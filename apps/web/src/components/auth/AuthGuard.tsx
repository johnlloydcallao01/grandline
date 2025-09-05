'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Authentication Guard Component
 * 
 * SIMPLE LOGIC:
 * - If no user authenticated → Redirect to /signin IMMEDIATELY
 * - If user authenticated → Show children
 * - If loading → Show loading state
 * 
 * NO COMPLEX LOGIC, NO SECURITY ALERTS, JUST REDIRECT!
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, error, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🔍 AuthGuard: Checking authentication state');
    console.log('🔍 AuthGuard: loading:', loading);
    console.log('🔍 AuthGuard: isAuthenticated:', isAuthenticated);
    console.log('🔍 AuthGuard: user:', user ? 'EXISTS' : 'NULL');
    console.log('🔍 AuthGuard: error:', error);

    // Only redirect if we're sure there's no authentication
    // Add a small delay to prevent redirect loops
    if (!loading && !isAuthenticated && !user) {
      console.log('🚨 AuthGuard: User definitely not authenticated - REDIRECT to /signin');

      // Use setTimeout to prevent immediate redirect loops
      setTimeout(() => {
        router.push('/signin');
      }, 100);
      return;
    }

  }, [loading, isAuthenticated, user, error, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show loading while redirecting
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
}
