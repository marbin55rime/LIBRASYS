import Support from '../models/Support.js';
import asyncHandler from '../utils/asyncHandler.js';
import nodemailer from 'nodemailer';

// @desc    Create a new support request
// @route   POST /api/support
// @access  Public
const createSupportRequest = asyncHandler(async (req, res) => {
  const { name, userId, email, phoneNumber, issue } = req.body;

  if (!name || !email || !issue) {
    res.status(400);
    throw new Error('Please enter all required fields: Name, Email, and Issue.');
  }

  const supportRequest = await Support.create({
    name,
    userId,
    email,
    phoneNumber,
    issue,
  });

  if (supportRequest) {
    res.status(201).json({
      message: 'Support request submitted successfully!',
      request: supportRequest,
    });
  } else {
    res.status(400);
    throw new Error('Invalid support request data');
  }
});

// @desc    Get all support requests (for admin)
// @route   GET /api/support
// @access  Private (Admin)
const getAllSupportRequests = asyncHandler(async (req, res) => {
  const requests = await Support.find({});
  res.status(200).json(requests);
});

// @desc    Update a support request (add solution and change status)
// @route   PUT /api/support/:id
// @access  Private (Admin)
const updateSupportRequest = asyncHandler(async (req, res) => {
  const { solution, status } = req.body;

  const request = await Support.findById(req.params.id);

  if (request) {
    request.solution = solution || request.solution;
    request.status = status || request.status;

    const updatedRequest = await request.save();

    // Send email with solution if status is 'Resolved' and solution is provided
    if (updatedRequest.status === 'Resolved' && updatedRequest.solution) {
      const transporter = nodemailer.createTransport({
        service: 'gmail', // You can use other services like Outlook, Yahoo, etc.
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: updatedRequest.email,
        subject: `Solution for your Support Request #${updatedRequest._id}`,
        html: `
          <p>Dear ${updatedRequest.name},</p>
          <p>Your support request regarding: <strong>${updatedRequest.issue}</strong> has been resolved.</p>
          <p><strong>Solution:</strong> ${updatedRequest.solution}</p>
          <p>Thank you for your patience.</p>
          <p>Sincerely,</p>
          <p>LIBRASYS Support Team</p>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Solution email sent successfully!');
      } catch (error) {
        console.error('Error sending solution email:', error);
      }
    }

    res.status(200).json(updatedRequest);
  } else {
    res.status(404);
    throw new Error('Support request not found');
  }
});

export { createSupportRequest, getAllSupportRequests, updateSupportRequest };
