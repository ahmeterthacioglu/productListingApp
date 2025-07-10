const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Simple rate limiting without external dependency
const rateLimitStore = new Map();

const createSimpleRateLimit = (windowMs, max) => {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, []);
    }
    
    const requests = rateLimitStore.get(key);
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= max) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    validRequests.push(now);
    rateLimitStore.set(key, validRequests);
    next();
  };
};

// Apply rate limiting
const generalLimiter = createSimpleRateLimit(15 * 60 * 1000, 100); // 100 per 15 min
const productLimiter = createSimpleRateLimit(1 * 60 * 1000, 30);   // 30 per minute
const goldLimiter = createSimpleRateLimit(5 * 60 * 1000, 10);      // 10 per 5 min

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://127.0.0.1:3000',
    'https://renring.vercel.app',
    'https://renring.herokuapp.com',
    'https://renring-api.herokuapp.com',
    process.env.FRONTEND_URL,
    process.env.PRODUCTION_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input validation middleware
const validateFilters = (req, res, next) => {
  const { minPrice, maxPrice, minPopularity, maxPopularity } = req.query;
  const errors = [];
  
  if (minPrice !== undefined && minPrice !== '') {
    const min = parseFloat(minPrice);
    if (isNaN(min) || min < 0 || min > 10000) {
      errors.push('Invalid minPrice. Must be a number between 0 and 10000.');
    } else {
      req.query.minPrice = min;
    }
  } else {
    req.query.minPrice = undefined;
  }
  
  if (maxPrice !== undefined && maxPrice !== '') {
    const max = parseFloat(maxPrice);
    if (isNaN(max) || max < 0 || max > 10000) {
      errors.push('Invalid maxPrice. Must be a number between 0 and 10000.');
    } else {
      req.query.maxPrice = max;
    }
  } else {
    req.query.maxPrice = undefined;
  }
  
  if (minPopularity !== undefined && minPopularity !== '') {
    const min = parseFloat(minPopularity);
    if (isNaN(min) || min < 0 || min > 5) {
      errors.push('Invalid minPopularity. Must be a number between 0 and 5.');
    } else {
      req.query.minPopularity = min;
    }
  } else {
    req.query.minPopularity = undefined;
  }
  
  if (maxPopularity !== undefined && maxPopularity !== '') {
    const max = parseFloat(maxPopularity);
    if (isNaN(max) || max < 0 || max > 5) {
      errors.push('Invalid maxPopularity. Must be a number between 0 and 5.');
    } else {
      req.query.maxPopularity = max;
    }
  } else {
    req.query.maxPopularity = undefined;
  }
  
  if (req.query.minPrice !== undefined && req.query.maxPrice !== undefined && req.query.minPrice > req.query.maxPrice) {
    errors.push('minPrice cannot be greater than maxPrice.');
  }
  
  if (req.query.minPopularity !== undefined && req.query.maxPopularity !== undefined && req.query.minPopularity > req.query.maxPopularity) {
    errors.push('minPopularity cannot be greater than maxPopularity.');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }
  
  next();
};

let goldPriceCache = {
  price: 100.45, // Updated fallback price
  lastUpdated: 0,
  cacheExpiry: 5 * 60 * 1000 
};

const loadProducts = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8');
    const products = JSON.parse(data);
    
    if (!Array.isArray(products) || products.length === 0) {
      throw new Error('Invalid products data structure');
    }
    
    return products;
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
};

// Enhanced gold price fetching with Metal Price API
const fetchGoldPrice = async () => {
  const now = Date.now();
  
  // Return cached price if still valid
  if (now - goldPriceCache.lastUpdated < goldPriceCache.cacheExpiry) {
    console.log('💰 Using cached gold price:', goldPriceCache.price);
    return goldPriceCache.price;
  }
  
  const goldPriceSources = [
    {
      name: 'MetalPriceAPI',
      fetch: async () => {
        const API_KEY = process.env.METAL_API_KEY ;
        const response = await axios.get(`https://api.metalpriceapi.com/v1/latest?api_key=${API_KEY}&base=USD&currencies=XAU`, {
          timeout: 5000
        });
        
        if (!response.data || !response.data.rates || !response.data.rates.XAU) {
          throw new Error('Invalid response format from MetalPriceAPI');
        }
        
        // Convert from troy ounce to gram and flip the rate (XAU is in troy ounces per USD)
        const pricePerTroyOunce = 1 / response.data.rates.XAU;
        const pricePerGram = pricePerTroyOunce / 31.1035;
        
        return pricePerGram;
      }
    },
    {
      name: 'GoldAPI.io',
      fetch: async () => {
        const API_KEY = process.env.GOLDAPI_KEY ;
        const response = await axios.get('https://www.goldapi.io/api/XAU/USD', {
          headers: {
            'x-access-token': API_KEY,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });
        
        if (!response.data || !response.data.price_gram_24k) {
          throw new Error('Invalid response format from GoldAPI');
        }
        
        return response.data.price_gram_24k;
      }
    },
    {
      name: 'Fallback',
      fetch: async () => {
        return 100.45; // Updated fallback price 
      }
    }
  ];

  for (const source of goldPriceSources) {
    try {
      const price = await source.fetch();
      
      if (price && price > 0 && price < 10000) { 
        
        // Update cache
        goldPriceCache = {
          price: price,
          lastUpdated: now,
          cacheExpiry: goldPriceCache.cacheExpiry
        };
        
        return price;
      } else {
        throw new Error('Invalid price value');
      }
    } catch (error) {
      console.log(`❌ ${source.name} failed:`, error.message);
      continue;
    }
  }

  
  return goldPriceCache.price;
};

const calculatePrice = (popularityScore, weight, goldPrice) => {
  if (typeof popularityScore !== 'number' || typeof weight !== 'number' || typeof goldPrice !== 'number') {
    throw new Error('Invalid input types for price calculation');
  }
  
  if (popularityScore < 0 || popularityScore > 1 || weight <= 0 || goldPrice <= 0) {
    throw new Error('Invalid input values for price calculation');
  }
  
  return (popularityScore + 1) * weight * goldPrice;
};

const convertPopularityTo5Stars = (popularityScore) => {
  if (typeof popularityScore !== 'number' || popularityScore < 0 || popularityScore > 1) {
    return 0;
  }
  return Math.round((popularityScore * 5) * 10) / 10;
};

const applyFilters = (products, filters) => {
  let filteredProducts = [...products];
  
  if (filters.minPrice !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice);
  }
  
  if (filters.maxPrice !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice);
  }
  
  if (filters.minPopularity !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.popularityRating >= filters.minPopularity);
  }
  
  if (filters.maxPopularity !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.popularityRating <= filters.maxPopularity);
  }
  
  return filteredProducts;
};

app.use('/api/', generalLimiter);
app.use('/api/products', productLimiter);
app.use('/api/gold-price', goldLimiter);

// GET /api/products - Get all products with calculated prices and filtering
app.get('/api/products', validateFilters, async (req, res) => {
  try {
    const products = loadProducts();
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No products found in products.json'
      });
    }
  
    const goldPrice = await fetchGoldPrice();
    
    let processedProducts = products.map((product, index) => {
      try {
        const price = calculatePrice(product.popularityScore, product.weight, goldPrice);
        const popularityRating = convertPopularityTo5Stars(product.popularityScore);
        
        return {
          id: index + 1,
          ...product,
          price: Math.round(price * 100) / 100,
          popularityRating,
          goldPrice: Math.round(goldPrice * 100) / 100
        };
      } catch (error) {
        console.error(`Error processing product ${product.name}:`, error);
        return null;
      }
    }).filter(product => product !== null);
    
    const filters = {
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      minPopularity: req.query.minPopularity,
      maxPopularity: req.query.maxPopularity
    };
    
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([key, value]) => value !== undefined)
    );
    
    const filteredProducts = applyFilters(processedProducts, filters);
        
    res.json({
      success: true,
      data: filteredProducts,
      totalProducts: products.length,
      filteredCount: filteredProducts.length,
      goldPrice: Math.round(goldPrice * 100) / 100,
      goldPriceSource: goldPriceCache.lastUpdated > 0 ? 'API' : 'fallback',
      filters: cleanFilters,
      timestamp: new Date().toISOString(),
      cacheInfo: {
        goldPriceCached: Date.now() - goldPriceCache.lastUpdated < goldPriceCache.cacheExpiry,
        cacheAge: Math.round((Date.now() - goldPriceCache.lastUpdated) / 1000)
      }
    });
  } catch (error) {
    console.error('❌ Error processing products:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// GET /api/products/:id - Get single product with validation
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId) || productId < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID. Must be a positive integer.'
      });
    }
    
    const products = loadProducts();
    const product = products[productId - 1];
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    const goldPrice = await fetchGoldPrice();
    const price = calculatePrice(product.popularityScore, product.weight, goldPrice);
    const popularityRating = convertPopularityTo5Stars(product.popularityScore);
    
    res.json({
      success: true,
      data: {
        id: productId,
        ...product,
        price: Math.round(price * 100) / 100,
        popularityRating,
        goldPrice: Math.round(goldPrice * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/gold-price - Get current gold price
app.get('/api/gold-price', async (req, res) => {
  try {
    const goldPrice = await fetchGoldPrice();
    
    res.json({
      success: true,
      goldPrice: Math.round(goldPrice * 100) / 100,
      goldData: {
        price_gram_24k: Math.round(goldPrice * 100) / 100,
        currency: 'USD',
        metal: 'XAU',
        source: goldPriceCache.lastUpdated > 0 ? 'Live API with fallback protection' : 'Fallback price',
        cached: Date.now() - goldPriceCache.lastUpdated < goldPriceCache.cacheExpiry,
        cacheAge: Math.round((Date.now() - goldPriceCache.lastUpdated) / 1000)
      },
      unit: 'USD per gram (24k)',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in gold price endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch gold price'
    });
  }
});

app.get('/health', (req, res) => {
  const products = loadProducts();
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    productsLoaded: products.length,
    goldPriceCache: {
      price: goldPriceCache.price,
      age: Math.round((Date.now() - goldPriceCache.lastUpdated) / 1000),
      cached: Date.now() - goldPriceCache.lastUpdated < goldPriceCache.cacheExpiry
    },
    environment: process.env.NODE_ENV || 'development',
    endpoints: [
      'GET /api/products',
      'GET /api/products/:id',
      'GET /api/gold-price',
      'GET /health'
    ]
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Renring - Gold Product Listing API',
    version: '1.0.0',
    description: 'Real-time gold product pricing with MetalPriceAPI integration',
    endpoints: {
      products: '/api/products',
      singleProduct: '/api/products/:id',
      goldPrice: '/api/gold-price',
      health: '/health'
    },
    filters: {
      minPrice: '?minPrice=100',
      maxPrice: '?maxPrice=500', 
      minPopularity: '?minPopularity=3',
      maxPopularity: '?maxPopularity=5',
      combined: '?minPrice=100&maxPrice=500&minPopularity=3'
    },
    features: [
      'Real-time gold pricing',
      'Product filtering & sorting',
      'Rate limiting',
      'Input validation',
      'Multiple API fallbacks'
    ]
  });
});

// Future endpoints 
//(not needed now because there is no user and I used local storage for keeping that information which is enough for now):
// POST /api/favorites - Add to favorites
// DELETE /api/favorites/:productId - Remove from favorites  
// GET /api/favorites - Get user's favorites

app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: ['/api/products', '/api/gold-price', '/health', '/']
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Renring API server running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`📦 Products: http://localhost:${PORT}/api/products`);
  console.log(`💰 Gold Price: http://localhost:${PORT}/api/gold-price`);
  console.log(`🔒 Security: Rate limiting and validation enabled`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});