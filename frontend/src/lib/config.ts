/**
 * Application configuration
 * @module lib/config
 */

/**
 * API configuration
 */
export const API_CONFIG = {
  BASE_URL: '/api',
  TIMEOUT: 30000, // 30 seconds
};

/**
 * Redis configuration
 */
export const REDIS_CONFIG = {
  URL: process.env.REDIS_URL || 'redis://redis:6379',
  PASSWORD: process.env.REDIS_PASSWORD || 'redispassword',
  DB: parseInt(process.env.REDIS_DB || '0', 10),
  CONNECT_TIMEOUT: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '5000', 10), // 5 seconds
};

/**
 * Authentication configuration
 */
export const AUTH_CONFIG = {
  TOKEN_EXPIRY: 3600, // 1 hour
  REFRESH_TOKEN_EXPIRY: 604800, // 7 days
  OTP_EXPIRY: 300, // 5 minutes
  PASSWORD_RESET_EXPIRY: 180, // 3 minutes
  SESSION_EXPIRY: 86400, // 24 hours
};

/**
 * Routes configuration
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
};

/**
 * Feature flags
 */
export const FEATURES = {
  ENABLE_RATE_LIMITING: false,
  ENABLE_REDIS_CACHE: true,
  ENABLE_SESSION_TRACKING: false,
}; 