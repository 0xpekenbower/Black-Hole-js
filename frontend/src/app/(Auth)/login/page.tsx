'use client'

import { LoginForm } from '@/components/Auth/login'
import { useAuth } from '@/hooks/useAuth'

/**
 * Login page component
 * @returns Login page UI
 */
export default function LoginPage() {
  const { login, isLoading, error } = useAuth()

  const handleLogin = async (email: string, password: string) => {
    await login({
      email,
      password
    })
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <LoginForm 
        handleLogin={handleLogin} 
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
} 