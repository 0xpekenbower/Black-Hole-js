'use client'

import { Conversation } from '@/types/Chat'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface ConversationListProps {
  conversations: Conversation[]
  activeId: number | null
  onSelect: (userId: number) => void
  isLoading: boolean
}

export function ConversationList({ 
  conversations, 
  activeId, 
  onSelect, 
  isLoading 
}: ConversationListProps) {
  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex flex-col space-y-4 py-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-md animate-pulse">
            <div className="w-10 h-10 rounded-full bg-muted"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No conversations yet
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-1 py-4">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          className={`flex items-center gap-3 p-3 rounded-md hover:bg-secondary/50 transition-colors ${
            activeId === conversation.id ? 'bg-secondary' : ''
          }`}
          onClick={() => onSelect(conversation.id)}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.avatar} alt={conversation.username} />
            <AvatarFallback>
              {conversation.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col items-start flex-1 overflow-hidden">
            <span className="font-medium text-sm">
              {conversation.first_name 
                ? `${conversation.first_name} ${conversation.last_name}` 
                : conversation.username}
            </span>
            <span className="text-xs text-muted-foreground truncate w-full text-left">
              {conversation.last_message}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
} 