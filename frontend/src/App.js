import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './App.css';

import Toast from './components/Toast/Toast';
import StarRating from './components/StarRating/StarRating';
import ColorPicker from './components/ColorPicker/ColorPicker';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import EmptyState from './components/EmptyState/EmptyState';
import CollapsibleFilterSort from './components/CollapsibleFilterSort/CollapsibleFilterSort';
import FavoritesButton from './components/FavoritesButton/FavoritesButton';
import FavoritesFilter from './components/FavoritesFilter/FavoritesFilter';
import useFavorites from './hooks/useFavorites';

import { sortProducts, getSortDescription } from './utils/sortingUtils';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export default function ProductListingApp() {
  const [products, setProducts] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedColors, setSelectedColors] = useState({});
  const [slidesToShow, setSlidesToShow] = useState(4);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minPopularity: '',
    maxPopularity: ''
  });
  
  const [sortBy, setSortBy] = useState('default');
  const [sortOrder, setSortOrder] = useState('asc');

  const scrollTrackRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartSlideRef = useRef(0);

  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const isTouchingRef = useRef(false);

  const {
    isFavorite,
    toggleFavorite,
    getFavoritesCount
  } = useFavorites();

  const filteredProducts = useMemo(() => {
    if (showFavoritesOnly) {
      const favoriteProducts = products.filter(product => {
        const productId = product.name; // Use name consistently
        const isFav = isFavorite(productId);
        return isFav;
      });
      return favoriteProducts;
    }
    return products;
  }, [products, showFavoritesOnly, isFavorite]);
  const maxSlide = Math.max(0, filteredProducts.length - slidesToShow);

  const validateFilters = () => {
    const errors = [];
    
    if (filters.minPrice && (isNaN(filters.minPrice) || filters.minPrice < 0 || filters.minPrice > 10000)) {
      errors.push('Min Price must be between $0 and $10,000');
    }
    
    if (filters.maxPrice && (isNaN(filters.maxPrice) || filters.maxPrice < 0 || filters.maxPrice > 10000)) {
      errors.push('Max Price must be between $0 and $10,000');
    }
    
    if (filters.minPopularity && (isNaN(filters.minPopularity) || filters.minPopularity < 0 || filters.minPopularity > 5)) {
      errors.push('Min Rating must be between 0 and 5');
    }
    
    if (filters.maxPopularity && (isNaN(filters.maxPopularity) || filters.maxPopularity < 0 || filters.maxPopularity > 5)) {
      errors.push('Max Rating must be between 0 and 5');
    }
    
    if (filters.minPrice && filters.maxPrice && parseFloat(filters.minPrice) > parseFloat(filters.maxPrice)) {
      errors.push('Min Price cannot be greater than Max Price');
    }
    
    if (filters.minPopularity && filters.maxPopularity && parseFloat(filters.minPopularity) > parseFloat(filters.maxPopularity)) {
      errors.push('Min Rating cannot be greater than Max Rating');
    }
    
    return errors;
  };

  const applySorting = useCallback((productsToSort) => {
    return sortProducts(productsToSort, sortBy, sortOrder);
  }, [sortBy, sortOrder]);

  const handleTouchStart = useCallback((e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isTouchingRef.current = true;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isTouchingRef.current) return;
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchStartXRef.current - touchX;
    const deltaY = touchStartYRef.current - touchY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (!isTouchingRef.current) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartXRef.current - touchEndX;
    const minSwipeDistance = 50;
    
    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        setCurrentSlide(s => Math.min(maxSlide, s + 1));
      } else {
        setCurrentSlide(s => Math.max(0, s - 1));
      }
    }
    
    isTouchingRef.current = false;
  }, [maxSlide]);

  const updateSlidesToShow = useCallback(() => {
    const getSlidesCount = () => {
      if (window.innerWidth >= 1200) return 4;
      if (window.innerWidth >= 992) return 3;
      if (window.innerWidth >= 680) return 2;
      return 1;
    };
    const newSlidesToShow = getSlidesCount();
    setSlidesToShow(newSlidesToShow);
    
    const maxSlide = Math.max(0, filteredProducts.length - newSlidesToShow);
    if (currentSlide > maxSlide) {
      setCurrentSlide(maxSlide);
    }
  }, [filteredProducts.length, currentSlide]);

  useEffect(() => {
    window.addEventListener('resize', updateSlidesToShow);
    updateSlidesToShow();
    return () => window.removeEventListener('resize', updateSlidesToShow);
  }, [updateSlidesToShow]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const queryParams = new URLSearchParams();
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
    if (filters.minPopularity) queryParams.append('minPopularity', filters.minPopularity);
    if (filters.maxPopularity) queryParams.append('maxPopularity', filters.maxPopularity);

    try {
      const url = `${API_BASE_URL}/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Invalid filter values. Please check your input ranges.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      const result = await response.json();
      if (result.success) {
        setOriginalProducts(result.data);
        const sortedProducts = applySorting(result.data);
        setProducts(sortedProducts);
        
        const initialColors = {};
        result.data.forEach(p => { 
          initialColors[p.name] = 'yellow'; 
        });
        setSelectedColors(initialColors);
        setCurrentSlide(0);
        
        if (queryParams.toString()) {
          setSuccessMessage(`Found ${result.data.length} products matching your criteria`);
        }
      } else {
        throw new Error(result.error || 'Failed to fetch products');
      }
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        setError('Unable to connect to server. Please check your connection and try again.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, applySorting]);

  const clearFilters = useCallback(async () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      minPopularity: '',
      maxPopularity: ''
    });
    
    setSortBy('default');
    setSortOrder('asc');
    setShowFavoritesOnly(false);
    
    setError(null);
    setSuccessMessage(null);
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`);
      const result = await response.json();
      
      if (result.success) {
        setOriginalProducts(result.data);
        setProducts(result.data);
        
        const initialColors = {};
        result.data.forEach(product => {
          initialColors[product.name] = 'yellow';
        });
        setSelectedColors(initialColors);
        setCurrentSlide(0);
        setSuccessMessage('Filters and sorting cleared successfully');
      }
      setLoading(false);
    } catch (error) {
      setError('Failed to clear filters. Please try again.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (originalProducts.length > 0) {
      const sortedProducts = applySorting(originalProducts);
      setProducts(sortedProducts);
      setCurrentSlide(0);
    }
  }, [sortBy, sortOrder, originalProducts, applySorting]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [showFavoritesOnly]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    
    if (error) {
      setError(null);
    }
  };

  const handleApplyFilters = () => {
    const validationErrors = validateFilters();
    
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }
    
    fetchProducts();
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleColorChange = (productName, color) => {
    setSelectedColors(prev => ({ ...prev, [productName]: color }));
  };

  const handleToggleFavorites = () => {
    setShowFavoritesOnly(prev => !prev);
  };

  const handleFavoriteToggle = (product) => {
    const productId = product.name; // Use name consistently
    const wasAdded = toggleFavorite(productId);
    
    if (wasAdded) {
      setSuccessMessage(`${product.name} added to favorites`);
    } else {
      setSuccessMessage(`${product.name} removed from favorites`);
    }
  };

  const handleMouseDown = useCallback((e) => {
    if (!scrollTrackRef.current) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartSlideRef.current = currentSlide;
    if (scrollTrackRef.current) {
      scrollTrackRef.current.classList.add('dragging');
    }
    e.preventDefault();
  }, [currentSlide]);

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current || !scrollTrackRef.current) return;
    const trackWidth = scrollTrackRef.current.offsetWidth;
    const thumbWidth = trackWidth * (slidesToShow / filteredProducts.length);
    const effectiveTrackWidth = trackWidth - thumbWidth;
    
    const deltaX = e.clientX - dragStartXRef.current;
    const dragPercentage = deltaX / effectiveTrackWidth;
    
    const slideChange = dragPercentage * maxSlide;
    const newSlide = dragStartSlideRef.current + slideChange;
    
    setCurrentSlide(Math.max(0, Math.min(Math.round(newSlide), maxSlide)));
  }, [maxSlide, filteredProducts.length, slidesToShow]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    if (scrollTrackRef.current) {
      scrollTrackRef.current.classList.remove('dragging');
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  
  const handleTrackClick = (e) => {
    if (!scrollTrackRef.current || e.target.classList.contains('scroll-thumb')) return;
    const rect = scrollTrackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const trackWidth = rect.width;
    const clickPercentage = clickX / trackWidth;
    const targetSlide = Math.round(clickPercentage * maxSlide);
    setCurrentSlide(targetSlide);
  };

  if (loading) {
    return (
      <div className="product-listing-app">
        <header className="header">
          <h1>Product List</h1>
        </header>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="product-listing-app">
      <header className="header">
        <h1>Product List</h1>
      </header>

      {error && (
        <Toast
          type="error"
          title="Validation Error"
          message={error}
          onClose={() => setError(null)}
          onRetry={error.includes('server') || error.includes('connection') ? fetchProducts : null}
        />
      )}
      
      {successMessage && (
        <Toast
          type="success"
          title="Success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      <CollapsibleFilterSort
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={clearFilters}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        productCount={products.length}
        additionalFilters={
          <FavoritesFilter
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavorites={handleToggleFavorites}
            favoritesCount={getFavoritesCount()}
          />
        }
      />

      {filteredProducts.length === 0 ? (
        <EmptyState 
          onAction={showFavoritesOnly ? () => setShowFavoritesOnly(false) : clearFilters}
          message={showFavoritesOnly ? "No favorite products found" : "No products found"}
          actionText={showFavoritesOnly ? "Show All Products" : "Clear Filters"}
        />
      ) : (
        <>
          <div className="carousel-container">
            <button 
              className="carousel-btn prev" 
              onClick={() => setCurrentSlide(s => Math.max(0, s - 1))} 
              disabled={currentSlide === 0}
            >
              ‹
            </button>
            
            <div 
              className="carousel-overflow"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div 
                className="carousel-wrapper" 
                style={{ 
                  transform: `translateX(-${currentSlide * (100 / slidesToShow)}%)` 
                }}
              >
                {filteredProducts.map((product) => (
                  <div 
                    key={product.name} 
                    className="product-card" 
                    style={{ 
                      flexBasis: `calc(100% / ${slidesToShow} - 20px)` 
                    }}
                  >
                    <FavoritesButton
                      productId={product.name}
                      productName={product.name}
                      onToggle={() => handleFavoriteToggle(product)}
                    />
                    
                    <img 
                      src={product.images[selectedColors[product.name] || 'yellow']} 
                      alt={product.name} 
                      className="product-image"
                    />
                    <div className="product-title">{product.name}</div>
                    <div className="product-price">${product.price.toFixed(2)} USD</div>
                    
                    <ColorPicker 
                      colors={product.images} 
                      selectedColor={selectedColors[product.name] || 'yellow'} 
                      onColorChange={(color) => handleColorChange(product.name, color)}
                    />
                    
                    <StarRating rating={product.popularityRating} />
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              className="carousel-btn next" 
              onClick={() => setCurrentSlide(s => Math.min(maxSlide, s + 1))} 
              disabled={currentSlide >= maxSlide}
            >
              ›
            </button>
          </div>

          <div className="product-info">
            <div className="product-count">
              {getSortDescription(sortBy, sortOrder, filteredProducts.length)}
              {showFavoritesOnly && ` (${getFavoritesCount()} favorites)`}
            </div>
            <div className="gold-price-info">
              Current Gold Price: ${products[0]?.goldPrice}/gram (24k)
            </div>
          </div>

          {filteredProducts.length > slidesToShow && (
            <div 
              className="scroll-track-container" 
              ref={scrollTrackRef} 
              onClick={handleTrackClick}
            >
              <div className="scroll-track">
                <div 
                  className="scroll-thumb" 
                  onMouseDown={handleMouseDown} 
                  style={{
                    width: `${(slidesToShow / filteredProducts.length) * 100}%`,
                    left: `${maxSlide > 0 ? (currentSlide / maxSlide) * (100 - (slidesToShow / filteredProducts.length) * 100) : 0}%`
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}