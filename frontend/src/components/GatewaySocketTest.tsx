'use client';

import { useState, useEffect } from 'react';
import { useGatewaySocket } from '@/hooks/useGatewaySocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function GatewaySocketTest() {
  const { connected, messages, sendMessage } = useGatewaySocket();
  const [message, setMessage] = useState('');
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  // Simulate connection attempts
  useEffect(() => {
    if (!connected) {
      const timer = setTimeout(() => {
        setConnectionAttempts(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [connected, connectionAttempts]);

  // Reset error when connected
  useEffect(() => {
    if (connected) {
      setLastError(null);
      setConnectionAttempts(0);
    }
  }, [connected]);

  const handleSendMessage = () => {
    if (message.trim()) {
      try {
        sendMessage({ text: message });
        setMessage('');
      } catch (err) {
        setLastError(`Failed to send message: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="font-medium">
          {connected 
            ? 'Connected to Gateway' 
            : `Disconnected (Attempt ${connectionAttempts})`}
        </span>
      </div>

      {lastError && (
        <div className="mb-4 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-sm">
          {lastError}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={!connected}
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={!connected}
          variant={connected ? "default" : "outline"}
        >
          Send
        </Button>
      </div>

      <div className="border rounded p-2 h-40 overflow-y-auto bg-slate-50">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No messages yet</p>
        ) : (
          <ul className="space-y-2">
            {messages.map((msg, index) => (
              <li key={index} className="text-sm p-2 bg-white border rounded">
                <pre className="whitespace-pre-wrap">{JSON.stringify(msg, null, 2)}</pre>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 