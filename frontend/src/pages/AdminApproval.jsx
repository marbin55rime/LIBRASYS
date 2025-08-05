import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAdminInfo } from '../utils/localStorageUtils';
import Toast from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminApproval.css';
import { FaCheckCircle, FaTimesCircle, FaUserCircle, FaEnvelope, FaIdCard, FaPhone, FaGenderless } from 'react-icons/fa';

const AdminApproval = ({ showToast }) => {
  const [unapprovedUsers, setUnapprovedUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnapprovedUsers = async () => {
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
        const { data } = await axios.get('http://localhost:5000/api/admin/users/unapproved', config);
        setUnapprovedUsers(data);
      } catch (error) {
        showToast(`Error fetching users: ${error.response?.data?.message || 'Server error'}`, 'error');
        if (error.response && error.response.status === 401) {
          navigate('/admin');
        }
      }
    };

    fetchUnapprovedUsers();
  }, [showToast, navigate]);

  const handleStatusChange = async (userId, status) => {
    const adminInfo = getAdminInfo();
    if (!adminInfo || !adminInfo.token) {
      showToast('Error: Not authorized as admin. Please log in.', 'error');
      navigate('/admin');
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminInfo.token}`,
        },
      };
      const { data } = await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/status`,
        { status },
        config
      );
      showToast(`Success: ${data.message}`, 'success');
      setUnapprovedUsers(unapprovedUsers.filter((user) => user._id !== userId));
    } catch (error) {
      showToast(`Error updating user status: ${error.response?.data?.message || 'Server error'}`, 'error');
    }
  };

  return (
    <div className="admin-approval-container">
      <div className="admin-approval-overlay"></div>
      <div className="admin-approval-content">
        <div className="admin-approval-title-box">
          <div className="admin-approval-circle"></div>
          <h1>User Approval Requests</h1>
          <p>Review and manage pending user registrations.</p>
        </div>

        {unapprovedUsers.length === 0 ? (
          <p className="no-requests">No pending approval requests.</p>
        ) : (
          <div className="approval-table-wrapper">
            <table className="approval-table">
              <thead>
                <tr>
                  <th><FaUserCircle /> User</th>
                  <th><FaEnvelope /> Email</th>
                  <th><FaIdCard /> User ID</th>
                  <th><FaIdCard /> NID</th>
                  <th><FaPhone /> Phone</th>
                  <th><FaGenderless /> Gender</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {unapprovedUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.userId}</td>
                    <td>{user.nid}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{user.gender}</td>
                    <td>
                      <button
                        className="approve-btn"
                        onClick={() => handleStatusChange(user._id, 'approve')}
                      >
                        <FaCheckCircle /> Approve
                      </button>
                      <button
                        className="decline-btn"
                        onClick={() => handleStatusChange(user._id, 'decline')}
                      >
                        <FaTimesCircle /> Decline
                      </button>
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

export default AdminApproval;