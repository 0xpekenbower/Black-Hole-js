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
import { ApiError } from '@/lib/api/Client';
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
  getOTP: (email: string) => Promise<{ token: string; expiresAt: Date } | null>;
  verifyOTP: (token: string, code: number) => Promise<{ token: string; retry: number; expiresAt: Date } | null>;
  changePassword: (token: string, newPassword: string) => Promise<void>;
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
   */
  const login = async (data: LoginRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(data);
      
      if (response.data) {
        const { token, refreshToken, expiresIn, user } = response.data;
        
        // Store tokens
        TokenManager.storeTokens(token, refreshToken, expiresIn);
        
        // Set auth token for subsequent requests
        authService.setAuthToken(token);
        
        // Set user data
        setUser(user);
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        throw new Error('Login failed: No data received');
      }
    } catch (err) {
      setError(handleApiError(err, 'Login'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle user registration
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
      // Pass user ID to invalidate session in cache
      if (user) {
        await authService.logout(user.id);
      } else {
        await authService.logout();
      }
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
  const getOTP = async (email: string): Promise<{ token: string; expiresAt: Date } | null> => {
    try {
      setIsLoading(true);
      
      // If Redis cache is disabled, we'll use a simpler approach
      if (!FEATURES.ENABLE_REDIS_CACHE) {
        // Mock response for development
        return {
          token: 'mock-token-' + Date.now(),
          expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
        };
      }
      
      const response = await authService.getOTP({ email });
      
      if (response.status.code !== 200 || !response.data) {
        throw new Error(response.status.message || 'Failed to get OTP');
      }
      
      return {
        token: response.data.token,
        expiresAt: new Date(response.data.expiresAt)
      };
    } catch (err) {
      const errorMessage = handleApiError(err, 'OTP Request');
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verify a one-time password
   */
  const verifyOTP = async (token: string, code: number): Promise<{ token: string; retry: number; expiresAt: Date } | null> => {
    try {
      setIsLoading(true);
      
      // If Redis cache is disabled, we'll use a simpler approach
      if (!FEATURES.ENABLE_REDIS_CACHE) {
        // Mock response for development
        return {
          token: token,
          retry: 3,
          expiresAt: new Date(Date.now() + 3 * 60 * 1000) // 3 minutes from now
        };
      }
      
      const response = await authService.verifyOTP({ token, code });
      
      if (response.status.code !== 200 || !response.data) {
        throw new Error(response.status.message || 'Failed to verify OTP');
      }
      
      return {
        token: response.data.token,
        retry: response.data.retry,
        expiresAt: new Date(response.data.expiresAt)
      };
    } catch (err) {
      const errorMessage = handleApiError(err, 'OTP Verification');
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Change user password
   */
  const changePassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // If Redis cache is disabled, we'll use a simpler approach
      if (!FEATURES.ENABLE_REDIS_CACHE) {
        // Mock successful response
        setUser(null);
        router.push(ROUTES.LOGIN);
        return;
      }
      
      const response = await authService.changePassword({
        token,
        newpassword: newPassword
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
    verifyOTP,
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