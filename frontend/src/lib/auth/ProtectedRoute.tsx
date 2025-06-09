'use client';

/**
 * Protected route middleware for authenticated routes
 * @module lib/auth/ProtectedRoute
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Protected route props
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackUrl?: string;
}

/**
 * Protected route component that redirects unauthenticated users
 * @param props - Component props
 * @returns Protected route component
 */
export function ProtectedRoute({ 
  children, 
  fallbackUrl = '/login' 
}: ProtectedRouteProps): React.ReactNode {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', pathname);
      }
      router.replace(fallbackUrl);
    }
  }, [isAuthenticated, isLoading, router, fallbackUrl, pathname]);

  if (isLoading || !isAuthenticated) {
    return null;
  }
  return children;
}

/**
 * Public route props
 */
interface PublicRouteProps {
  children: React.ReactNode;
  redirectAuthenticatedTo?: string;
}

/**
 * Public route component that redirects authenticated users
 * @param props - Component props
 * @returns Public route component
 */
export function PublicRoute({
  children,
  redirectAuthenticatedTo = '/dashboard'
}: PublicRouteProps): React.ReactNode {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      if (typeof window !== 'undefined') {
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
          router.replace(redirectPath);
        } else {
          router.replace(redirectAuthenticatedTo);
        }
      } else {
        router.replace(redirectAuthenticatedTo);
      }
    }
  }, [isAuthenticated, isLoading, router, redirectAuthenticatedTo]);

  if (isLoading || isAuthenticated) {
    return null;
  }

  return children;
} 