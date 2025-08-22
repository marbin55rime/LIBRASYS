import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';
import registerBackground from '../assets/register.jpg';

const Register = ({ showToast }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    userId: '',
    nid: '',
    gender: '',
    phoneNumber: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showToast('Error: Passwords do not match. Please re-enter.', 'error');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/users/register', formData);
      showToast('Success: OTP sent to your email. Please check your inbox.', 'success');
      setShowOtpInput(true);
    } catch (error) {
      showToast(`Error: Registration failed. ${error.response?.data?.message || 'Please try again.'}`, 'error');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users/verify-otp', { email: formData.email, otp });
      showToast('Success: OTP verified. Registration complete! You can now log in.', 'success');
      navigate('/'); 
    } catch (error) {
      showToast(`Error: OTP verification failed. ${error.response?.data?.message || 'Please try again.'}`, 'error');
    }
  };

  return (
    <div className="register-container" style={{ backgroundImage: `url(${registerBackground})` }}>
      <div className="register-overlay"></div>
      <div className="register-content">
        <div className="register-form-section">
          <h2>Register for LibraSys</h2>
          {!showOtpInput ? (
            <form onSubmit={handleRegister} className="register-form">
              <div className="register-input-group">
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                <label>First Name</label>
              </div>
              <div className="register-input-group">
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                <label>Last Name</label>
              </div>
              <div className="register-input-group">
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                <label>Email</label>
              </div>
              <div className="register-input-group">
                <input type="text" name="userId" value={formData.userId} onChange={handleChange} required />
                <label>User ID</label>
              </div>
              <div className="register-input-group">
                <input type="text" name="nid" value={formData.nid} onChange={handleChange} required />
                <label>NID</label>
              </div>
              <div className="register-input-group">
                <label></label>
                <select name="gender" value={formData.gender} onChange={handleChange} required className="gender-select">
                  <option value="" disabled>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="register-input-group">
                <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
                <label>Phone Number</label>
              </div>
              <div className="register-input-group">
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
                <label>Date of Birth</label>
              </div>
              <div className="register-input-group">
                <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                <label>Password</label>
              </div>
              <div className="register-input-group">
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                <label>Confirm Password</label>
              </div>
              <button type="submit" className="register-button">Register</button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="register-otp-form">
              <div className="register-input-group">
                <input type="text" name="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                <label>Enter OTP</label>
              </div>
              <button type="submit" className="register-verify-otp-button">Verify OTP</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;