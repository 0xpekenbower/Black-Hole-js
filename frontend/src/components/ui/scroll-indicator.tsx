/**
 * A scroll indicator component with animation
 */
'use client'

import { motion } from 'framer-motion'
import { cn } from '@/utils'

interface ScrollIndicatorProps {
  targetId: string
  className?: string
  fast?: boolean
  direction?: 'down' | 'up'
  sectionTitle?: string
}

export function ScrollIndicator({ 
  targetId, 
  className, 
  fast = false, 
  direction = 'down',
  sectionTitle
}: ScrollIndicatorProps) {
  const scrollToSection = () => {
    // Use the global navigation function if available, otherwise fallback to direct scrolling
    if (window.navigateToSectionById) {
      window.navigateToSectionById(targetId)
    } else {
      const element = document.getElementById(targetId)
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
        
        // For fast scrolling to top (optional implementation)
        if (fast && targetId === 'hero') {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          })
        }
      }
    }
  }

  return (
    <motion.div 
      className={cn("flex flex-col items-center cursor-pointer z-10", className)}
      onClick={scrollToSection}
      initial={{ opacity: 0, y: -10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.5 }
      }}
      whileHover={{ scale: 1.1 }}
    >
      <span className="text-sm mb-2 opacity-80">{sectionTitle || (direction === 'up' ? 'Back to top' : 'Next')}</span>
      <motion.div
        animate={{ 
          y: [0, 8, 0],
        }}
        transition={{ 
          duration: fast ? 0.8 : 1.5,
          repeat: Infinity,
          repeatType: "loop"
        }}
        className={direction === 'up' ? 'rotate-180' : ''}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          suppressHydrationWarning
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </motion.div>
    </motion.div>
  )
} 