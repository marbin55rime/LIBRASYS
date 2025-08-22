import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAdminInfo } from '../utils/localStorageUtils';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../styles/AdminManageReservations.css';

const AdminManageReservations = ({ showToast }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvalDate, setApprovalDate] = useState('');
  const [borrowExpiryDate, setBorrowExpiryDate] = useState('');
  const [fineExpiryDateInputs, setFineExpiryDateInputs] = useState({}); // State to manage fine expiry date inputs per reservation

  useEffect(() => {
    const adminInfo = getAdminInfo();
    if (!adminInfo || !adminInfo.token) {
      showToast('Error: Not authorized as admin. Please log in.', 'error');
      setLoading(false);
      return;
    }
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const adminInfo = getAdminInfo();
      const config = {
        headers: {
          Authorization: `Bearer ${adminInfo.token}`,
        },
      };
      const { data } = await axios.get('http://localhost:5000/api/reservations', config);
      setReservations(data);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Failed to fetch reservations.');
      showToast(`Error fetching reservations: ${err.response?.data?.message || 'Server error'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const adminInfo = getAdminInfo();
      const config = {
        headers: {
          Authorization: `Bearer ${adminInfo.token}`,
        },
      };

      let body = { status };
      if (status === 'approved') {
        if (!approvalDate || !borrowExpiryDate) {
          showToast('Error: Please select both approval date and borrow expiry date.', 'error');
          return;
        }
        body.reservationStartDate = approvalDate;
        body.borrowExpiryDate = borrowExpiryDate;
      }

      await axios.put(`http://localhost:5000/api/reservations/${id}/status`, body, config);
      showToast('Success: Reservation status updated.', 'success');
      fetchReservations();
    } catch (err) {
      showToast(`Error updating status: ${err.response?.data?.message || 'Server error'}`, 'error');
    }
  };

  const handleFineExpiryDateChange = (reservationId, date) => {
    setFineExpiryDateInputs(prev => ({ ...prev, [reservationId]: date }));
  };

  const handleSetFineExpiryDate = async (reservationId) => {
    const adminInfo = getAdminInfo();
    if (!adminInfo || !adminInfo.token) {
      showToast('Error: Not authorized as admin. Please log in.', 'error');
      return;
    }

    const dateToSet = fineExpiryDateInputs[reservationId];
    if (!dateToSet) {
      showToast('Error: Please select a fine expiry date.', 'error');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${adminInfo.token}`,
        },
      };
      await axios.put(`http://localhost:5000/api/reservations/${reservationId}/fine-expiry`, { fineExpiryDate: dateToSet }, config);
      showToast('Success: Fine expiry date updated!', 'success');
      fetchReservations();
    } catch (err) {
      showToast(`Error updating fine expiry date: ${err.response?.data?.message || 'Server error'}`, 'error');
    }
  };

  if (loading) {
    return <div className="admin-manage-reservations-container"><div className="admin-manage-reservations-overlay"></div><div className="admin-manage-reservations-content">Loading reservations...</div></div>;
  }

  if (error) {
    return <div className="admin-manage-reservations-container"><div className="admin-manage-reservations-overlay"></div><div className="admin-manage-reservations-content error-message">{error}</div></div>;
  }

  return (
    <div className="admin-manage-reservations-container">
      <div className="admin-manage-reservations-overlay"></div>
      <div className="admin-manage-reservations-content">
        <div className="admin-manage-reservations-title-box">
          <div className="admin-manage-reservations-circle"></div>
          <h1>Manage Reservations</h1>
          <p>Approve, track, and manage book reservations.</p>
        </div>

        <div className="reservations-table-container">
          {reservations.length === 0 ? (
            <p>No reservations found.</p>
          ) : (
            <table className="reservations-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Book</th>
                  <th>Reservation Date</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Borrow Expiry</th>
                  <th>Fine</th>
                  <th>Fine Payment Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation._id}>
                    <td>{reservation.user.firstName} {reservation.user.lastName} ({reservation.user.email})</td>
                    <td>{reservation.book.title} by {reservation.book.author}</td>
                    <td>{new Date(reservation.reservationDate).toLocaleDateString()}</td>
                    <td>{reservation.durationInWeeks} week(s)</td>
                    <td>{reservation.status}</td>
                    <td>{reservation.borrowExpiryDate ? new Date(reservation.borrowExpiryDate).toLocaleDateString() : 'N/A'}</td>
                    <td>{reservation.fineAmount ? `${reservation.fineAmount} Taka` : 'N/A'}</td>
                    <td>
                      <div className="fine-expiry-input-group">
                        <input
                          type="date"
                          value={fineExpiryDateInputs[reservation._id] || (reservation.fineExpiryDate ? new Date(reservation.fineExpiryDate).toISOString().split('T')[0] : '')}
                          onChange={(e) => handleFineExpiryDateChange(reservation._id, e.target.value)}
                          className="approval-date-input"
                        />
                        <button onClick={() => handleSetFineExpiryDate(reservation._id)} className="action-button">Set Date</button>
                      </div>
                    </td>
                    <td>
                      <div className="action-sub-columns">
                        {reservation.status === 'pending' && (
                          <div className="action-sub-column approval-section">
                            <h4>Approve Reservation</h4>
                            <div className="approval-controls">
                              <label htmlFor="approvalDate">Start Date:</label>
                              <input type="date" id="approvalDate" value={approvalDate} onChange={(e) => setApprovalDate(e.target.value)} className="approval-date-input" />
                              <label htmlFor="borrowExpiryDate">Borrow Expiry:</label>
                              <input type="date" id="borrowExpiryDate" value={borrowExpiryDate} onChange={(e) => setBorrowExpiryDate(e.target.value)} className="approval-date-input" />
                              <button onClick={() => handleStatusUpdate(reservation._id, 'approved')} className="action-button approve"><FaCheckCircle /> Approve</button>
                            </div>
                          </div>
                        )}
                        <div className="action-sub-column manage-section">
                          <h4>Manage Status</h4>
                          {(reservation.status === 'pending' || reservation.status === 'approved') && (
                            <button onClick={() => handleStatusUpdate(reservation._id, 'cancelled')} className="action-button cancel"><FaTimesCircle /> Cancel</button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManageReservations;