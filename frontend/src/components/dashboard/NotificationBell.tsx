'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotificationContext } from '@/context/NotificationContext'
import { Notification_type, NotificationType } from '@/types/Notifications'
import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge'
import { dashboardService } from '@/lib/api'
import { useRouter } from 'next/navigation'

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotificationContext()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleNotificationClick = async (notification: Notification_type) => {
    markAsRead(notification.id)
    
    // Navigate based on notification type
    if (notification.senderId) {
      switch (notification.type) {
        case NotificationType.FRIEND_REQUEST:
        case NotificationType.FRIEND_ACCEPT:
        case NotificationType.FRIEND_DENY:
        case NotificationType.FRIEND_CANCEL:
          router.push('/dashboard/friends')
          break
        case NotificationType.NEW_MESSAGE:
          router.push(`/dashboard/chat?userId=${notification.senderId}`)
          break
        case NotificationType.GAME_INVITE:
          router.push('/dashboard/game')
          break
        default:
          break
      }
    }
  }

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.FRIEND_REQUEST:
        return '👋'
      case NotificationType.FRIEND_ACCEPT:
        return '✅'
      case NotificationType.FRIEND_DENY:
        return '❌'
      case NotificationType.NEW_MESSAGE:
        return '💬'
      case NotificationType.GAME_INVITE:
        return '🎮'
      default:
        return '📣'
    }
  }

  const getUserAvatar = async (userId: number) => {
    try {
      const response = await dashboardService.getCard(userId.toString())
      if (response.status.success && response.data) {
        return response.data.User.avatar || '/data/avatars/default.png'
      }
    } catch (error) {
      console.error('Failed to fetch user avatar:', error)
    }
    return '/data/avatars/default.png'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead} 
                className="h-8 text-xs"
                disabled={unreadCount === 0}
              >
                Mark all as read
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearNotifications} 
                className="h-8 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length > 0 ? (
            <DropdownMenuGroup>
              {notifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id} 
                  className={`flex items-start gap-2 p-3 cursor-pointer ${!notification.read ? 'bg-muted/50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0">
                    {notification.senderId ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/data/avatars/default.png`} alt="User" />
                        <AvatarFallback>
                          {getNotificationIcon(notification.type)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{notification.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(notification.timestamp), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              No notifications
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 