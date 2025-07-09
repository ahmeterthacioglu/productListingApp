import React from 'react';
import './ProductSorting.css';

const ProductSorting = ({ sortBy, sortOrder, onSortChange }) => {
  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price', label: 'Price' },
    { value: 'rating', label: 'Rating' },
    { value: 'name', label: 'Name' }
  ];

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      onSortChange(newSortBy, newOrder);
    } else {
      const defaultOrder = newSortBy === 'price' ? 'asc' : 'desc'; 
      onSortChange(newSortBy, defaultOrder);
    }
  };

  const getSortIcon = (optionValue) => {
    if (sortBy !== optionValue) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getSortLabel = (optionValue) => {
    if (sortBy !== optionValue) return '';
    
    switch (optionValue) {
      case 'price':
        return sortOrder === 'asc' ? '(Low to High)' : '(High to Low)';
      case 'rating':
        return sortOrder === 'asc' ? '(Low to High)' : '(High to Low)';
      case 'name':
        return sortOrder === 'asc' ? '(A to Z)' : '(Z to A)';
      default:
        return '';
    }
  };

  return (
    <div className="product-sorting">
      <div className="sorting-header">
        <span className="sorting-label">Sort by:</span>
      </div>
      
      <div className="sorting-options">
        {sortOptions.map(option => (
          <button
            key={option.value}
            className={`sort-btn ${sortBy === option.value ? 'active' : ''}`}
            onClick={() => handleSortChange(option.value)}
            disabled={option.value === 'default'}
          >
            <span className="sort-text">
              {option.label}
              {sortBy === option.value && (
                <span className="sort-direction">{getSortLabel(option.value)}</span>
              )}
            </span>
            <span className="sort-icon">
              {option.value !== 'default' && getSortIcon(option.value)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductSorting;