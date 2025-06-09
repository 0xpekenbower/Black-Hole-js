import { useState } from 'react'
import { FriendData } from '@/types/friends'
import { UserInfo } from './UserInfo'
import { RemoveButton, BlockButton, MessageButton } from './ActionButtons'

interface FriendItemProps {
  friend: FriendData
  onRemove?: (userId: number) => void
  onBlock?: (userId: number) => void
  showMessage?: boolean
  isLoading?: boolean
}

export function FriendItem({
  friend,
  onRemove,
  onBlock,
  showMessage = true,
  isLoading = false
}: FriendItemProps) {
  const [localLoading, setLocalLoading] = useState(false)
  
  const handleRemove = async () => {
    setLocalLoading(true)
    try {
      await onRemove?.(friend.id)
    } finally {
      setLocalLoading(false)
    }
  }
  
  const handleBlock = async () => {
    setLocalLoading(true)
    try {
      await onBlock?.(friend.id)
    } finally {
      setLocalLoading(false)
    }
  }
  
  const isDisabled = isLoading || localLoading
  
  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <UserInfo user={friend} />
      
      <div className="flex gap-2">
        <RemoveButton
          onClick={handleRemove}
          isLoading={localLoading}
          disabled={isDisabled}
        />
        
        <BlockButton
          onClick={handleBlock}
          isLoading={localLoading}
          disabled={isDisabled}
        />
        
        {showMessage && (
          <MessageButton userId={friend.id} />
        )}
      </div>
    </div>
  )
}

export function FriendsList({
  friends,
  onRemove,
  onBlock,
  showMessage = true,
  isLoading = false
}: {
  friends: FriendData[]
  onRemove?: (userId: number) => void
  onBlock?: (userId: number) => void
  showMessage?: boolean
  isLoading?: boolean
}) {
  return (
    <div className="space-y-4">
      {friends.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No friends added yet. Add some friends to get started!
        </div>
      ) : (
        <div className="space-y-3">
          {friends.map(friend => (
            <FriendItem
              key={friend.id}
              friend={friend}
              onRemove={onRemove}
              onBlock={onBlock}
              showMessage={showMessage}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  )
}
