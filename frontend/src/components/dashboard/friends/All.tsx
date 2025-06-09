import { useState } from 'react'
import { Loader2, UserMinus, MessageSquare } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { FriendData } from '@/types/friends'
import { UserInfo } from './UserInfo'
import Link from 'next/link'

interface FriendItemProps {
  friend: FriendData
  onRemove?: (userId: number) => void
  showMessage?: boolean
  isLoading?: boolean
}

export function FriendItem({
  friend,
  onRemove,
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
  
  const isDisabled = isLoading || localLoading
  
  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <UserInfo user={friend} />
      
      <div className="flex gap-2">
        <Button 
          variant="outline"
          size="sm"
          className="h-8 gap-1 bg-error-1 text-error-1-foreground hover:bg-error-1 hover:text-error-1-foreground"
          onClick={handleRemove}
          disabled={isDisabled}
        >
          {localLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <UserMinus className="h-3 w-3" />
          )}
          <span className="hidden sm:inline">Remove</span>
          <span className="sm:hidden">✕</span>
        </Button>
        
        {showMessage && (
          <Button 
            variant="secondary"
            size="sm"
            className="h-8 gap-1"
            asChild
          >
            <Link href={`/dashboard/chat?user=${friend.id}`}>
              <MessageSquare className="h-3 w-3" />
              <span className="hidden sm:inline">Message</span>
              <span className="sm:hidden">💬</span>
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

export function FriendsList({
  friends,
  onRemove,
  showMessage = true,
  isLoading = false
}: {
  friends: FriendData[]
  onRemove?: (userId: number) => void
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
              showMessage={showMessage}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  )
}
