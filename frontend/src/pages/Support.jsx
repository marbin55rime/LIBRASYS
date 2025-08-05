import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Toast from '../components/Toast';
import '../styles/Support.css';
import supportImage from '../assets/support.png';

const Support = () => {
  const [formData, setFormData] = useState({
    name: '',
    userId: '',
    email: '',
    phoneNumber: '',
    issue: '',
  });

  const { name, userId, email, phoneNumber, issue } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !issue) {
      toast.error('Please fill in all required fields: Name, Email, and Issue.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/support', formData);
      toast.success(res.data.message);
      setFormData({
        name: '',
        userId: '',
        email: '',
        phoneNumber: '',
        issue: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting support request.');
    }
  };

  return (
    <div className="support-container">
      <div className="support-overlay"></div>
      <div className="support-content">
        <div className="support-left-section">
          <div className="support-image-box">
            <img src={supportImage} alt="Support" className="support-image" />
          </div>
        </div>
        <div className="support-right-section">
          <div className="support-title-box">
            <div className="support-circle"></div>
            <h1>Contact Support</h1>
            <p>We're here to help! Please fill out the form below.</p>
          </div>

          <form onSubmit={handleSubmit} className="support-form">
            <div className="form-group">
              <label htmlFor="name">Name: <span className="required">*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={handleChange}
                placeholder="Your Name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email: <span className="required">*</span></label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="Your Email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="userId">User ID:</label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={userId}
                onChange={handleChange}
                placeholder="Optional User ID"
              />
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number:</label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={phoneNumber}
                onChange={handleChange}
                placeholder="Optional Phone Number"
              />
            </div>
            <div className="form-group full-width">
              <label htmlFor="issue">Describe your Issue: <span className="required">*</span></label>
              <textarea
                id="issue"
                name="issue"
                value={issue}
                onChange={handleChange}
                placeholder="Please provide a detailed description of your issue..."
                rows="5"
                required
              ></textarea>
            </div>
            <button type="submit" className="submit-button">Submit Request</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Support;
