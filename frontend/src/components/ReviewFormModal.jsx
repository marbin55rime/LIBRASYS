import React, { useState } from 'react';
import axios from 'axios';
import { getUserInfo } from '../utils/userLocalStorageUtils';
import '../styles/ReviewFormModal.css'; // We'll create this CSS file
import StarRating from './StarRating'; // We'll create this component

const ReviewFormModal = ({ book, onClose, showToast, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userInfo = getUserInfo();
    if (!userInfo || !userInfo.token) {
      showToast('Error: Please log in to submit a review.', 'error');
      setLoading(false);
      return;
    }

    if (rating === 0) {
      showToast('Error: Please select a rating.', 'error');
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.post(`http://localhost:5000/api/books/${book._id}/reviews`, { rating, comment }, config);
      showToast('Success: Review submitted successfully!', 'success');
      onReviewSubmitted(); // Callback to refresh reviews in parent
      onClose();
    } catch (error) {
      showToast(`Error: ${error.response?.data?.message || 'Failed to submit review'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form-modal-overlay" onClick={onClose}>
      <div className="review-form-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Write a Review for {book.title}</h2>
        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label>Rating:</label>
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>
          <div className="form-group">
            <label htmlFor="comment">Comment:</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts on this book..."
              rows="5"
              required
            ></textarea>
          </div>
          <button type="submit" className="submit-review-button" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
          <button type="button" onClick={onClose} className="cancel-review-button">
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewFormModal;
