'use client'

import { useState, useRef, useEffect } from 'react'
import { Message, Conversation } from '@/types/Chat'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, Send } from 'lucide-react'

interface MessageAreaProps {
  messages: Message[]
  currentUserId?: number
  isLoading: boolean
  onSendMessage: (content: string) => void
  onBack?: () => void
  activeConversation?: Conversation
}

export function MessageArea({
  messages,
  currentUserId,
  isLoading,
  onSendMessage,
  onBack,
  activeConversation
}: MessageAreaProps) {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage)
      setNewMessage('')
    }
  }
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  
  if (!activeConversation) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a conversation to start messaging
      </div>
    )
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-3 border-b">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        
        <Avatar className="h-8 w-8">
          <AvatarImage src={activeConversation.avatar} alt={activeConversation.username} />
          <AvatarFallback>
            {activeConversation.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <div className="font-medium text-sm">
            {activeConversation.first_name 
              ? `${activeConversation.first_name} ${activeConversation.last_name}` 
              : activeConversation.username}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && messages.length === 0 ? (
          <div className="flex flex-col space-y-4">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`flex items-end gap-2 ${i % 2 === 0 ? 'justify-end' : ''}`}
              >
                {i % 2 !== 0 && (
                  <div className="w-8 h-8 rounded-full bg-muted"></div>
                )}
                <div 
                  className={`rounded-lg p-3 max-w-[70%] animate-pulse
                    ${i % 2 === 0 
                      ? 'bg-primary/20 rounded-tr-none' 
                      : 'bg-muted rounded-tl-none'}`
                  }
                >
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message, index) => {
                const isCurrentUser = message.sender === currentUserId
                return (
                  <div 
                    key={index} 
                    className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : ''}`}
                  >
                    {!isCurrentUser && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={activeConversation.avatar} 
                          alt={activeConversation.username} 
                        />
                        <AvatarFallback>
                          {activeConversation.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div 
                      className={`rounded-lg p-3 max-w-[70%]
                        ${isCurrentUser 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
                          : 'bg-secondary rounded-tl-none'}`
                      }
                    >
                      <p>{message.data}</p>
                      <div className="text-xs mt-1 opacity-70">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            size="icon" 
            disabled={!newMessage.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 