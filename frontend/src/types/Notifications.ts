export enum NotificationType {
  FRIEND_REQUEST = 'friend_request',
  FRIEND_ACCEPT = 'friend_accept',
  FRIEND_DENY = 'friend_deny',
  FRIEND_CANCEL = 'friend_cancel',
  USER_BLOCK = 'user_block',
  USER_UNBLOCK = 'user_unblock',
  NEW_MESSAGE = 'new_message',
  GAME_INVITE = 'game_invite',
  SYSTEM = 'system'
}

export interface Notification_type {
  id: string;
  type: NotificationType;
  senderId?: number;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface NotificationState {
  notifications: Notification_type[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}