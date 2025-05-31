'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
export type Lang = 'en' | 'fr'

interface LangContextType {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
})

interface LangProviderSSRProps {
  children: React.ReactNode
  initialLang: Lang
}
/**
 * @name LangProviderSSR
 * @description Provides language context and persists selected language using localStorage.
 * @param {React.ReactNode} param0.children - Child components
 * @param {'en' | 'fr'} param0.initialLang - Initial language from server
 * @returns {JSX.Element} Language context provider wrapping children
 * @author 0xpekenbower
 */
export const LangProviderSSR = ({ children, initialLang }: LangProviderSSRProps) => {
  const [lang, setLang] = useState<Lang>(initialLang)
  const [mounted, setMounted] = useState(false)

  // Initialize language from localStorage only once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lang') as Lang | null
      if (stored) {
        setLang(stored)
      } else {
        localStorage.setItem('lang', initialLang)
      }
    } catch (e) {
      console.error('Error accessing localStorage:', e)
    } finally {
      setMounted(true)
    }
  }, [initialLang]) // Remove lang from dependencies

  // Update localStorage when language changes
  useEffect(() => {
    if (!mounted) return
    
    try {
      localStorage.setItem('lang', lang)
    } catch (e) {
      console.error('Error writing to localStorage:', e)
    }
  }, [lang, mounted])

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
