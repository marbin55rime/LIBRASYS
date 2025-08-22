import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAdminInfo, removeAdminInfo } from '../utils/localStorageUtils';
import Toast from '../components/Toast';
import '../styles/AdminDashboard.css';
import { FaUsers, FaUserCheck, FaBook, FaExchangeAlt, FaClock, FaUserPlus, FaChartLine, FaMoneyBillAlt, FaBookMedical, FaBookOpen, FaCalendarAlt, FaTags, FaStarHalfAlt, FaUser } from 'react-icons/fa';
import adminImage from '../assets/admin.png';
import axios from 'axios';

const AdminDashboard = ({ showToast }) => {
  const navigate = useNavigate();
  const [adminUsername, setAdminUsername] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalReservations, setTotalReservations] = useState(0);

  useEffect(() => {
    const adminInfo = getAdminInfo();
    if (adminInfo && adminInfo.username && adminInfo.token) {
      setAdminUsername(adminInfo.username);
      fetchDashboardCounts(adminInfo.token);
    } else {
      navigate('/admin');
      return;
    }
  }, [navigate, showToast]);

  const fetchDashboardCounts = useCallback(async (token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const userCountRes = await axios.get('http://localhost:5000/api/users/count', config);
      setTotalUsers(userCountRes.data.count);

      const categoryCountRes = await axios.get('http://localhost:5000/api/categories/count', config);
      setTotalCategories(categoryCountRes.data.count);

      

      const reservationCountRes = await axios.get('http://localhost:5000/api/reservations/count', config);
      setTotalReservations(reservationCountRes.data.count);

    } catch (error) {
      showToast(`Error fetching dashboard counts: ${error.response?.data?.message || 'Server error'}`, 'error');
    }
  }, []);

  useEffect(() => {
    const adminInfo = getAdminInfo();
    if (adminInfo && adminInfo.username && adminInfo.token) {
      setAdminUsername(adminInfo.username);
      fetchDashboardCounts(adminInfo.token);
    } else {
      showToast('Your session has expired. Please log in again.', 'error');
      navigate('/admin');
    }
  }, [navigate, fetchDashboardCounts]);

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
          <img src={adminImage} alt="Admin Profile" className="admin-profile-pic" />
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
          <Link to="/admin/manage-reservations" className="admin-dashbox dark-shade">
            <FaCalendarAlt className="admin-dashbox-icon" />
            <h3>Manage Reservations</h3>
            <p>View & Update</p>
          </Link>
          <Link to="/admin/manage-categories" className="admin-dashbox white-shade">
            <FaTags className="admin-dashbox-icon" />
            <h3>Manage Categories</h3>
            <p>Add, Edit & Delete</p>
          </Link>
          <Link to="/admin/manage-reviews" className="admin-dashbox dark-shade">
            <FaStarHalfAlt className="admin-dashbox-icon" />
            <h3>Manage Reviews</h3>
            <p>View & Delete</p>
          </Link>
          
          
          
          </div>

        <div className="admin-counts-section">
          <div className="admin-dashbox count-box">
            <FaUsers className="admin-dashbox-icon" />
            <h3>Total Users</h3>
            <p>{totalUsers}</p>
          </div>
          <div className="admin-dashbox count-box">
            <FaTags className="admin-dashbox-icon" />
            <h3>Total Categories</h3>
            <p>{totalCategories}</p>
          </div>
          
          <div className="admin-dashbox count-box">
            <FaCalendarAlt className="admin-dashbox-icon" />
            <h3>Total Reservations</h3>
            <p>{totalReservations}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
