import React, { useState } from 'react';
import '../styles/BookDetailsModal.css';
import { FaTimes, FaStar } from 'react-icons/fa';
import axios from 'axios';
import { getUserInfo } from '../utils/userLocalStorageUtils';

const BookDetailsModal = ({ book, onClose, showToast, isAdminView = false }) => {
  const [durationInWeeks, setDurationInWeeks] = useState(1);

  if (!book) return null;

  const handleReserve = async () => {
    const userInfo = getUserInfo();
    if (!userInfo || !userInfo.token) {
      showToast('Error: Please log in to reserve a book.', 'error');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.post(`http://localhost:5000/api/books/${book._id}/reserve`, { durationInWeeks }, config);
      showToast('Success: Book reserved successfully! Awaiting admin approval.', 'success');
      onClose();
    } catch (error) {
      showToast(`Error: ${error.response?.data?.message || 'Failed to reserve book'}`, 'error');
    }
  };

  return (
    <div className="book-details-modal-overlay" onClick={onClose}>
      <div className="book-details-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="details-content-wrapper">
          <div className="details-image-container">
            {book.coverImage ? (
              <img src={`http://localhost:5000${book.coverImage}`} alt={book.title} className="details-cover-image" />
            ) : (
              <div className="details-cover-placeholder">No Image</div>
            )}
          </div>
          <div className="details-text-content">
            <h2>{book.title}</h2>
            <p><strong>Author:</strong> {book.author}</p>
            <p><strong>Genre:</strong> {book.genre}</p>
            <p><strong>Publication Year:</strong> {book.publicationYear}</p>
            <p><strong>ISBN:</strong> {book.isbn}</p>
            <p><strong>Category:</strong> {book.category?.name || 'N/A'}</p>
            <p><strong>Language:</strong> {book.language}</p>
            <p><strong>Total Copies:</strong> {book.totalCopies}</p>
            <p><strong>Available Copies:</strong> {book.availableCopies}</p>
            <div className="book-rating-info">
              <p><strong>Average Rating:</strong> {book.averageRating ? book.averageRating.toFixed(1) : 'N/A'} <FaStar className="star-icon" /></p>
              <p><strong>Reviews:</strong> {book.numReviews}</p>
            </div>
            <p><strong>Description:</strong> {book.description}</p>
            <p><strong>Tags:</strong> {book.tags.join(', ')}</p>
            {!isAdminView && book.availableCopies > 0 && (
              <div className="reserve-section">
                <div className="select-wrapper">
                  <label htmlFor="duration">Duration:</label>
                  <select
                    id="duration"
                    value={durationInWeeks}
                    onChange={(e) => setDurationInWeeks(e.target.value)}
                  >
                    <option value="1">1 Week</option>
                    <option value="2">2 Weeks</option>
                    <option value="3">3 Weeks</option>
                    <option value="4">4 Weeks</option>
                  </select>
                </div>
                <button onClick={handleReserve} className="reserve-button">Reserve Book</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsModal;