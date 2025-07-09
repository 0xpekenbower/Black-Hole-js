'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import { useChat } from '@/hooks/useChat'
import { ConversationList } from './ConversationList'
import { MessageArea } from './MessageArea'
import { useAuth } from '@/context/AuthContext'

export function ChatComponent() {
  const { 
    conversations, 
    messages, 
    activeConversation, 
    isLoading, 
    fetchConversations, 
    fetchMessages, 
    sendMessage 
  } = useChat()
  const { user } = useAuth()
  const [isMobile, setIsMobile] = useState(false)
  const [showConversations, setShowConversations] = useState(true)
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])
  
  useEffect(() => {
    if (activeConversation && isMobile) {
      setShowConversations(false)
    }
  }, [activeConversation, isMobile])
  
  const handleSelectConversation = (userId: number) => {
    fetchMessages(userId)
  }
  
  const handleSendMessage = (content: string) => {
    if (activeConversation && content.trim()) {
      sendMessage(activeConversation, content)
    }
  }
  
  const handleBackToList = () => {
    setShowConversations(true)
  }
  
  return (
    <div className="container mt-8 mx-auto w-full h-full">
      <Card className="w-full h-[calc(100vh-180px)] p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Messages
          </CardTitle>
        </div>
        
        <CardContent className="p-0 h-[calc(100%-60px)]">
          <div className="flex h-full gap-4">
            {(!isMobile || showConversations) && (
              <div className={`${isMobile ? 'w-full' : 'w-1/3'} h-full overflow-y-auto border-r pr-4`}>
                <ConversationList 
                  conversations={conversations}
                  activeId={activeConversation}
                  onSelect={handleSelectConversation}
                  isLoading={isLoading}
                />
              </div>
            )}
            
            {(!isMobile || !showConversations) && (
              <div className={`${isMobile ? 'w-full' : 'w-2/3'} h-full`}>
                <MessageArea 
                  messages={messages}
                  currentUserId={user?.id ? parseInt(user.id) : undefined}
                  isLoading={isLoading}
                  onSendMessage={handleSendMessage}
                  onBack={isMobile ? handleBackToList : undefined}
                  activeConversation={activeConversation ? 
                    conversations.find(c => c.id === activeConversation) : undefined}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 