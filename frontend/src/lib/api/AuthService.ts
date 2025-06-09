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
   * Adapts backend response format to frontend expected format
   * @param response - API response from backend
   * @returns Adapted response for frontend
   */
  private adaptResponse<T>(response: ApiResponse<any>): ApiResponse<T> {
    if (!response.status.success) {
      return response as ApiResponse<T>;
    }
    
    if (response.data?.token) {
      return {
        data: response.data as T,
        status: response.status
      };
    }
    
    return {
      data: response.data as T || null,
      status: response.status
    };
  }

  /**
   * Register a new user
   * @param data - User registration data
   * @returns Promise with registration response
   */
  async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    const response = await this.client.post<any>(Endpoints.Auth.Register, data);
    return this.adaptResponse<RegisterResponse>(response);
  }
  /**
   * Login a user
   * @param data - User login credentials
   * @returns Promise with login response containing token
   */
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.client.post<any>(Endpoints.Auth.Login, data);
    return this.adaptResponse<LoginResponse>(response);
  }

  /**
   * Send email for password reset
   * @param email - User email
   * @returns Promise with response
   */
  async sendResetEmail(email: string): Promise<ApiResponse<ForgotPasswordResponse>> {
    const response = await this.client.post<any>(Endpoints.Auth.Send_mail, { email });
    return this.adaptResponse<ForgotPasswordResponse>(response);
  }

  /**
   * Reset password with verification code
   * @param data - Password reset data including email, code, and new password
   * @returns Promise with response
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<ResetPasswordResponse>> {
    const response = await this.client.post<any>(Endpoints.Auth.Forget_pass, data);
    return this.adaptResponse<ResetPasswordResponse>(response);
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
    const response = await this.client.post<any>(Endpoints.Auth.Change_password, data);
    return this.adaptResponse<ChangePasswordResponse>(response);
  }

  /**
   * Handle OAuth callback
   * @param code - Authorization code from OAuth provider
   * @param provider - OAuth provider ('google' or '42')
   * @returns Promise with response containing token
   */
  async handleOAuthCallback(code: string, provider: 'google' | '42'): Promise<ApiResponse<OAuthResponse>> {
    const endpoint = provider === 'google' ? Endpoints.Auth.Google : Endpoints.Auth.FortyTwo;
    const response = await this.client.get<any>(`${endpoint}?code=${code}`);
    return this.adaptResponse<OAuthResponse>(response);
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