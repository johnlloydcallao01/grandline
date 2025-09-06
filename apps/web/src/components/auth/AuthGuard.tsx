'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useLoading } from '@/components/loading';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * ENHANCED Authentication Guard with Real-Time Security Monitoring
 *
 * Shows content immediately and handles authentication in background.
 * Now includes real-time security alerts and instant logout on role changes.
 * Integrates with Facebook Meta-style loading screen for smooth UX.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, isAuthenticated, error, securityAlert } = useAuth();
  const { hideLoadingScreen, setProgress } = useLoading();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  // 🚨 CRITICAL SECURITY: Handle security alerts immediately
  useEffect(() => {
    if (securityAlert?.show) {
      console.log('🚨 AUTHGUARD: Security alert detected:', securityAlert.type);
      console.log('🚨 AUTHGUARD: Alert message:', securityAlert.message);

      // Show alert to user
      alert(`SECURITY ALERT: ${securityAlert.message}`);

      // IMMEDIATE LOGOUT: Clear all cookies and force page reload
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Force page reload to clear all cached state and redirect to signin
      console.log('🚨 AUTHGUARD: Forcing page reload to clear cached state...');
      window.location.href = '/signin';

      return;
    }
  }, [securityAlert]);

  // Loading screen integration with authentication flow
  useEffect(() => {
    if (loading) {
      // Authentication is in progress, update loading progress
      console.log('🔄 AUTHGUARD: Authentication in progress, updating loading progress');
      setProgress(70); // Show progress during auth check
    } else if (isAuthenticated && user) {
      // Authentication successful, hide loading screen
      console.log('✅ AUTHGUARD: Authentication successful, hiding loading screen');
      setProgress(100);
      hideLoadingScreen();
    } else if (!isAuthenticated && !user && !hasRedirected) {
      // Authentication failed, redirect to signin
      console.log('🔒 AUTHGUARD: No authentication found, redirecting to signin');
      setProgress(100);
      hideLoadingScreen();
      setHasRedirected(true);

      // Small delay to prevent race conditions
      setTimeout(() => {
        router.push('/signin');
      }, 100);
    }
  }, [loading, isAuthenticated, user, hasRedirected, router, setProgress, hideLoadingScreen]);

  // ALWAYS show content - no black screens!
  // If user is not authenticated, they'll be redirected anyway
  return <>{children}</>;
}
