'use client'

import { useSearchParams } from 'next/navigation'
import { ProfileComponent } from '@/components/dashboard/profile'

export default function ProfilePage() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('id')
  
  return <ProfileComponent userId={userId || undefined} />
}
