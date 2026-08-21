/**
 * Application Routes
 * Centralized route path constants
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  STORE: '/store',
  PRODUCT_DETAIL: '/store/product/:id',
  ACCESSORIES: '/accessories',
  ABOUT: '/about',
  CONTACT: '/contact',
  
  // Shop routes
  CART: '/cart',
  WISHLIST: '/wishlist',
  CHECKOUT: '/checkout',
  
  // Order routes
  ORDER_CONFIRMATION: '/order-confirmation',
  TRACK_ORDER: '/track-order',
  
  // Auth routes
  SIGNIN: '/signin',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  
  // User routes
  DASHBOARD: '/dashboard',
};

// Helper function to generate product detail route
export const getProductRoute = (productId) => `/store/product/${productId}`;

// Helper function to generate store with category
export const getStoreWithCategory = (category) => `/store?category=${category}`;

// Helper function to generate store with search
export const getStoreWithSearch = (query) => `/store?search=${encodeURIComponent(query)}`;
