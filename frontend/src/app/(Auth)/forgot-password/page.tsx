'use client'

import { useState } from 'react'
import { ForgotPasswordForm } from '@/components/Auth/forgot-password'
import { useAuth } from '@/hooks/useAuth'

/**
 * Forgot password page component
 * @returns Forgot password page UI
 */
export default function ForgotPasswordPage() {
  const { getOTP, changePassword, isLoading, error } = useAuth()
  const [verificationStep, setVerificationStep] = useState<'email' | 'otp' | 'password'>('email')
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')

  const handleForgotPassword = async (email: string) => {
    try {
      const success = await getOTP(email)
      
      if (success) {
        setEmail(email)
        setVerificationStep('otp')
        return true
      }
      return false
    } catch (error) {
      console.error('Error requesting OTP:', error)
      return false
    }
  }

  const handleVerifyOtp = async (otp: string) => {
    try {
      // Validate OTP is 6 digits
      if (!/^\d{6}$/.test(otp)) {
        throw new Error('OTP must be 6 digits')
      }
      
      // Store the OTP code for later use in password reset
      setOtpCode(otp)
      setVerificationStep('password')
      return true
    } catch (error) {
      console.error('Error verifying OTP:', error)
      return false
    }
  }

  const handleResetPassword = async (password: string) => {
    try {
      // Pass email, OTP code, and password to the changePassword function
      await changePassword(email, otpCode, password)
      return true
    } catch (error) {
      console.error('Error resetting password:', error)
      return false
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <ForgotPasswordForm 
        handleForgotPassword={handleForgotPassword}
        handleVerifyOtp={handleVerifyOtp}
        handleResetPassword={handleResetPassword}
        verificationStep={verificationStep}
        setVerificationStep={setVerificationStep}
        email={email}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
} 