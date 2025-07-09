# Product Listing Application

A full-stack product listing application built with React and Node.js.

## Live Demo
- **Frontend**: https://your-app-name.vercel.app
- **Backend API**: https://your-app-name-backend.herokuapp.com

## Features
- Dynamic product pricing based on real-time gold prices
- Interactive color picker with image switching
- Responsive carousel with touch/swipe support
- Star rating system
- Product filtering by price and popularity
- Mobile-responsive design

## Tech Stack
- **Frontend**: React, HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Deployment**: Vercel (Frontend), Heroku (Backend)
- **APIs**: Real-time gold price API

## Local Development
1. Clone the repository
2. Install dependencies for both frontend and backend
3. Start backend server: `npm run dev`
4. Start frontend: `npm start`
5. Open http://localhost:3000

## API Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/gold-price` - Get current gold price
- `GET /health` - Health check