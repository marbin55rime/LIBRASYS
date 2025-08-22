import express from 'express';
import { protect, protectAdmin } from '../middleware/authMiddleware.js';
import { addReview, getBookReviews, getAllReviews, deleteReview, getMyReviews, getAllReviewsPublic } from '../controllers/reviewController.js';

const router = express.Router();

// User routes for reviews
router.route('/books/:bookId/reviews').post(protect, addReview).get(getBookReviews);
router.route('/reviews/my').get(protect, getMyReviews);
router.route('/reviews/all').get(protect, getAllReviewsPublic); // New route for all reviews (public)

// Admin routes for reviews
router.route('/reviews').get(protectAdmin, getAllReviews);
router.route('/reviews/:id').delete(protect, deleteReview); // Allow users to delete their own reviews

export default router;