'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLang } from "@/context/langContext"
import en from "@/i18n/en/auth"
import fr from "@/i18n/fr/auth"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { passwordResetSchema, PasswordResetFormValues } from "@/utils/validation"
import { useNavigation } from '@/context/NavigationContext'

/**
 * Direct password reset page component
 * This page is accessed via a link in the email with OTP code and email as URL parameters
 * @returns Password reset page UI
 */
export default function ResetPasswordPage() {
  const { changePassword, isLoading, error } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const otpCode = searchParams.get('code') || ''
  const { lang } = useLang()
  const content = lang === 'fr' ? fr.forgotPassword : en.forgotPassword
  const [internalError, setInternalError] = useState<string | null>(null)
  const { isNavigationAllowed } = useNavigation()
  const currentPath = `/reset-password?email=${encodeURIComponent(email)}&code=${otpCode}`

  // Redirect if no email or OTP code is provided or if navigation is not allowed
  useEffect(() => {
    if (!email || !otpCode) {
      router.push('/forgot-password')
    }
  }, [email, otpCode, router])

  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    if (error) {
      setInternalError(error)
      form.setError("root", { message: error })
    }
  }, [error, form])

  const onSubmit = async (values: PasswordResetFormValues) => {
    try {
      setInternalError(null)
      if (values.password !== values.confirmPassword) {
        form.setError("confirmPassword", { 
          message: "Passwords do not match" 
        })
        return
      }
      
      await changePassword(email, otpCode, values.password)
      return true
    } catch (error) {
      if (error instanceof Error) {
        setInternalError(error.message)
      } else {
        setInternalError("Failed to reset password. Please try again.")
      }
      return false
    }
  }

  // Don't render anything if no email or OTP code is provided
  if (!email || !otpCode) {
    return null
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-md border-0">
          <CardHeader className="pb-2 sm:pb-4 space-y-1">
            <CardTitle className="text-lg sm:text-xl font-bold text-foreground text-center">
              {content?.passwordTitle || "Reset Your Password"}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground text-xs sm:text-sm">
              {content?.passwordSubtitle || "Enter your new password below"}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">
                        {content?.passwordLabel || "New Password"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder={content?.passwordPlaceholder || "Enter new password"} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">
                        {content?.confirmPasswordLabel || "Confirm Password"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder={content?.confirmPasswordPlaceholder || "Confirm new password"} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <div className="flex justify-center w-full">
                  <Button 
                    type="submit" 
                    className="w-full bg-foreground text-background" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center bg-foreground text-background">
                        <span className="mr-2">Resetting</span>
                        <span className="animate-spin">...</span>
                      </span>
                    ) : (
                      content?.resetPasswordButton || "Reset Password"
                    )}
                  </Button>
                </div>
                {(internalError || form.formState.errors.root) && (
                  <p className="text-destructive text-xs text-center">
                    {internalError || form.formState.errors.root?.message}
                  </p>
                )}
              </form>
            </Form>
          </CardContent>
          <CardFooter className="pt-0 pb-4 sm:pb-5 flex flex-col justify-center items-center space-y-2">
            <Button 
              variant="link" 
              className="text-xs sm:text-sm" 
              onClick={() => router.push('/login')}
            >
              {content?.backToLogin || "Back to Login"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 