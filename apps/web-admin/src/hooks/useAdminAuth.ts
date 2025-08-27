/**
 * Admin Authentication Hook
 * Enhanced to work with PayloadCMS authentication
 */

import { useAuth } from '@encreasl/redux';
import { useAppDispatch } from '@encreasl/redux';
import { loginUser, logoutUser, loadUserFromToken } from '@encreasl/redux';
import { useCallback, useEffect, useState } from 'react';
import { authService, type LoginCredentials } from '@/lib/auth-service';

interface AdminUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

interface AdminAuthReturn {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ user: AdminUser; token: string; }>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  isAdmin: boolean;
}

export function useAdminAuth(): AdminAuthReturn {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  const appDispatch = useAppDispatch();
  const [localLoading, setLocalLoading] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = authService.getToken();
      if (token && !isAuthenticated) {
        try {
          await appDispatch(loadUserFromToken()).unwrap();
        } catch (error) {
          console.error('Failed to load user from token:', error);
          await authService.logout();
        }
      }
    };

    initializeAuth();
  }, [appDispatch, isAuthenticated]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLocalLoading(true);
    try {
      // Use our auth service for PayloadCMS authentication
      const result = await authService.login(credentials);

      // Update Redux state with the authenticated user
      await appDispatch(loginUser({
        ...credentials,
        rememberMe: true // Always remember admin sessions
      })).unwrap();

      return result;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLocalLoading(false);
    }
  }, [appDispatch]);

  const logout = useCallback(async () => {
    setLocalLoading(true);
    try {
      await authService.logout();
      await appDispatch(logoutUser()).unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLocalLoading(false);
    }
  }, [appDispatch]);

  const clearError = useCallback(() => {
    appDispatch({ type: 'auth/clearError' });
  }, [appDispatch]);

  return {
    user,
    isAuthenticated: isAuthenticated || authService.isAuthenticated(),
    isLoading: isLoading || localLoading,
    login,
    logout,
    error,
    clearError,
    isAdmin: user?.role === 'admin' || user?.role === 'instructor',
  };
}

export function useAdminUser(): AdminUser | null {
  const { user } = useAuth();
  return user as AdminUser | null;
}

interface AuthStateReturn {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export function useAuthState(): AuthStateReturn {
  const { user, isLoading } = useAuth();
  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };
}
