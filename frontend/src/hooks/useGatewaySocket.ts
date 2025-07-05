'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { TokenManager } from '@/lib/api';

export function useGatewaySocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const token = TokenManager.getToken();
    
    // Create socket connection with proper configuration
    socketRef.current = io('https://blackholejs.art', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: token ? { token } : undefined,
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socketRef.current.on('connect', () => {
      setConnected(true);
      console.log('[Gateway Socket connected]');
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('[Gateway Socket connection error]', err);
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
      console.log('[Gateway Socket disconnected]');
    });

    socketRef.current.on('gateway:response', (data) => {
      console.log('Received from gateway:', data);
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const sendMessage = (message: any) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('gateway:message', message);
    } else {
      console.warn('Cannot send message: socket not connected');
    }
  };

  return {
    connected,
    messages,
    sendMessage,
  };
} 