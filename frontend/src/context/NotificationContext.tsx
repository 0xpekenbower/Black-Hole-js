'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { Notification_type, NotificationType } from '@/types/Notifications'

interface NotificationContextType {
  notifications: Notification_type[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  addNotification: (notification: Omit<Notification_type, 'id' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
  requestNotificationPermission: () => Promise<boolean>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const notificationUtils = useNotifications()
  
  return (
    <NotificationContext.Provider value={notificationUtils}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext(): NotificationContextType {
  const context = useContext(NotificationContext)
  
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  
  return context
} 