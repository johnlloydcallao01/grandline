'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: 'canManageUsers' | 'canManageContent' | 'canManagePosts' | 'canManageMedia' | 'canViewAnalytics';
  fallback?: React.ReactNode;
}

const DefaultLoadingComponent: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">Verifying authentication...</p>
      <p className="text-gray-400 text-sm mt-2">Please wait while we check your credentials</p>
    </div>
  </div>
);

const UnauthorizedComponent: React.FC<{ permission?: string }> = ({ permission }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="text-red-500 text-6xl mb-4">🚫</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-gray-600 mb-4">
        {permission 
          ? `You don't have permission to access this feature. Required: ${permission}`
          : 'You need admin or instructor privileges to access this area.'
        }
      </p>
      <p className="text-gray-400 text-sm">
        Please contact your administrator if you believe this is an error.
      </p>
    </div>
  </div>
);

/**
 * ProtectedRoute Component
 * 
 * Protects routes that require authentication and specific permissions.
 * Automatically redirects unauthenticated users to login page.
 * Shows unauthorized message for users without required permissions.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  fallback
}) => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hasPermission } = useAdminAuth();

  useEffect(() => {
    // Redirect to login if not authenticated and not loading
    if (!isLoading && !isAuthenticated) {
      console.log('🚪 Redirecting to login - not authenticated');
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return fallback || <DefaultLoadingComponent />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return fallback || <DefaultLoadingComponent />;
  }

  // Check specific permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.log('🚫 Access denied - missing permission:', requiredPermission);
    return <UnauthorizedComponent permission={requiredPermission} />;
  }

  // User is authenticated and has required permissions
  console.log('✅ Access granted:', {
    email: user?.email,
    role: user?.role,
    requiredPermission,
    hasPermission: requiredPermission ? hasPermission(requiredPermission) : true
  });

  return <>{children}</>;
};

/**
 * Higher-order component for protecting pages
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission?: ProtectedRouteProps['requiredPermission']
) {
  const AuthenticatedComponent = (props: P) => (
    <ProtectedRoute requiredPermission={requiredPermission}>
      <Component {...props} />
    </ProtectedRoute>
  );

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return AuthenticatedComponent;
}

export default ProtectedRoute;
