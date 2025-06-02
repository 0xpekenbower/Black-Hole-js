// import { RegisterResponse } from './Auth';
/**
 * Auth types
 */

// Basic Response Type
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// API Response Status
export interface ResponseStatus {
  success: boolean;
  code: number;
  message: string;
}

// Register
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  repassword: string;
  first_name?: string;
  last_name?: string;
}

export interface RegisterResponse {
  Success: string;
  msg?: string;
  Error?: string;
}

// Login
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  Success: string;
  token: string;
  Error?: string;
}

// OAuth
export interface OAuthRequest {
  code: string;
}

export interface OAuthResponse {
  Success: string;
  token: string;
  Error?: string;
}

// Password Management
export interface ChangePasswordRequest {
  old_pass: string;
  new_pass: string;
}

export interface ChangePasswordResponse {
  Success: string;
  Error?: string;
}

// Forgot Password
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  Success: boolean;
  Error?: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  password: string;
  repassword: string;
}

export interface ResetPasswordResponse {
  Success: boolean;
  Error?: string;
}

// JWT Token
export interface JwtPayload {
  id: number;
  username: string;
  email: string;
  iat: number;
  exp: number;
}

// User Profile
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  is_oauth: boolean;
}

