/**
 * @file apps/web-admin/src/components/auth/ProtectedRoute.tsx
 * @description Protected route component for admin-only access
 * Based on apps/web ProtectedRoute but adapted for admin-only access
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRouteProtection } from '@/hooks/useAuth';
import { ProtectedRouteProps } from '@/types/auth';

/**
 * ProtectedRoute component that ensures only authenticated admin users can access wrapped content
 * Redirects non-admin users or unauthenticated users to the login page
 */
export function ProtectedRoute({ 
  children, 
  redirectTo = '/signin' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const {
    shouldRedirectToLogin,
    isCheckingAuth
  } = useRouteProtection();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (shouldRedirectToLogin) {
      // Store the current path for redirect after login
      const currentPath = window.location.pathname + window.location.search;
      if (currentPath !== redirectTo) {
        sessionStorage.setItem('auth:redirectAfterLogin', currentPath);
      }

      router.replace(redirectTo);
    }
  }, [shouldRedirectToLogin, redirectTo, router]);

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render anything if we should redirect
  if (shouldRedirectToLogin) {
    return null;
  }

  // No additional role validation needed - auth.ts already handles admin validation

  // Render children if user is authenticated
  return <>{children}</>;
}

/**
 * Higher-order component version of ProtectedRoute
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );

  WrappedComponent.displayName = `withProtectedRoute(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default ProtectedRoute;