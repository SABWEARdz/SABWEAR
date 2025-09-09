# SABWEAR - Premium Fashion Store

## Overview
SABWEAR is a premium fashion e-commerce platform specializing in jeans and fashion apparel. The application features a modern single-page application with a welcome landing overlay that transitions to the main shopping interface. It includes a product catalog, shopping cart functionality, admin panel for inventory management, and order processing capabilities. The platform is designed with a mobile-first responsive approach and supports both online and offline functionality through a dual data storage strategy.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Single Page Application (SPA)**: Built with vanilla HTML, CSS, and JavaScript without frameworks
- **Landing Page Experience**: Welcome overlay with hero image that transitions to the main shopping interface via "SHOP NOW" button
- **Responsive Design**: Mobile-first approach using modern CSS Grid, Flexbox, and CSS animations
- **Component-Based UI**: Modular sections including product catalog, admin panel, cart functionality, and sidebar navigation
- **Progressive Enhancement**: Graceful degradation from Firebase to local storage when offline

### Backend Architecture
- **Express.js Server**: RESTful API server running on configurable port (default 5000)
- **Static File Serving**: Serves frontend assets and uploaded product images
- **File Upload System**: Multer-based image upload with disk storage and automatic directory creation
- **CORS Configuration**: Wildcard origin support for cross-origin requests
- **Environment-Based Configuration**: Different API endpoints for development and production

### Data Storage Solutions
- **Primary Database**: Firebase Firestore for persistent product data storage
- **Local Storage Fallback**: Browser localStorage for cart data and offline product caching
- **Dual Data Strategy**: Automatic fallback to local storage when Firebase is unavailable
- **Product Schema**: Includes name, category, price, image URL, description, and available sizes (especially for jeans with waist measurements)
- **File Storage**: Local uploads directory for product images with unique filename generation

### Authentication and Authorization
- **Simple Admin Access**: Basic admin login system for inventory management interface
- **Firebase Service Account**: Server-side authentication using Firebase Admin SDK
- **Environment Variable Security**: Sensitive Firebase credentials stored in .env files
- **No User Authentication**: Public shopping interface without user registration requirements

### API Architecture
- **RESTful Endpoints**: Standardized API routes for products CRUD operations
- **Error Handling**: Centralized error handling with user-friendly notifications
- **Request Validation**: JSON body parsing with size limits (50MB) for image uploads
- **Fallback Strategy**: Automatic retry and local storage fallback on API failures

## External Dependencies

### Cloud Services
- **Firebase Firestore**: NoSQL document database for product data persistence and real-time updates
- **Firebase Admin SDK**: Server-side Firebase integration for secure database operations

### NPM Packages
- **Express.js (v5.1.0)**: Web application framework for the backend API server
- **CORS (v2.8.5)**: Cross-origin resource sharing middleware for browser compatibility
- **dotenv (v17.2.2)**: Environment variable management for configuration
- **firebase-admin (v13.5.0)**: Official Firebase Admin SDK for server-side operations
- **multer (v2.0.2)**: Middleware for handling multipart/form-data file uploads

### Frontend Dependencies
- **Google Fonts**: Poppins, Montserrat, and Roboto font families for typography
- **Native Browser APIs**: Fetch API for HTTP requests, localStorage for caching, FileReader for image handling