'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Shield, Loader2 } from '@/components/ui/IconWrapper';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

// Loading component
function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-lg font-medium text-gray-900">Verifying access...</span>
        </div>
        <p className="text-gray-600 max-w-md">
          Please wait while we verify your admin credentials and load the dashboard.
        </p>
      </div>
    </div>
  );
}

// Unauthorized access component
function UnauthorizedScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-6">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don&apos;t have permission to access this admin area. Please contact your administrator if you believe this is an error.
        </p>
        <button
          onClick={() => window.location.href = '/admin/login'}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
}

// Main AuthGuard component
export const AuthGuard = ({
  children,
  fallback,
  redirectTo = '/admin/login'
}: AuthGuardProps) => {
  const { user, isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to login if not authenticated (hook must be called before any conditional returns)
  useEffect(() => {
    if (!isAuthenticated && !isLoading && pathname !== redirectTo) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo, pathname]);

  // Allow login page to pass through without authentication
  if (pathname === redirectTo) {
    return children;
  }

  // Show loading screen while checking authentication (only on initial load)
  if (isLoading) {
    return fallback || <AuthLoadingScreen />;
  }

  // Redirect is handled by useEffect, but show loading while redirecting
  if (!isAuthenticated) {
    return fallback || <AuthLoadingScreen />;
  }

  // Check if user has admin privileges (ONLY admin role allowed)
  if (user && (user as { role?: string }).role !== 'admin') {
    return <UnauthorizedScreen />;
  }
  // User is authenticated and has admin privileges
  return children;
};

// Higher-order component for protecting pages
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode;
    redirectTo?: string;
  }
) {
  const WrappedComponent = (props: P): React.ReactElement => {
    return (
      <AuthGuard
        fallback={options?.fallback}
        redirectTo={options?.redirectTo}
      >
        <Component {...props} />
      </AuthGuard>
    );
  };

  WrappedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Hook to get current admin user (for use within AuthGuard)
export function useCurrentAdmin(): { firstName?: string; lastName?: string; email?: string; role?: string; } | null {
  const { user } = useAdminAuth();
  return user;
}

// Export default
export default AuthGuard;
