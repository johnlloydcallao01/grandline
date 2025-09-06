'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * ENHANCED Authentication Guard with Real-Time Security Monitoring
 *
 * Shows content immediately and handles authentication in background.
 * Now includes real-time security alerts and instant logout on role changes.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, isAuthenticated, error, securityAlert } = useAuth();
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

  // Standard authentication check
  useEffect(() => {
    // Simple check: if not loading and not authenticated, redirect
    if (!loading && !isAuthenticated && !user && !hasRedirected) {
      console.log('🔒 AUTHGUARD: No authentication found, redirecting to signin');
      setHasRedirected(true);

      // Small delay to prevent race conditions
      setTimeout(() => {
        router.push('/signin');
      }, 100);
    }
  }, [loading, isAuthenticated, user, hasRedirected, router]);

  // ALWAYS show content - no black screens!
  // If user is not authenticated, they'll be redirected anyway
  return <>{children}</>;
}
