/**
 * @file apps/web-admin/src/contexts/AuthContext.tsx
 * @description Authentication Context Provider for PayloadCMS
 * Manages global authentication state with automatic session restoration
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type {
  User,
  AuthState,
  AuthContextType,
  LoginCredentials,
} from '@/types/auth';
import {
  login as authLogin,
  logout as authLogout,
  getCurrentUser,
  refreshSession as authRefreshSession,
  checkAuthStatus,
  clearAuthState,
  emitAuthEvent,
  startSessionMonitoring,
} from '@/lib/auth';

// ========================================
// AUTHENTICATION REDUCER
// ========================================

type AuthAction =
  | { type: 'AUTH_INIT_START' }
  | { type: 'AUTH_FAST_SUCCESS'; payload: { user: User } }
  | { type: 'AUTH_INIT_SUCCESS'; payload: { user: User | null } }
  | { type: 'AUTH_INIT_ERROR'; payload: { error: string } }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User } }
  | { type: 'LOGIN_ERROR'; payload: { error: string } }
  | { type: 'LOGOUT_START' }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'REFRESH_SUCCESS'; payload: { user: User } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SESSION_EXPIRED' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false, // Start as false, will be set during initialization
  isLoading: true, // Start as loading
  isInitialized: false, // Not initialized yet
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_INIT_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_FAST_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: false, // Keep as false until real validation completes
        error: null,
      };

    case 'AUTH_INIT_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: action.payload.user !== null,
        isLoading: false,
        isInitialized: true,
        error: null,
      };

    case 'AUTH_INIT_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: action.payload.error,
      };

    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'LOGIN_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };

    case 'LOGOUT_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOGOUT_SUCCESS':
    case 'SESSION_EXPIRED':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'REFRESH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        error: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// ========================================
// CONTEXT CREATION
// ========================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ========================================
// AUTH PROVIDER COMPONENT
// ========================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ========================================
  // INITIALIZATION
  // ========================================

  const initializeAuth = useCallback(async () => {
    try {
      // For cookie-based auth, check with server directly
      const user = await getCurrentUser();
      dispatch({ type: 'AUTH_INIT_SUCCESS', payload: { user } });

      if (user) {
        emitAuthEvent('session_restored', { user });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize authentication';
      dispatch({ type: 'AUTH_INIT_ERROR', payload: { error: errorMessage } });
    }
  }, []);

  // Initialize authentication on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // ========================================
  // AUTHENTICATION METHODS
  // ========================================

  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await authLogin(credentials);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: response.user } });
      emitAuthEvent('login_success', { user: response.user });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_ERROR', payload: { error: errorMessage } });
      emitAuthEvent('login_failure', { error: errorMessage });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    dispatch({ type: 'LOGOUT_START' });

    try {
      await authLogout();
      clearAuthState();
      dispatch({ type: 'LOGOUT_SUCCESS' });
      emitAuthEvent('logout');
    } catch {
      // Always succeed logout locally even if server call fails
      clearAuthState();
      dispatch({ type: 'LOGOUT_SUCCESS' });
      emitAuthEvent('logout');
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const user = await authRefreshSession();
      if (user) {
        dispatch({ type: 'REFRESH_SUCCESS', payload: { user } });
        emitAuthEvent('session_refreshed', { user });
      } else {
        dispatch({ type: 'SESSION_EXPIRED' });
        emitAuthEvent('session_expired');
      }
    } catch (error: unknown) {
      // If refresh fails, treat as session expired
      dispatch({ type: 'SESSION_EXPIRED' });
      emitAuthEvent('session_expired');
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // ========================================
  // SESSION MONITORING
  // ========================================

  // Session monitoring and management
  useEffect(() => {
    if (!state.isAuthenticated || !state.isInitialized) return;

    const handleSessionExpired = () => {
      dispatch({ type: 'SESSION_EXPIRED' });
      // Don't emit event here to prevent infinite loop
    };

    // Listen for auth events from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth:logout') {
        handleSessionExpired();
      }
    };

    // Listen for custom auth events
    const handleAuthEvent = (e: CustomEvent) => {
      if (e.type === 'auth:logout') {
        handleSessionExpired();
      }
      // Removed 'auth:session_expired' to prevent infinite loop
    };

    // Start session monitoring
    const stopSessionMonitoring = startSessionMonitoring();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:logout', handleAuthEvent as EventListener);
    window.addEventListener('auth:session_expired', handleAuthEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:logout', handleAuthEvent as EventListener);
      window.removeEventListener('auth:session_expired', handleAuthEvent as EventListener);
      stopSessionMonitoring();
    };
  }, [state.isAuthenticated, state.isInitialized]);

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshSession,
    clearError,
    checkAuthStatus,
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
}

// ========================================
// HOOK FOR USING AUTH CONTEXT
// ========================================

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}

export { AuthContext };