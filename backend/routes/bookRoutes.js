import express from 'express';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { upload, addBook, getBooks, getBookById, updateBook, deleteBook, searchPublicBooks, getBookSuggestions } from '../controllers/bookController.js';

const router = express.Router();

router.route('/').post(protectAdmin, upload.single('coverImage'), addBook).get(getBooks);
router.route('/search').get(searchPublicBooks);
router.route('/:id').get(getBookById).put(protectAdmin, upload.single('coverImage'), updateBook).delete(protectAdmin, deleteBook);
router.route('/suggestions').get(getBookSuggestions);

export default router;
