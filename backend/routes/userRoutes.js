import express from 'express';
import { registerUser, verifyOtp, loginUser, getUserProfile, updateUserProfile, getTotalUsers, getUserFine, getBorrowedBooks } from '../controllers/userController.js';
import { protect, protectAdmin } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `profileImage-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('profileImage'), updateUserProfile);
router.get('/count', protectAdmin, getTotalUsers);
router.get('/fine', protect, getUserFine);
router.get('/borrowed-books', protect, getBorrowedBooks);

export default router;