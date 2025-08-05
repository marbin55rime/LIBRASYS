import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAdminInfo, removeAdminInfo } from '../utils/localStorageUtils';
import Toast from '../components/Toast';
import '../styles/AdminDashboard.css';
import { FaUsers, FaUserCheck, FaBook, FaExchangeAlt, FaClock, FaUserPlus, FaChartLine, FaMoneyBillAlt, FaBookMedical, FaBookOpen } from 'react-icons/fa';

const AdminDashboard = ({ showToast }) => {
  const navigate = useNavigate();
  const [adminUsername, setAdminUsername] = useState('');

  useEffect(() => {
    const adminInfo = getAdminInfo();
    if (adminInfo && adminInfo.username && adminInfo.token) {
      setAdminUsername(adminInfo.username);
    } else {
      navigate('/admin');
      return;
    }
  }, [navigate, showToast]);

  const handleLogout = () => {
    removeAdminInfo();
    showToast('Success: Logged out successfully.', 'success');
    navigate('/admin');
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-overlay"></div>
      <div className="admin-dashboard-content">
        <div className="admin-greeting-card">
          <div className="admin-greeting-circle"></div>
          <div className="admin-greeting-text">
            <h1>Welcome, {adminUsername}!</h1>
            <p>Your central hub for library management.</p>
          </div>
          <button onClick={handleLogout} className="admin-logout-button">Logout</button>
        </div>

        <div className="admin-dashboxes-grid">
          
          <Link to="/admin/approval" className="admin-dashbox dark-shade">
            <FaUserCheck className="admin-dashbox-icon" />
            <h3>User Approvals</h3>
            <p>Pending Requests</p>
          </Link>
          <Link to="/admin/users" className="admin-dashbox white-shade">
            <FaUsers className="admin-dashbox-icon" />
            <h3>All Users</h3>
            <p>View & Manage</p>
          </Link>
          <Link to="/admin/add-book" className="admin-dashbox white-shade">
            <FaBookMedical className="admin-dashbox-icon" />
            <h3>Add New Book</h3>
            <p>Register a new book</p>
          </Link>
          <Link to="/admin/manage-books" className="admin-dashbox dark-shade">
            <FaBookOpen className="admin-dashbox-icon" />
            <h3>Manage Books</h3>
            <p>View, Edit & Delete</p>
          </Link>
          <Link to="/admin/support" className="admin-dashbox white-shade">
            <FaBook className="admin-dashbox-icon" />
            <h3>Support Requests</h3>
            <p>View & Respond</p>
          </Link>
          
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
