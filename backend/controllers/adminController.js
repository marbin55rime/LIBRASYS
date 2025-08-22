import dotenv from 'dotenv';
import User from '../models/User.js';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

dotenv.config();

const protectAdmin = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.admin = decoded;
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

  if (username === 'admin' && password === 'admin') {
    const expiresIn = '7d';
    const token = jwt.sign({ id: 'admin', role: 'admin' }, process.env.JWT_SECRET, { expiresIn });

    res.status(200).json({
      message: 'Admin login successful',
      token,
      expiresIn,
      admin: { username: 'Admin' },
    });
  } else {
    res.status(401).json({ message: 'Invalid admin credentials' });
  }
};

const getUnapprovedUsers = async (req, res) => {
  const users = await User.find({ isVerified: true, isApproved: false }).select('-password -otp -otpExpires');
  res.status(200).json(users);
};

const getAllUsers = async (req, res) => {
  const users = await User.find({}).select('-password -otp -otpExpires');
  res.status(200).json(users);
};

const updateUserApprovalStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const user = await User.findById(id);

  if (user) {
    if (status === 'approve') {
      user.isApproved = true;
      await user.save();

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
        subject: 'LIBRASYS Account Approval Confirmation',
        html: `
          <p>Dear ${user.firstName},</p>
          <p>We are pleased to inform you that your LIBRASYS account has been successfully approved.</p>
          <p>You can now log in to your account and access our full range of library services.</p>
          <p>Thank you for joining LIBRASYS.</p>
          <p>Sincerely,</p>
          <p>The LIBRASYS Team</p>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (error) {
        console.error('Error sending approval email:', error);
      }

      res.status(200).json({ message: `User ${user.email} approved successfully.` });
    } else if (status === 'decline') {
      const userEmail = user.email;
      const userName = user.firstName;
      await user.deleteOne();

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
          <p>We regret to inform you that your LIBRASYS account application has been declined.</p>
          <p>This decision was made after careful review. If you believe there has been a misunderstanding or wish to appeal, please contact our support team for further assistance.</p>
          <p>Thank you for your understanding.</p>
          <p>Sincerely,</p>
          <p>The LIBRASYS Team</p>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
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