import { ApiResponse } from "./Auth";

/**
 * Dashboard types
 */

// User Profile
export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string;
  background: string;
  bio: string;
  is_online: boolean;
  is_oauth: boolean;
}

export interface Level {
  id: number;
  min_exp: number;
  max_exp: number;
  reward: number;
}

export interface Rank {
  name: string;
  min_exp: number;
  max_exp: number;
  reward: number;
  path: string;
}

export enum FriendshipStatus {
  BLOCKED = -1,
  NO_RELATION = 0,
  FRIENDS = 1,
  REQUEST_SENT = 2,
  REQUEST_RECEIVED = 3
}

// User Card
export interface UserCard {
  User: User;
  Level: Level;
  Rank: Rank;
  Friends: number[]; // array of ids
  is_self: boolean;
  Friendship: FriendshipStatus;
}

export interface UserCardResponse {
  data?: UserCard | null;
}

// Search
export interface SearchResult {
  users: UserCard[];
  total: number;
}

export interface SearchResponse {
  data?: SearchResult | null;
}

// Password Change
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  data?: {
    success: boolean;
  } | null;
}

export type LogoutResponse = ApiResponse<ApiResponse>;

