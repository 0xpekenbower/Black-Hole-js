'use client';

/**
 * Authentication context for managing user authentication state
 * @module context/AuthContext
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/api/AuthService';
import { TokenManager } from '@/lib/api/TokenManager';
import { LoginRequest, RegisterRequest } from '@/types/Auth';
import { handleApiError } from '@/utils/errorHandler';
import { FEATURES } from '@/lib/config';
import { ROUTES } from '@/lib/config';

/**
 * User data structure
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  createdAt: Date;
  avatar: string;
  bio: string;
  background: string;
}

/**
 * Authentication context state
 */
interface AuthContextState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  getOTP: (email: string) => Promise<boolean>;
  changePassword: (email: string, code: string, newPassword: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

/**
 * Authentication context provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextState | undefined>(undefined);

/**
 * Authentication context provider component
 */
export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const authService = new AuthService();

  // Check if the user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (TokenManager.isAuthenticated()) {
          // Set the token in the API client
          const token = TokenManager.getToken();
          if (token) {
            authService.setAuthToken(token);
            // Here you would typically fetch the user profile
            // For now, we'll just set isLoading to false
          }
        }
      } catch (err) {
        console.error('Authentication initialization error:', err);
        TokenManager.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Handle user login
   * Note: The LoginRequest interface uses 'username' field, but our login form collects 'email'.
   * This is mapped at the page component level where the email input is assigned to the username field.
   */
  const login = async (data: LoginRequest): Promise<void> => {
    // setIsLoading(true);
    // setError(null);
    
    // try {
    //   const response = await authService.login(data);
      
    //   if (response.data) {
    //     const { token } = response.data;
        
    //     // Store tokens
    //     // Using token only as the backend doesn't return refresh token
    //     TokenManager.updateToken(token, 3600); // 1 hour expiry
        
    //     // Set auth token for subsequent requests
    //     authService.setAuthToken(token);
        
    //     // Redirect to dashboard
    //     router.push('/Dashboard/overview');
    //   } else {
    //     throw new Error('Login failed: No data received');
    //   }
    // } catch (err) {
    //   setError(handleApiError(err, 'Login'));
    // } finally {
    //   setIsLoading(false);
    // }
    router.push('/dashboard/overview');
  };

  /**
   * Handle user registration
   * Note: The RegisterRequest interface requires specific field names:
   * - username: typically the same as email
   * - email: user's email address
   * - password: user's password
   * - repassword: confirmation of password
   * - first_name: user's first name (optional)
   * - last_name: user's last name (optional)
   */
  const register = async (data: RegisterRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.register(data);
      // Redirect to login page after successful registration
      router.push('/login');
    } catch (err) {
      setError(handleApiError(err, 'Registration'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle user logout
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // No need to call API for logout as we're just clearing tokens
      console.log('Logging out user');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear tokens and user data regardless of API response
      TokenManager.clearTokens();
      authService.removeAuthToken();
      setUser(null);
      setIsLoading(false);
      router.push('/login');
    }
  };

  /**
   * Request a one-time password for password reset
   */
  const getOTP = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // If Redis cache is disabled, we'll use a simpler approach
      if (!FEATURES.ENABLE_REDIS_CACHE) {
        // Mock response for development
        return true;
      }
      
      const response = await authService.sendResetEmail(email);
      
      if (response.status.code !== 200 || !response.data) {
        throw new Error(response.status.message || 'Failed to get OTP');
      }
      
      // Return success status
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err, 'OTP Request');
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Change user password
   */
  const changePassword = async (email: string, code: string, newPassword: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // If Redis cache is disabled, we'll use a simpler approach
      if (!FEATURES.ENABLE_REDIS_CACHE) {
        // Mock successful response
        setUser(null);
        router.push(ROUTES.LOGIN);
        return;
      }
      
      const response = await authService.resetPassword({
        email: email,
        code: code,
        password: newPassword,
        repassword: newPassword
      });
      
      if (response.status.code !== 200) {
        throw new Error(response.status.message || 'Failed to change password');
      }
      
      // Redirect to login page after successful password change
      router.push(ROUTES.LOGIN);
    } catch (err) {
      const errorMessage = handleApiError(err, 'Password Change');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear error state
   */
  const clearError = (): void => {
    setError(null);
  };

  const value: AuthContextState = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    getOTP,
    changePassword,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use the authentication context
 * @returns Authentication context state
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextState {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 