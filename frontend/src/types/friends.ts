import { FriendshipStatus } from './Dashboard';

export interface FriendData {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  is_online: boolean;
  friendship_status: FriendshipStatus;
}

export interface MinimalFriendData {
  userId: number;
  username?: string;
  avatar?: string;
}

export interface FriendsListProps {
  friends: FriendData[];
  onRemove?: (userId: number) => void;
  isLoading?: boolean;
}

export interface FriendRequestsProps {
  requests: FriendData[];
  onAccept?: (userId: number) => void;
  onReject?: (userId: number) => void;
  isLoading?: boolean;
}

export interface SentRequestsProps {
  sentRequests: FriendData[];
  onCancel?: (userId: number) => void;
  isLoading?: boolean;
}

export interface BlockedUsersProps {
  blockedUsers: FriendData[];
  onUnblock?: (userId: number) => void;
  isLoading?: boolean;
}

export interface AddFriendProps {
  onSearch?: (username: string) => void;
  searchResults?: FriendData[];
  onSendRequest?: (userId: number) => void;
  onCancelRequest?: (userId: number) => void;
  isLoading?: boolean;
}

export interface MinimalFriendRequestProps {
  userId: number;
  username?: string;
  avatar?: string;
  onAccept?: (userId: number) => void;
  onReject?: (userId: number) => void;
  onBlock?: (userId: number) => void;
  isLoading?: boolean;
}

export interface MinimalSentRequestProps {
  userId: number;
  username?: string;
  avatar?: string;
  onCancel?: (userId: number) => void;
  isLoading?: boolean;
}

export interface MinimalFriendRequestsListProps {
  requests: MinimalFriendData[];
  onAccept?: (userId: number) => void;
  onReject?: (userId: number) => void;
  onBlock?: (userId: number) => void;
  isLoading?: boolean;
}

export interface MinimalSentRequestsListProps {
  requests: MinimalFriendData[];
  onCancel?: (userId: number) => void;
  isLoading?: boolean;
}
