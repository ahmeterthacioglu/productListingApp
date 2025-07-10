import { useState, useEffect } from 'react';

const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem('renring_favorites');
      const favoritesData = stored ? JSON.parse(stored) : [];
      setFavorites(favoritesData);
      return favoritesData;
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  };

  const saveFavorites = (newFavorites) => {
    try {
      localStorage.setItem('renring_favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const addToFavorites = (productId) => {
    const id = String(productId);
    if (!favorites.includes(id)) {
      const newFavorites = [...favorites, id];
      saveFavorites(newFavorites);
      return true;
    }
    return false;
  };

  const removeFromFavorites = (productId) => {
    const id = String(productId);
    const newFavorites = favorites.filter(favId => favId !== id);
    saveFavorites(newFavorites);
    return true;
  };

  const toggleFavorite = (productId) => {
    const id = String(productId);
    if (favorites.includes(id)) {
      removeFromFavorites(id);
      return false;
    } else {
      addToFavorites(id);
      return true;
    }
  };

  const isFavorite = (productId) => {
    return favorites.includes(String(productId));
  };

  const getFavoriteProducts = (allProducts) => {
    return allProducts.filter(product => {
      const productId = product.id || product.name;
      return favorites.includes(productId);
    });
  };

  const clearFavorites = () => {
    saveFavorites([]);
  };

  const getFavoritesCount = () => {
    return favorites.length;
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    getFavoriteProducts,
    clearFavorites,
    getFavoritesCount,
    loadFavorites
  };
};

export default useFavorites;