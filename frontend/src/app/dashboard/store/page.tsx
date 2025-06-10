'use client'

import React from 'react'
import Store from '@/components/dashboard/store'
import { useLang } from '@/context/langContext'
import en from '@/i18n/en'
import fr from '@/i18n/fr'

export default function StorePage() {
  const { lang } = useLang()
  const t = lang === 'en' ? en.store : fr.store
  
  return (
    <div className="container mx-auto p-4">
      <Store />
    </div>
  )
} 