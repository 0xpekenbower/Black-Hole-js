'use client'

import React from 'react'
import { Coins } from 'lucide-react'
import { useLang } from '@/context/langContext'
import { cn } from '@/utils'
import en from '@/i18n/en'
import fr from '@/i18n/fr'

interface WalletProps {
  budget?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Wallet({ budget = 0, className, size = 'md' }: WalletProps) {
  const { lang } = useLang()
  const t = lang === 'en' ? en.store : fr.store
  
  const sizeClasses = {
    sm: 'text-xs py-1 px-2 gap-1',
    md: 'text-sm py-1.5 px-3 gap-1.5',
    lg: 'text-base py-2 px-4 gap-2'
  }
  
  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  }

  return (
    <div 
      className={cn(
        'flex items-center bg-secondary/30 rounded-full font-medium text-secondary-foreground', 
        sizeClasses[size],
        className
      )}
    >
      <Coins size={iconSizes[size]} className="text-yellow-500" />
      <span>{(budget || 0).toLocaleString()} {t.coins}</span>
    </div>
  )
}

export default Wallet 