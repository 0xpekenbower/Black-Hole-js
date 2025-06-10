'use client'

import { useEffect, useState } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  User, 
  Save,
  Loader2,
  KeyRound,
  Smartphone
} from "lucide-react"
import { useSettings } from '@/hooks/useSettings'
import { 
  PersonalInfoProps, 
  PasswordProps, 
  OTPProps,
  PersonalInfoFormValues,
  PasswordFormValues,
  personalInfoSchema,
  passwordSchema
} from '@/types/Dashboard'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

function PersonalInfoForm({ initialData, onSubmit, isLoading, error }: PersonalInfoProps) {
  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      first_name: initialData.first_name,
      last_name: initialData.last_name,
      username: initialData.username,
      email: initialData.email || ''
    }
  })

  const handleSubmit = async (data: PersonalInfoFormValues) => {
    await onSubmit({
      first_name: data.first_name,
      last_name: data.last_name
    });
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Update your personal details
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {error && (
          <div className="bg-destructive/10 border border-destructive rounded-xl p-4 text-destructive mb-4">
            {error}
          </div>
        )}
        <Form {...form}>
          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input className="text-white selection:bg-foreground" placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input className="text-white selection:bg-foreground" placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input 
                      className="text-white selection:bg-foreground bg-muted/40" 
                      placeholder="username" 
                      {...field} 
                      disabled 
                      readOnly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      className="text-white selection:bg-foreground bg-muted/40" 
                      placeholder="email@example.com" 
                      {...field} 
                      disabled 
                      readOnly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="mt-auto bg-card text-white">
        <Button 
          onClick={form.handleSubmit(handleSubmit)}
          disabled={isLoading}
          className="flex items-center gap-2 ml-auto bg-card text-white"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Profile
        </Button>
      </CardFooter>
    </Card>
  )
}

function PasswordChangeForm({ onSubmit, isLoading, error }: PasswordProps) {
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      old_pass: "",
      new_pass: "",
      re_pass: ""
    }
  })

  const handleSubmit = async (data: PasswordFormValues) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          Change Password
        </CardTitle>
        <CardDescription>
          Update your password to keep your account secure
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {error && (
          <div className="bg-destructive/10 border border-destructive rounded-xl p-4 text-destructive mb-4">
            {error}
          </div>
        )}
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="old_pass"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" className="text-white selection:bg-foreground" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="new_pass"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" className="text-white selection:bg-foreground" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="re_pass"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" className="text-white selection:bg-foreground" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button 
          onClick={form.handleSubmit(handleSubmit)}
          disabled={isLoading}
          className="flex items-center gap-2 ml-auto bg-card text-white"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Update Password
        </Button>
      </CardFooter>
    </Card>
  )
}

function OTPSetupForm({ initialData, onToggle, isLoading, error }: OTPProps) {
  const [isActive, setIsActive] = useState(initialData.is_otp_active)
  
  const handleToggleOTP = async () => {
    try {
      await onToggle(!isActive);
      setIsActive(!isActive);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-primary" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {error && (
          <div className="bg-destructive/10 border border-destructive rounded-xl p-4 text-destructive mb-4">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="otp-toggle" className="font-medium">Enable 2FA</Label>
              <p className="text-sm text-muted-foreground">
                Protect your account with two-factor authentication
              </p>
            </div>
            <Checkbox 
              id="otp-toggle" 
              checked={isActive} 
              onCheckedChange={handleToggleOTP}
              disabled={isLoading}
            />
          </div>
          
          {isActive && (
            <div className="p-4 bg-muted/50 rounded-md text-sm">
              <p className="font-medium mb-2">Two-factor authentication is enabled</p>
              <p className="text-muted-foreground">
                You will be required to enter a verification code when signing in.
              </p>
            </div>
          )}
        </div>
      </CardContent>
      {isActive && (
        <CardFooter className="mt-auto">
          <Button 
            className="flex items-center gap-2 ml-auto"
          >
            <KeyRound className="h-4 w-4" />
            Manage 2FA Settings
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

export function SettingsComponent() {
  const { 
    userData, 
    isLoading, 
    error, 
    updateProfile, 
    changePassword, 
    toggleOTP, 
    fetchUserData 
  } = useSettings();
  
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (isLoading && !userData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="bg-destructive/10 border border-destructive rounded-xl p-4 text-destructive">
        {error || 'Failed to load user data'}
      </div>
    )
  }

  return (
    <div className="container mt-8 mx-auto w-full h-full">
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PersonalInfoForm 
            initialData={userData}
            onSubmit={updateProfile}
            isLoading={isLoading}
            error={error}
          />

          {!userData.is_oauth && (
            <PasswordChangeForm 
              onSubmit={async (data) => {
                try {
                  await changePassword({
                    oldPassword: data.old_pass,
                    newPassword: data.new_pass
                  });                  
                  await logout();
                  router.push('/login');
                } catch (err) {
                  console.log(err);
                }
              }}
              isLoading={isLoading}
              error={error}
            />
          )}
          
          {userData.is_oauth && (
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-primary" />
                  Password
                </CardTitle>
                <CardDescription>
                  Password management is handled by your OAuth provider
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="p-4 bg-muted/50 rounded-md text-sm text-muted-foreground">
                  Your account uses OAuth authentication. Password changes must be made through your provider.
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OTPSetupForm 
            initialData={{
              is_otp_active: userData.is_otp_active,
              is_otp_verified: userData.is_otp_verified
            }}
            onToggle={toggleOTP}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  )
}
