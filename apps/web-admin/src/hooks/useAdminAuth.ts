/**
 * Admin Authentication Hook
 * Uses Redux auth state instead of custom AuthContext
 */

import { useAuth } from '@encreasl/redux';
import { useAppDispatch } from '@encreasl/redux';
import { loginUser, logoutUser } from '@encreasl/redux';
import { useCallback } from 'react';

export function useAdminAuth() {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  const appDispatch = useAppDispatch();

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    return appDispatch(loginUser(credentials));
  }, [appDispatch]);

  const logout = useCallback(() => {
    return appDispatch(logoutUser());
  }, [appDispatch]);

  const clearError = useCallback(() => {
    appDispatch({ type: 'auth/clearError' });
  }, [appDispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    error,
    clearError,
    isAdmin: user?.role === 'admin',
  };
}

export function useAdminUser() {
  const { user } = useAuth();
  return user;
}

export function useAuthState() {
  const { user, isLoading } = useAuth();
  return {
    user,
    loading: isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };
}
