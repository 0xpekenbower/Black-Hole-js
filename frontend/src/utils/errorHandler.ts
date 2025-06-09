/**
 * Error handling utilities
 * @module utils/errorHandler
 */

import { ApiErrorCode, BackendErrorMap, getErrorMessage } from '@/types/ApiError';

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
 * Get a user-friendly error message from an error
 * @param error - Error object
 * @returns User-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      return getErrorMessage(ApiErrorCode.NETWORK_ERROR);
    }
    
    const errorCode = BackendErrorMap[error.message];
    if (errorCode) {
      return getErrorMessage(errorCode);
    }
    
    return error.message;
  }
  
  if (typeof error === 'string') {
    const errorCode = BackendErrorMap[error];
    if (errorCode) {
      return getErrorMessage(errorCode);
    }
    return error;
  }
  
  if (typeof error === 'object' && error !== null && 'Error' in error) {
    const errorMessage = (error as any).Error;
    const errorCode = BackendErrorMap[errorMessage];
    if (errorCode) {
      return getErrorMessage(errorCode);
    }
    return errorMessage;
  }  
  return getErrorMessage(ApiErrorCode.UNKNOWN_ERROR);
}

/**
 * Handle API errors with consistent error handling
 * @param error - Error object
 * @param context - Error context information
 * @returns User-friendly error message
 */
export function handleApiError(error: unknown, context: string = 'API'): string {
  console.error(`${context} Error:`, error);
  
  if (typeof error === 'object' && error !== null) {
    if ('status' in error) {
      const apiError = error as { data?: any, status: { code: number, message: string, success: boolean } };      
      if (apiError.status.code && ERROR_MESSAGES[apiError.status.code]) {
        return ERROR_MESSAGES[apiError.status.code];
      }
      if (apiError.status.message) {
        const errorCode = BackendErrorMap[apiError.status.message];
        if (errorCode) {
          return getErrorMessage(errorCode);
        }
        return apiError.status.message;
      }
    }
    if ('Error' in error) {
      const errorMessage = (error as any).Error;
      const errorCode = BackendErrorMap[errorMessage];
      if (errorCode) {
        return getErrorMessage(errorCode);
      }
      return errorMessage;
    }
  }
  
  if (typeof error === 'string') {
    const errorCode = BackendErrorMap[error];
    if (errorCode) {
      return getErrorMessage(errorCode);
    }
    return error;
  }
  
  if (error instanceof Error) {
    const errorCode = BackendErrorMap[error.message];
    if (errorCode) {
      return getErrorMessage(errorCode);
    }
    
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      return getErrorMessage(ApiErrorCode.NETWORK_ERROR);
    }
    
    return error.message;
  }
  
  return getErrorMessage(ApiErrorCode.UNKNOWN_ERROR);
} 