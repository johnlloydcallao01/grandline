/**
 * @file apps/web-admin/src/components/auth/PublicRoute.tsx
 * @description Public route component that redirects authenticated admin users
 * Based on apps/web PublicRoute but adapted for admin-only access
 */

'use client';

import React from 'react';
import { redirect } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { PublicRouteProps } from '@/types/auth';

/**
 * PublicRoute component that redirects authenticated admin users away from public pages
 * Typically used for login, registration, and other auth-related pages
 */
export function PublicRoute({ 
  children, 
  redirectTo = '/dashboard' 
}: PublicRouteProps) {
  const { user, isAuthenticated, isLoading, isInitialized } = useAuth();

  // Show loading state while authentication is being initialized
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect if user is authenticated
  if (isAuthenticated && user) {
    redirect(redirectTo);
    return null;
  }

  // Render children if user is not authenticated
  return <>{children}</>;
}

/**
 * Higher-order component version of PublicRoute
 */
export function withPublicRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<PublicRouteProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <PublicRoute {...options}>
      <Component {...props} />
    </PublicRoute>
  );

  WrappedComponent.displayName = `withPublicRoute(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default PublicRoute;