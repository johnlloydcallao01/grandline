/**
 * Admin Authentication Hook
 * Simplified to work directly with PayloadCMS authentication and local storage
 */

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
  const [user, setUser] = useState<AdminUser | null>(null);
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
        } else {
          setUser(null);
          setIsAuthenticated(false);
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
      // Use our auth service for PayloadCMS authentication
      const result = await authService.login(credentials);

      // Update local state
      setUser(result.user);
      setIsAuthenticated(true);

      return result;
    } catch (error) {
      console.error('Login failed:', error);
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
      await authService.logout();

      // Update local state
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    error,
    clearError,
    isAdmin: user?.role === 'admin' || user?.role === 'instructor',
  };
}

export function useAdminUser(): AdminUser | null {
  const { user } = useAdminAuth();
  return user;
}

interface AuthStateReturn {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export function useAuthState(): AuthStateReturn {
  const { user, isLoading, isAuthenticated } = useAdminAuth();
  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin: user?.role === 'admin' || user?.role === 'instructor',
  };
}
