/**
 * Error handling utilities
 * @module utils/errorHandler
 */

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
const AUTH_ERROR_CODES: Record<string, string> = {
  'invalid_credentials': 'Invalid email or password.',
  'account_locked': 'Account is locked. Please reset your password.',
  'email_exists': 'Email already exists. Please use a different email.',
  'invalid_code': 'Invalid verification code.',
  'code_expired': 'Verification code has expired.',
  'too_many_attempts': 'Too many failed attempts. Please try again later.',
  'token_expired': 'Password reset token is invalid or has expired.',
  'session_expired': 'Session has expired. Please log in again.',
};

/**
 * Backend specific error messages and their user-friendly versions
 */
const BACKEND_ERROR_MESSAGES: Record<string, string> = {
  // Login errors
  'User does not exist': 'Invalid username or password.',
  'Incorrect Password': 'Invalid username or password.',
  
  // Registration errors
  'Email does not comply with requirements': 'Please enter a valid email address.',
  'Passwords do not match': 'The passwords you entered do not match.',
  'Password must contain at least 10 characters': 'Password must be at least 10 characters long.',
  'Password must contain [a-z]': 'Password must include lowercase letters.',
  'Password must contain [A-Z]': 'Password must include uppercase letters.',
  'Password must contain [0-9]': 'Password must include numbers.',
  'Password must contain [@$!%*?&\'"]': 'Password must include special characters.',
  
  // Forgot password errors
  'Email does not exist': 'No account found with this email address.',
  'Incorrect email/code': 'The verification code is invalid.',
  'The code expired': 'The verification code has expired. Please request a new one.',
};

/**
 * Get a user-friendly error message from an error
 * @param error - Error object
 * @returns User-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  // Check for network errors
  if (error instanceof Error) {
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    
    // Check if the error message matches any of our known backend error messages
    const backendMessage = BACKEND_ERROR_MESSAGES[error.message];
    if (backendMessage) {
      return backendMessage;
    }
    
    // Check if the error message contains an array (from backend validation)
    if (error.message.startsWith('[') && error.message.endsWith(']')) {
      try {
        const errorArray = JSON.parse(error.message);
        if (Array.isArray(errorArray) && errorArray.length > 0) {
          // Map each error to a user-friendly message if possible
          const mappedErrors = errorArray.map(err => BACKEND_ERROR_MESSAGES[err] || err);
          return mappedErrors.join(', ');
        }
      } catch (e) {
        // If parsing fails, just return the original message
      }
    }
    
    return error.message;
  }
  
  // If error is a string
  if (typeof error === 'string') {
    return BACKEND_ERROR_MESSAGES[error] || error;
  }
  
  // If error is an object with an Error property (from our API responses)
  if (typeof error === 'object' && error !== null && 'Error' in error) {
    const errorMessage = (error as any).Error;
    return BACKEND_ERROR_MESSAGES[errorMessage] || errorMessage;
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
  // Log the original error for debugging
  console.error(`${context} Error:`, error);
  
  // Extract error from API response if available
  let errorToHandle = error;
  
  if (typeof error === 'object' && error !== null) {
    // Handle axios or fetch response errors
    if ('response' in error && error.response) {
      const response = (error as any).response;
      
      // Check for status code first
      if (response.status && ERROR_MESSAGES[response.status]) {
        return ERROR_MESSAGES[response.status];
      }
      
      // Then check for error data
      if (response.data) {
        if (typeof response.data === 'string') {
          errorToHandle = response.data;
        } else if (response.data.Error) {
          errorToHandle = response.data.Error;
        } else if (response.data.message) {
          errorToHandle = response.data.message;
        }
      }
    } 
    // Handle standard fetch API responses
    else if ('status' in error && (error as any).status) {
      const status = (error as any).status;
      if (ERROR_MESSAGES[status.code]) {
        return ERROR_MESSAGES[status.code];
      }
      
      if (status.message) {
        errorToHandle = status.message;
      }
    }
    // Handle our API client responses
    else if ('data' in error && 'status' in error) {
      const apiError = error as { data?: any, status: { code: number, message: string } };
      
      if (apiError.status && ERROR_MESSAGES[apiError.status.code]) {
        return ERROR_MESSAGES[apiError.status.code];
      }
      
      if (apiError.data && apiError.data.Error) {
        errorToHandle = apiError.data.Error;
      } else if (apiError.status.message) {
        errorToHandle = apiError.status.message;
      }
    }
  }
  
  return getUserFriendlyErrorMessage(errorToHandle);
} 