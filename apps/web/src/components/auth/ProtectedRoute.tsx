/**
 * @file apps/web/src/components/auth/ProtectedRoute.tsx
 * @description Route protection component for authenticated pages
 * Redirects unauthenticated users to signin page
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRouteProtection } from '@/hooks/useAuth';
import type { ProtectedRouteProps } from '@/types/auth';



// ========================================
// PROTECTED ROUTE COMPONENT
// ========================================

export function ProtectedRoute({
  children,
  fallback,
  redirectTo = '/signin'
}: ProtectedRouteProps) {
  const router = useRouter();
  const {
    isAuthenticated,
    isInitialized,
    isLoading,
    shouldRedirectToLogin,
    isCheckingAuth
  } = useRouteProtection();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (shouldRedirectToLogin) {
      console.log('🔄 PROTECTED ROUTE: Redirecting to login');
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
    console.log('⏳ PROTECTED ROUTE: Still checking auth...');
    return fallback || null;
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    console.log('❌ PROTECTED ROUTE: Not authenticated, will redirect');
    return null;
  }

  console.log('✅ PROTECTED ROUTE: Authenticated, rendering content');

  // Render protected content
  return <>{children}</>;
}

// ========================================
// HOC VERSION
// ========================================

/**
 * Higher-order component version of ProtectedRoute
 * Usage: const ProtectedComponent = withAuth(MyComponent);
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode;
    redirectTo?: string;
  }
) {
  const WrappedComponent = (props: P) => {
    return (
      <ProtectedRoute
        fallback={options?.fallback}
        redirectTo={options?.redirectTo}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// ========================================
// ROLE-BASED PROTECTION
// ========================================

interface RoleProtectedRouteProps extends ProtectedRouteProps {
  allowedRoles: string[];
  fallbackComponent?: React.ComponentType;
}

export function RoleProtectedRoute({
  children,
  allowedRoles,
  fallback,
  fallbackComponent: FallbackComponent,
  redirectTo = '/signin'
}: RoleProtectedRouteProps) {
  const router = useRouter();
  const {
    isAuthenticated,
    isInitialized,
    isLoading,
    shouldRedirectToLogin,
    isCheckingAuth
  } = useRouteProtection();

  // Get user role from auth context
  const { user } = useRouteProtection() as any; // Type assertion for user access

  // Redirect to login if not authenticated
  useEffect(() => {
    if (shouldRedirectToLogin) {
      const currentPath = window.location.pathname + window.location.search;
      if (currentPath !== redirectTo) {
        sessionStorage.setItem('auth:redirectAfterLogin', currentPath);
      }
      
      router.replace(redirectTo);
    }
  }, [shouldRedirectToLogin, redirectTo, router]);

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return fallback || <AuthLoadingScreen />;
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return fallback || <AuthLoadingScreen />;
  }

  // Check role permissions
  const userRole = user?.role;
  const hasPermission = userRole && allowedRoles.includes(userRole);

  if (!hasPermission) {
    if (FallbackComponent) {
      return <FallbackComponent />;
    }
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <i className="fa fa-exclamation-triangle text-red-600 text-2xl"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ========================================
// CONDITIONAL RENDERING HELPERS
// ========================================

interface AuthGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * Conditional rendering based on authentication status
 * Useful for showing different content to authenticated vs unauthenticated users
 */
export function AuthGate({ children, fallback, requireAuth = true }: AuthGateProps) {
  const { isAuthenticated, isCheckingAuth } = useRouteProtection();

  if (isCheckingAuth) {
    return fallback || null;
  }

  if (requireAuth && !isAuthenticated) {
    return fallback || null;
  }

  if (!requireAuth && isAuthenticated) {
    return fallback || null;
  }

  return <>{children}</>;
}

// ========================================
// EXPORTS
// ========================================

export default ProtectedRoute;
