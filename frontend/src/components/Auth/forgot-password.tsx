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
import { forgotPasswordSchema, ForgotPasswordFormValues } from "@/utils/validation"

interface ForgotPasswordFormProps extends React.ComponentProps<"div"> {
  handleForgotPassword: (email: string) => Promise<boolean>
  isLoading?: boolean
  error?: string | null
}

export function ForgotPasswordForm({
  className,
  handleForgotPassword,
  isLoading: externalIsLoading,
  error: externalError,
  ...props
}: ForgotPasswordFormProps) {
  const { lang } = useLang()
  const content = lang === 'fr' ? fr.forgotPassword : en.forgotPassword
  
  return (
    <div className={cn("flex justify-center items-center min-h-screen w-full px-4 py-6", className)} {...props}>
      <div className="w-full max-w-md">
        <EmailCard 
          content={content} 
          handleForgotPassword={handleForgotPassword}
          isLoading={externalIsLoading}
          error={externalError}
        />
      </div>
    </div>
  )
}

interface EmailCardProps {
  content: typeof en.forgotPassword
  handleForgotPassword: (email: string) => Promise<boolean>
  isLoading?: boolean
  error?: string | null
}

function EmailCard({ content, handleForgotPassword, isLoading: externalIsLoading, error: externalError }: EmailCardProps) {
  const [internalIsLoading, setInternalIsLoading] = useState(false)
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading
  const [formSubmitted, setFormSubmitted] = useState(false)
  
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  useEffect(() => {
    if (externalError) {
      form.setError("root", { message: externalError })
      setFormSubmitted(false)
    }
  }, [externalError, form])

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    if (!handleForgotPassword) return
    
    try {
      setFormSubmitted(true)
      
      if (externalIsLoading === undefined) {
        setInternalIsLoading(true)
      }
      
      const success = await handleForgotPassword(values.email)
      
      if (!success) {
        form.setError("root", { 
          message: "Failed to send reset email. Please try again." 
        });
        setFormSubmitted(false)
      }
    } catch (error) {
      form.setError("root", { 
        message: "Failed to send reset link. Please try again." 
      })
      setFormSubmitted(false)
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
              <EmailField content={content} form={form} disabled={formSubmitted} />
              <ResetButton isLoading={isLoading || formSubmitted} content={content} />

              {form.formState.errors.root && (
                <p className="text-destructive text-xs text-center">
                  {form.formState.errors.root.message}
                </p>
              )}
              
              {formSubmitted && !form.formState.errors.root && !isLoading && (
                <p className="text-green-600 text-xs text-center">
                  Verification code sent! Check your email.
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

function EmailField({ content, form, disabled }: { content: typeof en.forgotPassword, form: any, disabled?: boolean }) {
  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs sm:text-sm">
            {content?.emailLabel || "Email"}
          </FormLabel>
          <FormControl>
            <Input
              placeholder={content?.emailPlaceholder || "Enter your email address"}
              className="text-sm sm:text-base h-9 sm:h-10"
              autoComplete="email"
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  )
}

function ResetButton({ isLoading, content }: { isLoading: boolean, content: typeof en.forgotPassword }) {
  return (
    <Button 
      type="submit" 
      className="w-full bg-foreground text-background" 
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <span className="mr-2">Sending</span>
          <span className="animate-spin">...</span>
        </span>
      ) : (
        content?.resetButton || "Send Reset Link"
      )}
    </Button>
  )
}

function BackToLogin({ content }: { content: typeof en.forgotPassword }) {
  return (
    <Button 
      variant="link" 
      className="text-xs sm:text-sm" 
      asChild
    >
      <a href="/login">
        {content?.backToLogin || "Back to Login"}
      </a>
    </Button>
  )
} 