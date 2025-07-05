'use client'

import { LoginForm } from '@/components/Auth/login'
import { useAuth } from '@/hooks/useAuth'

/**
 * Login page component
 * @returns Login page UI
 */
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/lib/api/AuthService';

export default function LoginPage() {
  const { login, loginWithToken, isLoading, error } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExchanging, setIsExchanging] = useState(false);

  useEffect(() => {
    // Handle OAuth code from either Google or 42
    const code = searchParams.get('code');
    const token = searchParams.get('token');
    
    // If we have a token directly (from 42 redirect), use it
    if (token) {
      loginWithToken(token);
      return;
    }
    
    // If we have a code, exchange it for a token
    if (code) {
      setIsExchanging(true);
      
      // Check if the URL path or referrer contains clues about the provider
      const currentUrl = window.location.href;
      const referrer = document.referrer || '';
      
      // For 42 OAuth, the backend redirects to /login with a token parameter
      // For Google OAuth, we need to exchange the code for a token
      if (currentUrl.includes('google') || referrer.includes('google')) {
        // Google OAuth flow
        const authService = new AuthService();
        authService.googleOAuthLogin(code)
          .then((data) => {
            if (data.token) {
              loginWithToken(data.token);
            } else {
              throw new Error(data.error || 'Authentication failed');
            }
          })
          .catch((err) => {
            console.error('Google OAuth error:', err);
            router.replace('/login?error=oauth_failed');
            setIsExchanging(false);
          });
      } else {
        // 42 OAuth flow - redirect to the backend endpoint with the code
        // The backend will exchange the code and redirect back with a token
        window.location.href = `/api/auth/oauth/42/?code=${code}`;
      }
    }
  }, [searchParams, router, loginWithToken]);

  const handleLogin = async (username: string, password: string) => {
    await login({
      username,
      password
    });
  };

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      {isExchanging ? (
        <div className="text-lg text-muted-foreground">Logging you in...</div>
      ) : (
        <LoginForm 
          handleLogin={handleLogin} 
          isLoading={isLoading}
          error={error}
        />
      )}
    </div>
  );
}