import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ type, title, message, onClose, onRetry }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 8000); // Auto close after 8 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span className="toast-icon">
          {type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️'}
        </span>
        <div className="toast-details">
          <div className="toast-title">{title}</div>
          <div className="toast-message">{message}</div>
        </div>
        <button 
          className="toast-close-btn" 
          onClick={onClose}
          title="Close"
        >
          ✕
        </button>
      </div>
      {onRetry && (
        <div className="toast-actions">
          <button onClick={onClose} className="toast-dismiss-btn">
            Dismiss
          </button>
          <button onClick={onRetry} className="toast-retry-btn">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Toast;