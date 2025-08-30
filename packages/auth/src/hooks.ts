/**
 * React hooks for authentication
 */

'use client';

import { useState, useCallback } from 'react';
import type { AuthState, LoginCredentials, AuthConfig, AuthUser, RoleConfig } from './types';
import { AuthClient } from './auth-client';

/**
 * Hook for authentication state management
 */
export function useAuth(config: AuthConfig & RoleConfig = { apiUrl: '' }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: false,
    error: null,
  });

  const authClient = new AuthClient(config);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authClient.login(credentials);
      
      // Validate user role if configured
      if (!authClient.validateUserRole(response.user)) {
        const roleError = config.requiredRole 
          ? `Access denied. Required role: ${config.requiredRole}. Current role: ${response.user.role}`
          : 'Access denied. Insufficient permissions.';
        throw new Error(roleError);
      }

      setState({
        isAuthenticated: true,
        user: response.user,
        token: response.token || null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = (error as Error)?.message || 'Authentication failed. Please check your credentials.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: { message: errorMessage },
      }));
      throw error;
    }
  }, [authClient, config.requiredRole]);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      authClient.clearAuthCookie();
      setState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: { message: 'Logout failed' },
      }));
    }
  }, [authClient]);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    if (!authClient.hasAuthCookie()) {
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const user = await authClient.getCurrentUser();
      
      if (user && authClient.validateUserRole(user)) {
        setState({
          isAuthenticated: true,
          user,
          token: null, // Token is in cookie
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        setState({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
          error: null,
        });
        return false;
      }
    } catch (error) {
      setState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: { message: 'Authentication check failed' },
      });
      return false;
    }
  }, [authClient]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    logout,
    checkAuth,
    clearError,
  };
}

/**
 * Hook for admin authentication (convenience wrapper)
 */
export function useAdminAuth(apiUrl: string, debug = false) {
  return useAuth({
    apiUrl,
    requiredRole: 'admin',
    debug,
  });
}

/**
 * Hook for role-based authentication
 */
export function useRoleAuth(apiUrl: string, roleConfig: RoleConfig, debug = false) {
  return useAuth({
    apiUrl,
    ...roleConfig,
    debug,
  });
}

/**
 * Hook for trainee authentication (convenience wrapper)
 */
export function useTraineeAuth(apiUrl: string, debug = false) {
  return useAuth({
    apiUrl,
    requiredRole: 'trainee',
    debug,
  });
}
