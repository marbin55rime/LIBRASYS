import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Book',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Prevent duplicate reviews by the same user for the same book
ReviewSchema.index({ book: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', ReviewSchema);

export default Review;
