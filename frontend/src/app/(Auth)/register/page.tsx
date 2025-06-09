'use client'

import { RegisterForm } from '@/components/Auth/register'
import { useAuth } from '@/hooks/useAuth'
import { RegisterFormValues } from '@/types/Auth'

/**
 * Registration page component
 * @returns Registration page UI
 */
export default function RegisterPage() {
  const { register, isLoading, error } = useAuth()

  const handleRegister = async (data: {
    username: string;
    email: string;
    password: string;
    repassword: string;
    first_name?: string;
    last_name?: string;
  }) => {
    await register({
      username: data.username,
      email: data.email,
      password: data.password,
      repassword: data.repassword,
      first_name: data.first_name,
      last_name: data.last_name
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