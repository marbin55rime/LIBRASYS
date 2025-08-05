import React, { useState } from 'react';
import '../styles/Home.css';
import homeBackground from '../assets/home.jpg';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setUserInfo } from '../utils/userLocalStorageUtils';

const Home = ({ showToast }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', { userId, password });
      setUserInfo(response.data);
      navigate('/user/dashboard');
    } catch (error) {
      showToast(`Error: ${error.response?.data?.message || 'Login failed.'}`, 'error');
    }
  };

  return (
    <div className="home-container" style={{ backgroundImage: `url(${homeBackground})` }}>
      <div className="home-overlay"></div>
      <div className="home-content">
        <div className="home-title-section">
          <h1 className="home-main-title">LibraSys</h1>
          <p className="home-subquote">A Smarter Way to Manage Books and Borrowers</p>
        </div>
        <div className="home-login-section">
          <form onSubmit={handleLogin} className="home-login-form">
            <h2>Member Login</h2>
            <div className="home-input-group">
              <input
                type="text"
                id="userId"
                name="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
              <label htmlFor="userId">User ID</label>
            </div>
            <div className="home-input-group">
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="password">Password</label>
            </div>
            <button type="submit" className="home-login-button">Login</button>
            <p className="home-register-prompt">Don't have an account? <a href="/register">Register here</a></p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
