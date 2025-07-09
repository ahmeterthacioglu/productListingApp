
export const sortProducts = (products, sortBy, sortOrder) => {
    if (sortBy === 'default') {
      return [...products];
    }
  
    const sortedProducts = [...products].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'rating':
          aValue = a.popularityRating;
          bValue = b.popularityRating;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          return 0;
      }
  
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (sortOrder === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      } else {
        if (sortOrder === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      }
    });
  
    return sortedProducts;
  };
  
  export const getSortingState = (sortBy, sortOrder) => {
    return {
      sortBy: sortBy || 'default',
      sortOrder: sortOrder || 'asc'
    };
  };
  
  export const getSortDescription = (sortBy, sortOrder, productCount) => {
    if (sortBy === 'default') {
      return `Showing ${productCount} products`;
    }
  
    const direction = sortOrder === 'asc' ? 'ascending' : 'descending';
    const field = sortBy === 'rating' ? 'rating' : sortBy;
    
    return `${productCount} products sorted by ${field} (${direction})`;
  };