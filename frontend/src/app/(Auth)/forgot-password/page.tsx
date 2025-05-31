'use client'

import { ForgotPasswordForm } from '@/components/Auth/forgot-password'
import { useAuth } from '@/hooks/useAuth'

/**
 * Forgot password page component
 * @returns Forgot password page UI
 */
export default function ForgotPasswordPage() {
  const { getOTP, verifyOTP, changePassword, isLoading, error } = useAuth()

  const handleForgotPassword = async (email: string) => {
    const response = await getOTP(email)
    
    if (response?.token) {
      localStorage.setItem('otp_token', response.token)
    }
  }

  const handleVerifyOtp = async (otp: string) => {
    const otpNumber = parseInt(otp, 10)
    if (isNaN(otpNumber)) {
      throw new Error('Invalid OTP format')
    }
    
    const token = localStorage.getItem('otp_token')
    if (!token) {
      throw new Error('OTP token not found')
    }
    
    await verifyOTP(token, otpNumber)
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <ForgotPasswordForm 
        handleForgotPassword={handleForgotPassword}
        handleVerifyOtp={handleVerifyOtp}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
} 