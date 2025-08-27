/**
 * Admin Authentication Hook
 * Works with PayloadCMS authentication and Supabase PostgreSQL database
 */

import { useCallback, useEffect, useState } from 'react';
import { authService, type LoginCredentials, type AdminUserWithPermissions } from '@/lib/auth-service';

interface AdminAuthReturn {
  user: AdminUserWithPermissions | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ user: AdminUserWithPermissions; token: string; }>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  isAdmin: boolean;
  isInstructor: boolean;
  permissions: AdminUserWithPermissions['permissions'] | null;
  hasPermission: (permission: keyof AdminUserWithPermissions['permissions']) => boolean;
}

export function useAdminAuth(): AdminAuthReturn {
  const [user, setUser] = useState<AdminUserWithPermissions | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        const storedUser = authService.getUser();

        if (token && storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
          console.log('🔄 Auth initialized from storage:', {
            email: storedUser.email,
            role: storedUser.role,
            permissions: storedUser.permissions
          });
        } else {
          setUser(null);
          setIsAuthenticated(false);
          console.log('🔄 No stored auth found');
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔐 Starting login process...');

      // Use PayloadCMS auth service
      const result = await authService.login(credentials);

      // Update local state
      setUser(result.user);
      setIsAuthenticated(true);

      console.log('✅ Login successful:', {
        email: result.user.email,
        role: result.user.role,
        permissions: result.user.permissions
      });

      return result;
    } catch (error) {
      console.error('❌ Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('🚪 Logging out...');
      await authService.logout();

      // Update local state
      setUser(null);
      setIsAuthenticated(false);
      setError(null);

      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const hasPermission = useCallback((permission: keyof AdminUserWithPermissions['permissions']) => {
    return authService.hasPermission(permission);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    error,
    clearError,
    isAdmin: user?.role === 'admin',
    isInstructor: user?.role === 'instructor',
    permissions: user?.permissions || null,
    hasPermission,
  };
}

export function useAdminUser(): AdminUserWithPermissions | null {
  const { user } = useAdminAuth();
  return user;
}

interface AuthStateReturn {
  user: AdminUserWithPermissions | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  permissions: AdminUserWithPermissions['permissions'] | null;
}

export function useAuthState(): AuthStateReturn {
  const { user, isLoading, isAuthenticated, isAdmin, isInstructor, permissions } = useAdminAuth();
  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isInstructor,
    permissions,
  };
}
