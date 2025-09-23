/**
 * @file apps/web-admin/src/components/auth/ProtectedRoute.tsx
 * @description Protected route component for admin-only access
 * Based on apps/web ProtectedRoute but adapted for admin-only access
 */

'use client';

import React from 'react';
import { redirect } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRouteProps } from '@/types/auth';
import { isAdminUser } from '@/lib/auth';

/**
 * ProtectedRoute component that ensures only authenticated admin users can access wrapped content
 * Redirects non-admin users or unauthenticated users to the login page
 */
export function ProtectedRoute({ 
  children, 
  redirectTo = '/signin' 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, isInitialized } = useAuth();

  // Show loading state while authentication is being initialized
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    redirect(redirectTo);
    return null;
  }

  // Redirect if user is not an admin
  if (!isAdminUser(user)) {
    redirect('/access-denied');
    return null;
  }

  // Render children if user is authenticated and is an admin
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