import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAdminInfo } from '../utils/localStorageUtils';
import Toast from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminManageReviews.css'; // We'll create this CSS file
import { FaTrash, FaStar } from 'react-icons/fa';

const AdminManageReviews = ({ showToast }) => {
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllReviews();
  }, []);

  const fetchAllReviews = async () => {
    const adminInfo = getAdminInfo();
    if (!adminInfo || !adminInfo.token) {
      showToast('Error: Not authorized as admin. Please log in.', 'error');
      navigate('/admin');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${adminInfo.token}`,
        },
      };
      const { data } = await axios.get('http://localhost:5000/api/reviews', config);
      setReviews(data);
    } catch (error) {
      showToast(`Error fetching reviews: ${error.response?.data?.message || 'Server error'}`, 'error');
      if (error.response && error.response.status === 401) {
        navigate('/admin');
      }
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    const adminInfo = getAdminInfo();
    if (!adminInfo || !adminInfo.token) {
      showToast('Error: Not authorized as admin. Please log in.', 'error');
      navigate('/admin');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${adminInfo.token}`,
        },
      };
      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, config);
      showToast('Success: Review deleted successfully!', 'success');
      fetchAllReviews(); // Refresh the list
    } catch (error) {
      showToast(`Error deleting review: ${error.response?.data?.message || 'Server error'}`, 'error');
    }
  };

  return (
    <div className="admin-manage-reviews-container">
      <div className="admin-manage-reviews-overlay"></div>
      <div className="admin-manage-reviews-content">
        <div className="admin-manage-reviews-title-box">
          <h1>Manage Book Reviews</h1>
          <p>View and delete user-submitted reviews.</p>
        </div>

        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews found.</p>
        ) : (
          <div className="reviews-table-container">
            <table className="reviews-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>User</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review._id}>
                    <td>{review.book?.title || 'N/A'}</td>
                    <td>{review.user?.firstName || 'Anonymous'} {review.user?.lastName || ''}</td>
                    <td>
                      {review.rating} <FaStar className="star-icon" />
                    </td>
                    <td>{review.comment}</td>
                    <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => handleDeleteReview(review._id)} className="action-button delete">
                        <FaTrash /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManageReviews;
