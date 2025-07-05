'use client'

import { useState, useEffect } from "react"
import { cn } from "@/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SocialButton } from "./social-button"
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
import Link from "next/link"
import { loginSchema, LoginFormValues } from "@/utils/validation"
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext';

interface LoginFormProps extends React.ComponentProps<"div"> {
  handleLogin?: (username: string, password: string) => Promise<void>
  isLoading?: boolean
  error?: string | null
}

export function LoginForm({
  className,
  handleLogin,
  isLoading: externalIsLoading,
  error: externalError,
  ...props
}: LoginFormProps) {
  const { lang } = useLang()
  const content = lang === 'fr' ? fr.login : en.login
  
  return (
    <div className={cn("flex justify-center items-center min-h-screen w-full px-4 py-6", className)} {...props}>
      <div className="w-full max-w-md">
        <Card className="w-full shadow-md border-0">
          <CardHeader className="pb-2 sm:pb-4 space-y-1">
            <CardTitle className="text-lg sm:text-xl font-bold text-foreground text-center">{content.title}</CardTitle>
            <CardDescription className="text-center text-muted-foreground text-xs sm:text-sm">{content.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <LoginFormContent 
              content={content} 
              handleLogin={handleLogin}
              externalIsLoading={externalIsLoading}
              externalError={externalError}
            />
          </CardContent>
          <CardFooter className="pt-0 pb-4 sm:pb-5 flex justify-center">
            <LoginTerms content={content} />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

interface LoginFormContentProps {
  content: typeof en.login
  handleLogin?: LoginFormProps['handleLogin']
  externalIsLoading?: boolean
  externalError?: string | null
}

function LoginFormContent({ content, handleLogin, externalIsLoading, externalError }: LoginFormContentProps) {
  const [internalIsLoading, setInternalIsLoading] = useState(false)
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading
  const [showPassword, setShowPassword] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { loginWithToken, isLoading: contextLoading } = useAuth();
  const loading = isLoading || contextLoading;
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  useEffect(() => {
    // Check for token in URL (after redirect from backend OAuth flow)
    const token = searchParams.get('token');
    if (token) {
      loginWithToken(token);
      // Remove token from URL after processing
      const params = new URLSearchParams(window.location.search);
      params.delete('token');
      const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, loginWithToken]);

  useEffect(() => {
    if (externalError) {
      if (externalError.includes('Invalid username or password') || 
          externalError.includes('User does not exist') || 
          externalError.includes('Incorrect Password')) {
        form.setError("username", { message: "Invalid username or password" })
        form.setError("password", { message: "Invalid username or password" })
      } else if (externalError.includes('locked')) {
        form.setError("root", { 
          message: "Your account has been locked. Please reset your password." 
        })
      } else if (externalError.includes('too many attempts')) {
        form.setError("root", { 
          message: "Too many failed login attempts. Please try again later." 
        })
      } else if (externalError.includes('Network error')) {
        form.setError("root", { 
          message: "Network error. Please check your internet connection and try again." 
        })
      } else {
        form.setError("root", { message: externalError })
      }
    }
  }, [externalError, form])

  const onSubmit = async (values: LoginFormValues) => {
    if (!handleLogin) return
    
    try {
      if (externalIsLoading === undefined) {
        setInternalIsLoading(true)
      }
      await handleLogin(values.username, values.password)
    } catch (error) {
    } finally {
      if (externalIsLoading === undefined) {
        setInternalIsLoading(false)
      }
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span className="text-muted-foreground text-lg">Logging you in...</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="flex flex-col space-y-4">
          <UsernameField content={content} form={form} />
          <PasswordField content={content} form={form} showPassword={showPassword} togglePasswordVisibility={togglePasswordVisibility} />
          <LoginButton isLoading={isLoading} content={content} />

          {form.formState.errors.root && (
            <p className="text-destructive text-xs text-center">
              {form.formState.errors.root.message}
            </p>
          )}

          <SocialLoginSection content={content} />
          <SignUpPrompt content={content} />
        </div>
      </form>
    </Form>
  )
}

function UsernameField({ content, form }: { content: typeof en.login, form: any }) {
  return (
    <FormField
      control={form.control}
      name="username"
      render={({ field }: { field: any }) => (
        <FormItem className="space-y-1 sm:space-y-2">
          <FormLabel className="text-xs sm:text-sm">Username</FormLabel>
          <FormControl>
            <Input
              placeholder="Enter your username"
              type="text"
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

// Password field component
function PasswordField({ 
  content, 
  form, 
  showPassword = false, 
  togglePasswordVisibility 
}: { 
  content: typeof en.login, 
  form: any, 
  showPassword?: boolean, 
  togglePasswordVisibility?: () => void 
}) {
  return (
    <FormField
      control={form.control}
      name="password"
      render={({ field }: { field: any }) => (
        <FormItem className="space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel className="text-xs sm:text-sm">{content.passwordLabel}</FormLabel>
            <Link
              href="/forgot-password"
              className="text-xs underline hover:underline text-foreground/80 hover:text-primary transition-colors"
            >
              {content.forgotPassword}
            </Link>
          </div>
          <FormControl>
            <div className="relative">
              <Input
                placeholder={content.passwordPlaceholder}
                type={showPassword ? "text" : "password"}
                {...field}
                className="h-8 sm:h-9 text-xs sm:text-sm pr-10"
              />
              {togglePasswordVisibility && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-1 text-muted-foreground"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                      <line x1="2" x2="22" y1="2" y2="22"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </Button>
              )}
            </div>
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  )
}

function LoginButton({ isLoading, content }: { isLoading: boolean, content: typeof en.login }) {
  return (
    <Button 
      type="submit" 
      className="w-full h-8 sm:h-9 text-xs font-medium bg-foreground text-background sm:text-sm" 
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
          {content.loginButton}
        </span>
      ) : content.loginButton}
    </Button>
  )
}

function SocialLoginSection({ content }: { content: typeof en.login }) {
  const handleIntraLogin = () => {
    window.location.href = "/api/auth/42/";
  }
  
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google/";
  }

  return (
    <>
      <div className="relative text-center text-xs sm:text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
        <span className="relative z-10 bg-card px-2 text-muted-foreground">
          {content.orContinueWith}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <SocialButton 
          provider="42" 
          className="h-8 sm:h-9 text-xs sm:text-sm"
          onClick={handleIntraLogin}
        />
        <SocialButton 
          provider="google" 
          className="h-8 sm:h-9 text-xs sm:text-sm"
          onClick={handleGoogleLogin}
        />
      </div>
    </>
  )
}

function SignUpPrompt({ content }: { content: typeof en.login }) {
  return (
    <div className="text-center text-xs sm:text-sm font-medium">
      {content.noAccount}{" "}
      <Link href="/register" className="text-forground underline underline-offset-2 hover:text-primary/80 transition-colors">
        {content.signUp}
      </Link>
    </div>
  )
}

function LoginTerms({ content }: { content: typeof en.login }) {
  return (
    <div className="text-balance text-center text-[10px] sm:text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary">
      {content.termsText} <a href="#">{content.termsLink}</a>{" "}
      {content.andText} <a href="#">{content.privacyLink}</a>.
    </div>
  )
}
