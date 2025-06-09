/**
 * API Error types
 * @module types/ApiError
 */

/**
 * Common API error codes
 */
export enum ApiErrorCode {
  INVALID_CREDENTIALS = 'invalid_credentials',
  ACCOUNT_LOCKED = 'account_locked',
  TOO_MANY_ATTEMPTS = 'too_many_attempts',
  SESSION_EXPIRED = 'session_expired',
  EMAIL_EXISTS = 'email_exists',
  USERNAME_EXISTS = 'username_exists',
  INVALID_EMAIL = 'invalid_email',
  INVALID_PASSWORD = 'invalid_password',
  PASSWORDS_DONT_MATCH = 'passwords_dont_match',
  INVALID_CODE = 'invalid_code',
  CODE_EXPIRED = 'code_expired',
  EMAIL_NOT_FOUND = 'email_not_found',
  NETWORK_ERROR = 'network_error',
  SERVER_ERROR = 'server_error',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Maps backend error messages to error codes
 */
export const BackendErrorMap: Record<string, ApiErrorCode> = {
  'User does not exist': ApiErrorCode.INVALID_CREDENTIALS,
  'Incorrect Password': ApiErrorCode.INVALID_CREDENTIALS,
  
  'Account is locked': ApiErrorCode.ACCOUNT_LOCKED,
  'Too many failed login attempts': ApiErrorCode.TOO_MANY_ATTEMPTS,
  
  'Email already exists': ApiErrorCode.EMAIL_EXISTS,
  'Username already exists': ApiErrorCode.USERNAME_EXISTS,
  'Email does not comply with requirements': ApiErrorCode.INVALID_EMAIL,
  'Passwords do not match': ApiErrorCode.PASSWORDS_DONT_MATCH,
  'Password must contain at least 10 characters': ApiErrorCode.INVALID_PASSWORD,
  'Password must contain [a-z]': ApiErrorCode.INVALID_PASSWORD,
  'Password must contain [A-Z]': ApiErrorCode.INVALID_PASSWORD,
  'Password must contain [0-9]': ApiErrorCode.INVALID_PASSWORD,
  'Password must contain [@$!%*?&\'"]': ApiErrorCode.INVALID_PASSWORD,
  
  'Email does not exist': ApiErrorCode.EMAIL_NOT_FOUND,
  'Incorrect email/code': ApiErrorCode.INVALID_CODE,
  'The code expired': ApiErrorCode.CODE_EXPIRED,
  
  'Network error': ApiErrorCode.NETWORK_ERROR,
  'Failed to fetch': ApiErrorCode.NETWORK_ERROR,
};

/**
 * Maps error codes to user-friendly messages
 */
export const ErrorMessages: Record<ApiErrorCode, string> = {
  [ApiErrorCode.INVALID_CREDENTIALS]: 'Invalid username or password.',
  [ApiErrorCode.ACCOUNT_LOCKED]: 'Your account has been locked. Please reset your password.',
  [ApiErrorCode.TOO_MANY_ATTEMPTS]: 'Too many failed login attempts. Please try again later.',
  [ApiErrorCode.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  
  [ApiErrorCode.EMAIL_EXISTS]: 'This email is already registered. Please use a different email.',
  [ApiErrorCode.USERNAME_EXISTS]: 'This username is already taken. Please choose a different username.',
  [ApiErrorCode.INVALID_EMAIL]: 'Please enter a valid email address.',
  [ApiErrorCode.INVALID_PASSWORD]: 'Password must be at least 10 characters and include lowercase letters, uppercase letters, numbers, and special characters.',
  [ApiErrorCode.PASSWORDS_DONT_MATCH]: 'The passwords you entered do not match.',
  
  [ApiErrorCode.INVALID_CODE]: 'The verification code is invalid.',
  [ApiErrorCode.CODE_EXPIRED]: 'The verification code has expired. Please request a new one.',
  [ApiErrorCode.EMAIL_NOT_FOUND]: 'No account found with this email address.',
  
  [ApiErrorCode.NETWORK_ERROR]: 'Network error. Please check your internet connection and try again.',
  [ApiErrorCode.SERVER_ERROR]: 'Server error. Please try again later.',
  
  [ApiErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
};

/**
 * Get a user-friendly error message from an error code
 * @param code - Error code
 * @returns User-friendly error message
 */
export function getErrorMessage(code: ApiErrorCode): string {
  return ErrorMessages[code] || ErrorMessages[ApiErrorCode.UNKNOWN_ERROR];
}

/**
 * Get an error code from a backend error message
 * @param message - Backend error message
 * @returns Error code
 */
export function getErrorCode(message: string): ApiErrorCode {
  return BackendErrorMap[message] || ApiErrorCode.UNKNOWN_ERROR;
} 