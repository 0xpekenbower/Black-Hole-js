/**
 * Authentication service for handling user authentication operations
 * @module lib/api/Auth
 */

import { ApiClient, ApiResponse } from './Client';
import {
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  VerifyEmailExistRequest,
  GetOTPRequest,
  GetOTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from '@/types/Auth';

/**
 * Authentication service for handling user authentication operations
 */
export class AuthService {
  private client: ApiClient;
  private readonly AUTH_ENDPOINTS = {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VERIFY_EMAIL: '/auth/verify-email',
    GET_OTP: '/auth/get-otp',
    VERIFY_OTP: '/auth/verify-otp',
    CHANGE_PASSWORD: '/auth/change-password',
    REFRESH_TOKEN: '/auth/refresh',
  };

  /**
   * Create a new AuthService instance
   * @param apiClient - Optional API client instance
   */
  constructor(apiClient?: ApiClient) {
    this.client = apiClient || new ApiClient();
  }

  /**
   * Register a new user
   * @param data - User registration data
   * @returns Promise with registration response
   */
  async register(data: RegisterRequest): Promise<ApiResponse<void>> {
    return this.client.post<void>(this.AUTH_ENDPOINTS.REGISTER, data);
  }

  /**
   * Login a user
   * @param data - User login credentials
   * @returns Promise with login response containing user data and tokens
   */
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse['data']>> {
    return this.client.post<LoginResponse['data']>(this.AUTH_ENDPOINTS.LOGIN, data);
  }

  /**
   * Logout the current user
   * @returns Promise with logout response
   */
  async logout(): Promise<ApiResponse<void>> {
    return this.client.post<void>(this.AUTH_ENDPOINTS.LOGOUT);
  }

  /**
   * Verify if an email exists in the system
   * @param data - Email verification request
   * @returns Promise with email verification response
   */
  async verifyEmailExists(data: VerifyEmailExistRequest): Promise<ApiResponse<boolean>> {
    return this.client.post<boolean>(this.AUTH_ENDPOINTS.VERIFY_EMAIL, data);
  }

  /**
   * Request a one-time password for password reset
   * @param data - OTP request data
   * @returns Promise with OTP response
   */
  async getOTP(data: GetOTPRequest): Promise<ApiResponse<GetOTPResponse['data']>> {
    return this.client.post<GetOTPResponse['data']>(this.AUTH_ENDPOINTS.GET_OTP, data);
  }

  /**
   * Verify a one-time password
   * @param data - OTP verification data
   * @returns Promise with OTP verification response
   */
  async verifyOTP(data: VerifyOTPRequest): Promise<ApiResponse<VerifyOTPResponse['data']>> {
    return this.client.post<VerifyOTPResponse['data']>(this.AUTH_ENDPOINTS.VERIFY_OTP, data);
  }

  /**
   * Change user password using a token
   * @param data - Password change data
   * @returns Promise with password change response
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<ChangePasswordResponse['data']>> {
    return this.client.post<ChangePasswordResponse['data']>(this.AUTH_ENDPOINTS.CHANGE_PASSWORD, data);
  }

  /**
   * Refresh the authentication token
   * @param refreshToken - Refresh token
   * @returns Promise with new tokens
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string; expiresIn: number }>> {
    return this.client.post<{ token: string; expiresIn: number }>(
      this.AUTH_ENDPOINTS.REFRESH_TOKEN,
      { refreshToken }
    );
  }

  /**
   * Set the authentication token in the API client
   * @param token - JWT token
   */
  setAuthToken(token: string): void {
    this.client.setAuthToken(token);
  }

  /**
   * Remove the authentication token from the API client
   */
  removeAuthToken(): void {
    this.client.removeAuthToken();
  }
}
