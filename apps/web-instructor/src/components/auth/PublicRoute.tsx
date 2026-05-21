/**
 * @file apps/web-admin/src/components/auth/PublicRoute.tsx
 * @description Public route component for authentication pages
 * Redirects authenticated users away from auth pages (signin, register)
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRouteProtection } from '@/hooks/useAuth';
import type { PublicRouteProps } from '@/types/auth';

export const PublicRoute = ({
  children,
  redirectTo = '/'
}: PublicRouteProps): React.ReactNode => {
  const router = useRouter();
  const {
    isAuthenticated,
    isInitialized,
    isLoading
  } = useRouteProtection();
  const debug = process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true';

  useEffect(() => {
    if (isAuthenticated && isInitialized && !isLoading) {
      if (debug) console.log('🔄 PUBLIC ROUTE: Redirecting authenticated user');

      const redirectTimer = setTimeout(() => {
        const storedRedirect = sessionStorage.getItem('auth:redirectAfterLogin');

        if (storedRedirect) {
          if (debug) console.log('🔄 REDIRECTING TO STORED PATH:', storedRedirect);
          sessionStorage.removeItem('auth:redirectAfterLogin');
          router.replace(storedRedirect as any);
        } else {
          if (debug) console.log('🔄 REDIRECTING TO DEFAULT:', redirectTo);
          router.replace(redirectTo as any);
        }
      }, 100);

      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, isInitialized, isLoading, redirectTo, router]);

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

/**
 * Higher-order component version of PublicRoute
 */
export function withPublicRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<PublicRouteProps, 'children'>
) {
  const WrappedComponent = (props: P): React.ReactNode => (
    <PublicRoute {...options}>
      {React.createElement(Component, props)}
    </PublicRoute>
  );

  WrappedComponent.displayName = `withPublicRoute(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default PublicRoute;
