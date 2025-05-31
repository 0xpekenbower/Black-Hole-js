import { ThemeData } from '@/types/theme'

export const darkTheme: ThemeData = {
  dark: true,
  // Base colors
  frontground: '#eee',
  background: '#111',
  
  // Main color variants
  primary: {
    1: '#0284c7',
    2: '#075985',
    3: '#0c4a6e',
  },
  back: {
    1: '#404040',
    2: '#262626',
    3: '#171717',
  },
  border: {
    1: '#404040',
    2: '#262626',
    3: '#171717',
  },
  success: {
    1: '#10b981',
    2: '#047857',
    3: '#064e3b',
  },
  error: {
    1: '#ef4444',
    2: '#b91c1c',
    3: '#7f1d1d',
  },
  warning: {
    1: '#f59e0b',
    2: '#b45309',
    3: '#78350f',
  },
  
  // UI component colors
  card: '#262626',
  cardForeground: '#eee',
  popover: '#262626',
  popoverForeground: '#eee',
  primaryForeground: '#0284c7',
  secondary: '#262626',
  secondaryForeground: '#eee',
  muted: '#262626',
  mutedForeground: '#eee',
  accent: '#262626',
  accentForeground: '#eee',
  destructive: '#ef4444',
  input: '#404040',
  ring: '#0284c7',
  
  // Sidebar specific
  sidebar: '#262626',
  sidebarForeground: '#eee',
  sidebarPrimary: '#0284c7',
  sidebarPrimaryForeground: '#0284c7',
  sidebarAccent: '#262626',
  sidebarAccentForeground: '#eee',
  sidebarBorder: '#262626',
  sidebarRing: '#0284c7',
  
  // Chart colors
  chart1: '#0284c7',
  chart2: '#0284c7',
  chart3: '#0284c7',
  chart4: '#0284c7',
  chart5: '#0284c7',
}

export const lightTheme: ThemeData = {
  dark: false,
  // Base colors
  frontground: '#111',
  background: '#fff',
  
  // Main color variants
  primary: {
    1: '#0284c7',
    2: '#0284c7',
    3: '#0284c7',
  },
  back: {
    1: '#ffffff',
    2: '#fefefe',
    3: '#fcfcfc',
  },
  border: {
    1: '#d4d4d4',
    2: '#a3a3a3',
    3: '#a3a3a3',
  },
  success: {
    1: '#059669',
    2: '#059669',
    3: '#059669',
  },
  error: {
    1: '#dc2626',
    2: '#dc2626',
    3: '#dc2626',
  },
  warning: {
    1: '#d97706',
    2: '#d97706',
    3: '#d97706',
  },
  
  // UI component colors
  card: '#fff',
  cardForeground: '#111',
  popover: '#fff',
  popoverForeground: '#111',
  primaryForeground: '#0284c7',
  secondary: '#fff',
  secondaryForeground: '#111',
  muted: '#fff',
  mutedForeground: '#111',
  accent: '#fff',
  accentForeground: '#111',
  destructive: '#dc2626',
  input: '#d4d4d4',
  ring: '#0284c7',
  
  // Sidebar specific
  sidebar: '#fff',
  sidebarForeground: '#111',
  sidebarPrimary: '#0284c7',
  sidebarPrimaryForeground: '#0284c7',
  sidebarAccent: '#fff',
  sidebarAccentForeground: '#111',
  sidebarBorder: '#a3a3a3',
  sidebarRing: '#0284c7',
  
  // Chart colors
  chart1: '#0284c7',
  chart2: '#0284c7',
  chart3: '#0284c7',
  chart4: '#0284c7',
  chart5: '#0284c7',
}