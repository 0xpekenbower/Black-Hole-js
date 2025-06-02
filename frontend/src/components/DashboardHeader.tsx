'use client'

import React, { useEffect, useState } from 'react'
import { useLang } from '@/context/langContext'
import ThemeToggle from './theme-toggle'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/themeContext'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

const DashboardHeader = () => {
  const { lang, setLang } = useLang()
  const { themeData } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Toggle language between 'en' and 'fr'
  const toggleLang = () => {
    setLang(lang === 'en' ? 'fr' : 'en')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality here
    console.log('Search query:', searchQuery)
  }

  // Navigation tabs for dashboard
  const navTabs = [
    { name: 'Home', href: '/dashboard' },
    { name: 'Game', href: '/dashboard/game' },
    { name: 'Chat', href: '/dashboard/chat' },
    { name: 'Friends', href: '/dashboard/friends' },
    { name: 'Leaderboard', href: '/dashboard/leaderboard' },
    { name: 'History', href: '/dashboard/history' },
    { name: 'Settings', href: '/dashboard/settings' },
  ]

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <header className="flex items-center p-4 border-b border-border-1 bg-card text-frontground">
        {/* Left section - Logo */}
        <div className="flex flex-col w-1/4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-primary-1 transition-colors flex items-center gap-2">
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
          
          {/* Tabs Section - Below logo */}
          <nav className="mt-4">
            <ul className="flex space-x-4 text-sm">
              {navTabs.map((tab) => (
                <li key={tab.name}>
                  <Link 
                    href={tab.href} 
                    className="hover:text-primary-1 transition-colors px-1 py-0.5 rounded-md hover:bg-accent"
                  >
                    {tab.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Center section - Search bar */}
        <div className="flex-1 flex justify-center">
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </form>
        </div>

        {/* Right section - Theme toggle and language switch */}
        <div className="flex items-center gap-3 mt-2 w-1/4 justify-end">
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
    </div>
  )
}

export default DashboardHeader 