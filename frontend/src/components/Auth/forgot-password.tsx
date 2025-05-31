'use client'

import { useState, useEffect } from "react"
import { cn } from "@/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLang } from "@/context/langContext"
import en from "@/i18n/en/auth"
import fr from "@/i18n/fr/auth"
import { z } from "zod"
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

// Schema definition
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

const otpSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 digits" }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
type OtpFormValues = z.infer<typeof otpSchema>

interface ForgotPasswordFormProps extends React.ComponentProps<"div"> {
  handleForgotPassword?: (email: string) => Promise<void>
  handleVerifyOtp?: (otp: string) => Promise<void>
  isLoading?: boolean
  error?: string | null
}

export function ForgotPasswordForm({
  className,
  handleForgotPassword,
  handleVerifyOtp,
  isLoading: externalIsLoading,
  error: externalError,
  ...props
}: ForgotPasswordFormProps) {
  const { lang } = useLang()
  const content = lang === 'fr' ? fr.forgotPassword : en.forgotPassword
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState("")
  
  return (
    <div className={cn("flex justify-center items-center min-h-screen w-full px-4 py-6", className)} {...props}>
      <div className="w-full max-w-md">
        {step === 'email' ? (
          <EmailCard 
            content={content} 
            handleForgotPassword={async (email) => {
              if (handleForgotPassword) {
                await handleForgotPassword(email);
                setEmail(email);
                setStep('otp');
              }
            }}
            isLoading={externalIsLoading}
            error={externalError}
          />
        ) : (
          <OtpCard 
            content={content} 
            email={email}
            handleVerifyOtp={handleVerifyOtp}
            onBack={() => setStep('email')}
            isLoading={externalIsLoading}
            error={externalError}
          />
        )}
      </div>
    </div>
  )
}

// Email Card component
interface EmailCardProps {
  content: typeof en.forgotPassword
  handleForgotPassword?: (email: string) => Promise<void>
  isLoading?: boolean
  error?: string | null
}

function EmailCard({ content, handleForgotPassword, isLoading: externalIsLoading, error: externalError }: EmailCardProps) {
  const [internalIsLoading, setInternalIsLoading] = useState(false)
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading
  
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  useEffect(() => {
    if (externalError) {
      form.setError("root", { message: externalError })
    }
  }, [externalError, form])

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    if (!handleForgotPassword) return
    
    try {
      if (externalIsLoading === undefined) {
        setInternalIsLoading(true)
      }
      await handleForgotPassword(values.email)
    } catch (error) {
      form.setError("root", { 
        message: "Failed to send reset link. Please try again." 
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
          {content?.title || "Reset Password"}
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground text-xs sm:text-sm">
          {content?.subtitle || "Enter your email to receive a password reset link"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
            <div className="flex flex-col space-y-4">
              <EmailField content={content} form={form} />
              <ResetButton isLoading={isLoading} content={content} />

              {form.formState.errors.root && (
                <p className="text-destructive text-xs text-center">
                  {form.formState.errors.root.message}
                </p>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="pt-0 pb-4 sm:pb-5 flex justify-center">
        <BackToLogin content={content} />
      </CardFooter>
    </Card>
  )
}

// OTP Card component
interface OtpCardProps {
  content: typeof en.forgotPassword
  email: string
  handleVerifyOtp?: (otp: string) => Promise<void>
  onBack: () => void
  isLoading?: boolean
  error?: string | null
}

function OtpCard({ content, email, handleVerifyOtp, onBack, isLoading: externalIsLoading, error: externalError }: OtpCardProps) {
  const [internalIsLoading, setInternalIsLoading] = useState(false)
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading
  
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  })

  useEffect(() => {
    if (externalError) {
      form.setError("root", { message: externalError })
    }
  }, [externalError, form])

  const onSubmit = async (values: OtpFormValues) => {
    if (!handleVerifyOtp) return
    
    try {
      // Only set loading if we're managing it internally
      if (externalIsLoading === undefined) {
        setInternalIsLoading(true)
      }
      await handleVerifyOtp(values.otp)
    } catch (error) {
      // console.error("OTP verification failed:", error)
      form.setError("root", { 
        message: "Invalid verification code. Please try again." 
      })
    } finally {
      // Only set loading if we're managing it internally
      if (externalIsLoading === undefined) {
        setInternalIsLoading(false)
      }
    }
  }

  return (
    <Card className="w-full shadow-md border-0">
      <CardHeader className="pb-2 sm:pb-4 space-y-1">
        <CardTitle className="text-lg sm:text-xl font-bold text-foreground text-center">
          {content?.otpTitle || "Verify Code"}
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground text-xs sm:text-sm">
          {content?.otpSubtitle || `Enter the 6-digit code sent to ${email}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
            <div className="flex flex-col space-y-6">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }: { field: any }) => (
                  <FormItem className="space-y-3">
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <FormMessage className="text-xs text-center text-foreground" />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full h-8 sm:h-9 text-xs sm:text-sm bg-foreground text-background" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2 text-foreground bg-foreground">
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {content?.verifyButton || "Verify Code"}
                  </span>
                ) : content?.verifyButton || "Verify Code"}
              </Button>

              {form.formState.errors.root && (
                <p className="text-destructive text-xs text-center">
                  {form.formState.errors.root.message}
                </p>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="pt-0 pb-4 sm:pb-5 flex flex-col gap-2 items-center">
        <BackToLogin content={content} />
      </CardFooter>
    </Card>
  )
}

// Email field component
function EmailField({ content, form }: { content: typeof en.forgotPassword, form: any }) {
  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }: { field: any }) => (
        <FormItem className="space-y-1 sm:space-y-2">
          <FormLabel className="text-xs sm:text-sm">{content?.emailLabel || "Email"}</FormLabel>
          <FormControl>
            <Input
              placeholder={content?.emailPlaceholder || "Enter your email address"}
              type="email"
              {...field}
              className="h-8 sm:h-9 text-xs sm:text-sm"
            />
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  )
}

// Reset button component
function ResetButton({ isLoading, content }: { isLoading: boolean, content: typeof en.forgotPassword }) {
  return (
    <Button 
      type="submit" 
      className="w-full h-8 sm:h-9 text-xs sm:text-sm bg-foreground text-background" 
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {content?.resetButton || "Send Reset Link"}
        </span>
      ) : content?.resetButton || "Send Reset Link"}
    </Button>
  )
}

// Back to login component
function BackToLogin({ content }: { content: typeof en.forgotPassword }) {
  return (
    <div className="text-center text-xs sm:text-sm">
      <a href="/login" className="text-foreground underline underline-offset-2 hover:text-primary/80 transition-colors">
        {content?.backToLogin || "Back to login"}
      </a>
    </div>
  )
} 