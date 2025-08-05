import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';
import nodemailer from 'nodemailer';

dotenv.config();

// Middleware to protect admin routes
const protectAdmin = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.admin = decoded; // Attach decoded admin info to request
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  // Hardcoded credentials for demonstration
  if (username === 'admin' && password === 'admin') {
    // Generate JWT token
    const token = jwt.sign({ id: 'admin', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Admin login successful',
      token,
      admin: { username: 'Admin' },
    });
  } else {
    res.status(401).json({ message: 'Invalid admin credentials' });
  }
};

// @desc    Get unapproved users
// @route   GET /api/admin/users/unapproved
// @access  Private (Admin)
const getUnapprovedUsers = async (req, res) => {
  const users = await User.find({ isVerified: true, isApproved: false }).select('-password -otp -otpExpires');
  res.status(200).json(users);
};

// @desc    Get all users
// @route   GET /api/admin/users/all
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  const users = await User.find({}).select('-password -otp -otpExpires');
  res.status(200).json(users);
};

// @desc    Approve or Decline a user
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
const updateUserApprovalStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approve' or 'decline'

  const user = await User.findById(id);

  if (user) {
    if (status === 'approve') {
      user.isApproved = true;
      await user.save();

      // Send approval email
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
        subject: 'Your LIBRASYS Account Approval',
        html: `
          <p>Dear ${user.firstName},</p>
          <p>Good news! Your LIBRASYS account has been successfully approved by our administration.</p>
          <p>You can now log in and start exploring our vast collection of books.</p>
          <p>Thank you for joining LIBRASYS!</p>
          <p>Sincerely,</p>
          <p>The LIBRASYS Team</p>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Approval email sent successfully!');
      } catch (error) {
        console.error('Error sending approval email:', error);
      }

      res.status(200).json({ message: `User ${user.email} approved successfully.` });
    } else if (status === 'decline') {
      const userEmail = user.email; // Store email before deleting user
      const userName = user.firstName; // Store name before deleting user
      await user.deleteOne(); // Example: delete declined user

      // Send decline email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Regarding Your LIBRASYS Account Application',
        html: `
          <p>Dear ${userName},</p>
          <p>We regret to inform you that your LIBRASYS account application has been declined by our administration.</p>
          <p>If you believe this is a mistake or have any questions, please contact our support team.</p>
          <p>Sincerely,</p>
          <p>The LIBRASYS Team</p>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Decline email sent successfully!');
      } catch (error) {
        console.error('Error sending decline email:', error);
      }

      res.status(200).json({ message: `User ${userEmail} declined and removed.` });
    } else {
      res.status(400).json({ message: 'Invalid status provided.' });
    }
  } else {
    res.status(404).json({ message: 'User not found.' });
  }
};

export { adminLogin, protectAdmin, getUnapprovedUsers, getAllUsers, updateUserApprovalStatus };
