'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { cn } from "@/utils"

type SocialProvider = '42' | 'google' 

interface SocialButtonProps {
  provider: SocialProvider
  onClick?: () => void
  className?: string
}

const providerIcons = {
  42: (
    <svg className="h-3 w-3 sm:h-4 sm:w-4" 
    viewBox="0 -200 960 960" 
    xmlns="http://www.w3.org/2000/svg" 
    xmlnsXlink="http://www.w3.org/1999/xlink" 
    x="0px" y="0px" 
    enableBackground="new 0 -200 960 960" 
    xmlSpace="preserve" 
    aria-hidden="true"
    fill="currentColor"
    >
    <polygon id="polygon5" points="32,412.6 362.1,412.6 362.1,578 526.8,578 526.8,279.1 197.3,279.1 526.8,-51.1 362.1,-51.1 32,279.1 "/>
    <polygon id="polygon7" points="597.9,114.2 762.7,-51.1 597.9,-51.1 "/>
    <polygon id="polygon9" points="762.7,114.2 597.9,279.1 597.9,443.9 762.7,443.9 762.7,279.1 928,114.2 928,-51.1 762.7,-51.1 "/>
    <polygon id="polygon11" points="928,279.1 762.7,443.9 928,443.9 "/>
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

const providerLabels = {
  42: "Sign in with Intra",
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