import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

// Utility to send OTP email
const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for LibraSys Registration',
    html: `<p>Your OTP for LibraSys registration is: <strong>${otp}</strong></p><p>This OTP is valid for 10 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};

// @desc    Register a new user and send OTP
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  const { firstName, lastName, email, userId, nid, gender, phoneNumber, dateOfBirth, password } = req.body;

  // Check if email already exists and is verified
  const userExistsByEmail = await User.findOne({ email });
  if (userExistsByEmail && userExistsByEmail.isVerified) {
    return res.status(400).json({ message: 'User with this email is already registered and verified.' });
  }

  // Check if userId already exists
  const userExistsByUserId = await User.findOne({ userId });
  if (userExistsByUserId) {
    return res.status(400).json({ message: 'User with this User ID already exists.' });
  }

  // Check if nid already exists
  const userExistsByNid = await User.findOne({ nid });
  if (userExistsByNid) {
    return res.status(400).json({ message: 'User with this NID already exists.' });
  }

  // Check if phoneNumber already exists
  const userExistsByPhoneNumber = await User.findOne({ phoneNumber });
  if (userExistsByPhoneNumber) {
    return res.status(400).json({ message: 'User with this Phone Number already exists.' });
  }

  // If user exists by email but not verified, update their details and resend OTP
  if (userExistsByEmail && !userExistsByEmail.isVerified) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    userExistsByEmail.firstName = firstName;
    userExistsByEmail.lastName = lastName;
    userExistsByEmail.userId = userId;
    userExistsByEmail.nid = nid;
    userExistsByEmail.gender = gender;
    userExistsByEmail.phoneNumber = phoneNumber;
    userExistsByEmail.dateOfBirth = dateOfBirth;
    userExistsByEmail.password = password; // Password will be hashed by pre-save hook
    userExistsByEmail.otp = hashedOtp;
    userExistsByEmail.otpExpires = otpExpires;

    await userExistsByEmail.save();
    await sendOtpEmail(email, otp);

    return res.status(200).json({ message: 'User details updated and OTP re-sent. Please verify your OTP.' });
  }

  // New user registration
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  const user = await User.create({
    firstName,
    lastName,
    email,
    userId,
    nid,
    gender,
    phoneNumber,
    dateOfBirth,
    password,
    otp: hashedOtp,
    otpExpires,
    isVerified: false, // Ensure new users are unverified
    isApproved: false, // New users are not approved by default
  });

  if (user) {
    await sendOtpEmail(email, otp);
    res.status(201).json({
      message: 'OTP sent to your email. Please verify to complete registration.',
      email: user.email,
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Verify OTP and complete registration
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: 'User already verified' });
  }

  if (!user.otp || !user.otpExpires) {
    return res.status(400).json({ message: 'No OTP found for this user. Please register again.' });
  }

  if (user.otpExpires < Date.now()) {
    // Clear expired OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    return res.status(400).json({ message: 'OTP expired. Please register again to get a new OTP.' });
  }

  const isMatch = await bcrypt.compare(otp, user.otp);

  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  user.isVerified = true;
  user.otp = undefined; // Clear OTP after successful verification
  user.otpExpires = undefined;
  await user.save();

  res.status(200).json({ message: 'Email verified successfully. Registration complete! Awaiting admin approval.' });
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { userId, password } = req.body;

  const user = await User.findOne({ userId });

  if (user && (await user.matchPassword(password))) {
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Account not verified. Please verify your email.' });
    }
    if (!user.isApproved) {
      return res.status(401).json({ message: 'Account awaiting admin approval. Please try again later.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userId: user.userId,
      token,
      profileImage: user.profileImage, // Include profile image
    });
  } else {
    res.status(401).json({ message: 'Invalid User ID or password' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userId: user.userId,
      nid: user.nid,
      gender: user.gender,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      isVerified: user.isVerified,
      isApproved: user.isApproved,
      profileImage: user.profileImage, // Include profile image
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Check if email is being changed and if the new email is already taken by another user
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use by another account.' });
      }
    }

    // Check if phoneNumber is being changed and if the new phoneNumber is already taken by another user
    if (req.body.phoneNumber && req.body.phoneNumber !== user.phoneNumber) {
      const phoneNumberExists = await User.findOne({ phoneNumber: req.body.phoneNumber });
      if (phoneNumberExists) {
        return res.status(400).json({ message: 'Phone number already in use by another account.' });
      }
    }

    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
    user.profileImage = req.file ? `/uploads/${req.file.filename}` : user.profileImage; // Save image path

    if (req.body.password) {
      user.password = req.body.password; // Pre-save hook will hash it
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      userId: updatedUser.userId,
      phoneNumber: updatedUser.phoneNumber,
      dateOfBirth: updatedUser.dateOfBirth,
      profileImage: updatedUser.profileImage,
      token: jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' }),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

export { registerUser, verifyOtp, loginUser, getUserProfile, updateUserProfile };