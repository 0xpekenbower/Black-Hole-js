/**
 * Dashboard service for handling dashboard-related operations
 * @module lib/api/DashboardService
 */

import { ApiClient, ApiResponse } from './Client';
import Endpoints from '@/constants/endpoints';
import {
  User,
  UserCard,
  UserCardResponse,
  SearchResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  LogoutResponse
} from '@/types/Dashboard';

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
  }

  /**
   * Logout the current user
   * @returns Promise with logout response
   */
  async logout(): Promise<ApiResponse<any>> {
    return this.client.post(Endpoints.Auth.Logout);
  }

  /**
   * Get user card
   * @param userId - Optional user ID
   * @returns Promise with response
   */
  async getCard(userId?: string): Promise<ApiResponse<UserCardResponse['data']>> {
    return this.client.get<UserCardResponse['data']>(`${Endpoints.Dashboard.Get_card}${userId ? '?userId=' + userId : ''}`);
  }

  /**
   * Search for users
   * @param query - Search query
   * @returns Promise with response
   */
  async search(query: string): Promise<ApiResponse<SearchResponse['data']>> {
    return this.client.get<SearchResponse['data']>(`${Endpoints.Dashboard.Search}?q=${encodeURIComponent(query)}`);
  }

  /**
   * Change user password
   * @param data - Password change data
   * @returns Promise with response
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<ChangePasswordResponse['data']>> {
    return this.client.post<ChangePasswordResponse['data']>(Endpoints.Dashboard.Change_password, data);
  }

  /**
   * Send friend request
   * @param userId - User ID to send request to
   * @returns Promise with response
   */
  async sendFriendRequest(userId: string): Promise<ApiResponse<any>> {
    return this.client.post(Endpoints.Dashboard.Send_req, { userId });
  }

  /**
   * Cancel friend request
   * @param userId - User ID to cancel request for
   * @returns Promise with response
   */
  async cancelFriendRequest(userId: string): Promise<ApiResponse<any>> {
    return this.client.post(Endpoints.Dashboard.Cancel, { userId });
  }

  /**
   * Accept friend request
   * @param userId - User ID to accept request from
   * @returns Promise with response
   */
  async acceptFriendRequest(userId: string): Promise<ApiResponse<any>> {
    return this.client.post(Endpoints.Dashboard.Accept_req, { userId });
  }

  /**
   * Deny friend request
   * @param userId - User ID to deny request from
   * @returns Promise with response
   */
  async denyFriendRequest(userId: string): Promise<ApiResponse<any>> {
    return this.client.post(Endpoints.Dashboard.Deny_req, { userId });
  }

  /**
   * Remove friend
   * @param userId - User ID to unfriend
   * @returns Promise with response
   */
  async unfriend(userId: string): Promise<ApiResponse<any>> {
    return this.client.post(Endpoints.Dashboard.Unfriend, { userId });
  }

  /**
   * Block user
   * @param userId - User ID to block
   * @returns Promise with response
   */
  async blockUser(userId: string): Promise<ApiResponse<any>> {
    return this.client.post(Endpoints.Dashboard.Block, { userId });
  }

  /**
   * Unblock user
   * @param userId - User ID to unblock
   * @returns Promise with response
   */
  async unblockUser(userId: string): Promise<ApiResponse<any>> {
    return this.client.post(Endpoints.Dashboard.Unblock, { userId });
  }
} 