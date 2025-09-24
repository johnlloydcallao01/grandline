/**
 * @file apps/web-admin/src/components/ProtectedRoute.tsx
 * @description Route protection components for PayloadCMS
 * Handles authentication-based route access control
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRouteProtection } from '@/hooks/useAuth';

// ========================================
// PROTECTED ROUTE COMPONENT
// ========================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Component that protects routes requiring authentication
 * Redirects to signin if user is not authenticated
 */
export function ProtectedRoute({ 
  children, 
  fallback = <div>Loading...</div>,
  redirectTo = '/signin' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { 
    isAuthenticated, 
    shouldRedirectToLogin,
    isCheckingAuth 
  } = useRouteProtection();

  // Handle redirect to login
  useEffect(() => {
    if (shouldRedirectToLogin) {
      console.log('🔒 PROTECTED ROUTE: Redirecting to signin...');
      router.push(redirectTo);
    }
  }, [shouldRedirectToLogin, router, redirectTo]);

  // Show loading fallback while checking auth
  if (isCheckingAuth) {
    return <>{fallback}</>;
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    console.log('🔒 PROTECTED ROUTE: Not authenticated, blocking render');
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
}

// ========================================
// HOC FOR ROUTE PROTECTION
// ========================================

/**
 * Higher-order component for protecting pages
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode;
    redirectTo?: string;
  }
) {
  const AuthenticatedComponent = (props: P) => {
    return (
      <ProtectedRoute 
        fallback={options?.fallback}
        redirectTo={options?.redirectTo}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return AuthenticatedComponent;
}

// ========================================
// ROLE-BASED PROTECTION
// ========================================

interface RoleProtectedRouteProps extends ProtectedRouteProps {
  requiredRoles?: string[];
  requireAll?: boolean;
}

/**
 * Component that protects routes based on user roles
 */
export function RoleProtectedRoute({ 
  children, 
  fallback = <div>Loading...</div>,
  redirectTo = '/signin'
}: RoleProtectedRouteProps) {
  const router = useRouter();
  const { 
    isAuthenticated, 
    shouldRedirectToLogin,
    isCheckingAuth 
  } = useRouteProtection();

  // Handle redirect to login
  useEffect(() => {
    if (shouldRedirectToLogin) {
      router.push(redirectTo);
    }
  }, [shouldRedirectToLogin, router, redirectTo]);

  // Show loading fallback while checking auth
  if (isCheckingAuth) {
    return <>{fallback}</>;
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // TODO: Implement role checking logic here
  // For now, just render if authenticated
  return <>{children}</>;
}

// ========================================
// AUTH GATE COMPONENT
// ========================================

interface AuthGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * Component that conditionally renders content based on auth state
 * Unlike ProtectedRoute, this doesn't redirect
 */
export function AuthGate({ 
  children, 
  fallback = null,
  requireAuth = true 
}: AuthGateProps) {
  const { isAuthenticated, isCheckingAuth } = useRouteProtection();

  if (isCheckingAuth) {
    return <>{fallback}</>;
  }

  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  if (!requireAuth && isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default ProtectedRoute;