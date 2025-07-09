import React from 'react';
import './EmptyState.css';

const EmptyState = ({ 
  icon = "🔍", 
  message = "No products found matching your criteria",
  actionText = "Clear Filters",
  onAction 
}) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-message">{message}</div>
      {onAction && (
        <button onClick={onAction} className="empty-action-btn">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;