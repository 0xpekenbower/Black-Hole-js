'use client'

import { useEffect } from 'react'
import { darkTheme, lightTheme } from '@/theme/theme'
import { applyThemeColors } from '@/utils/themeUtils'

export function ThemeScript() {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      applyThemeColors(darkTheme)
    } else {
      document.documentElement.classList.remove('dark')
      applyThemeColors(lightTheme)
    }
  }, [])

  return (
    <script
      id="theme-script"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var isDarkMode = false;
              try {
                isDarkMode = localStorage.getItem('theme') === 'dark' || 
                  (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
              } catch (storageErr) {
                isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
              }
              
              if (isDarkMode) {
                document.documentElement.classList.add('dark');
                document.documentElement.style.colorScheme = 'dark';
              } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.style.colorScheme = 'light';
              }

              // Basic theme colors for initial load
              // Full theme will be applied by React after hydration
              var root = document.documentElement;
              if (isDarkMode) {
                root.style.setProperty('--background', '#111');
                root.style.setProperty('--frontground', '#eee');
              } else {
                root.style.setProperty('--background', '#fff');
                root.style.setProperty('--frontground', '#111');
              }
            } catch (e) {
              console.error('Theme initialization failed:', e);
            }
          })();
        `,
      }}
    />
  )
}

export default ThemeScript 