import React from 'react';
import './StarRating.css';

const StarRating = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<span key={i} className="star filled">★</span>);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<span key={`half-${i}`} className="star half">★</span>);
    } else {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }
  }

  return (
    <div className="rating">
      {stars}
      <span className="rating-text">{rating}/5</span>
    </div>
  );
};

export default StarRating;