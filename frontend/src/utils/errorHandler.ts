/**
 * Error handling utilities
 * @module utils/errorHandler
 */

import { ApiError } from '@/lib/api/Client';

/**
 * Common HTTP error codes and their user-friendly messages
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'Authentication failed. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This operation couldn\'t be completed due to a conflict.',
  422: 'The provided data is invalid.',
  429: 'Too many requests. Please try again later.',
  500: 'An unexpected error occurred. Please try again later.',
  502: 'Server is temporarily unavailable. Please try again later.',
  503: 'Service is unavailable. Please try again later.',
  504: 'Server took too long to respond. Please try again later.',
};

/**
 * Authentication-specific error codes and messages
 */
const AUTH_ERROR_CODES: Record<number, string> = {
  1001: 'Invalid email or password.',
  1002: 'Account is locked. Please reset your password.',
  1003: 'Email already exists. Please use a different email.',
  1004: 'Invalid verification code.',
  1005: 'Verification code has expired.',
  1006: 'Too many failed attempts. Please try again later.',
  1007: 'Password reset token is invalid or has expired.',
  1008: 'Session has expired. Please log in again.',
};

/**
 * Get a user-friendly error message from an error
 * @param error - Error object
 * @returns User-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    // Check for auth-specific error codes
    if (error.code && AUTH_ERROR_CODES[error.code]) {
      return AUTH_ERROR_CODES[error.code];
    }
    
    // Check for HTTP status code messages
    if (error.status && ERROR_MESSAGES[error.status]) {
      return ERROR_MESSAGES[error.status];
    }
    
    // Use the error message from the API if available
    return error.message || 'An unexpected error occurred. Please try again.';
  }
  
  if (error instanceof Error) {
    // For network errors or other JS errors
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    return error.message;
  }
  
  // Default error message
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Handle API errors with consistent error handling
 * @param error - Error object
 * @param context - Error context information
 * @returns User-friendly error message
 */
export function handleApiError(error: unknown, context: string = 'API'): string {
  return getUserFriendlyErrorMessage(error);
} 