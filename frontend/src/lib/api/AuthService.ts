/**
 * Enhanced authentication service with Redis cache integration
 * @module lib/api/AuthService
 */

import { ApiClient, ApiResponse } from './Client';
import * as authCache from '../cache/AuthCache';
import * as redis from '../cache/RedisClient';
import { AUTH_CONFIG, FEATURES } from '../config';

// Type definitions for OTP data
interface OTPTokenData {
  email: string;
  code: number;
  retry: number;
  expiresAt: Date;
}
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
 * Enhanced authentication service for handling user authentication operations with Redis cache
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
    try {
      const response = await this.client.post<void>(this.AUTH_ENDPOINTS.REGISTER, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login a user
   * @param data - User login credentials
   * @returns Promise with login response containing user data and tokens
   */
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse['data']>> {
    try {
      const response = await this.client.post<LoginResponse['data']>(this.AUTH_ENDPOINTS.LOGIN, data);
      
      // If login successful and we have user data, store session in cache if enabled
      if (FEATURES.ENABLE_SESSION_TRACKING && response.data && response.data.user) {
        await authCache.storeUserSession(
          response.data.user.id,
          {
            userId: response.data.user.id,
            email: response.data.user.email,
            lastLogin: new Date(),
          },
          response.data.expiresIn
        );
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout the current user
   * @param userId - User ID to invalidate session
   * @returns Promise with logout response
   */
  async logout(userId?: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.client.post<void>(this.AUTH_ENDPOINTS.LOGOUT);
      
      // If session tracking is enabled and user ID is provided, invalidate their session in cache
      if (FEATURES.ENABLE_SESSION_TRACKING && userId) {
        await authCache.invalidateUserSession(userId);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify if an email exists in the system
   * @param data - Email verification request
   * @returns Promise with email verification response
   */
  async verifyEmailExists(data: VerifyEmailExistRequest): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.client.post<boolean>(this.AUTH_ENDPOINTS.VERIFY_EMAIL, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request a one-time password for password reset
   * @param data - OTP request data
   * @returns Promise with OTP response
   */
  async getOTP(data: GetOTPRequest): Promise<ApiResponse<GetOTPResponse['data']>> {
    try {
      // Make API request to send OTP
      const response = await this.client.post<GetOTPResponse['data']>(this.AUTH_ENDPOINTS.GET_OTP, data);
      
      // If Redis cache is enabled and we have response data
      if (FEATURES.ENABLE_REDIS_CACHE && response.data) {
        // Generate a random 6-digit OTP code for testing/development
        const otpCode = Math.floor(100000 + Math.random() * 900000);
        
        // Store OTP data in Redis with token as key
        const otpData: OTPTokenData = {
          email: data.email,
          code: otpCode,
          retry: 3, // 3 attempts allowed
          expiresAt: new Date(response.data.expiresAt),
        };
        
        // Store in Redis with expiration based on token expiry
        await redis.set(
          `otp:${response.data.token}`,
          JSON.stringify(otpData),
          60 * 30 // 30 minutes expiry
        );
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify a one-time password
   * @param data - OTP verification data
   * @returns Promise with OTP verification response
   */
  async verifyOTP(data: VerifyOTPRequest): Promise<ApiResponse<VerifyOTPResponse['data']>> {
    try {
      // If using Redis cache in development/testing
      if (FEATURES.ENABLE_REDIS_CACHE) {
        // Get OTP data from Redis
        const otpDataString = await redis.get<string>(`otp:${data.token}`);
        
        if (otpDataString) {
          // Parse the stored OTP data
          const otpData: OTPTokenData = JSON.parse(otpDataString);
          
          // Verify the submitted code against stored code
          if (otpData.code === data.code) {
            // If matches, make API request to verify OTP
            const response = await this.client.post<VerifyOTPResponse['data']>(
              this.AUTH_ENDPOINTS.VERIFY_OTP,
              data
            );
            
            // Update Redis entry with new expiration time from response
            if (response.data) {
              // Create updated OTP data
              const updatedOtpData: OTPTokenData = {
                ...otpData,
                retry: response.data.retry,
                expiresAt: new Date(response.data.expiresAt),
              };
              
              // Calculate seconds until expiry for Redis TTL
              const secondsUntilExpiry = Math.floor(
                (new Date(response.data.expiresAt).getTime() - Date.now()) / 1000
              );
              
              // Store updated data in Redis
              await redis.set(
                `otp:${response.data.token}`,
                JSON.stringify(updatedOtpData),
                secondsUntilExpiry > 0 ? secondsUntilExpiry : 60 * 5 // default 5min if calculation is off
              );
            }
            
            return response;
          } else {
            // If code doesn't match, decrement retry count
            otpData.retry--;
            
            if (otpData.retry > 0) {
              // Update Redis with decremented retry count
              await redis.set(
                `otp:${data.token}`,
                JSON.stringify(otpData),
                60 * 30 // 30 minutes
              );
            } else {
              // If no retries left, delete the OTP data
              await redis.del(`otp:${data.token}`);
            }
            
            // Return API response
            return this.client.post<VerifyOTPResponse['data']>(
              this.AUTH_ENDPOINTS.VERIFY_OTP,
              data
            );
          }
        }
      }
      
      // If not using Redis or no data found, proceed with normal API verification
      return this.client.post<VerifyOTPResponse['data']>(
        this.AUTH_ENDPOINTS.VERIFY_OTP,
        data
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change a user's password
   * @param data - Password change data
   * @returns Promise with password change response
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<ChangePasswordResponse['data']>> {
    try {
      // Make API request to change password
      const response = await this.client.post<ChangePasswordResponse['data']>(
        this.AUTH_ENDPOINTS.CHANGE_PASSWORD,
        data
      );
      
      // Clean up OTP token from Redis if we were using it
      if (FEATURES.ENABLE_REDIS_CACHE) {
        await redis.del(`otp:${data.token}`);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh the authentication token
   * @param refreshToken - Refresh token
   * @returns Promise with new tokens
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string; expiresIn: number }>> {
    try {
      const response = await this.client.post<{ token: string; expiresIn: number }>(
        this.AUTH_ENDPOINTS.REFRESH_TOKEN,
        { refreshToken }
      );
      
      return response;
    } catch (error) {
      throw error;
    }
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