import Review from '../models/Review.js';
import Book from '../models/Book.js';
import asyncHandler from '../utils/asyncHandler.js';

const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { bookId } = req.params;
  const userId = req.user._id;

  const book = await Book.findById(bookId);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  const alreadyReviewed = await Review.findOne({ book: bookId, user: userId });
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this book');
  }

  const review = await Review.create({
    book: bookId,
    user: userId,
    rating,
    comment,
  });

  const reviews = await Review.find({ book: bookId });
  const newAverageRating = reviews.length > 0 ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length : 0;

  await Book.findByIdAndUpdate(
    book._id,
    {
      numReviews: reviews.length,
      averageRating: newAverageRating,
    },
    { new: true }
  );

  res.status(201).json({ message: 'Review added', review });
});

const getBookReviews = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  const reviews = await Review.find({ book: bookId }).populate('user', 'firstName lastName email userId');

  res.status(200).json(reviews);
});

const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .populate('book', 'title author coverImage')
    .sort({ createdAt: -1 });

  res.status(200).json(reviews);
});

const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({})
    .populate('user', 'firstName lastName email userId')
    .populate('book', 'title author coverImage');

  res.status(200).json(reviews);
});

const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  await review.deleteOne();

  const book = await Book.findById(review.book);
  if (book) {
    const reviews = await Review.find({ book: book._id });
    const newAverageRating = reviews.length > 0 ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length : 0;

    await Book.findByIdAndUpdate(
      book._id,
      {
        numReviews: reviews.length,
        averageRating: newAverageRating,
      },
      { new: true }
    );
  }

  res.status(200).json({ message: 'Review removed' });
});

const getAllReviewsPublic = asyncHandler(async (req, res) => {
  const reviews = await Review.find({})
    .populate('user', 'firstName lastName')
    .populate('book', 'title author coverImage');

  res.status(200).json(reviews);
});

export { addReview, getBookReviews, getMyReviews, getAllReviews, deleteReview, getAllReviewsPublic };