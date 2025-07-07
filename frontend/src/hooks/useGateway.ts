'use client'

import { useAuth } from '@/context/AuthContext'
import { useState, useEffect, useCallback } from 'react'
import { Socket } from 'socket.io-client'

/**
 * Interface for the gateway socket hook return value
 */
export interface UseGatewayReturn {
  socket: Socket | null
  connected: boolean
  sendMessage: (event: string, data: any) => boolean
  addListener: (event: string, callback: (data: any) => void) => void
  removeListener: (event: string, callback: (data: any) => void) => void
}

/**
 * Hook to use the gateway socket from AuthContext
 * @returns Gateway socket interface
 */
export function useGateway(): UseGatewayReturn {
  const { gatewaySocket } = useAuth()
  const [connected, setConnected] = useState<boolean>(false)
  
  useEffect(() => {
    if (!gatewaySocket) return
    
    setConnected(gatewaySocket.connected)
    
    const handleConnect = () => setConnected(true)
    const handleDisconnect = () => setConnected(false)
    
    gatewaySocket.on('connect', handleConnect)
    gatewaySocket.on('disconnect', handleDisconnect)
    
    return () => {
      gatewaySocket.off('connect', handleConnect)
      gatewaySocket.off('disconnect', handleDisconnect)
    }
  }, [gatewaySocket])
  
  const sendMessage = useCallback((event: string, data: any): boolean => {
    if (!gatewaySocket || !connected) return false
    
    try {
      gatewaySocket.emit(event, data)
      return true
    } catch (err) {
      console.error('Error sending message:', err)
      return false
    }
  }, [gatewaySocket, connected])
  
  const addListener = useCallback((event: string, callback: (data: any) => void) => {
    if (!gatewaySocket) return
    gatewaySocket.on(event, callback)
  }, [gatewaySocket])
  
  const removeListener = useCallback((event: string, callback: (data: any) => void) => {
    if (!gatewaySocket) return
    gatewaySocket.off(event, callback)
  }, [gatewaySocket])
  
  return {
    socket: gatewaySocket,
    connected,
    sendMessage,
    addListener,
    removeListener
  }
} 