import express from 'express';
import { protectAdmin, protect } from '../middleware/authMiddleware.js';
import { upload, addBook, getBooks, getBookById, updateBook, deleteBook, getBookSuggestions, reserveBook, getTotalBooks } from '../controllers/bookController.js';

const router = express.Router();

// Dedicated route for getting a single book by ID
router.get('/:id', protect, getBookById);

// Other book routes
router.route('/').post(protectAdmin, upload.single('coverImage'), addBook).get(getBooks);
router.route('/suggestions').get(getBookSuggestions);

// Reservation Routes
router.route('/:id/reserve').post(protect, reserveBook);

// Update and Delete book routes (now separate from getBookById)
router.put('/:id', protectAdmin, upload.single('coverImage'), updateBook);
router.delete('/:id', protectAdmin, deleteBook);
router.get('/count', protectAdmin, getTotalBooks);

export default router;