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
import { clearProfileData } from '@/utils/profileStorage';
import { io, Socket } from 'socket.io-client';

// Socket configuration for gateway
const GATEWAY_SOCKET_URL = 'http://localhost:8000';
const GATEWAY_SOCKET_PATH = '/socket.io';

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
  loginWithToken: (token: string) => Promise<void>;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  getOTP: (email: string) => Promise<boolean>;
  verifyCode: (email: string, code: string) => Promise<boolean>;
  changePassword: (email: string, code: string, newPassword: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
  gatewaySocket: Socket | null;
}

/**
 * Authentication context provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);

/**
 * Authentication context provider component
 */
export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [gatewaySocket, setGatewaySocket] = useState<Socket | null>(null);
  const router = useRouter();
  const authService = new AuthService();

  // Function to connect to gateway socket
  const connectGatewaySocket = (token: string) => {
    try {
      // Disconnect existing socket if any
      if (gatewaySocket) {
        gatewaySocket.disconnect();
      }

      // Create new socket connection with token
      const socket = io(GATEWAY_SOCKET_URL, {
        path: GATEWAY_SOCKET_PATH,
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        secure: window.location.protocol === 'https:',
        auth: { token },
      });

      setGatewaySocket(socket);
      return socket;
    } catch (err) {
      console.error('Error creating gateway socket connection:', err);
      return null;
    }
  };

  // Disconnect gateway socket
  const disconnectGatewaySocket = () => {
    if (gatewaySocket) {
      gatewaySocket.disconnect();
      setGatewaySocket(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (TokenManager.isAuthenticated()) {
          const token = TokenManager.getToken();
          if (token) {
            authService.setAuthToken(token);
            setUser({
              id: '1',
              firstName: '',
              lastName: '',
              username: '',
              email: '',
              createdAt: new Date(),
              avatar: '',
              bio: '',
              background: '',
            });
            
            connectGatewaySocket(token);
          }
        };
      } catch (err) {
        console.error('Authentication initialization error:', err);
        TokenManager.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
    return () => {
      disconnectGatewaySocket();
    };
  }, []);

  /**
   * Handle user login
   */
  const login = async (data: LoginRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(data);
      if (response.status.success && response.data?.token) {
        const { token } = response.data;
        TokenManager.updateToken(token, 3600);
        authService.setAuthToken(token);
        setUser({
          id: '1',
          firstName: '',
          lastName: '',
          username: data.username,
          email: '',
          createdAt: new Date(),
          avatar: '',
          bio: '',
          background: '',
        });

        // Connect to gateway socket with token
        connectGatewaySocket(token);
        router.replace('/dashboard');
      } else {
        throw new Error(response.status.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle user login
   */
  const loginIntra = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.loginIntra();
      if (response.status.success && response.data?.token) {
        const { token } = response.data;
        TokenManager.updateToken(token, 3600);
        authService.setAuthToken(token);
        setUser({
          id: '1',
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          createdAt: new Date(),
          avatar: '',
          bio: '',
          background: '',
        });

        // Connect to gateway socket with token
        connectGatewaySocket(token);
        router.replace('/dashboard');
      } else {
        throw new Error(response.status.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
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
      const response = await authService.register(data);
      if (response.status.success) {
        router.push('/login');
      } else {
        throw new Error(response.status.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
      // Disconnect gateway socket
      disconnectGatewaySocket();
      
      TokenManager.clearTokens();
      authService.removeAuthToken();
      clearProfileData();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
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
      setError(null);
      const response = await authService.sendResetEmail(email);
      if (response.status.success) {
        return true;
      } else {
        throw new Error(response.status.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get OTP');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verify OTP code
   */
  const verifyCode = async (email: string, code: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.verifyCode(email, code);
      if (response.status.success) {
        return true;
      } else {
        throw new Error(response.status.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify code');
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
      
      const response = await authService.resetPassword({
        email: email,
        code: code,
        password: newPassword,
        repassword: newPassword
      });
      
      if (response.status.success) {
        router.push('/login');
      } else {
        throw new Error(response.status.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
      throw err;
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

  /**
   * Login with token
   */
  const loginWithToken = async (token: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      TokenManager.updateToken(token, 3600);
      authService.setAuthToken(token);
      setUser({
        id: '1',
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        createdAt: new Date(),
        avatar: '',
        bio: '',
        background: '',
      });

      // Connect to gateway socket with token
      connectGatewaySocket(token);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login with token');
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextState = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithToken,
    register,
    logout,
    getOTP,
    verifyCode,
    changePassword,
    error,
    clearError,
    gatewaySocket,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
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