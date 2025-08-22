import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getUserInfo } from '../utils/userLocalStorageUtils';
import { getAdminInfo } from '../utils/localStorageUtils';
import Toast from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import '../styles/ViewReviews.css';
import { FaStar, FaTrash } from 'react-icons/fa';

const ViewReviews = ({ showToast }) => {
  const [allReviews, setAllReviews] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const navigate = useNavigate();
  const userInfo = getUserInfo();
  const adminInfo = getAdminInfo();
  const [activeTab, setActiveTab] = useState(userInfo ? 'myReviews' : 'allReviews');

  useEffect(() => {
    if (userInfo) {
      fetchMyReviews();
    }
    fetchAllReviews();
  }, [userInfo]);

  const fetchMyReviews = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get('http://localhost:5000/api/reviews/my', config);
      setMyReviews(data);
    } catch (error) {
      showToast(`Error fetching your reviews: ${error.response?.data?.message || 'Server error'}`, 'error');
    }
  };

  const fetchAllReviews = async () => {
    const token = userInfo?.token || adminInfo?.token;
    if (!token) {
      showToast('Error: Not authorized. Please log in.', 'error');
      navigate('/');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get('http://localhost:5000/api/reviews/all', config);
      setAllReviews(data);
    } catch (error) {
      showToast(`Error fetching all reviews: ${error.response?.data?.message || 'Server error'}`, 'error');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    const token = userInfo?.token || adminInfo?.token;
    if (!token) {
      showToast('Error: Not authorized to delete this review.', 'error');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, config);
      showToast('Success: Review deleted successfully!', 'success');
      fetchMyReviews();
      fetchAllReviews();
    } catch (error) {
      showToast(`Error deleting review: ${error.response?.data?.message || 'Server error'}`, 'error');
    }
  };

  return (
    <div className="view-reviews-container">
      <div className="view-reviews-overlay"></div>
      <div className="view-reviews-content">
        <div className="view-reviews-title-box">
          <h1>Book Reviews</h1>
          <p>Browse and manage book reviews.</p>
        </div>

        <div className="tabs-container">
          {userInfo && (
            <button
              className={`tab-button ${activeTab === 'myReviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('myReviews')}
            >
              My Reviews
            </button>
          )}
          <button
            className={`tab-button ${activeTab === 'allReviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('allReviews')}
          >
            All Reviews
          </button>
        </div>

        {activeTab === 'myReviews' && userInfo && (
          <div className="my-reviews-section">
            <h2>My Reviews</h2>
            {myReviews.length === 0 ? (
              <p className="no-reviews">You haven't submitted any reviews yet.</p>
            ) : (
              <div className="reviews-list">
                {myReviews.map((review) => (
                  <div key={review._id} className="review-card">
                    <div className="review-book-info">
                      {review.book?.coverImage ? (
                        <img src={`http://localhost:5000${review.book.coverImage}`} alt={review.book.title} className="review-book-image" />
                      ) : (
                        <div className="review-book-image-placeholder">No Image</div>
                      )}
                      <div className="review-book-details">
                        <h3>{review.book?.title || 'Unknown Title'}</h3>
                        <p>by {review.book?.author || 'Unknown Author'}</p>
                      </div>
                    </div>
                    <div className="review-details">
                      <p><strong>Rating:</strong> {review.rating} <FaStar className="star-icon" /></p>
                      <p><strong>Comment:</strong> {review.comment}</p>
                      <p><strong>Reviewed On:</strong> {new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="review-actions">
                      
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'allReviews' && (
          <div className="all-reviews-section">
            <h2>All Reviews</h2>
            {allReviews.length === 0 ? (
              <p className="no-reviews">No reviews found.</p>
            ) : (
              <div className="reviews-list">
                {allReviews.map((review) => (
                  <div key={review._id} className="review-card">
                    <div className="review-book-info">
                      {review.book?.coverImage ? (
                        <img src={`http://localhost:5000${review.book.coverImage}`} alt={review.book.title} className="review-book-image" />
                      ) : (
                        <div className="review-book-image-placeholder">No Image</div>
                      )}
                       <div className="review-book-details">
                        <h3>{review.book?.title || 'Unknown Title'}</h3>
                        <p>by {review.book?.author || 'Unknown Author'}</p>
                      </div>
                    </div>
                    <div className="review-details">
                      <p><strong>User:</strong> {review.user?.firstName || 'Anonymous'} {review.user?.lastName || ''}</p>
                      <p><strong>Rating:</strong> {review.rating} <FaStar className="star-icon" /></p>
                      <p><strong>Comment:</strong> {review.comment}</p>
                      <p><strong>Reviewed On:</strong> {new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                     {adminInfo && (
                      <div className="review-actions">
                        
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewReviews;
