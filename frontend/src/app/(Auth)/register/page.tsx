'use client'

import { RegisterForm } from '@/components/Auth/register'
import { useAuth } from '@/hooks/useAuth'

/**
 * Registration page component
 * @returns Registration page UI
 */
export default function RegisterPage() {
  const { register, isLoading, error } = useAuth()

  const handleRegister = async (name: string, email: string, password: string) => {
    const nameParts = name.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''
    
    await register({
      username: email,
      email,
      password,
      repassword: password,
      first_name: firstName,
      last_name: lastName
    })
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <RegisterForm 
        handleRegister={handleRegister}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
} 