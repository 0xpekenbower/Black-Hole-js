import { useState } from 'react'
import { FriendshipStatus } from '@/types/Dashboard'
import { dashboardService } from '@/lib/api'
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
  showMessage?: boolean
  compact?: boolean
  onActionComplete?: () => Promise<void>
}

export function FriendActions({
  userId,
  username,
  friendshipStatus,
  showMessage = false,
  compact = false,
  onActionComplete
}: FriendActionsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async (action: () => Promise<any>) => {
    setIsLoading(true)
    try {
      await action()
      if (onActionComplete) {
        await onActionComplete()
      }
    } catch (error) {
      console.error("Error performing friend action:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendRequest = () => handleAction(() => dashboardService.sendFriendRequest(userId.toString()))
  const handleCancelRequest = () => handleAction(() => dashboardService.cancelFriendRequest(userId.toString()))
  const handleAcceptRequest = () => handleAction(() => dashboardService.acceptFriendRequest(userId.toString()))
  const handleRejectRequest = () => handleAction(() => dashboardService.denyFriendRequest(userId.toString()))
  const handleRemoveFriend = () => handleAction(() => dashboardService.unfriend(userId.toString()))
  const handleBlockUser = () => handleAction(() => dashboardService.blockUser(userId.toString()))
  const handleUnblockUser = () => handleAction(() => dashboardService.unblockUser(userId.toString()))

  switch (friendshipStatus) {
    case 0 as unknown as FriendshipStatus: // No relation (no enum value for this in new system)
      return (
        <AddButton
          onClick={handleSendRequest}
          isLoading={isLoading}
          compact={compact}
        />
      )
    
    case FriendshipStatus.I_SENT: // I sent request (previously REQUEST_SENT)
      return (
        <CancelButton
          onClick={handleCancelRequest}
          isLoading={isLoading}
          compact={compact}
        />
      )
    
    case FriendshipStatus.HE_SENT: // He sent request (previously REQUEST_RECEIVED)
      return (
        <div className="flex gap-2">
          <AcceptButton
            onClick={handleAcceptRequest}
            isLoading={isLoading}
            compact={compact}
          />
          <RejectButton
            onClick={handleRejectRequest}
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
            onClick={handleRemoveFriend}
            isLoading={isLoading}
            compact={compact}
          />
          
          <BlockButton
            onClick={handleBlockUser}
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
          onClick={handleUnblockUser}
          isLoading={isLoading}
          compact={compact}
        />
      )
    
    case FriendshipStatus.HE_BLK: // He blocked me
      return null;
    
    default:
      return null
  }
}
