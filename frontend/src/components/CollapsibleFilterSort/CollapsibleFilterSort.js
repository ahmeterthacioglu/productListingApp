import React, { useState } from 'react';
import './CollapsibleFilterSort.css';

const CollapsibleFilterSort = ({ 
  filters, 
  onFilterChange, 
  onApplyFilters, 
  onClearFilters,
  sortBy,
  sortOrder,
  onSortChange,
  productCount
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
    if (sortBy !== optionValue) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getSortDescription = (optionValue) => {
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

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.minPopularity || filters.maxPopularity;
  const hasActiveSorting = sortBy !== 'default';

  return (
    <div className="collapsible-filter-sort">
      <div className="filter-sort-header">
        <div className="header-left">
          <button 
            className="expand-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
          >
            <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
            <span className="toggle-text">
              Filter & Sort
              {(hasActiveFilters || hasActiveSorting) && (
                <span className="active-indicator">•</span>
              )}
            </span>
          </button>
          
          <div className="product-count-compact">
            {productCount} products
          </div>
        </div>

        <div className="quick-sort">
          <span className="sort-label">Sort:</span>
          <div className="sort-buttons-compact">
            {sortOptions.slice(1).map(option => (
              <button
                key={option.value}
                className={`sort-btn-compact ${sortBy === option.value ? 'active' : ''}`}
                onClick={() => handleSortChange(option.value)}
                title={`Sort by ${option.label} ${getSortDescription(option.value)}`}
              >
                {option.label}
                <span className="sort-icon-compact">
                  {getSortIcon(option.value)}
                </span>
              </button>
              
            ))}
            <button onClick={onClearFilters} className="clear-btn">
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      <div className={`filter-sort-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="content-inner">
          <div className="detailed-filters">
            <h4>Filters</h4>
            <div className="filter-grid">
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
            </div>
          </div>

          <div className="detailed-sorting">
            <h4>Sorting</h4>
            <div className="sort-options-detailed">
              {sortOptions.map(option => (
                <button
                  key={option.value}
                  className={`sort-btn-detailed ${sortBy === option.value ? 'active' : ''}`}
                  onClick={() => handleSortChange(option.value)}
                  disabled={option.value === 'default'}
                >
                  <span className="sort-text">
                    {option.label}
                    {sortBy === option.value && (
                      <span className="sort-direction">
                        {getSortDescription(option.value)}
                      </span>
                    )}
                  </span>
                  <span className="sort-icon">
                    {option.value !== 'default' && getSortIcon(option.value)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="action-buttons">
            <button onClick={onApplyFilters} className="apply-btn">
              Apply Filters
            </button>
            <button onClick={onClearFilters} className="clear-btn">
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollapsibleFilterSort;