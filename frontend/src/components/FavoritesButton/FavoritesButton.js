import React, { useState, useEffect } from 'react';
import './FavoritesButton.css';

const FavoritesButton = ({ productId, productName, onToggle, className = '' }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const favorites = getFavoritesFromStorage();
    const isFav = favorites.includes(String(productId));
    setIsFavorite(isFav);
  }, [productId]);

  // Get favorites from localStorage
  const getFavoritesFromStorage = () => {
    try {
      const favorites = localStorage.getItem('renring_favorites');
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  };

  // Save favorites to localStorage
  const saveFavoritesToStorage = (favorites) => {
    try {
      localStorage.setItem('renring_favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  // Toggle favorite status
  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const favorites = getFavoritesFromStorage();
    let newFavorites;

    if (isFavorite) {
      newFavorites = favorites.filter(id => id !== String(productId));
    } else {
      newFavorites = [...favorites, String(productId)];
    }

    saveFavoritesToStorage(newFavorites);
    setIsFavorite(!isFavorite);
    
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    if (onToggle) {
      onToggle();
    }
  };

  return (
    <button
      className={`favorites-button ${isFavorite ? 'active' : ''} ${isAnimating ? 'animating' : ''} ${className}`}
      onClick={toggleFavorite}
      title={isFavorite ? `Remove ${productName} from favorites` : `Add ${productName} to favorites`}
      aria-label={isFavorite ? `Remove ${productName} from favorites` : `Add ${productName} to favorites`}
      data-id={productId}
    >
      <span className="heart-symbol">
        {isFavorite ? '♥' : '♡'}
      </span>
    </button>
  );
};

export default FavoritesButton;