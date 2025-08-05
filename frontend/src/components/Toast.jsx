import React, { useEffect } from 'react';
import '../styles/Toast.css';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';

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
        return <FaCheckCircle />;
      case 'error':
        return <FaTimesCircle />;
      case 'info':
        return <FaInfoCircle />;
      default:
        return null;
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">{getIcon()}</div>
      <p>{message}</p>
      <button onClick={onClose} className="toast-close-btn">&times;</button>
    </div>
  );
};

export default Toast;
