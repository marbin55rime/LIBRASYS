import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getUserInfo } from '../utils/userLocalStorageUtils';
import StarRating from '../components/StarRating';
import '../styles/WriteReview.css';

const WriteReview = ({ showToast }) => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.token) {
        showToast('Error: Not authorized. Please log in.', 'error');
        navigate('/');
        return;
      }
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await axios.get('http://localhost:5000/api/books', config);
        setBooks(data.books || []);
      } catch (error) {
        showToast(`Error fetching books: ${error.response?.data?.message || 'Server error'}`, 'error');
      }
    };
    fetchBooks();
  }, [navigate, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userInfo = getUserInfo();
    if (!userInfo || !userInfo.token) {
      showToast('Error: Please log in to submit a review.', 'error');
      setLoading(false);
      return;
    }

    if (!selectedBook) {
      showToast('Error: Please select a book.', 'error');
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
      await axios.post(`http://localhost:5000/api/books/${selectedBook}/reviews`, { rating, comment }, config);
      showToast('Success: Review submitted successfully!', 'success');
      setRating(0);
      setComment('');
      setSelectedBook('');
      navigate('/view-reviews');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to submit review';
      showToast(`Error: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="write-review-container">
      <div className="write-review-overlay"></div>
      <div className="write-review-content">
        <div className="write-review-title-box">
          <h1>Write a Book Review</h1>
          <p>Share your experience and help other readers!</p>
        </div>

        <form onSubmit={handleSubmit} className="review-submission-form">
          <div className="form-group">
            <label htmlFor="bookSelect">Select Book:</label>
            <select
              id="bookSelect"
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              required
            >
              <option value="">-- Select a Book --</option>
              {books.map((book) => (
                <option key={book._id} value={book._id}>
                  {book.title} by {book.author}
                </option>
              ))}
            </select>
          </div>

          {selectedBook && books.length > 0 && (
            <div className="selected-book-preview">
              {(() => {
                const book = books.find(b => b._id === selectedBook);
                return book && (
                  <img src={`http://localhost:5000${book.coverImage}`} alt={book.title} className="selected-book-cover" />
                );
              })()}
            </div>
          )}

          <div className="form-group">
            <label>Your Rating:</label>
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>

          <div className="form-group">
            <label htmlFor="comment">Your Comment:</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your review here..."
              rows="6"
              required
            ></textarea>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WriteReview;
