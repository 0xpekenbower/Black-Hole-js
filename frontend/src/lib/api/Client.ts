/**
 * Simple API client for making HTTP requests
 * @module lib/api/Client
 */

import { ResponseStatus } from '@/types/Auth';

/**
 * HTTP request methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';

/**
 * API response interface
 */
export interface ApiResponse<T = any> {
  data?: T | null;
  status: ResponseStatus;
}

/**
 * Simple API client for making HTTP requests
 */
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  /**
   * Create a new API client instance
   */
  constructor() {
    this.baseUrl = 'http://localhost:6969';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
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
   * Make an API request
   * @param endpoint - API endpoint
   * @param method - HTTP method
   * @param body - Request body
   * @param headers - Additional headers
   * @returns Promise with typed response
   */
  private async request<T>(
    endpoint: string,
    method: HttpMethod,
    body?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }
    
    try {
      const response = await fetch(url, requestOptions);
      let data = null;
      
      if (response.status !== 204) {
        const text = await response.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (e) {
            data = null;
          }
        }
      }
      
      if (!response.ok || data?.Error) {
        return {
          data,
          status: {
            success: false,
            code: response.status,
            message: data?.Error || response.statusText || 'Unknown error'
          }
        };
      }
      
      return {
        data,
        status: {
          success: true,
          code: response.status,
          message: 'Success'
        }
      };
    } catch (error) {
      return {
        data: null,
        status: {
          success: false,
          code: 500,
          message: error instanceof Error ? 
            error.message === 'Failed to fetch' ? 
              'Network error. Please check your internet connection.' : 
              error.message : 
            'Unknown error'
        }
      };
    }
  }

  /**
   * Make a GET request
   * @param endpoint - API endpoint
   * @param headers - Additional headers
   * @returns Promise with typed response
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, headers);
  }

  /**
   * Make a POST request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param headers - Additional headers
   * @returns Promise with typed response
   */
  async post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', body, headers);
  }

  /**
   * Make a PUT request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param headers - Additional headers
   * @returns Promise with typed response
   */
  async put<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', body, headers);
  }

  /**
   * Make a DELETE request
   * @param endpoint - API endpoint
   * @param headers - Additional headers
   * @returns Promise with typed response
   */
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', undefined, headers);
  }

  /**
   * Make a PATCH request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param headers - Additional headers
   * @returns Promise with typed response
   */
  async patch<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', body, headers);
  }
}