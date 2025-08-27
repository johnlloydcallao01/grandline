/**
 * Professional Admin Authentication Hook
 * Integrates PayloadCMS authentication with Redux Toolkit state management
 */

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginWithPayloadCMS, type RootState, type AppDispatch } from '@/lib/store';
import { logoutUser, loadUserFromToken } from '@encreasl/redux';
import { adminApi } from '@/lib/admin-api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AdminAuthReturn {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<any>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  isAdmin: boolean;
  isInstructor: boolean;
}

/**
 * Professional Admin Authentication Hook
 * Uses Redux Toolkit for state management with PayloadCMS integration
 */
export function useAdminAuth(): AdminAuthReturn {
  const dispatch = useDispatch<AppDispatch>();

  // Get auth state from Redux store
  const { user, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      // Check if we have a stored token but no user in Redux
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

      if (storedToken && !user && !isLoading) {
        console.log('🔄 Initializing auth from stored token...');
        try {
          // Try to load user from token
          await dispatch(loadUserFromToken()).unwrap();
        } catch (error) {
          console.warn('⚠️ Failed to load user from stored token:', error);
          // Clear invalid token
          if (typeof window !== 'undefined') {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
          }
        }
      }
    };

    initializeAuth();
  }, [dispatch, user, isLoading]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      console.log('🔐 Professional PayloadCMS login initiated...');

      // Use Redux thunk for PayloadCMS authentication
      const result = await dispatch(loginWithPayloadCMS(credentials)).unwrap();

      console.log('✅ Professional login successful:', {
        email: result.user.email,
        role: result.user.role,
        hasToken: !!result.token
      });

      return result;
    } catch (error) {
      console.error('❌ Professional login failed:', error);
      throw error;
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      console.log('🚪 Professional logout initiated...');

      // Call PayloadCMS logout endpoint
      await dispatch(adminApi.endpoints.logout.initiate()).unwrap();

      // Dispatch Redux logout action
      await dispatch(logoutUser()).unwrap();

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }

      console.log('✅ Professional logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force clear state even if API call fails
      dispatch({ type: 'auth/forceLogout' });
    }
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch({ type: 'auth/clearError' });
  }, [dispatch]);

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
  };
}

export function useAdminUser() {
  const { user } = useAdminAuth();
  return user;
}

interface AuthStateReturn {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
}

export function useAuthState(): AuthStateReturn {
  const { user, isLoading, isAuthenticated, isAdmin, isInstructor } = useAdminAuth();
  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isInstructor,
  };
}
