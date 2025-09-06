'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Professional Authentication Guard
 *
 * Simple, clean authentication check without loading screens.
 * Professional apps don't show "Checking authentication..." - they just work.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Silent redirect if not authenticated (no loading screens)
    if (!loading && !isAuthenticated && !user) {
      router.push('/signin');
    }
  }, [loading, isAuthenticated, user, router]);

  // If still loading or not authenticated, don't render anything
  // This prevents flash of content and eliminates loading screens
  if (loading || !isAuthenticated || !user) {
    return null;
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
}
