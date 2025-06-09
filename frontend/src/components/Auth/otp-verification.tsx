'use client'

import { useState, useEffect } from "react"
import { cn } from "@/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { otpSchema, passwordResetSchema, OtpFormValues, PasswordResetFormValues } from "@/utils/validation"

interface OtpVerificationFormProps extends React.ComponentProps<"div"> {
  email: string
  handleVerifyOtp: (otp: string) => Promise<boolean>
  handleResetPassword: (password: string) => Promise<boolean>
  handleBackToEmail: () => void
  verificationStep: 'otp' | 'password'
  isLoading?: boolean
  error?: string | null
}

export function OtpVerificationForm({
  className,
  email,
  handleVerifyOtp,
  handleResetPassword,
  handleBackToEmail,
  verificationStep = 'otp',
  isLoading: externalIsLoading,
  error: externalError,
  ...props
}: OtpVerificationFormProps) {
  const { lang } = useLang()
  const content = lang === 'fr' ? fr.forgotPassword : en.forgotPassword
  
  return (
    <div className={cn("flex justify-center items-center min-h-screen w-full px-4 py-6", className)} {...props}>
      <div className="w-full max-w-md">
        {verificationStep === 'otp' ? (
          <OtpCard 
            content={content} 
            email={email}
            handleVerifyOtp={handleVerifyOtp}
            onBack={handleBackToEmail}
            isLoading={externalIsLoading}
            error={externalError}
          />
        ) : (
          <PasswordCard
            content={content}
            handleResetPassword={handleResetPassword}
            isLoading={externalIsLoading}
            error={externalError}
          />
        )}
      </div>
    </div>
  )
}

interface OtpCardProps {
  content: typeof en.forgotPassword
  email: string
  handleVerifyOtp: (otp: string) => Promise<boolean>
  onBack: () => void
  isLoading?: boolean
  error?: string | null
}

function OtpCard({ content, email, handleVerifyOtp, onBack, isLoading: externalIsLoading, error: externalError }: OtpCardProps) {
  const [internalIsLoading, setInternalIsLoading] = useState(false)
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  })

  useEffect(() => {
    if (externalError) {
      if (externalError.includes('code expired') || externalError.includes('verification code has expired')) {
        form.setError("root", { 
          message: "Verification code has expired. Please request a new code." 
        })
      } else if (externalError.includes('invalid') || externalError.includes('incorrect')) {
        form.setError("root", { 
          message: "Invalid verification code. Please check and try again." 
        })
      } else {
        form.setError("root", { message: externalError })
      }
    }
  }, [externalError, form])

  const onSubmit = async (values: OtpFormValues) => {
    try {
      if (externalIsLoading === undefined) {
        setInternalIsLoading(true)
      }      
      if (values.otp.length !== 6) {
        form.setError("otp", { 
          message: "Verification code must be 6 characters" 
        })
        return
      }
      
      const success = await handleVerifyOtp(values.otp)      
      if (!success) {
        form.setError("root", { 
          message: "Failed to verify code. Please try again." 
        })
      }
    } catch (error) {
      form.setError("root", { 
        message: "Failed to verify code. Please try again." 
      })
    } finally {
      if (externalIsLoading === undefined) {
        setInternalIsLoading(false)
      }
    }
  }

  const handleResendCode = async () => {
    try {
      setResendLoading(true)
      setResendError(null)      
      onBack()
    } catch (error) {
      setResendError("Failed to request a new code. Please try again.")
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-md border-0">
      <CardHeader className="pb-2 sm:pb-4 space-y-1">
        <CardTitle className="text-lg sm:text-xl font-bold text-foreground text-center">
          {content?.otpTitle || "Verify Your Email"}
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground text-xs sm:text-sm">
          {content?.otpSubtitle || `Enter the verification code sent to ${email}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
            <div className="flex flex-col space-y-4 justify-center">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel className="text-xs sm:text-sm text-center">
                      {content?.otpLabel || "Verification Code"}
                    </FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} className="flex justify-center" {...field}>
                        <InputOTPGroup className="gap-0">
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage className="text-xs text-center" />
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
                      <span className="mr-2">Verifying</span>
                      <span className="animate-spin">...</span>
                    </span>
                  ) : (
                    content?.verifyButton || "Verify Code"
                  )}
                </Button>
              </div>

              {form.formState.errors.root && (
                <p className="text-destructive text-xs text-center">
                  {form.formState.errors.root.message}
                </p>
              )}
              
              {resendError && (
                <p className="text-destructive text-xs text-center">
                  {resendError}
                </p>
              )}
              
              {resendSuccess && (
                <p className="text-green-600 text-xs text-center">
                  {content?.resendSuccess || "New code sent! Check your email."}
                </p>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="pt-0 pb-4 sm:pb-5 flex flex-col justify-center items-center space-y-2">
        <Button 
          variant="link" 
          className="text-xs sm:text-sm" 
          onClick={onBack}
        >
          {content?.backToEmail || "Back to Email"}
        </Button>
        <Button 
          variant="link" 
          className="text-xs sm:text-sm" 
          onClick={handleResendCode}
          disabled={resendLoading}
        >
          {resendLoading ? (
            <span className="flex items-center justify-center">
              <span className="mr-2">Requesting</span>
              <span className="animate-spin">...</span>
            </span>
          ) : (
            content?.resendCode || "Didn't receive a code? Request a new one"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

// Password Card component
interface PasswordCardProps {
  content: typeof en.forgotPassword
  handleResetPassword: (password: string) => Promise<boolean>
  isLoading?: boolean
  error?: string | null
}

function PasswordCard({ content, handleResetPassword, isLoading: externalIsLoading, error: externalError }: PasswordCardProps) {
  const [internalIsLoading, setInternalIsLoading] = useState(false)
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading
  
  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    if (externalError) {
      form.setError("root", { message: externalError })
    }
  }, [externalError, form])

  const onSubmit = async (values: PasswordResetFormValues) => {
    try {
      if (externalIsLoading === undefined) {
        setInternalIsLoading(true)
      }
      if (values.password !== values.confirmPassword) {
        form.setError("confirmPassword", { 
          message: "Passwords don't match" 
        })
        return
      }
      const success = await handleResetPassword(values.password)
      
      if (!success) {
        form.setError("root", { 
          message: "Failed to reset password. Please try again." 
        })
      }
    } catch (error) {
      form.setError("root", { 
        message: "Failed to reset password. Please try again." 
      })
    } finally {
      if (externalIsLoading === undefined) {
        setInternalIsLoading(false)
      }
    }
  }

  return (
    <Card className="w-full shadow-md border-0">
      <CardHeader className="pb-2 sm:pb-4 space-y-1">
        <CardTitle className="text-lg sm:text-xl font-bold text-foreground text-center">
          {content?.passwordTitle || "Reset Your Password"}
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground text-xs sm:text-sm">
          {content?.passwordSubtitle || "Enter your new password"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
            <div className="flex flex-col space-y-4">
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
                        placeholder={content?.passwordPlaceholder || "Enter your new password"}
                        className="text-sm sm:text-base h-9 sm:h-10"
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
                        placeholder={content?.confirmPasswordPlaceholder || "Confirm your new password"}
                        className="text-sm sm:text-base h-9 sm:h-10"
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

              {form.formState.errors.root && (
                <p className="text-destructive text-xs text-center">
                  {form.formState.errors.root.message}
                </p>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 