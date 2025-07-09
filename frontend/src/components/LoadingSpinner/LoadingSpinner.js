import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ title = "Loading products...", subtitle = "Fetching real-time gold prices" }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <div className="loading-text">{title}</div>
      <div className="loading-subtext">{subtitle}</div>
    </div>
  );
};

export default LoadingSpinner;