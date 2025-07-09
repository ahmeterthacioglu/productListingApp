import React from 'react';
import './ProductFilters.css';

const ProductFilters = ({ 
  filters, 
  onFilterChange, 
  onApplyFilters, 
  onClearFilters 
}) => {
  const isInvalid = (name, value) => {
    if (!value) return false;
    
    switch (name) {
      case 'minPrice':
      case 'maxPrice':
        return isNaN(value) || value < 0 || value > 10000;
      case 'minPopularity':
      case 'maxPopularity':
        return isNaN(value) || value < 0 || value > 5;
      default:
        return false;
    }
  };

  return (
    <div className="filters">
      <h3>Filter Products</h3>
      <div className="filter-row">
        <div className="filter-group">
          <label>Min Price ($)</label>
          <input 
            name="minPrice" 
            type="number" 
            min="0"
            max="10000"
            value={filters.minPrice} 
            onChange={onFilterChange} 
            placeholder="0"
            className={isInvalid('minPrice', filters.minPrice) ? 'invalid' : ''}
          />
        </div>
        
        <div className="filter-group">
          <label>Max Price ($)</label>
          <input 
            name="maxPrice" 
            type="number" 
            min="0"
            max="10000"
            value={filters.maxPrice} 
            onChange={onFilterChange} 
            placeholder="1000"
            className={isInvalid('maxPrice', filters.maxPrice) ? 'invalid' : ''}
          />
        </div>
        
        <div className="filter-group">
          <label>Min Rating</label>
          <input 
            name="minPopularity" 
            type="number" 
            step="0.1" 
            min="0" 
            max="5" 
            value={filters.minPopularity} 
            onChange={onFilterChange} 
            placeholder="0.0"
            className={isInvalid('minPopularity', filters.minPopularity) ? 'invalid' : ''}
          />
        </div>
        
        <div className="filter-group">
          <label>Max Rating</label>
          <input 
            name="maxPopularity" 
            type="number" 
            step="0.1" 
            min="0" 
            max="5" 
            value={filters.maxPopularity} 
            onChange={onFilterChange} 
            placeholder="5.0"
            className={isInvalid('maxPopularity', filters.maxPopularity) ? 'invalid' : ''}
          />
        </div>
        
        <div className="filter-buttons">
          <button onClick={onApplyFilters} className="apply-btn">
            Apply Filters
          </button>
          <button onClick={onClearFilters} className="clear-btn">
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;