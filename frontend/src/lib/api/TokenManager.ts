/**
 * Token manager for handling authentication tokens
 * @module lib/api/TokenManager
 */

/**
 * Storage keys for tokens
 */
const TOKEN_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRY: 'token_expiry',
};

/**
 * Token manager for handling authentication tokens
 */
export class TokenManager {
  /**
   * Store authentication tokens
   * @param token - JWT token
   * @param refreshToken - Refresh token
   * @param expiresIn - Token expiration time in seconds
   */
  static storeTokens(token: string, refreshToken: string, expiresIn: number): void {
    if (typeof window === 'undefined') return;
    
    const expiryTime = Date.now() + expiresIn * 10000;
    
    localStorage.setItem(TOKEN_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString());
  }

  /**
   * Get the stored authentication token
   * @returns The stored token or null if not found
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEYS.AUTH_TOKEN);
  }

  /**
   * Get the stored refresh token
   * @returns The stored refresh token or null if not found
   */
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  }

  /**
   * Check if the token is expired
   * @returns True if the token is expired or not found, false otherwise
   */
  static isTokenExpired(): boolean {
    if (typeof window === 'undefined') return true;
    
    const expiryTime = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
    if (!expiryTime) return true;    
    return Date.now() > parseInt(expiryTime, 10) - 30000;
  }

  /**
   * Check if the user is authenticated
   * @returns True if the user has a valid token, false otherwise
   */
  static isAuthenticated(): boolean {
    // return true;
    return !!this.getToken() && !this.isTokenExpired();
  }

  /**
   * Clear all stored tokens
   */
  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(TOKEN_KEYS.AUTH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.TOKEN_EXPIRY);
  }

  /**
   * Update the stored token and its expiry time
   * @param token - New JWT token
   * @param expiresIn - Token expiration time in seconds
   */
  static updateToken(token: string, expiresIn: number): void {
    if (typeof window === 'undefined') return;
    
    const expiryTime = Date.now() + expiresIn * 1000;
    
    localStorage.setItem(TOKEN_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString());
  }
} 