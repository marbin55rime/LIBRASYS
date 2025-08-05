import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAdminInfo } from '../utils/localStorageUtils';
import Toast from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminUserDetails.css';
import { FaUserCircle, FaEnvelope, FaIdCard, FaPhone, FaGenderless, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaImage } from 'react-icons/fa';

const AdminUserDetails = ({ showToast }) => {
  const [allUsers, setAllUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllUsers = async () => {
      const adminInfo = getAdminInfo();
      if (!adminInfo || !adminInfo.token) {
        showToast('Error: Not authorized as admin. Please log in.', 'error');
        navigate('/admin');
        return;
      }

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${adminInfo.token}`,
          },
        };
        const { data } = await axios.get('http://localhost:5000/api/admin/users/all', config);
        setAllUsers(data);
      } catch (error) {
        showToast(`Error fetching users: ${error.response?.data?.message || 'Server error'}`, 'error');
        if (error.response && error.response.status === 401) {
          navigate('/admin');
        }
      }
    };

    fetchAllUsers();
  }, [showToast, navigate]);

  return (
    <div className="admin-user-details-container">
      <div className="admin-user-details-overlay"></div>
      <div className="admin-user-details-content">
        <div className="admin-user-details-title-box">
          <div className="admin-user-details-circle"></div>
          <h1>All Registered Users</h1>
          <p>Comprehensive list of all users and their approval status.</p>
        </div>

        {allUsers.length === 0 ? (
          <p className="no-users">No users registered yet.</p>
        ) : (
          <div className="user-details-table-wrapper">
            <table className="user-details-table">
              <thead>
                <tr>
                   <th><FaImage /> Profile Pic</th>
                  <th><FaUserCircle /> User</th>
                  <th><FaEnvelope /> Email</th>
                  <th><FaIdCard /> User ID</th>
                  <th><FaIdCard /> NID</th>
                  <th><FaPhone /> Phone</th>
                  <th><FaGenderless /> Gender</th>
                  <th>Date of Birth</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((user) => (
                  <tr key={user._id}>
                     <td className="profile-pic-cell">
                      {user.profileImage ? (
                        <img src={`http://localhost:5000${user.profileImage}`} alt="Profile" className="table-profile-pic" />
                      ) : (
                        <div className="table-profile-pic-placeholder"><FaUserCircle /></div>
                      )}
                    </td>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.userId}</td>
                    <td>{user.nid}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{user.gender}</td>
                    <td>{new Date(user.dateOfBirth).toLocaleDateString()}</td>
                    <td>
                      {user.isApproved ? (
                        <span className="status-approved"><FaCheckCircle /> Approved</span>
                      ) : user.isVerified ? (
                        <span className="status-pending"><FaHourglassHalf /> Pending</span>
                      ) : (
                        <span className="status-unverified"><FaTimesCircle /> Unverified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserDetails;