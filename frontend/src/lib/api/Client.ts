/**
 * Base API client for making HTTP requests
 * @module lib/api/Client
 */

import { ResponseStatus } from '@/types/Auth';
import { API_CONFIG } from '@/lib/config';

/**
 * HTTP request methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API request options
 */
export interface ApiRequestOptions {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  cache?: RequestCache;
  credentials?: RequestCredentials;
}

/**
 * API response interface
 */
export interface ApiResponse<T = any> {
  data?: T | null;
  status: ResponseStatus;
}

/**
 * API error with structured information
 */
export class ApiError extends Error {
  status: number;
  code: number;
  message: string;

  constructor(status: number, code: number, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.message = message;
    this.name = 'ApiError';
  }
}

/**
 * Base API client for making HTTP requests
 */
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  /**
   * Create a new API client instance
   * @param baseUrl - Base URL for API requests
   */
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Set authorization header with token
   * @param token - JWT token
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authorization header
   */
  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Safely parse JSON response
   * @param response - Fetch Response object
   * @returns Promise with parsed JSON or error object
   */
  private async safeParseJson(response: Response): Promise<any> {
    // For empty responses, return null
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }

    // First try to get the text content
    const text = await response.text();
    
    // If empty, return null
    if (!text) {
      return null;
    }
    
    // Try to parse as JSON
    try {
      return JSON.parse(text);
    } catch (error) {
      // If not valid JSON, return an error object with the text
      return {
        status: {
          code: response.status,
          message: `Invalid JSON response: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`
        }
      };
    }
  }

  /**
   * Make an API request
   * @param endpoint - API endpoint
   * @param options - Request options
   * @returns Promise with typed response
   */
  async request<T>(endpoint: string, options: ApiRequestOptions): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    const requestOptions: RequestInit = {
      method: options.method,
      headers,
      cache: options.cache || 'no-cache',
      credentials: options.credentials || 'include',
    };

    if (options.body && options.method !== 'GET') {
      requestOptions.body = JSON.stringify(options.body);
    }

    try {
      // Make the request
      const response = await fetch(url, requestOptions);
      
      // Parse the response
      const data = await this.safeParseJson(response);
      
      // Handle API error responses
      if (!response.ok) {
        const errorMessage = data?.message || data?.error || 'Unknown API error';
        const errorCode = data?.code || response.status;
        throw new ApiError(response.status, errorCode, errorMessage);
      }
      
      // Return successful response
      return {
        data: data,
        status: {
          success: true,
          code: response.status,
          message: 'Success'
        }
      };
    } catch (error) {
      // Handle fetch errors or API errors
      if (error instanceof ApiError) {
        return {
          data: null,
          status: {
            success: false,
            code: error.status,
            message: error.message
          }
        };
      }
      
      // Generic error handling
      return {
        data: null,
        status: {
          success: false,
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // Convenience methods for different HTTP methods

  /**
   * Make a GET request
   * @param endpoint - API endpoint
   * @param headers - Additional headers
   * @returns Promise with typed response
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers
    });
  }

  /**
   * Make a POST request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param headers - Additional headers
   * @returns Promise with typed response
   */
  async post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body,
      headers
    });
  }

  /**
   * Make a PUT request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param headers - Additional headers
   * @returns Promise with typed response
   */
  async put<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body,
      headers
    });
  }

  /**
   * Make a DELETE request
   * @param endpoint - API endpoint
   * @param headers - Additional headers
   * @returns Promise with typed response
   */
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers
    });
  }

  /**
   * Make a PATCH request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param headers - Additional headers
   * @returns Promise with typed response
   */
  async patch<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body,
      headers
    });
  }
}
