'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * SIMPLE Authentication Guard - NO BLACK SCREENS!
 *
 * Shows content immediately and handles authentication in background.
 * Professional apps don't show loading screens - they just work.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

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
