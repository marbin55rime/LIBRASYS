import React, { useEffect } from 'react';
import '../styles/Toast.css';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="toast-icon success-icon" />;
      case 'error':
        return <FaTimesCircle className="toast-icon error-icon" />;
      case 'info':
        return <FaInfoCircle className="toast-icon info-icon" />;
      default:
        return null;
    }
  };

  return (
    <div className={`toast-container toast-${type}`}>
      <div className="toast-content">
        {getIcon()}
        <p className="toast-message">{message}</p>
      </div>
      <button onClick={onClose} className="toast-close-button">
        <FaTimes />
      </button>
    </div>
  );
};

export default Toast;
