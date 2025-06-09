import { Button } from "@/components/ui/button"
import { 
  UserPlus, 
  UserX, 
  UserMinus, 
  Shield, 
  Loader2,
  MessageSquare
} from "lucide-react"
import Link from 'next/link'
import { FriendshipStatus } from '@/types/Dashboard'

interface FriendActionsProps {
  userId: number
  username?: string
  friendshipStatus: FriendshipStatus
  isLoading?: boolean
  onSendRequest?: (userId: number) => void
  onCancelRequest?: (userId: number) => void
  onAcceptRequest?: (userId: number) => void
  onRejectRequest?: (userId: number) => void
  onRemoveFriend?: (userId: number) => void
  onBlockUser?: (userId: number) => void
  onUnblockUser?: (userId: number) => void
  showMessage?: boolean
  compact?: boolean
}

export function FriendActions({
  userId,
  username,
  friendshipStatus,
  isLoading = false,
  onSendRequest,
  onCancelRequest,
  onAcceptRequest,
  onRejectRequest,
  onRemoveFriend,
  onBlockUser,
  onUnblockUser,
  showMessage = false,
  compact = false
}: FriendActionsProps) {
  
  const renderIcon = (Icon: React.ElementType) => {
    return isLoading ? <Loader2 className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} animate-spin`} /> : <Icon className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
  }  
  const renderText = (text: string) => {
    if (compact) {
      return <span className="hidden sm:inline">{text}</span>
    }
    return text
  }

  switch (friendshipStatus) {
    case FriendshipStatus.NO_RELATION:
      return (
        <Button 
          variant={compact ? "outline" : "default"}
          size={compact ? "sm" : "default"}
          className={`${compact ? 'h-8' : ''} gap-1 bg-foreground text-background`}
          onClick={() => onSendRequest?.(userId)}
          disabled={isLoading}
        >
          {renderIcon(UserPlus)}
          {renderText("Add")}
        </Button>
      )
    
    case FriendshipStatus.REQUEST_SENT:
      return (
        <Button 
          variant="outline" 
          size={compact ? "sm" : "default"}
          className={`${compact ? 'h-8' : ''} gap-1 bg-warning-1 text-warning-1-foreground hover:bg-warning-1 hover:text-warning-1-foreground`}
          onClick={() => onCancelRequest?.(userId)}
          disabled={isLoading}
        >
          {renderIcon(UserX)}
          {renderText("Cancel")}
        </Button>
      )
    
    case FriendshipStatus.REQUEST_RECEIVED:
      return (
        <div className="flex gap-2">
          <Button 
            variant={compact ? "outline" : "default"}
            size={compact ? "sm" : "default"}
            className={`${compact ? 'h-8' : ''} gap-1 bg-primary-1 text-primary-1-foreground hover:bg-primary-1 hover:text-primary-1-foreground`}
            onClick={() => onAcceptRequest?.(userId)}
            disabled={isLoading}
          >
            {renderIcon(UserPlus)}
            {renderText("Accept")}
          </Button>
          <Button 
            variant="outline"
            size={compact ? "sm" : "default"}
            className={`${compact ? 'h-8' : ''} gap-1 bg-error-1 text-error-1-foreground hover:bg-error-1 hover:text-error-1-foreground`}
            onClick={() => onRejectRequest?.(userId)}
            disabled={isLoading}
          >
            {renderIcon(UserX)}
            {renderText("Reject")}
          </Button>
        </div>
      )
    
    case FriendshipStatus.FRIENDS:
      return (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size={compact ? "sm" : "default"}
            className={`${compact ? 'h-8' : ''} gap-1 bg-error-1 text-error-1-foreground hover:bg-error-1 hover:text-error-1-foreground`}
            onClick={() => onRemoveFriend?.(userId)}
            disabled={isLoading}
          >
            {renderIcon(UserMinus)}
            {renderText("Remove")}
          </Button>
          
          {showMessage && (
            <Button 
              variant="secondary"
              size={compact ? "sm" : "default"}
              className={`${compact ? 'h-8' : ''} gap-1`}
              asChild
            >
              <Link href={`/dashboard/chat?user=${userId}`}>
                {renderIcon(MessageSquare)}
                {renderText("Message")}
              </Link>
            </Button>
          )}
        </div>
      )
    
    case FriendshipStatus.BLOCKED:
      return (
        <Button 
          variant="outline" 
          size={compact ? "sm" : "default"}
          className={`${compact ? 'h-8' : ''} gap-1`}
          onClick={() => onUnblockUser?.(userId)}
          disabled={isLoading}
        >
          {renderIcon(Shield)}
          {renderText("Unblock")}
        </Button>
      )
    
    default:
      return null
  }
}

export function BlockUserButton({
  userId,
  isBlocked = false,
  isLoading = false,
  onBlockUser,
  onUnblockUser,
  compact = false
}: {
  userId: number
  isBlocked?: boolean
  isLoading?: boolean
  onBlockUser?: (userId: number) => void
  onUnblockUser?: (userId: number) => void
  compact?: boolean
}) {
  const renderIcon = () => {
    return isLoading ? 
      <Loader2 className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} animate-spin`} /> : 
      <Shield className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
  }
  
  if (isBlocked) {
    return (
      <Button 
        variant="outline"
        size={compact ? "sm" : "default"}
        className={`${compact ? 'h-8' : ''} gap-1`}
        onClick={() => onUnblockUser?.(userId)}
        disabled={isLoading}
      >
        {renderIcon()}
        {compact ? <span className="hidden sm:inline">Unblock</span> : "Unblock"}
      </Button>
    )
  }
  
  return (
    <Button 
      variant="ghost"
      size={compact ? "sm" : "default"}
      className={`${compact ? 'h-8' : ''} gap-1 bg-error-1 text-error-1-foreground hover:bg-error-1 hover:text-error-1-foreground`}
      onClick={() => onBlockUser?.(userId)}
      disabled={isLoading}
    >
      {renderIcon()}
      {compact ? <span className="hidden sm:inline">Block</span> : "Block"}
    </Button>
  )
}
