'use client';

import * as React from 'react';
import { AuthGuard } from './AuthGuard';
import { AlertTriangle } from 'lucide-react';

interface AdminRouteGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requireSuperAdmin?: boolean;
  fallback?: React.ReactNode;
}

// Insufficient permissions component
function _InsufficientPermissionsScreen({
  requiredPermission,
  requireSuperAdmin
}: {
  requiredPermission?: string;
  requireSuperAdmin?: boolean;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-2xl mb-6">
          <AlertTriangle className="w-8 h-8 text-yellow-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Insufficient Permissions</h1>
        <p className="text-gray-600 mb-6">
          {requireSuperAdmin
            ? 'This action requires super admin privileges.'
            : requiredPermission
              ? `You need the "${requiredPermission}" permission to access this area.`
              : 'You don\'t have the required permissions to access this area.'
          }
        </p>
        <button
          onClick={() => window.history.back()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

// Admin route guard component
export function AdminRouteGuard({
  children,
  requiredPermission,
  requireSuperAdmin = false,
  fallback
}: AdminRouteGuardProps) {
  return React.createElement(AuthGuard as React.ComponentType<{ fallback?: React.ReactNode; children?: React.ReactNode }>, {
    fallback
  }, React.createElement(PermissionCheck as React.ComponentType<{
    requiredPermission?: string;
    requireSuperAdmin?: boolean;
    children?: React.ReactNode
  }>, {
    requiredPermission,
    requireSuperAdmin
  }, children));
}

// Permission check component (used within AuthGuard)
function PermissionCheck({
  children,
  requiredPermission: _requiredPermission,
  requireSuperAdmin: _requireSuperAdmin
}: {
  children: React.ReactNode;
  requiredPermission?: string;
  requireSuperAdmin?: boolean;
}) {
  // For now, just use the AuthGuard which already checks for admin roles
  // In the future, you could implement more granular permission checking here
  return <>{children}</>;
}

// Higher-order component for protecting admin routes with permissions
export function withAdminRouteGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredPermission?: string;
    requireSuperAdmin?: boolean;
    fallback?: React.ReactNode;
  }
) {
  const WrappedComponent = (props: P) => {
    return React.createElement(AdminRouteGuard as React.ComponentType<{
      requiredPermission?: string;
      requireSuperAdmin?: boolean;
      fallback?: React.ReactNode;
      children?: React.ReactNode;
    }>, {
      requiredPermission: options?.requiredPermission,
      requireSuperAdmin: options?.requireSuperAdmin,
      fallback: options?.fallback
    }, React.createElement(Component, props));
  };

  WrappedComponent.displayName = `withAdminRouteGuard(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default AdminRouteGuard;
