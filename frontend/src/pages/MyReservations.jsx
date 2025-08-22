import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getUserInfo } from '../utils/userLocalStorageUtils';
import Toast from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import '../styles/MyReservations.css';
import PdfGenerator from '../components/PdfGenerator';

const MyReservations = ({ showToast }) => {
  const [reservations, setReservations] = useState([]);
  const [pdfReservation, setPdfReservation] = useState(null);
  const [triggerPdfDownload, setTriggerPdfDownload] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyReservations();
  }, []);

  const fetchMyReservations = async () => {
    const userInfo = getUserInfo();
    if (!userInfo || !userInfo.token) {
      showToast('Error: Not authorized. Please log in.', 'error');
      navigate('/');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get('http://localhost:5000/api/reservations/my', config);
      setReservations(data);
    } catch (error) {
      showToast(`Error fetching reservations: ${error.response?.data?.message || 'Server error'}`, 'error');
      if (error.response && error.response.status === 401) {
        navigate('/');
      }
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    const userInfo = getUserInfo();
    if (!userInfo || !userInfo.token) {
      showToast('Error: Not authorized. Please log in.', 'error');
      navigate('/');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.put(`http://localhost:5000/api/reservations/${reservationId}/cancel`, {}, config);
      showToast('Success: Reservation cancelled successfully!', 'success');
      fetchMyReservations();
    } catch (error) {
      showToast(`Error cancelling reservation: ${error.response?.data?.message || 'Server error'}`, 'error');
    }
  };

  const handleDownloadReceipt = (reservation) => {
    setPdfReservation(reservation);
    setTriggerPdfDownload(true);
  };

  useEffect(() => {
    if (triggerPdfDownload) {
      setTriggerPdfDownload(false); // Reset after triggering
    }
  }, [triggerPdfDownload]);

  return (
    <div className="my-reservations-container">
      <div className="my-reservations-overlay"></div>
      <div className="my-reservations-content">
        <div className="my-reservations-title-box">
          <h1>My Book Reservations</h1>
          <p>View and manage your reserved books.</p>
        </div>

        <div className="reservations-table-container">
          {reservations.length === 0 ? (
            <p className="no-reservations">You have no active book reservations.</p>
          ) : (
            <table className="reservations-table">
              <thead>
                <tr>
                  <th>Book Cover</th>
                  <th>Book Title & Author</th>
                  <th>Status</th>
                  <th>Reserved On</th>
                  <th>Duration</th>
                  <th>Reservation Period</th>
                  <th>Borrow Expiry</th>
                  <th>Fine Calculated Till</th>
                  <th>Fine</th>
                  <th>Actions</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation._id}>
                    <td>
                      {reservation.book?.coverImage ? (
                        <img src={`http://localhost:5000${reservation.book.coverImage}`} alt={reservation.book.title} className="table-book-image" />
                      ) : (
                        <div className="table-book-image-placeholder">No Image</div>
                      )}
                    </td>
                    <td>
                      <h3>{reservation.book?.title || 'Unknown Title'}</h3>
                      <p>by {reservation.book?.author || 'Unknown Author'}</p>
                    </td>
                    <td><span className={`status-${reservation.status}`}>{reservation.status}</span></td>
                    <td>{new Date(reservation.reservationDate).toLocaleDateString()}</td>
                    <td>{reservation.durationInWeeks} week(s)</td>
                    <td>
                      {reservation.reservationStartDate ? (
                        <>{new Date(reservation.reservationStartDate).toLocaleDateString()} - {reservation.reservationEndDate ? new Date(reservation.reservationEndDate).toLocaleDateString() : 'N/A'}</>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>{reservation.borrowExpiryDate ? new Date(reservation.borrowExpiryDate).toLocaleDateString() : 'N/A'}</td>
                    <td>{reservation.fineExpiryDate ? new Date(reservation.fineExpiryDate).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      {reservation.fineAmount > 0 ? (
                        <span className="fine-amount">{reservation.fineAmount} Taka</span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>
                      {(reservation.status === 'approved' && reservation.fineAmount === 0) && (
                        <button
                          onClick={() => handleCancelReservation(reservation._id)}
                          className="cancel-reservation-button"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDownloadReceipt(reservation)}
                        className="download-receipt-button"
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {pdfReservation && (
        <PdfGenerator reservationDetails={pdfReservation} triggerDownload={triggerPdfDownload} />
      )}
    </div>
  );
};

export default MyReservations;