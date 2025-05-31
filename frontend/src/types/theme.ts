
interface ColorVariants {
  1: string
  2: string
  3: string
}

export interface ThemeData {
  dark: boolean
  // Base colors
  frontground: string
  background: string
  
  // Main color variants
  primary: ColorVariants
  back: ColorVariants
  border: ColorVariants
  success: ColorVariants
  error: ColorVariants
  warning: ColorVariants
  
  // UI component colors
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  input: string
  ring: string
  
  // Sidebar specific
  sidebar: string
  sidebarForeground: string
  sidebarPrimary: string
  sidebarPrimaryForeground: string
  sidebarAccent: string
  sidebarAccentForeground: string
  sidebarBorder: string
  sidebarRing: string
  
  // Chart colors
  chart1: string
  chart2: string
  chart3: string
  chart4: string
  chart5: string
}
