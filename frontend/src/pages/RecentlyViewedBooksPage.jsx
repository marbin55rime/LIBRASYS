import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getUserInfo } from '../utils/userLocalStorageUtils';
import Toast from '../components/Toast';
import RecentlyViewedSlider from '../components/RecentlyViewedSlider'; // We'll create this component
import '../styles/RecentlyViewedBooksPage.css'; // We'll create this CSS file

const RecentlyViewedBooksPage = ({ showToast }) => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('RecentlyViewedBooksPage: useEffect triggered.');
    const fetchRecentlyViewed = async () => {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.token) {
        console.log('RecentlyViewedBooksPage: User not authorized.');
        showToast('Error: Not authorized. Please log in.', 'error');
        navigate('/');
        return;
      }

      try {
        console.log('RecentlyViewedBooksPage: Attempting to fetch user profile.');
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
        setRecentlyViewed(data.recentlyViewedBooks || []);
        console.log('RecentlyViewedBooksPage: Fetched recently viewed books:', data.recentlyViewedBooks);
        console.log('RecentlyViewedBooksPage: Full user profile data:', data);
      } catch (err) {
        console.error('RecentlyViewedBooksPage: Error fetching recently viewed books:', err);
        setError('Failed to fetch recently viewed books.');
        showToast(`Error: ${err.response?.data?.message || 'Server error'}`, 'error');
      } finally {
        setLoading(false);
        console.log('RecentlyViewedBooksPage: Loading set to false.');
      }
    };

    fetchRecentlyViewed();
  }, [navigate, showToast]);

  if (loading) {
    return <div className="recently-viewed-page-container"><div className="recently-viewed-page-overlay"></div><div className="recently-viewed-page-content">Loading recently viewed books...</div></div>;
  }

  if (error) {
    return <div className="recently-viewed-page-container"><div className="recently-viewed-page-overlay"></div><div className="recently-viewed-page-content error-message">{error}</div></div>;
  }

  return (
    <div className="recently-viewed-page-container">
      <div className="recently-viewed-page-overlay"></div>
      <div className="recently-viewed-page-content">
        <div className="recently-viewed-page-title-box">
          <h1>Your Recently Viewed Books</h1>
          <p>Books you've recently checked out.</p>
        </div>

        {recentlyViewed.length === 0 ? (
          <p className="no-recently-viewed">You haven't viewed any books recently.</p>
        ) : (
          <RecentlyViewedSlider books={recentlyViewed} />
        )}
      </div>
    </div>
  );
};

export default RecentlyViewedBooksPage;
