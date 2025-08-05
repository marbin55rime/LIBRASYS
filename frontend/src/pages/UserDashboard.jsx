import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUserInfo, removeUserInfo } from '../utils/userLocalStorageUtils';
import Toast from '../components/Toast';
import ProfileModal from '../components/ProfileModal';
import '../styles/UserDashboard.css';
import { FaUser, FaBook, FaCalendarAlt, FaMoneyBillWave, FaHistory, FaBell, FaSearch } from 'react-icons/fa';

const UserDashboard = ({ showToast }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfoState] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const storedUserInfo = getUserInfo();
    if (storedUserInfo && storedUserInfo.userId) {
      setUserInfoState(storedUserInfo);
    } else {
      navigate('/');
      return;
    }
  }, [navigate, showToast]);

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
          <Link to="/search-books" className="user-dashbox white-shade">
            <FaSearch className="user-dashbox-icon" />
            <h3>Search Books</h3>
            <p>Find your next read</p>
          </Link>
          
          
        </div>
      </div>
      {isProfileModalOpen && (
        <ProfileModal showToast={showToast} onClose={closeProfileModal} />
      )}
    </div>
  );
};

export default UserDashboard;