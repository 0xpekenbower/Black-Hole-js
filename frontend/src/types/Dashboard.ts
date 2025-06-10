import { ApiResponse } from "./Auth";
import { z } from "zod";

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
  exp: number;
  rank: number;
  level: number;
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
  icon_path: string;
}

// export enum FriendshipStatus {
//   BLOCKED = -1,
//   NO_RELATION = 0,
//   FRIENDS = 1,
//   REQUEST_SENT = 2,
//   REQUEST_RECEIVED = 3
// }
// const status_types = {
//   HE_SENT: 3,
//   HE_FR: 2,
//   HE_BLK: 1,

//   I_SENT: -3,
//   I_FR: -2,
//   I_BLK: -1
// }
export enum FriendshipStatus {
  HE_SENT = 3, // he sent a request to me
  HE_FR = 2, // he is a friend
  HE_BLK = 1, // he blocked me
  I_SENT = -3, // i sent a request to him
  I_FR = -2, // he is a friend
  I_BLK = -1 // i blocked him
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
export interface SearchUser {
  id: string;
  username: string;
  avatar?: string;
}

export interface SearchResponse {
  data?: SearchUser[] | null;
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

// Profile Edit
export interface EditProfileRequest {
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar?: string;
  background?: string;
}

export interface EditProfileResponse {
  data?: {
    success: boolean;
  } | null;
}

// User relationships
export interface UserRelation {
  id?: number;
  username?: string;
  avatar?: string;
  first_name?: string;
  last_name?: string;
  is_online?: boolean;
}

export interface FriendRequest {
  sender?: number;
  receiver?: number;
  user?: UserRelation;
}

export interface RelationshipsResponse {
  friends: UserRelation[];
  blacklist: UserRelation[];
  receivedReq: UserRelation[];
  sentReq: UserRelation[];
}

export type LogoutResponse = ApiResponse<ApiResponse>;

// Settings types
export interface PersonalInfoProps {
  initialData: {
    first_name: string;
    last_name: string;
    username: string;
    email?: string;
  };
  onSubmit: (data: EditProfileRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface PasswordProps {
  onSubmit: (data: PasswordFormValues) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface OTPProps {
  initialData: {
    is_otp_active: boolean;
    is_otp_verified: boolean;
  };
  onToggle: (isActive: boolean) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface UserData {
  first_name: string;
  last_name: string;
  username: string;
  email?: string;
  avatar: string;
  is_oauth: boolean;
  is_otp_active: boolean;
  is_otp_verified: boolean;
}

export interface UseSettingsProps {
  onSuccess?: () => void;
}

export interface UseSettingsReturn {
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: EditProfileRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  toggleOTP: (isActive: boolean) => Promise<void>;
  fetchUserData: () => Promise<void>;
}

// Schema for password validation
export const passwordSchema = z.object({
  old_pass: z.string().min(1, "Current password is required"),
  new_pass: z.string()
    .min(10, "Password must be at least 10 characters")
    .regex(/[a-z]/, "Password must contain lowercase letters")
    .regex(/[A-Z]/, "Password must contain uppercase letters")
    .regex(/[0-9]/, "Password must contain numbers")
    .regex(/[@$!%*?&'"]/, "Password must contain special characters"),
  re_pass: z.string().min(1, "Confirm password is required")
}).refine(data => data.new_pass === data.re_pass, {
  message: "Passwords don't match",
  path: ["re_pass"]
});

// Schema for personal info validation
export const personalInfoSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  username: z.string(),
  email: z.string().optional()
});

export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;