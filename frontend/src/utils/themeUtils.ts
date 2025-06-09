import { ThemeData } from '@/types/theme';

/**
 * Applies theme colors to CSS variables
 * @param themeData The theme data object
 */
export const applyThemeColors = (themeData: ThemeData): void => {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  root.style.setProperty('--frontground', themeData.frontground);
  root.style.setProperty('--background', themeData.background);
  
  Object.entries(themeData.primary).forEach(([key, value]) => {
    root.style.setProperty(`--primary-${key}`, value);
  });
  
  Object.entries(themeData.back).forEach(([key, value]) => {
    root.style.setProperty(`--back-${key}`, value);
  });
  
  Object.entries(themeData.border).forEach(([key, value]) => {
    root.style.setProperty(`--border-${key}`, value);
  });
  
  Object.entries(themeData.success).forEach(([key, value]) => {
    root.style.setProperty(`--success-${key}`, value);
  });
  
  Object.entries(themeData.error).forEach(([key, value]) => {
    root.style.setProperty(`--error-${key}`, value);
  });
  
  Object.entries(themeData.warning).forEach(([key, value]) => {
    root.style.setProperty(`--warning-${key}`, value);
  });
  
  root.style.setProperty('--card', themeData.card);
  root.style.setProperty('--card-foreground', themeData.cardForeground);
  root.style.setProperty('--popover', themeData.popover);
  root.style.setProperty('--popover-foreground', themeData.popoverForeground);
  root.style.setProperty('--primary', themeData.primary[1]);
  root.style.setProperty('--primary-foreground', themeData.primaryForeground);
  root.style.setProperty('--secondary', themeData.secondary);
  root.style.setProperty('--secondary-foreground', themeData.secondaryForeground);
  root.style.setProperty('--muted', themeData.muted);
  root.style.setProperty('--muted-foreground', themeData.mutedForeground);
  root.style.setProperty('--accent', themeData.accent);
  root.style.setProperty('--accent-foreground', themeData.accentForeground);
  root.style.setProperty('--destructive', themeData.destructive);
  root.style.setProperty('--input', themeData.input);
  root.style.setProperty('--ring', themeData.ring);
  
  root.style.setProperty('--sidebar', themeData.sidebar);
  root.style.setProperty('--sidebar-foreground', themeData.sidebarForeground);
  root.style.setProperty('--sidebar-primary', themeData.sidebarPrimary);
  root.style.setProperty('--sidebar-primary-foreground', themeData.sidebarPrimaryForeground);
  root.style.setProperty('--sidebar-accent', themeData.sidebarAccent);
  root.style.setProperty('--sidebar-accent-foreground', themeData.sidebarAccentForeground);
  root.style.setProperty('--sidebar-border', themeData.sidebarBorder);
  root.style.setProperty('--sidebar-ring', themeData.sidebarRing);
  
  root.style.setProperty('--chart-1', themeData.chart1);
  root.style.setProperty('--chart-2', themeData.chart2);
  root.style.setProperty('--chart-3', themeData.chart3);
  root.style.setProperty('--chart-4', themeData.chart4);
  root.style.setProperty('--chart-5', themeData.chart5);
}; 