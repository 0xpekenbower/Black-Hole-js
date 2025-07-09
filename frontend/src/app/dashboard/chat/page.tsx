'use client'

import { ChatComponent } from '@/components/dashboard/chat'
import { useSearchParams } from 'next/navigation'

export default function ChatPage() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  
  return <ChatComponent userId={userId ? parseInt(userId) : undefined} />
}
