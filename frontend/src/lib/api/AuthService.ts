/**
 * Authentication service for handling user authentication operations
 * @module lib/api/AuthService
 */

import { ApiClient, ApiResponse } from './Client';
import Endpoints from '@/constants/endpoints';
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  OAuthResponse
} from '@/types/Auth';

/**
 * Authentication service for handling user authentication operations
 */
export class AuthService {
  private client: ApiClient;

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
  async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    return this.client.post<RegisterResponse>(Endpoints.Auth.Register, data);
  }

  /**
   * Login a user
   * @param data - User login credentials
   * @returns Promise with login response containing token
   */
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.client.post<LoginResponse>(Endpoints.Auth.Login, data);
  }

  /**
   * Send email for password reset
   * @param email - User email
   * @returns Promise with response
   */
  async sendResetEmail(email: string): Promise<ApiResponse<ForgotPasswordResponse>> {
    return this.client.post<ForgotPasswordResponse>(Endpoints.Auth.Send_mail, { email });
  }

  /**
   * Reset password with verification code
   * @param data - Password reset data including email, code, and new password
   * @returns Promise with response
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<ResetPasswordResponse>> {
    return this.client.post<ResetPasswordResponse>(Endpoints.Auth.Forget_pass, data);
  }

  /**
   * Change password (requires authentication)
   * @param oldPassword - Current password
   * @param newPassword - New password
   * @returns Promise with response
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<ChangePasswordResponse>> {
    const data: ChangePasswordRequest = {
      old_pass: oldPassword,
      new_pass: newPassword
    };
    return this.client.post<ChangePasswordResponse>('/api/auth/change-password/', data);
  }

  /**
   * Handle OAuth callback
   * @param code - Authorization code from OAuth provider
   * @param provider - OAuth provider ('google' or '42')
   * @returns Promise with response containing token
   */
  async handleOAuthCallback(code: string, provider: 'google' | '42'): Promise<ApiResponse<OAuthResponse>> {
    const endpoint = provider === 'google' ? '/oauth/google/' : '/oauth/';
    return this.client.get<OAuthResponse>(`${endpoint}?code=${code}`);
  }

  /**
   * Set the auth token in the API client
   * @param token - JWT token
   */
  setAuthToken(token: string): void {
    this.client.setAuthToken(token);
  }

  /**
   * Remove the auth token from the API client
   */
  removeAuthToken(): void {
    this.client.removeAuthToken();
  }
} 