import { useState, useEffect, useCallback } from 'react';
import { useGateway } from './useGateway';
import chatService from '@/lib/api/ChatService';
import { Message, Conversation, ChatState, SendMessageRequest } from '@/types/Chat';
import { useAuth } from '@/context/AuthContext';

export function useChat() {
  const [state, setState] = useState<ChatState>({
    conversations: [],
    activeConversation: null,
    messages: [],
    isLoading: false,
    error: null
  });
  
  const { socket, connected, addListener, removeListener } = useGateway();
  const { user } = useAuth();
  
  const fetchConversations = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await chatService.getConversations();
      if (response.status.success) {
        setState(prev => ({ 
          ...prev, 
          conversations: response.data || [], 
          isLoading: false 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          error: response.status.message, 
          isLoading: false 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to fetch conversations', 
        isLoading: false 
      }));
    }
  }, []);
  
  const fetchMessages = useCallback(async (userId: number) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await chatService.getMessages(userId);
      if (response.status.success) {
        setState(prev => ({ 
          ...prev, 
          messages: response.data || [], 
          activeConversation: userId,
          isLoading: false 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          error: response.status.message, 
          isLoading: false 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to fetch messages', 
        isLoading: false 
      }));
    }
  }, []);
  
  // Send a message to a user
  // This uses the POST /api/chat/msg/ endpoint with { id: recipientId, msg: content }
  const sendMessage = useCallback(async (recipientId: number, content: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const messageData: SendMessageRequest = {
        id: recipientId,
        msg: content
      };
      
      const response = await chatService.sendMessage(messageData);
      
      if (response.status.success) {
        // Local optimistic update
        if (user) {
          const newMessage: Message = {
            sender: parseInt(user.id),
            data: content,
            created_at: new Date().toISOString()
          };
          
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, newMessage],
            isLoading: false
          }));
        }
      } else {
        setState(prev => ({ 
          ...prev, 
          error: response.status.message, 
          isLoading: false 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to send message', 
        isLoading: false 
      }));
    }
  }, [user]);
  
  const handleNewMessage = useCallback((data: any) => {
    if (data.type === 'new_message' && data.senderId) {
      // If this message belongs to the active conversation
      if (state.activeConversation === data.senderId) {
        const newMessage: Message = {
          sender: data.senderId,
          data: data.content,
          created_at: data.timestamp || new Date().toISOString()
        };
        
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, newMessage]
        }));
      }      
      fetchConversations();
    }
  }, [state.activeConversation, fetchConversations]);
  
  const handleMessageSent = useCallback((data: any) => {
    if (data.type === 'message_sent' && data.receiverId) {
      if (state.activeConversation === data.receiverId) {
        fetchConversations();
      }
    }
  }, [state.activeConversation, fetchConversations]);
  
  useEffect(() => {
    if (connected) {
      fetchConversations();
      addListener('message', handleNewMessage);
      addListener('message_sent', handleMessageSent);
    }
    
    return () => {
      if (connected) {
        removeListener('message', handleNewMessage);
        removeListener('message_sent', handleMessageSent);
      }
    };
  }, [connected, addListener, removeListener, fetchConversations, handleNewMessage, handleMessageSent]);
  
  return {
    ...state,
    fetchConversations,
    fetchMessages,
    sendMessage,
    isConnected: connected
  };
} 