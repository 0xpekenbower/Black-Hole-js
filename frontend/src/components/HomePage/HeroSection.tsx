'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ScrollIndicator } from '@/components/ui/scroll-indicator'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface HeroSectionProps {
  content: {
    title: string
    description: string
    getStarted: string
    dashboard: string
  }
  headerHeight: number
}

/**
 * Hero section component for the homepage
 */
export function HeroSection({ content, headerHeight }: HeroSectionProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

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
    <section 
      className="flex flex-col items-center justify-center w-full min-h-screen"
      style={{ paddingTop: headerHeight }}
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
      
      <div className="mt-16">
        <ScrollIndicator targetId="about" />
      </div>
    </section>
  )
} 