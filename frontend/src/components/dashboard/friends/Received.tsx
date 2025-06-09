import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { FriendData, MinimalFriendData } from '@/types/friends'
import { UserInfo } from './UserInfo'

interface FriendRequestProps {
  request: FriendData
  onAccept?: (userId: number) => void
  onReject?: (userId: number) => void
  onBlock?: (userId: number) => void
  isLoading?: boolean
}

interface MinimalFriendRequestProps {
  request: MinimalFriendData
  onAccept?: (userId: number) => void
  onReject?: (userId: number) => void
  onBlock?: (userId: number) => void
  isLoading?: boolean
}

export function FriendRequest({
  request,
  onAccept,
  onReject,
  onBlock,
  isLoading = false
}: FriendRequestProps) {
  const [localLoading, setLocalLoading] = useState(false)
  
  const handleAccept = async () => {
    setLocalLoading(true)
    try {
      await onAccept?.(request.id)
    } finally {
      setLocalLoading(false)
    }
  }
  
  const handleReject = async () => {
    setLocalLoading(true)
    try {
      await onReject?.(request.id)
    } finally {
      setLocalLoading(false)
    }
  }
  
  const handleBlock = async () => {
    setLocalLoading(true)
    try {
      await onBlock?.(request.id)
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
          className="h-8 gap-1 bg-primary-1 text-primary-1-foreground hover:bg-primary-1 hover:text-primary-1-foreground"
          onClick={handleAccept}
          disabled={isDisabled}
        >
          {localLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          <span className="hidden sm:inline">Accept</span>
          <span className="sm:hidden">✓</span>
        </Button>
        
        <Button 
          variant="outline"
          size="sm"
          className="h-8 gap-1 bg-error-1 text-error-1-foreground hover:bg-error-1 hover:text-error-1-foreground"
          onClick={handleReject}
          disabled={isDisabled}
        >
          {localLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          <span className="hidden sm:inline">Reject</span>
          <span className="sm:hidden">✕</span>
        </Button>
        
        <Button 
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          onClick={handleBlock}
          disabled={isDisabled}
        >
          {localLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          <span className="hidden sm:inline">Block</span>
          <span className="sm:hidden">⛔</span>
        </Button>
      </div>
    </div>
  )
}

export function MinimalFriendRequest({
  request,
  onAccept,
  onReject,
  onBlock,
  isLoading = false
}: MinimalFriendRequestProps) {
  const [localLoading, setLocalLoading] = useState(false)
  
  const handleAccept = async () => {
    setLocalLoading(true)
    try {
      await onAccept?.(request.userId)
    } finally {
      setLocalLoading(false)
    }
  }
  
  const handleReject = async () => {
    setLocalLoading(true)
    try {
      await onReject?.(request.userId)
    } finally {
      setLocalLoading(false)
    }
  }
  
  const handleBlock = async () => {
    setLocalLoading(true)
    try {
      await onBlock?.(request.userId)
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
          className="h-8 gap-1 bg-primary-1 text-primary-1-foreground hover:bg-primary-1 hover:text-primary-1-foreground"
          onClick={handleAccept}
          disabled={isDisabled}
        >
          {localLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          <span className="hidden sm:inline">Accept</span>
          <span className="sm:hidden">✓</span>
        </Button>
        
        <Button 
          variant="outline"
          size="sm"
          className="h-8 gap-1 bg-error-1 text-error-1-foreground hover:bg-error-1 hover:text-error-1-foreground"
          onClick={handleReject}
          disabled={isDisabled}
        >
          {localLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          <span className="hidden sm:inline">Reject</span>
          <span className="sm:hidden">✕</span>
        </Button>
        
        <Button 
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          onClick={handleBlock}
          disabled={isDisabled}
        >
          {localLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          <span className="hidden sm:inline">Block</span>
          <span className="sm:hidden">⛔</span>
        </Button>
      </div>
    </div>
  )
}

export function FriendRequestsList({
  requests,
  onAccept,
  onReject,
  onBlock,
  isLoading = false
}: {
  requests: FriendData[] | MinimalFriendData[]
  onAccept?: (userId: number) => void
  onReject?: (userId: number) => void
  onBlock?: (userId: number) => void
  isLoading?: boolean
}) {
  // Check if we're using minimal data format
  const isMinimal = requests.length > 0 && 'userId' in requests[0]
  
  return (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No pending friend requests
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            isMinimal ? (
              <MinimalFriendRequest
                key={(request as MinimalFriendData).userId}
                request={request as MinimalFriendData}
                onAccept={onAccept}
                onReject={onReject}
                onBlock={onBlock}
                isLoading={isLoading}
              />
            ) : (
              <FriendRequest
                key={(request as FriendData).id}
                request={request as FriendData}
                onAccept={onAccept}
                onReject={onReject}
                onBlock={onBlock}
                isLoading={isLoading}
              />
            )
          ))}
        </div>
      )}
    </div>
  )
}
