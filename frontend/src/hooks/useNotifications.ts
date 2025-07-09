import { useState, useEffect, useCallback } from 'react';
import { useGateway } from './useGateway';
import { Notification_type, NotificationState, NotificationType } from '@/types/Notifications';
import { v4 as uuidv4 } from 'uuid';

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null
  });
  
  const { connected, addListener, removeListener } = useGateway();
  
  // Add a notification
  const addNotification = useCallback((notification: Omit<Notification_type, 'id' | 'read'>) => {
    const newNotification: Notification_type = {
      ...notification,
      id: uuidv4(),
      read: false
    };
    
    setState((prev: NotificationState) => {
      const updatedNotifications = [newNotification, ...prev.notifications].slice(0, 50); // Keep only last 50 notifications
      return {
        ...prev,
        notifications: updatedNotifications,
        unreadCount: prev.unreadCount + 1
      };
    });    
    if (Notification.permission === 'granted') {
      new Notification(getNotificationTitle(notification.type), {
        body: notification.content
      });
    }
  }, []);  
  const markAsRead = useCallback((id: string) => {
    setState((prev: NotificationState) => {
      const updatedNotifications = prev.notifications.map((notification: Notification_type) => 
        notification.id === id ? { ...notification, read: true } : notification
      );
      
      const unreadCount = updatedNotifications.filter((n: Notification_type) => !n.read).length;
      
      return {
        ...prev,
        notifications: updatedNotifications,
        unreadCount
      };
    });
  }, []);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setState((prev: NotificationState) => {
      const updatedNotifications = prev.notifications.map((notification: Notification_type) => 
        ({ ...notification, read: true })
      );
      
      return {
        ...prev,
        notifications: updatedNotifications,
        unreadCount: 0
      };
    });
  }, []);
  
  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setState((prev: NotificationState) => ({
      ...prev,
      notifications: [],
      unreadCount: 0
    }));
  }, []);
  
  // Handle relation events
  const handleRelationEvent = useCallback((data: any) => {
    if (!data || !data.type) return;
    
    addNotification({
      type: data.type as NotificationType,
      senderId: data.senderId,
      content: data.content,
      timestamp: data.timestamp || new Date().toISOString()
    });
  }, [addNotification]);
  
  // Handle message events
  const handleMessageEvent = useCallback((data: any) => {
    if (!data || !data.type || data.type !== 'new_message') return;
    
    addNotification({
      type: NotificationType.NEW_MESSAGE,
      senderId: data.senderId,
      content: data.content,
      timestamp: data.timestamp || new Date().toISOString()
    });
  }, [addNotification]);
  
  // Request notification permissions
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  }, []);
  
  // Get a title for browser notifications based on type
  const getNotificationTitle = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.FRIEND_REQUEST:
        return 'New Friend Request';
      case NotificationType.FRIEND_ACCEPT:
        return 'Friend Request Accepted';
      case NotificationType.FRIEND_DENY:
        return 'Friend Request Denied';
      case NotificationType.FRIEND_CANCEL:
        return 'Friend Request Canceled';
      case NotificationType.NEW_MESSAGE:
        return 'New Message';
      case NotificationType.GAME_INVITE:
        return 'Game Invitation';
      default:
        return 'Notification';
    }
  };
  
  // Set up socket listeners
  useEffect(() => {
    if (connected) {
      addListener('relation', handleRelationEvent);
      addListener('message', handleMessageEvent);
      
      // Request notification permission when connected
      requestNotificationPermission();
    }
    
    return () => {
      if (connected) {
        removeListener('relation', handleRelationEvent);
        removeListener('message', handleMessageEvent);
      }
    };
  }, [connected, addListener, removeListener, handleRelationEvent, handleMessageEvent, requestNotificationPermission]);
  
  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        if (Array.isArray(parsed)) {
          const unreadCount = parsed.filter((n: Notification_type) => !n.read).length;
          setState((prev: NotificationState) => ({
            ...prev,
            notifications: parsed,
            unreadCount
          }));
        }
      } catch (error) {
        console.error('Failed to parse saved notifications:', error);
      }
    }
  }, []);
  
  // Save notifications to localStorage when they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(state.notifications));
  }, [state.notifications]);
  
  return {
    ...state,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    requestNotificationPermission
  };
} 