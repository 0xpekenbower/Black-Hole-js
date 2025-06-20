'use client'

import { useLang } from '@/context/langContext'
import en from '@/i18n/en/home'
import fr from '@/i18n/fr/home'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollIndicator } from '@/components/ui/scroll-indicator'
import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    navigateToSectionById?: (id: string) => void;
  }
}

export default function HomePage() {
  const { lang } = useLang()
  const content = lang === 'fr' ? fr : en
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const header = document.querySelector('header')
    if (header) {
      header.offsetHeight;
    }
  }, [])

  const navigateToSection = (index: number) => {
    const sections = document.querySelectorAll('section, footer')
    if (index >= 0 && index < sections.length) {
      const targetSection = sections[index] as HTMLElement
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  useEffect(() => {
    window.navigateToSectionById = (id: string) => {
      const sections = document.querySelectorAll('section, footer')
      const index = Array.from(sections).findIndex(section => section.id === id)
      if (index !== -1) {
        navigateToSection(index)
      }
    }
    
    return () => {
      delete window.navigateToSectionById
    }
  }, [])

  const navigateToAuth = () => {
    router.push("/login")
  }

  const navigateToDashboard = () => {
    router.push("/dashboard") 
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  }


  return (
    <main ref={mainRef} className="flex flex-col items-center min-h-screen scroll-smooth overflow-hidden">
      <section 
        id="hero"
        className="flex flex-col items-center justify-center w-full min-h-screen relative snap-start pt-16"
      >
        <div className="max-w-3xl w-full text-center space-y-8 px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{content.title}</h1>
            <p className="text-xl text-muted-foreground mt-4">{content.description}</p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {!isLoading && (
              <>
                {!isAuthenticated ? (
                  <Button size="lg" className="bg-foreground text-background" onClick={navigateToAuth}>
                    {content.getStarted}
                  </Button>
                ) : (
                  <Button size="lg" className="bg-foreground text-background" onClick={navigateToDashboard}>
                    {content.dashboard}
                  </Button>
                )}
              </>
            )}
          </motion.div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <ScrollIndicator targetId="about" sectionTitle={content.about.title} />
        </div>
      </section>

      <section 
        id="about" 
        className="w-full min-h-screen relative snap-start pt-16"
      >
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <ScrollIndicator targetId="api" sectionTitle={content.api.title} />
        </div>
      </section>

      <section 
        id="api" 
        className="w-full min-h-screen relative snap-start pt-16"
      >
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <ScrollIndicator targetId="infrastructure" sectionTitle={content.infrastructure.title} />
        </div>
      </section>

      <section 
        id="infrastructure" 
        className="w-full min-h-screen relative snap-start pt-16"
      >
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <ScrollIndicator targetId="resources" sectionTitle={content.documentation.title} />
        </div>
      </section>
      <section 
        id="resources" 
        className="w-full min-h-screen relative snap-start pt-16"
      >
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <ScrollIndicator targetId="footer" sectionTitle="Contact" />
        </div>
      </section>

      <footer 
        id="footer" 
        className="w-full min-h-screen relative snap-start pt-16"
      >
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <ScrollIndicator targetId="hero" className="text-white" fast={true} direction="up" sectionTitle={content.title} />
        </div>
      </footer>
    </main>
  )
}