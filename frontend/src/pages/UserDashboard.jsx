import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { getUserInfo, removeUserInfo } from '../utils/userLocalStorageUtils';
import Toast from '../components/Toast';
import ProfileModal from '../components/ProfileModal';
import '../styles/UserDashboard.css';
import { FaUser, FaBook, FaCalendarAlt, FaMoneyBillWave, FaHistory, FaBell, FaSearch, FaStar, FaPenFancy, FaClock } from 'react-icons/fa';

const UserDashboard = ({ showToast }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfoState] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [totalFine, setTotalFine] = useState(0);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [currentBorrowedBookIndex, setCurrentBorrowedBookIndex] = useState(0);

  useEffect(() => {
    const storedUserInfo = getUserInfo();
    if (storedUserInfo && storedUserInfo.userId) {
      const fetchUserData = async () => {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${storedUserInfo.token}`,
            },
          };
          const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
          setUserInfoState(data);

          const fineRes = await axios.get('http://localhost:5000/api/users/fine', config);
          setTotalFine(fineRes.data.totalFine);

          const borrowedRes = await axios.get('http://localhost:5000/api/users/borrowed-books', config);
          setBorrowedBooks(borrowedRes.data);

        } catch (error) {
          console.error('UserDashboard: Error fetching user data:', error);
          showToast(`Error fetching user data: ${error.response?.data?.message || 'Server error'}`, 'error');
        }
      };
      fetchUserData();
    } else {
      navigate('/');
      return;
    }
  }, [navigate, showToast]);

  useEffect(() => {
    if (borrowedBooks.length > 1) {
      const interval = setInterval(() => {
        setCurrentBorrowedBookIndex((prevIndex) =>
          (prevIndex + 1) % borrowedBooks.length
        );
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [borrowedBooks]);

  const handleLogout = () => {
    removeUserInfo();
    showToast('Success: Logged out successfully.', 'success');
    navigate('/'); 
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  if (!userInfo) {
    return null; 
  }

  return (
    <div className="user-dashboard-container">
      <div className="user-dashboard-overlay"></div>
      <div className="user-dashboard-content">
        <div className="user-greeting-card">
          <div className="user-greeting-circle"></div> {}
          {userInfo.profileImage ? (
            <img src={`http://localhost:5000${userInfo.profileImage}`} alt="Profile" className="user-profile-pic" />
          ) : (
            <div className="user-profile-pic-placeholder"><FaUser /></div>
          )}
          <div className="user-greeting-text-content">
            <h1>Welcome, {userInfo.firstName}!</h1>
            <p>User ID: {userInfo.userId} | Email: {userInfo.email}</p>
            <button onClick={handleLogout} className="user-logout-button">Logout</button>
          </div>
        </div>

        <div className="user-dashboxes-grid">
          <div className="user-dashbox dark-shade" onClick={openProfileModal} style={{ cursor: 'pointer' }}>
            <FaUser className="user-dashbox-icon" />
            <h3>My Profile</h3>
            <p>Update Details</p>
          </div>
          <Link to="/browse-books" className="user-dashbox white-shade">
            <FaSearch className="user-dashbox-icon" />
            <h3>Browse & Reserve Books</h3>
            <p>Find and reserve your next read</p>
          </Link>
          <Link to="/my-reservations" className="user-dashbox dark-shade">
            <FaCalendarAlt className="user-dashbox-icon" />
            <h3>My Reservations</h3>
            <p>View & Manage</p>
          </Link>
          <Link to="/write-review" className="user-dashbox white-shade">
            <FaPenFancy className="user-dashbox-icon" />
            <h3>Write a Review</h3>
            <p>Share your thoughts</p>
          </Link>
          <Link to="/view-reviews" className="user-dashbox dark-shade">
            <FaStar className="user-dashbox-icon" />
            <h3>View Reviews</h3>
            <p>All & Your Reviews</p>
          </Link>
          <Link to="/recently-viewed" className="user-dashbox white-shade">
            <FaClock className="user-dashbox-icon" />
            <h3>Recently Viewed</h3>
            <p>Your browsing history</p>
          </Link>
          <div className="user-dashbox fine-dashbox">
            <FaMoneyBillWave className="user-dashbox-icon" />
            <h3>Total Fine</h3>
            <p>{totalFine > 0 ? `৳${totalFine.toFixed(2)} Please Pay` : 'No outstanding fine'}</p>
          </div>
          {borrowedBooks.length > 0 && (
            <div className="user-dashbox dark-shade borrowed-book-display">
              <FaCalendarAlt className="user-dashbox-icon" />
              <h4>{borrowedBooks[currentBorrowedBookIndex].title}</h4>
              <p>Expiry: {new Date(borrowedBooks[currentBorrowedBookIndex].borrowExpiryDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>
      {isProfileModalOpen && (
        <ProfileModal showToast={showToast} onClose={closeProfileModal} />
      )}
    </div>
  );
};

export default UserDashboard;