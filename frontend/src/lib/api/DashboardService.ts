/**
 * Dashboard service for handling dashboard-related operations
 * @module lib/api/DashboardService
 */

import { ApiClient, ApiResponse } from './Client';
import Endpoints from '@/constants/endpoints';
import {
  UserCardResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  SearchUser,
  RelationshipsResponse
} from '@/types/Dashboard';
import { TokenManager } from './TokenManager';

/**
 * Dashboard service for handling dashboard-related operations
 */
export class DashboardService {
  private client: ApiClient;

  /**
   * Create a new DashboardService instance
   * @param apiClient - Optional API client instance
   */
  constructor(apiClient?: ApiClient) {
    this.client = apiClient || new ApiClient();
    const token = TokenManager.getToken();
    if (token) {
      this.client.setAuthToken(token);
    }
  }

  /**
   * Get authorization headers for requests
   * @returns Headers with authorization token if available
   */
  private getAuthHeaders(): Record<string, string> | undefined {
    const token = TokenManager.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : undefined;
  }

  /**
   * Logout the current user
   * @returns Promise with logout response
   */
  async logout(): Promise<ApiResponse<any>> {
    const headers = this.getAuthHeaders();
    return this.client.post(Endpoints.Auth.Logout, undefined, headers);
  }

  /**
   * Get user card
   * @param userId - Optional user ID
   * @returns Promise with response
   */
  async getCard(userId?: string): Promise<ApiResponse<UserCardResponse['data']>> {
    const headers = this.getAuthHeaders();
    return this.client.get<UserCardResponse['data']>(`${Endpoints.Dashboard.Get_card}${userId ? '?id=' + userId : ''}`, headers);
  }

  /**
   * Search for users
   * @param query - Search query
   * @returns Promise with response
   */
  async search(query: string): Promise<ApiResponse<SearchUser[]>> {
    const headers = this.getAuthHeaders();
    return this.client.get<SearchUser[]>(`${Endpoints.Dashboard.Search}?q=${encodeURIComponent(query)}`, headers);
  }

  /**
   * Change user password
   * @param data - Password change data
   * @returns Promise with response
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<ChangePasswordResponse['data']>> {
    const headers = this.getAuthHeaders();
    return this.client.post<ChangePasswordResponse['data']>(Endpoints.Auth.Change_password, data, headers);
  }

  /**
   * Send friend request
   * @param userId - User ID to send request to
   * @returns Promise with response
   */
  async sendFriendRequest(userId: string): Promise<ApiResponse<any>> {
    const headers = this.getAuthHeaders();
    return this.client.get(`${Endpoints.Dashboard.Send_req}?id=${userId}`, headers);
  }

  /**
   * Cancel friend request
   * @param userId - User ID to cancel request for
   * @returns Promise with response
   */
  async cancelFriendRequest(userId: string): Promise<ApiResponse<any>> {
    const headers = this.getAuthHeaders();
    return this.client.get(`${Endpoints.Dashboard.Cancel}?id=${userId}`, headers);
  }

  /**
   * Accept friend request
   * @param userId - User ID to accept request from
   * @returns Promise with response
   */
  async acceptFriendRequest(userId: string): Promise<ApiResponse<any>> {
    const headers = this.getAuthHeaders();
    return this.client.get(`${Endpoints.Dashboard.Accept_req}?id=${userId}`, headers);
  }

  /**
   * Deny friend request
   * @param userId - User ID to deny request from
   * @returns Promise with response
   */
  async denyFriendRequest(userId: string): Promise<ApiResponse<any>> {
    const headers = this.getAuthHeaders();
    return this.client.get(`${Endpoints.Dashboard.Deny_req}?id=${userId}`, headers);
  }

  /**
   * Remove friend
   * @param userId - User ID to unfriend
   * @returns Promise with response
   */
  async unfriend(userId: string): Promise<ApiResponse<any>> {
    const headers = this.getAuthHeaders();
    return this.client.get(`${Endpoints.Dashboard.Unfriend}?id=${userId}`, headers);
  }

  /**
   * Block user
   * @param userId - User ID to block
   * @returns Promise with response
   */
  async blockUser(userId: string): Promise<ApiResponse<any>> {
    const headers = this.getAuthHeaders();
    return this.client.get(`${Endpoints.Dashboard.Block}?id=${userId}`, headers);
  }

  /**
   * Unblock user
   * @param userId - User ID to unblock
   * @returns Promise with response
   */
  async unblockUser(userId: string): Promise<ApiResponse<any>> {
    const headers = this.getAuthHeaders();
    return this.client.get(`${Endpoints.Dashboard.Unblock}?id=${userId}`, headers);
  }
  
  /**
   * Get all user relationships
   * @returns Promise with response containing all relationships
   */
  async getAllRelations(): Promise<ApiResponse<RelationshipsResponse>> {
    const headers = this.getAuthHeaders();
    return this.client.get<RelationshipsResponse>(Endpoints.Dashboard.All_relations, headers);
  }
} 