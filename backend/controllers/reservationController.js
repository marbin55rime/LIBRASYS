import Reservation from '../models/Reservation.js';
import Book from '../models/Book.js';
import User from '../models/User.js'; // Import User model
import asyncHandler from '../utils/asyncHandler.js';
import nodemailer from 'nodemailer'; // Import nodemailer
import dotenv from 'dotenv';

dotenv.config();

// @desc    Get all reservations (Admin only)
// @route   GET /api/reservations
// @access  Private (Admin)
const getAllReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({})
    .populate('user', 'firstName lastName email userId')
    .populate('book', 'title author coverImage')
    .select('reservationDate durationInWeeks reservationStartDate reservationEndDate borrowExpiryDate fineAmount returned status fineExpiryDate')
    .sort({ createdAt: -1 });

  res.status(200).json(reservations);
});

// @desc    Get all reservations for the authenticated user
// @route   GET /api/reservations/my
// @access  Private (User)
const getMyReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({ user: req.user._id })
    .populate('book', 'title author coverImage')
    .populate('user', 'firstName lastName email')
    .select('reservationDate durationInWeeks reservationStartDate reservationEndDate borrowExpiryDate fineAmount returned status fineExpiryDate')
    .sort({ createdAt: -1 });

  res.status(200).json(reservations);
});

// @desc    Admin manage reservation status (approve, fulfill, reject)
// @route   PUT /api/reservations/:id/status
// @access  Private (Admin)
const adminManageReservation = asyncHandler(async (req, res) => {
  const { id: reservationId } = req.params;
  const { status, reservationStartDate, borrowExpiryDate } = req.body;

  const reservation = await Reservation.findById(reservationId);

  if (!reservation) {
    res.status(404);
    throw new Error('Reservation not found');
  }

  const book = await Book.findById(reservation.book);

  if (!book) {
    res.status(404);
    throw new Error('Associated book not found');
  }

  if (status === 'approved') {
    if (reservation.status !== 'pending') {
      res.status(400);
      throw new Error('Only pending reservations can be approved.');
    }
    if (!reservationStartDate || !borrowExpiryDate) {
      res.status(400);
      throw new Error('Reservation start date and borrow expiry date are required for approval.');
    }

    const startDate = new Date(reservationStartDate);
    const borrowExpDate = new Date(borrowExpiryDate);

    // Calculate reservationEndDate based on reservationStartDate and durationInWeeks
    const reservationEnd = new Date(startDate);
    reservationEnd.setDate(startDate.getDate() + (reservation.durationInWeeks * 7) -1); // Subtract 1 day to make it inclusive

    reservation.status = 'approved';
    reservation.isApproved = true;
    reservation.reservationStartDate = startDate;
    reservation.borrowExpiryDate = borrowExpDate;
    reservation.reservationEndDate = reservationEnd;

    // Send approval email
    const user = await User.findById(reservation.user);
    if (user) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'LIBRASYS Reservation Approved',
        html: `
          <p>Dear ${user.firstName},</p>
          <p>Your reservation for the book <strong>${book.title}</strong> has been approved.</p>
          <p>Please pick up the book by <strong>${borrowExpDate.toLocaleDateString()}</strong>.</p>
          <p>Thank you for using LIBRASYS.</p>
          <p>Sincerely,</p>
          <p>The LIBRASYS Team</p>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Reservation approval email sent successfully!');
      } catch (error) {
        console.error('Error sending reservation approval email:', error);
      }
    }

  } else if (status === 'fulfilled') {
    if (reservation.status !== 'approved') {
      res.status(400);
      throw new Error('Only approved reservations can be fulfilled.');
    }
    reservation.status = 'fulfilled';
    reservation.returned = true;

    book.availableCopies += 1;
    try {
      await book.save();
    } catch (bookSaveError) {
      console.error('Error saving book after fulfilling reservation:', bookSaveError);
      res.status(500);
      throw new Error(`Failed to update book availability after fulfillment: ${bookSaveError.message}`);
    }

  } else if (status === 'cancelled') {
    if (reservation.status === 'fulfilled' || reservation.status === 'expired') {
      res.status(400);
      throw new Error(`Reservation cannot be cancelled as it is already ${reservation.status}.`);
    }
    reservation.status = 'cancelled';
    if (book && (reservation.status === 'pending' || reservation.status === 'approved')) {
      book.availableCopies += 1;
      try {
        await book.save();
      } catch (bookSaveError) {
        console.error('Error saving book after cancelling reservation:', bookSaveError);
        res.status(500);
        throw new Error(`Failed to update book availability after cancellation: ${bookSaveError.message}`);
      }
    }

    // Send cancellation email
    const user = await User.findById(reservation.user);
    if (user) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'LIBRASYS Reservation Cancelled',
        html: `
          <p>Dear ${user.firstName},</p>
          <p>Your reservation for the book <strong>${book.title}</strong> has been cancelled.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Sincerely,</p>
          <p>The LIBRASYS Team</p>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Reservation cancellation email sent successfully!');
      } catch (error) {
        console.error('Error sending reservation cancellation email:', error);
      }
    }
  } else {
    res.status(400);
    throw new Error('Invalid reservation status provided.');
  }

  await reservation.save();
  res.status(200).json({ message: `Reservation status updated to ${status}.`, reservation });
});

// @desc    Update fine expiry date for a reservation
// @route   PUT /api/reservations/:id/fine-expiry
// @access  Private (Admin)
const updateFineExpiryDate = asyncHandler(async (req, res) => {
  const { id: reservationId } = req.params;
  const { fineExpiryDate } = req.body;

  console.log('updateFineExpiryDate: Received fineExpiryDate:', fineExpiryDate);

  const reservation = await Reservation.findById(reservationId);

  if (!reservation) {
    res.status(404);
    throw new Error('Reservation not found');
  }

  console.log('updateFineExpiryDate: Existing reservation borrowExpiryDate:', reservation.borrowExpiryDate);

  if (!fineExpiryDate) {
    res.status(400);
    throw new Error('Fine expiry date is required.');
  }

  // Parse fineExpiryDate explicitly to avoid ambiguity
  const [year, month, day] = fineExpiryDate.split('-').map(Number);
  reservation.fineExpiryDate = new Date(year, month - 1, day); // Month is 0-indexed
  console.log('updateFineExpiryDate: Parsed fineExpiryDate:', reservation.fineExpiryDate);

  // Calculate fine based on borrowExpiryDate and the new fineExpiryDate
  if (reservation.borrowExpiryDate && reservation.fineExpiryDate > reservation.borrowExpiryDate) {
    const borrowExpDate = new Date(reservation.borrowExpiryDate);
    const fineExpDate = new Date(reservation.fineExpiryDate);

    // Set both dates to start of day to ensure accurate day difference
    borrowExpDate.setHours(0, 0, 0, 0);
    fineExpDate.setHours(0, 0, 0, 0);

    console.log('updateFineExpiryDate: borrowExpDate (normalized):', borrowExpDate);
    console.log('updateFineExpiryDate: fineExpDate (normalized):', fineExpDate);

    const overdueMilliseconds = fineExpDate.getTime() - borrowExpDate.getTime();
    // Calculate days overdue, starting from the day *after* borrowExpiryDate
    const overdueDays = Math.ceil(overdueMilliseconds / (1000 * 60 * 60 * 24));

    // Ensure fine is only applied for positive overdue days
    reservation.fineAmount = Math.max(0, overdueDays) * 200; // 200 Taka per day
    console.log('updateFineExpiryDate: Calculated fineAmount:', reservation.fineAmount);
  } else {
    reservation.fineAmount = 0; // No fine if fineExpiryDate is not past borrowExpiryDate
    console.log('updateFineExpiryDate: Fine amount set to 0.');
  }

  await reservation.save();
  console.log('updateFineExpiryDate: Reservation saved. New fineAmount:', reservation.fineAmount);

  res.status(200).json({ message: 'Fine expiry date updated successfully.', reservation });
});

// @desc    Cancel a reservation
// @route   PUT /api/reservations/:id/cancel
// @access  Private (User)
const cancelReservation = asyncHandler(async (req, res) => {
  const { id: reservationId } = req.params;

  const reservation = await Reservation.findById(reservationId);

  if (!reservation) {
    res.status(404);
    throw new Error('Reservation not found');
  }

  if (reservation.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized to cancel this reservation');
  }

  if (reservation.status === 'cancelled' || reservation.status === 'fulfilled' || reservation.status === 'expired') {
    res.status(400);
    throw new Error(`Reservation cannot be cancelled as it is already ${reservation.status}.`);
  }

  reservation.status = 'cancelled';
  await reservation.save();

  const book = await Book.findById(reservation.book);
  if (book && (reservation.status === 'pending' || reservation.status === 'approved')) {
    book.availableCopies += 1;
    await book.save();
  }

  res.status(200).json({ message: 'Reservation cancelled successfully.' });
});

// @desc    Get total number of reservations
// @route   GET /api/reservations/count
// @access  Private (Admin)
const getTotalReservations = asyncHandler(async (req, res) => {
  try {
    const count = await Reservation.countDocuments({});
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: `Error fetching reservation count: ${error.message}` });
  }
});

export { getAllReservations, getMyReservations, adminManageReservation, cancelReservation, updateFineExpiryDate, getTotalReservations };