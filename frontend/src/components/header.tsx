'use client'

import React, { useEffect, useState } from 'react'
import { useLang } from '@/context/langContext'
import ThemeToggle from './theme-toggle'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/themeContext'
import Link from 'next/link'
import Image from 'next/image'

const Header = () => {
  const { lang, setLang } = useLang()
  const { themeData } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Toggle language between 'en' and 'fr'
  const toggleLang = () => {
    setLang(lang === 'en' ? 'fr' : 'en')
  }

  return (
    <header className="fixed top-0 left-0 right-0 flex justify-between items-center p-4 border-b border-border-1 bg-card text-frontground z-50">
      <div className="flex items-center gap-4">
        <Link href="/" className="hover:text-primary-1 transition-colors flex items-center gap-2">
          <Image 
            src="/blackHole.svg" 
            alt="BlackHole.Js Logo" 
            width={24} 
            height={24} 
            className="dark:invert"
          />
          <h1 className="text-xl font-bold">BlackHole.Js</h1>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        
        {mounted && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLang}
            aria-label="Switch language"
            className="w-9 px-0"
          >
            {lang === 'en' ? 'FR' : 'EN'}
          </Button>
        )}
        {!mounted && (
          <Button
            variant="outline"
            size="sm"
            aria-label="Switch language"
            className="w-9 px-0"
          >
            {/* Static placeholder for SSR */}
            EN
          </Button>
        )}
      </div>
    </header>
  )
}

export default Header
