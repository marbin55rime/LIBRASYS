import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAdminInfo } from '../utils/localStorageUtils';
import { toast } from 'react-toastify';
import Toast from '../components/Toast';
import '../styles/AdminSupport.css';
import { FaCheckCircle, FaHourglassHalf, FaPaperPlane } from 'react-icons/fa';

const AdminSupport = () => {
  const [supportRequests, setSupportRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [solutionText, setSolutionText] = useState('');

  useEffect(() => {
    fetchSupportRequests();
  }, []);

  const fetchSupportRequests = async () => {
    const adminInfo = getAdminInfo();
    if (!adminInfo || !adminInfo.token) {
      toast.error('Error: Not authorized as admin. Please log in.');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${adminInfo.token}`,
        },
      };
      const { data } = await axios.get('http://localhost:5000/api/support', config);
      setSupportRequests(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching support requests.');
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setSolutionText(request.solution || '');
  };

  const handleCloseDetails = () => {
    setSelectedRequest(null);
    setSolutionText('');
  };

  const handleSendSolution = async () => {
    if (!selectedRequest || !solutionText) {
      toast.error('Please select a request and provide a solution.');
      return;
    }

    const adminInfo = getAdminInfo();
    if (!adminInfo || !adminInfo.token) {
      toast.error('Error: Not authorized as admin. Please log in.');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${adminInfo.token}`,
        },
      };
      await axios.put(
        `http://localhost:5000/api/support/${selectedRequest._id}`,
        { solution: solutionText, status: 'Resolved' },
        config
      );
      toast.success('Solution sent and request marked as resolved!');
      fetchSupportRequests();
      handleCloseDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sending solution.');
    }
  };

  return (
    <div className="admin-support-container">
      <div className="admin-support-overlay"></div>
      <div className="admin-support-content">
        <div className="admin-support-title-box">
          <div className="admin-support-circle"></div>
          <h1>Support Requests</h1>
          <p>Manage and respond to user support inquiries.</p>
        </div>

        {supportRequests.length === 0 ? (
          <p className="no-requests">No support requests at the moment.</p>
        ) : (
          <div className="support-requests-grid">
            {supportRequests.map((request) => (
              <div key={request._id} className={`support-card ${request.status.toLowerCase()}`}>
                <h3>Request from: {request.name}</h3>
                <p><strong>Email:</strong> {request.email}</p>
                <p><strong>Issue:</strong> {request.issue}</p>
                <p><strong>Status:</strong> {request.status === 'Pending' ? <><FaHourglassHalf /> Pending</> : <><FaCheckCircle /> Resolved</>}</p>
                <p className="request-date">Received: {new Date(request.createdAt).toLocaleString()}</p>
                <button onClick={() => handleViewDetails(request)} className="view-details-button">View Details</button>
              </div>
            ))}
          </div>
        )}

        {selectedRequest && (
          <div className="support-modal-overlay">
            <div className="support-modal-content">
              <h2>Request Details</h2>
              <p><strong>Name:</strong> {selectedRequest.name}</p>
              <p><strong>User ID:</strong> {selectedRequest.userId || 'N/A'}</p>
              <p><strong>Email:</strong> {selectedRequest.email}</p>
              <p><strong>Phone:</strong> {selectedRequest.phoneNumber || 'N/A'}</p>
              <p><strong>Issue:</strong> {selectedRequest.issue}</p>
              <p><strong>Status:</strong> {selectedRequest.status}</p>
              <p><strong>Requested On:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}</p>
              {selectedRequest.solution && (
                <p><strong>Current Solution:</strong> {selectedRequest.solution}</p>
              )}
              <>
                <div className="solution-section">
                  <label htmlFor="solution">Send Solution:</label>
                  <textarea
                    id="solution"
                    value={solutionText}
                    onChange={(e) => setSolutionText(e.target.value)}
                    placeholder="Type your solution here..."
                    rows="5"
                  ></textarea>
                </div>
                <div className="modal-actions">
                  <button onClick={handleSendSolution} className="send-solution-button">
                    <FaPaperPlane /> Send Solution
                  </button>
                  <button onClick={handleCloseDetails} className="close-modal-button">Close</button>
                </div>
              </>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupport;



