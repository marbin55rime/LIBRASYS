import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setAdminInfo } from '../utils/localStorageUtils';
import Toast from '../components/Toast'; 
import '../styles/Admin.css';
import logo from '../assets/logo.png'; 

const Admin = ({ showToast }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', { username, password });
      setAdminInfo({ username: response.data.admin.username, token: response.data.token }); 
      console.log('Admin login successful, token stored.');
      showToast(' Admin login successful!', 'success');
      navigate('/admin/dashboard');
    } catch (error) {
      showToast(`Error: ${error.response?.data?.message || 'Admin login failed.'}`, 'error');
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-overlay"></div>
      <div className="admin-login-box">
        <div className="admin-logo-section">
          <img src={logo} alt="LibraSys Logo" className="admin-logo" />
        </div>
        <div className="admin-form-section">
          <h2>Admin Login</h2>
          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="admin-input-group">
              <input
                type="text"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <label>Username</label>
            </div>
            <div className="admin-input-group">
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label>Password</label>
            </div>
            <button type="submit" className="admin-login-button">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Admin;
