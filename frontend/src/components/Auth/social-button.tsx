'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { cn } from "@/utils"

type SocialProvider = 'apple' | 'google' 

interface SocialButtonProps {
  provider: SocialProvider
  onClick?: () => void
  className?: string
}

const providerIcons = {
  apple: (
    <svg
      className="h-3 w-3 sm:h-4 sm:w-4"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09z" />
    </svg>
  ),
  google: (
    <svg
      className="h-3 w-3 sm:h-4 sm:w-4"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  )
}

// Provider labels for accessibility
const providerLabels = {
  apple: "Sign in with Apple",
  google: "Sign in with Google"
}

export function SocialButton({ provider, onClick, className }: SocialButtonProps) {
  return (
    <Button
      variant="outline"
      type="button"
      onClick={onClick}
      className={cn("w-full flex items-center justify-center", className)}
      aria-label={providerLabels[provider]}
    >
      {providerIcons[provider]}
    </Button>
  )
} 