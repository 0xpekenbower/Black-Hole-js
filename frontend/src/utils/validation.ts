/**
 * Validation utilities for form inputs
 * @module utils/validation
 */

/**
 * Email validation regex pattern
 * Matches standard email format with domain validation
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Password validation regex pattern
 * Requires at least 8 characters, one uppercase letter, one lowercase letter,
 * one number, and one special character
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Name validation regex pattern
 * Allows letters, spaces, hyphens, and apostrophes
 */
const NAME_REGEX = /^[a-zA-Z\s'-]+$/;

/**
 * Username validation regex pattern
 * Allows letters, numbers, underscores, and hyphens, 3-20 characters
 */
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns Error message or null if valid
 */
export function validateEmail(email: string): string | null {
  if (!email) {
    return 'Email is required';
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Error message or null if valid
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  if (!PASSWORD_REGEX.test(password)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
  }
  
  return null;
}

/**
 * Validate password confirmation match
 * @param password - Original password
 * @param confirmPassword - Password confirmation to validate
 * @returns Error message or null if valid
 */
export function validatePasswordConfirm(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return null;
}

/**
 * Validate name format
 * @param name - Name to validate
 * @returns Error message or null if valid
 */
export function validateName(name: string): string | null {
  if (!name) {
    return 'Name is required';
  }
  
  if (name.length < 2) {
    return 'Name must be at least 2 characters long';
  }
  
  if (!NAME_REGEX.test(name)) {
    return 'Name can only contain letters, spaces, hyphens, and apostrophes';
  }
  
  return null;
}

/**
 * Validate username format
 * @param username - Username to validate
 * @returns Error message or null if valid
 */
export function validateUsername(username: string): string | null {
  if (!username) {
    return 'Username is required';
  }
  
  if (username.length < 3) {
    return 'Username must be at least 3 characters long';
  }
  
  if (username.length > 20) {
    return 'Username must be less than 20 characters long';
  }
  
  if (!USERNAME_REGEX.test(username)) {
    return 'Username can only contain letters, numbers, underscores, and hyphens';
  }
  
  return null;
}

/**
 * Validate OTP (One-Time Password) format
 * @param otp - OTP to validate
 * @returns Error message or null if valid
 */
export function validateOTP(otp: string): string | null {
  if (!otp) {
    return 'Verification code is required';
  }
  
  // OTP should be 6 digits
  if (!/^\d{6}$/.test(otp)) {
    return 'Verification code must be 6 digits';
  }
  
  return null;
} 