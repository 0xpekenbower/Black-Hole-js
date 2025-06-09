import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { FriendData, MinimalFriendData } from '@/types/friends'
import { UserInfo } from './UserInfo'

interface SentRequestProps {
  request: FriendData
  onCancel?: (userId: number) => void
  isLoading?: boolean
}

interface MinimalSentRequestProps {
  request: MinimalFriendData
  onCancel?: (userId: number) => void
  isLoading?: boolean
}

export function SentRequest({
  request,
  onCancel,
  isLoading = false
}: SentRequestProps) {
  const [localLoading, setLocalLoading] = useState(false)
  
  const handleCancel = async () => {
    setLocalLoading(true)
    try {
      await onCancel?.(request.id)
    } finally {
      setLocalLoading(false)
    }
  }
  
  const isDisabled = isLoading || localLoading
  
  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <UserInfo user={request} />
      
      <div className="flex gap-2">
        <Button 
          variant="outline"
          size="sm"
          className="h-8 gap-1 bg-error-1 text-error-1-foreground hover:bg-error-1 hover:text-error-1-foreground"
          onClick={handleCancel}
          disabled={isDisabled}
        >
          {localLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          <span className="hidden sm:inline">Cancel</span>
          <span className="sm:hidden">✕</span>
        </Button>
      </div>
    </div>
  )
}

export function MinimalSentRequest({
  request,
  onCancel,
  isLoading = false
}: MinimalSentRequestProps) {
  const [localLoading, setLocalLoading] = useState(false)
  
  const handleCancel = async () => {
    setLocalLoading(true)
    try {
      await onCancel?.(request.userId)
    } finally {
      setLocalLoading(false)
    }
  }
  
  const isDisabled = isLoading || localLoading
  
  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <UserInfo user={request} minimal />
      
      <div className="flex gap-2">
        <Button 
          variant="outline"
          size="sm"
          className="h-8 gap-1 bg-error-1 text-error-1-foreground hover:bg-error-1 hover:text-error-1-foreground"
          onClick={handleCancel}
          disabled={isDisabled}
        >
          {localLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          <span className="hidden sm:inline">Cancel</span>
          <span className="sm:hidden">✕</span>
        </Button>
      </div>
    </div>
  )
}

export function SentRequestsList({
  requests,
  onCancel,
  isLoading = false
}: {
  requests: FriendData[] | MinimalFriendData[]
  onCancel?: (userId: number) => void
  isLoading?: boolean
}) {
  const isMinimal = requests.length > 0 && 'userId' in requests[0]  
  return (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No sent friend requests
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            isMinimal ? (
              <MinimalSentRequest
                key={(request as MinimalFriendData).userId}
                request={request as MinimalFriendData}
                onCancel={onCancel}
                isLoading={isLoading}
              />
            ) : (
              <SentRequest
                key={(request as FriendData).id}
                request={request as FriendData}
                onCancel={onCancel}
                isLoading={isLoading}
              />
            )
          ))}
        </div>
      )}
    </div>
  )
}
