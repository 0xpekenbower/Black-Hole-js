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
import Link from "next/link"

// Schema definition
const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(25, { message: "Password must not exceed 25 characters" })
})

type RegisterFormValues = z.infer<typeof registerSchema>

interface RegisterFormProps extends React.ComponentProps<"div"> {
  handleRegister?: (name: string, email: string, password: string) => Promise<void>
  isLoading?: boolean
  error?: string | null
}

export function RegisterForm({
  className,
  handleRegister,
  isLoading: externalIsLoading,
  error: externalError,
  ...props
}: RegisterFormProps) {
  const { lang } = useLang()
  const content = lang === 'fr' ? fr.register : en.register
  
  return (
    <div className={cn("flex justify-center items-center min-h-screen w-full px-4 py-6", className)} {...props}>
      <div className="w-full max-w-md">
        <Card className="w-full shadow-md border-0">
          <CardHeader className="pb-2 sm:pb-4 space-y-1">
              <CardTitle className="text-lg sm:text-xl font-bold text-foreground text-center">{content?.title || "Create Account"}</CardTitle>
            <CardDescription className="text-center text-muted-foreground text-xs sm:text-sm">
              {content?.subtitle || "Enter your details to create your account"}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <RegisterFormContent 
              content={content} 
              handleRegister={handleRegister}
              externalIsLoading={externalIsLoading}
              externalError={externalError}
            />
          </CardContent>
          <CardFooter className="pt-0 pb-4 sm:pb-5 flex justify-center">
            <RegisterTerms content={content} />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

// Form content component
interface RegisterFormContentProps {
  content: typeof en.register
  handleRegister?: RegisterFormProps['handleRegister']
  externalIsLoading?: boolean
  externalError?: string | null
}

function RegisterFormContent({ content, handleRegister, externalIsLoading, externalError }: RegisterFormContentProps) {
  const [internalIsLoading, setInternalIsLoading] = useState(false)
  // Use external loading state if provided, otherwise use internal
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading
  const [showPassword, setShowPassword] = useState(false)
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    },
  })

  // Set form error if external error is provided
  useEffect(() => {
    if (externalError) {
      // Handle specific registration error cases
      if (externalError.includes('Email already exists') || 
          externalError.includes('email already in use')) {
        form.setError("email", { 
          message: "Email already in use. Please use a different email." 
        })
      } else if (externalError.includes('Username already exists') || 
                externalError.includes('username already in use')) {
        form.setError("name", { 
          message: "Username already in use. Please choose a different one." 
        })
      } else if (externalError.includes('Password must contain')) {
        form.setError("password", { 
          message: externalError 
        })
      } else if (externalError.includes('Email does not comply')) {
        form.setError("email", { 
          message: "Please enter a valid email address." 
        })
      } else if (externalError.includes('Passwords do not match')) {
        form.setError("password", { 
          message: "Passwords do not match." 
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

  const onSubmit = async (values: RegisterFormValues) => {
    if (!handleRegister) return
    
    try {
      // Only set loading if we're managing it internally
      if (externalIsLoading === undefined) {
        setInternalIsLoading(true)
      }
      await handleRegister(values.name, values.email, values.password)
    } catch (error) {
      console.error("Registration failed:", error)
      form.setError("root", { 
        message: "Registration failed. Please try again." 
      })
    } finally {
      // Only set loading if we're managing it internally
      if (externalIsLoading === undefined) {
        setInternalIsLoading(false)
      }
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="flex flex-col space-y-4">
          <NameField content={content} form={form} />
          <EmailField content={content} form={form} />
          <PasswordField 
            content={content} 
            form={form} 
            showPassword={showPassword} 
            togglePasswordVisibility={togglePasswordVisibility} 
          />
          <RegisterButton isLoading={isLoading} content={content} />

          {form.formState.errors.root && (
            <p className="text-destructive text-xs text-center">
              {form.formState.errors.root.message}
            </p>
          )}

          <SocialLoginSection content={content} />
          <LoginPrompt content={content} />
        </div>
      </form>
    </Form>
  )
}

// Name field component
function NameField({ content, form }: { content: typeof en.register, form: any }) {
  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }: { field: any }) => (
        <FormItem className="space-y-1 sm:space-y-2">
          <FormLabel className="text-xs sm:text-sm">{content?.nameLabel || "Full Name"}</FormLabel>
          <FormControl>
            <Input
              placeholder={content?.namePlaceholder || "Enter your name"}
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

// Email field component
function EmailField({ content, form }: { content: typeof en.register, form: any }) {
  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }: { field: any }) => (
        <FormItem className="space-y-1 sm:space-y-2">
          <FormLabel className="text-xs sm:text-sm">{content?.emailLabel || "Email"}</FormLabel>
          <FormControl>
            <Input
              placeholder={content?.emailPlaceholder || "Enter your email"}
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

// Password field component
function PasswordField({ 
  content, 
  form, 
  showPassword = false, 
  togglePasswordVisibility 
}: { 
  content: typeof en.register, 
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
          <FormLabel className="text-xs sm:text-sm">{content?.passwordLabel || "Password"}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder={content?.passwordPlaceholder || "Create a password"} 
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
          
          {/* Password strength indicator */}
          <div className="space-y-1">
            <div className="h-1 flex gap-1">
              <div className={`h-full flex-1 rounded-sm transition-colors ${
                field.value.length > 0 ? 'bg-red-500' : 'bg-muted'
              }`}></div>
              <div className={`h-full flex-1 rounded-sm transition-colors ${
                field.value.length >= 8 ? 'bg-orange-500' : 'bg-muted'
              }`}></div>
              <div className={`h-full flex-1 rounded-sm transition-colors ${
                field.value.length >= 8 && 
                /[A-Z]/.test(field.value) && 
                /[a-z]/.test(field.value) ? 'bg-yellow-500' : 'bg-muted'
              }`}></div>
              <div className={`h-full flex-1 rounded-sm transition-colors ${
                field.value.length >= 8 && 
                /[A-Z]/.test(field.value) && 
                /[a-z]/.test(field.value) && 
                /[0-9]/.test(field.value) ? 'bg-green-500' : 'bg-muted'
              }`}></div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {field.value.length === 0 && "Password strength"}
              {field.value.length > 0 && field.value.length < 8 && "Weak password"}
              {field.value.length >= 8 && !(/[A-Z]/.test(field.value) && /[a-z]/.test(field.value)) && "Fair password"}
              {field.value.length >= 8 && /[A-Z]/.test(field.value) && /[a-z]/.test(field.value) && !(/[0-9]/.test(field.value)) && "Good password"}
              {field.value.length >= 8 && /[A-Z]/.test(field.value) && /[a-z]/.test(field.value) && /[0-9]/.test(field.value) && "Strong password"}
            </p>
          </div>
        </FormItem>
      )}
    />
  )
}

// Register button component
function RegisterButton({ isLoading, content }: { isLoading: boolean, content: typeof en.register }) {
  return (
    <Button 
      type="submit" 
      className="w-full h-8 sm:h-9 text-xs font-medium bg-foreground text-background shadow-xs hover:bg-primary/90 sm:text-sm" 
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
          {content?.registerButton || "Register"}
        </span>
      ) : content?.registerButton || "Sign Up"}
    </Button>
  )
}

// Social login section component
function SocialLoginSection({ content }: { content: typeof en.register }) {
  return (
    <>
      <div className="relative text-center text-xs sm:text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
        <span className="relative z-10 bg-card px-2 text-muted-foreground">
          {content?.orContinueWith || "Or continue with"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <SocialButton 
          provider="apple" 
          className="h-8 sm:h-9 text-xs sm:text-sm"
        />
        <SocialButton 
          provider="google" 
          className="h-8 sm:h-9 text-xs sm:text-sm"
        />
      </div>
    </>
  )
}

// Login prompt component
function LoginPrompt({ content }: { content: typeof en.register }) {
  return (
    <div className="text-center text-xs sm:text-sm font-medium">
      {content?.haveAccount || "Already have an account?"}{" "}
      <Link href="/login" className="text-foreground underline underline-offset-2 hover:text-primary/80 transition-colors">
        {content?.signIn || "Sign in"}
      </Link>
    </div>
  )
}

// Terms and conditions component
function RegisterTerms({ content }: { content: typeof en.register }) {
  return (
    <div className="text-balance text-center text-[10px] sm:text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary">
      {content?.termsText || "By registering, you agree to our"}{" "}
      <a href="#">{content?.termsLink || "Terms of Service"}</a>{" "}
      {content?.andText || "and"}{" "}
      <a href="#">{content?.privacyLink || "Privacy Policy"}</a>.
    </div>
  )
} 