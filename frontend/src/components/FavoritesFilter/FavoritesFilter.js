import React from 'react';
import './FavoritesFilter.css';

const FavoritesFilter = ({ showFavoritesOnly, onToggleFavorites, favoritesCount }) => {
  return (
    <div className="favorites-filter">
      <button
        className={`favorites-filter-btn ${showFavoritesOnly ? 'active' : ''}`}
        onClick={onToggleFavorites}
        title={showFavoritesOnly ? 'Show all products' : 'Show only favorites'}
      >
        <span className="heart-symbol">♥</span>
        <span className="favorites-text">
          {showFavoritesOnly ? 'Show All' : 'Favorites'}
        </span>
        {favoritesCount > 0 && (
          <span className="favorites-badge">{favoritesCount}</span>
        )}
      </button>
    </div>
  );
};

export default FavoritesFilter;