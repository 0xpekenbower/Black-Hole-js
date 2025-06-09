'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { applyThemeColors } from '@/utils/themeUtils'
import { darkTheme, lightTheme } from '@/theme/theme'
import { ThemeData } from '@/types/theme'

type ThemeName = 'light' | 'dark'

interface ThemeContextType {
  theme: ThemeName
  themeData: ThemeData
  setTheme: (theme: ThemeName) => void
  toggleTheme: () => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  themeData: lightTheme,
  setTheme: () => {},
  toggleTheme: () => {},
  mounted: false
})

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<ThemeName>('light')
  const [themeData, setThemeData] = useState<ThemeData>(lightTheme)  
  useEffect(() => {
    setMounted(true)    
    try {
      const storedTheme = localStorage.getItem('theme') as ThemeName | null
      if (storedTheme === 'dark' || storedTheme === 'light') {
        setTheme(storedTheme)
        setThemeData(storedTheme === 'dark' ? darkTheme : lightTheme)
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark')
        setThemeData(darkTheme)
      }
    } catch (e) {
      console.error('Error accessing localStorage:', e)
    }
  }, [])
  useEffect(() => {
    if (!mounted) return
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.style.colorScheme = 'dark'
      setThemeData(darkTheme)
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.style.colorScheme = 'light'
      setThemeData(lightTheme)
    }
    try {
      localStorage.setItem('theme', theme)
    } catch (e) {
      console.error('Error writing to localStorage:', e)
    }
  }, [theme, mounted])
  useEffect(() => {
    if (!mounted) return
    applyThemeColors(themeData)
  }, [themeData, mounted])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }
  const contextValue = {
    theme,
    themeData,
    setTheme,
    toggleTheme,
    mounted
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext) 