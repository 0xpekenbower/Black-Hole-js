import { useState } from 'react'
import { FriendData } from '@/types/friends'
import { UserInfo } from './UserInfo'
import { UnblockButton } from './ActionButtons'

interface BlockedUserProps {
  user: FriendData
  onUnblock?: (userId: number) => void
  isLoading?: boolean
}

export function BlockedUser({
  user,
  onUnblock,
  isLoading = false
}: BlockedUserProps) {
  const [localLoading, setLocalLoading] = useState(false)
  
  const handleUnblock = async () => {
    setLocalLoading(true)
    try {
      await onUnblock?.(user.id)
    } finally {
      setLocalLoading(false)
    }
  }
  
  const isDisabled = isLoading || localLoading
  
  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <UserInfo user={user} />
      
      <UnblockButton
        onClick={handleUnblock}
        isLoading={localLoading}
        disabled={isDisabled}
      />
    </div>
  )
}

export function BlockedUsersList({
  users,
  onUnblock,
  isLoading = false
}: {
  users: FriendData[]
  onUnblock?: (userId: number) => void
  isLoading?: boolean
}) {
  return (
    <div className="space-y-4">
      {users.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No blocked users
        </div>
      ) : (
        <div className="space-y-3">
          {users.map(user => (
            <BlockedUser
              key={user.id}
              user={user}
              onUnblock={onUnblock}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  )
}
