import { FriendshipStatus } from '@/types/Dashboard'
import { 
  AddButton, 
  CancelButton, 
  AcceptButton, 
  RejectButton, 
  RemoveButton, 
  BlockButton, 
  UnblockButton, 
  MessageButton 
} from './ActionButtons'

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
  switch (friendshipStatus) {
    case 0 as unknown as FriendshipStatus: // No relation (no enum value for this in new system)
      return (
        <AddButton
          onClick={() => onSendRequest?.(userId)}
          isLoading={isLoading}
          compact={compact}
        />
      )
    
    case FriendshipStatus.I_SENT: // I sent request (previously REQUEST_SENT)
      return (
        <CancelButton
          onClick={() => onCancelRequest?.(userId)}
          isLoading={isLoading}
          compact={compact}
        />
      )
    
    case FriendshipStatus.HE_SENT: // He sent request (previously REQUEST_RECEIVED)
      return (
        <div className="flex gap-2">
          <AcceptButton
            onClick={() => onAcceptRequest?.(userId)}
            isLoading={isLoading}
            compact={compact}
          />
          <RejectButton
            onClick={() => onRejectRequest?.(userId)}
            isLoading={isLoading}
            compact={compact}
          />
        </div>
      )
    
    case FriendshipStatus.I_FR: // I am friend (previously FRIENDS)
    case FriendshipStatus.HE_FR: // He is friend
      return (
        <div className="flex gap-2">
          <RemoveButton
            onClick={() => onRemoveFriend?.(userId)}
            isLoading={isLoading}
            compact={compact}
          />
          
          <BlockButton
            onClick={() => onBlockUser?.(userId)}
            isLoading={isLoading}
            compact={compact}
          />
          
          {showMessage && (
            <MessageButton userId={userId} compact={compact} />
          )}
        </div>
      )
    
    case FriendshipStatus.I_BLK: // I blocked (previously BLOCKED)
      return (
        <UnblockButton
          onClick={() => onUnblockUser?.(userId)}
          isLoading={isLoading}
          compact={compact}
        />
      )
    
    case FriendshipStatus.HE_BLK: // He blocked me
      // When someone blocks you, you shouldn't see any action buttons
      return null;
    
    default:
      return null
  }
}
