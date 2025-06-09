'use client';

/**
 * Navigation context for tracking navigation between protected pages
 * @module context/NavigationContext
 */

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Navigation context state
 */
interface NavigationContextState {
  allowedPaths: Record<string, boolean>;
  allowNavigation: (path: string) => void;
  isNavigationAllowed: (path: string) => boolean;
  clearAllowedPaths: () => void;
}

/**
 * Navigation context provider props
 */
interface NavigationProviderProps {
  children: ReactNode;
}

const NavigationContext = createContext<NavigationContextState | undefined>(undefined);

/**
 * Navigation context provider component
 */
export function NavigationProvider({ children }: NavigationProviderProps): React.ReactElement {
  const [allowedPaths, setAllowedPaths] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname === '/reset-password') {
      const email = searchParams.get('email');
      const code = searchParams.get('code');
      
      if (email && code) {
        setAllowedPaths((prev) => ({
          ...prev,
          [`/reset-password?email=${encodeURIComponent(email)}&code=${code}`]: true,
        }));
      }
    }
  }, [pathname, searchParams]);

  /**
   * Allow navigation to a specific path
   */
  const allowNavigation = (path: string): void => {
    setAllowedPaths((prev) => ({
      ...prev,
      [path]: true,
    }));
  };

  /**
   * Check if navigation to a path is allowed
   * TODO: need fix to match email link (l3ars time)
   */
  const isNavigationAllowed = (path: string): boolean => {
    if (path.startsWith('/reset-password?')) {
      const url = new URL(path, 'http://localhost');
      const email = url.searchParams.get('email');
      const code = url.searchParams.get('code');
      
      if (email && code) {
        return true;
      }
    }
    
    return !!allowedPaths[path];
  };

  /**
   * Clear all allowed paths
   */
  const clearAllowedPaths = (): void => {
    setAllowedPaths({});
  };

  const value: NavigationContextState = {
    allowedPaths,
    allowNavigation,
    isNavigationAllowed,
    clearAllowedPaths,
  };

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

/**
 * Hook to use the navigation context
 * @returns Navigation context state
 * @throws Error if used outside of NavigationProvider
 */
export function useNavigation(): NavigationContextState {
  const context = useContext(NavigationContext);
  
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  
  return context;
} 