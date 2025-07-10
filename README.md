# 🌟 Renring - Premium Gold Product Listing Platform

> A modern, responsive web application for browsing and filtering gold jewelry products with real-time pricing.

## 🚀 Live Demo

- **Frontend**: [https://renring.vercel.app](https://renring.vercel.app)
- **Backend API**: [https://renring-api.herokuapp.com](https://renring-api.herokuapp.com)
- **API Documentation**: [https://renring-api.herokuapp.com/](https://renring-api.herokuapp.com/)

## ✨ Features

### 🎯 Core Features
- **Real-time Gold Pricing** - Live gold prices from MetalPriceAPI
- **Product Carousel** - Smooth, touch-enabled product browsing
- **Advanced Filtering** - Filter by price range and rating
- **Smart Sorting** - Sort by price, rating, and name
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Color Variations** - Yellow, White, and Rose Gold options

### 🔧 Technical Features
- **Collapsible Filters** - Clean, expandable filter interface
- **Toast Notifications** - User-friendly feedback messages
- **Input Validation** - Client and server-side validation
- **Rate Limiting** - API protection with smart caching
- **Touch Gestures** - Swipe support for mobile users
- **Drag Scrolling** - Interactive carousel navigation

### 🎨 UI/UX Features
- **Avenir Typography** - Premium font experience
- **Smooth Animations** - Polished micro-interactions
- **Loading States** - Elegant loading and error handling
- **Star Ratings** - Visual product popularity indicators
- **Empty States** - Helpful messaging for no results

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **CSS3** - Custom styling with Avenir fonts
- **Responsive Design** - Mobile-first approach
- **Touch Events** - Native mobile gestures

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MetalPriceAPI** - Real-time gold prices
- **Rate Limiting** - Request throttling
- **CORS** - Cross-origin resource sharing

### Deployment
- **Vercel** - Frontend hosting
- **Heroku** - Backend API hosting
- **GitHub** - Version control
- **Environment Variables** - Secure configuration

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ahmeterthacioglu/productListingApp.git
   cd productListingApp
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Add your MetalPriceAPI key to .env
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Configure API URL in .env
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📦 Project Structure

```
renring/
├── backend/
│   ├── server.js              # Express server
│   ├── products.json          # Product data
│   ├── package.json           # Backend dependencies
│   └── .env                   # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Toast/         # Notification system
│   │   │   ├── StarRating/    # Rating component
│   │   │   ├── ColorPicker/   # Color selection
│   │   │   ├── LoadingSpinner/ # Loading states
│   │   │   ├── EmptyState/    # Empty results
│   │   │   ├── ProductFilters/ # Filter controls
│   │   │   └── CollapsibleFilterSort/ # Combined filter/sort
│   │   ├── utils/
│   │   │   └── sortingUtils.js # Sorting logic
│   │   ├── App.js             # Main application
│   │   ├── App.css            # Layout styles
│   │   └── index.css          # Global styles
│   ├── public/
│   │   └── fonts/             # Avenir font files
│   └── package.json           # Frontend dependencies
└── README.md                  # This file
```

## 🌐 API Endpoints

### Products
- `GET /api/products` - Get all products with filtering
- `GET /api/products/:id` - Get single product
- `GET /api/gold-price` - Get current gold price
- `GET /health` - Health check

### Query Parameters
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `minPopularity` - Minimum rating filter
- `maxPopularity` - Maximum rating filter

### Example Requests
```bash
# Get all products
curl https://renring-api.herokuapp.com/api/products

# Filter by price range
curl "https://renring-api.herokuapp.com/api/products?minPrice=100&maxPrice=500"

# Filter by rating
curl "https://renring-api.herokuapp.com/api/products?minPopularity=4"

# Get current gold price
curl https://renring-api.herokuapp.com/api/gold-price
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```bash
PORT=5000
NODE_ENV=production
METAL_API_KEY=your_metal_api_key
GOLDAPI_KEY=your_gold_api_key
FRONTEND_URL=https://renring.vercel.app
```

**Frontend (.env)**
```bash
REACT_APP_API_URL=https://renring-api.herokuapp.com/api
REACT_APP_APP_NAME=Renring
REACT_APP_VERSION=1.0.0
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 680px (1 product per row)
- **Tablet**: 680px - 992px (2 products per row)
- **Desktop**: 992px - 1200px (3 products per row)
- **Large Desktop**: > 1200px (4 products per row)

### Touch Support
- **Swipe Navigation** - Horizontal swipe on carousel
- **Touch Scrolling** - Drag to scroll through products
- **Tap Interactions** - Optimized button sizes

## 🎨 Design System

### Typography
- **Primary Font**: Avenir (Black, Book, Medium)
- **Fallback**: System fonts (-apple-system, BlinkMacSystemFont)
- **Sizes**: 45px (headers), 14-16px (body), 12px (labels)

### Colors
- **Primary**: #4CAF50 (Green)
- **Error**: #f44336 (Red)
- **Text**: #333 (Dark Gray)
- **Background**: #f5f5f5 (Light Gray)
- **Gold Colors**: #E6CA97, #D9D9D9, #E1A4A9

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Smooth transitions, hover effects
- **Inputs**: Clean borders, focus states
- **Toasts**: Slide-in animations, auto-dismiss

## 🔒 Security Features

### Rate Limiting
- **General**: 100 requests per 15 minutes
- **Products**: 30 requests per minute
- **Gold Price**: 10 requests per 5 minutes

### Input Validation
- **Server-side**: Express middleware validation
- **Client-side**: React form validation
- **Sanitization**: XSS protection

### CORS Configuration
- **Origins**: Restricted to known domains
- **Methods**: GET, POST, PUT, DELETE
- **Headers**: Content-Type, Authorization

## 📊 Performance

### Caching
- **Gold Prices**: 5-minute cache
- **Static Assets**: Browser caching
- **API Responses**: Efficient data structure

### Optimization
- **Image Optimization**: Compressed product images
- **Code Splitting**: Component-based loading
- **Bundle Size**: Minimal dependencies

## 🚀 Deployment

### Backend (Heroku)
```bash
heroku create renring-api
heroku config:set METAL_API_KEY=your_key
git subtree push --prefix=backend heroku main
```

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Monitoring
- **Heroku Logs**: `heroku logs --tail -a renring-api`
- **Vercel Analytics**: Built-in performance monitoring
- **Health Checks**: Automated uptime monitoring


## 🙏 Acknowledgments

- **MetalPriceAPI** - Real-time gold pricing
- **Vercel** - Frontend hosting
- **Heroku** - Backend hosting
- **Avenir** - Typography
- **React Community** - Amazing ecosystem

