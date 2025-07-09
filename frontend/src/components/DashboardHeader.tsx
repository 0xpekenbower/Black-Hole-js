'use client'

import React, { useState, useEffect } from 'react'
import { useLang } from '@/context/langContext'
import { ThemeToggle } from '@/components/layouts/theme-toggle'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useWallet } from '@/context/walletContext'
import Wallet from '@/components/ui/wallet'
import { NotificationBell } from '@/components/dashboard/NotificationBell'

/**
 * Small header component for dashboard layout
 * @returns Header component
 */
const DashboardHeader = () => {
  const { lang, setLang, mounted: langMounted } = useLang()
  const { budget, isLoading: walletLoading } = useWallet()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleLang = () => {
    setLang(lang === 'en' ? 'fr' : 'en')
  }

  if (!mounted || !langMounted) {
    return (
      <div className="w-full">
        <header className="border-b border-border-1 bg-card/80 backdrop-blur-sm h-12 px-4">
          <div className="flex items-center justify-between h-full">
          </div>
        </header>
      </div>
    )
  }

  return (
    <div className="w-full">
      <header className="border-b border-border-1 bg-card/80 backdrop-blur-sm h-12 px-4">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            {mounted && <Wallet budget={budget} size="sm" />}
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ThemeToggle className="h-8 w-8 rounded-full" />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Toggle Theme</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleLang}
                    className="h-8 w-8 rounded-full"
                  >
                    <span className="font-medium text-xs">{lang === 'en' ? 'FR' : 'EN'}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Switch Language</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>
    </div>
  )
}

export default DashboardHeader 