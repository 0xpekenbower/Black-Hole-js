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
  VerifyCodeRequest,
  VerifyCodeResponse
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
   * Adapt API response to standardized format
   * @param response - Raw API response
   * @returns Standardized API response
   */
  private adaptResponse<T>(response: any): ApiResponse<T> {
    const success = response?.status === 200 || response?.status === 201;
    const message = success
      ? response?.data?.Success || 'Operation successful'
      : response?.data?.Error || 'Operation failed';
    const data = success ? response?.data : null;

    return {
      status: {
        success,
        code: response?.status || 500,
        message
      },
      data
    };
  }

  /**
   * Set authentication token for API client
   * @param token - JWT token
   */
  setAuthToken(token: string): void {
    this.client.setAuthToken(token);
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
   * Login a user using intra42
   * @returns Promise with login response containing token
   */
  async loginIntra(): Promise<ApiResponse<LoginResponse>> {
    const response = await this.client.post<any>(Endpoints.Auth.FortyTwo);
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
   * Verify OTP code
   * @param email - User email
   * @param code - Verification code
   * @returns Promise with response
   */
  async verifyCode(email: string, code: string): Promise<ApiResponse<VerifyCodeResponse>> {
    const data: VerifyCodeRequest = { email, code };
    const response = await this.client.post<any>(Endpoints.Auth.Verify_code, data);
    return this.adaptResponse<VerifyCodeResponse>(response);
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
   * Login a user using Google
   * @returns Promise with login response containing token
   */
  async loginGoogle(): Promise<ApiResponse<LoginResponse>> {
    const response = await this.client.post<any>(Endpoints.Auth.Google);
    return this.adaptResponse<LoginResponse>(response);
  }

  /**
   * Remove the auth token from the API client
   */
  removeAuthToken(): void {
    this.client.removeAuthToken();
  }
} 