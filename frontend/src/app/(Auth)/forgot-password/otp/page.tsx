'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { OtpVerificationForm } from '@/components/Auth/otp-verification'
import { useAuth } from '@/hooks/useAuth'
import { useNavigation } from '@/context/NavigationContext'

/**
 * OTP verification page component
 * @returns OTP verification page UI
 */
export default function OtpVerificationPage() {
  const { changePassword, isLoading, error } = useAuth()
  const [verificationStep, setVerificationStep] = useState<'otp' | 'password'>('otp')
  const [otpCode, setOtpCode] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const { isNavigationAllowed } = useNavigation()
  const currentPath = `/forgot-password/otp?email=${encodeURIComponent(email)}`

  // Redirect if no email is provided or if navigation is not allowed
  useEffect(() => {
    if (!email || !isNavigationAllowed(currentPath)) {
      router.push('/forgot-password')
    }
  }, [email, router, currentPath, isNavigationAllowed])

  const handleVerifyOtp = async (otp: string) => {
    try {
      if (otp.length !== 6) {
        throw new Error('Verification code must be 6 characters')
      }      
      setOtpCode(otp)
      setVerificationStep('password')
      return true
    } catch (error) {
      return false
    }
  }

  const handleResetPassword = async (password: string) => {
    try {
      await changePassword(email, otpCode, password)
      return true
    } catch (error) {
      return false
    }
  }

  const handleBackToEmail = () => {
    router.push('/forgot-password')
  }
  
  // Don't render anything if not allowed to access this page
  if (!email || !isNavigationAllowed(currentPath)) {
    return null
  }
  
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <OtpVerificationForm
        email={email}
        handleVerifyOtp={handleVerifyOtp}
        handleResetPassword={handleResetPassword}
        handleBackToEmail={handleBackToEmail}
        verificationStep={verificationStep}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
} 