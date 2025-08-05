import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getUserInfo, setUserInfo } from '../utils/userLocalStorageUtils';
import '../styles/ProfileModal.css';

const ProfileModal = ({ showToast, onClose }) => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    const currentUser = getUserInfo();
    if (currentUser) {
      setUserData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
        dateOfBirth: currentUser.dateOfBirth ? currentUser.dateOfBirth.split('T')[0] : '', 
        confirmPassword: '',
      });
      if (currentUser.profileImage) {
        setProfileImagePreview(`http://localhost:5000${currentUser.profileImage}`);
      }
    }
  }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProfileImage(null);
      setFileName('');
      setProfileImagePreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userData.password && userData.password !== userData.confirmPassword) {
      showToast('Error: Passwords do not match.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('firstName', userData.firstName);
    formData.append('lastName', userData.lastName);
    formData.append('email', userData.email);
    formData.append('phoneNumber', userData.phoneNumber);
    formData.append('dateOfBirth', userData.dateOfBirth);
    if (userData.password) {
      formData.append('password', userData.password);
    }
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    try {
      const userInfo = getUserInfo();
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.put('http://localhost:5000/api/users/profile', formData, config);
      setUserInfo(data); 
      showToast('Success: Profile updated successfully!', 'success');
      onClose();
    } catch (error) {
      showToast(`Error: Profile update failed. ${error.response?.data?.message || 'Server error'}`, 'error');
    }
  };

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal-content">
        <button className="profile-modal-close-btn" onClick={onClose}>&times;</button>
        <h2>Edit Profile</h2>
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-image-upload-section">
            {profileImagePreview ? (
              <img src={profileImagePreview} alt="Profile Preview" className="profile-preview-image" />
            ) : (
              <div className="profile-placeholder-image">No Image</div>
            )}
            <input
              type="file"
              id="profileImage"
              name="profileImage"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="profileImage" className="upload-button">Upload Image</label>
            {fileName && <span className="file-name">{fileName}</span>}
          </div>

          <div className="profile-input-grid">
            <div className="profile-input-group">
              <input type="text" name="firstName" value={userData.firstName} onChange={handleChange} />
              <label>First Name</label>
            </div>
            <div className="profile-input-group">
              <input type="text" name="lastName" value={userData.lastName} onChange={handleChange} />
              <label>Last Name</label>
            </div>
            <div className="profile-input-group">
              <input type="email" name="email" value={userData.email} onChange={handleChange} />
              <label>Email</label>
            </div>
            <div className="profile-input-group">
              <input type="text" name="phoneNumber" value={userData.phoneNumber} onChange={handleChange} />
              <label>Phone Number</label>
            </div>
            <div className="profile-input-group">
              <input type="date" name="dateOfBirth" value={userData.dateOfBirth} onChange={handleChange} />
              <label>Date of Birth</label>
            </div>
            <div className="profile-input-group">
              <input type="password" name="password" value={userData.password} onChange={handleChange} />
              <label>New Password (optional)</label>
            </div>
            <div className="profile-input-group">
              <input type="password" name="confirmPassword" value={userData.confirmPassword} onChange={handleChange} />
              <label>Confirm New Password</label>
            </div>
          </div>

          <button type="submit" className="profile-save-button">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
