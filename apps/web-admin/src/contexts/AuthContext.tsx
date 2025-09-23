/**
 * @file apps/web-admin/src/contexts/AuthContext.tsx
 * @description Authentication context for admin users
 * Based on apps/web AuthContext but adapted for admin-only access
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { 
  User, 
  AuthState, 
  AuthContextType, 
  LoginCredentials,
  AuthErrorDetails,
  AuthEvent,
  AuthEventData
} from '@/types/auth';
import { 
  login as authLogin, 
  logout as authLogout, 
  getCurrentUser, 
  refreshSession as authRefreshSession,
  checkAuthStatus,
  handleApiError,
  isAdminUser,
  AuthenticationError
} from '@/lib/auth';

// ========================================
// AUTHENTICATION REDUCER
// ========================================

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'SESSION_EXPIRED' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload && isAdminUser(action.payload),
        isLoading: false,
        error: null,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'SET_INITIALIZED':
      return {
        ...state,
        isInitialized: action.payload,
        isLoading: !action.payload,
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
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'LOGOUT_SUCCESS':
    case 'SESSION_EXPIRED':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.type === 'SESSION_EXPIRED' ? 'Your session has expired. Please log in again.' : null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'RESET_STATE':
      return {
        ...initialState,
        isInitialized: state.isInitialized,
      };

    default:
      return state;
  }
}

// ========================================
// AUTHENTICATION CONTEXT
// ========================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ========================================
// AUTHENTICATION PROVIDER
// ========================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const initializationRef = useRef(false);
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ========================================
  // EVENT HANDLING
  // ========================================

  const emitAuthEvent = useCallback((event: AuthEvent, user?: User, error?: AuthErrorDetails) => {
    const eventData: AuthEventData = {
      event,
      user,
      error,
      timestamp: new Date(),
    };

    // Emit custom event for other parts of the app to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-event', { detail: eventData }));
    }

    // Log important events for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth Event:', eventData);
    }
  }, []);

  // ========================================
  // INITIALIZATION
  // ========================================

  const initializeAuth = useCallback(async () => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const user = await getCurrentUser();
      
      if (user && isAdminUser(user)) {
        dispatch({ type: 'SET_USER', payload: user });
        emitAuthEvent('LOGIN_SUCCESS', user);
      } else {
        dispatch({ type: 'SET_USER', payload: null });
        if (user && !isAdminUser(user)) {
          emitAuthEvent('ACCESS_DENIED', user);
        }
      }
    } catch (_error) {
      console.error('Auth initialization error:', _error);
      dispatch({ type: 'SET_USER', payload: null });
      
      if (_error instanceof AuthenticationError && _error.type === 'SESSION_EXPIRED') {
        emitAuthEvent('SESSION_EXPIRED');
      }
    } finally {
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    }
  }, [emitAuthEvent]);

  // ========================================
  // AUTHENTICATION METHODS
  // ========================================

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authLogin(credentials);
      
      if (!isAdminUser(response.user)) {
        const error = 'Access denied. This application is restricted to admin users only.';
        dispatch({ type: 'LOGIN_FAILURE', payload: error });
        emitAuthEvent('ACCESS_DENIED', response.user);
        throw new AuthenticationError('ACCESS_DENIED', error);
      }
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
      emitAuthEvent('LOGIN_SUCCESS', response.user);
    } catch (error) {
      const authError = handleApiError(error);
      const errorMessage = authError.message;
      
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      emitAuthEvent('LOGIN_FAILURE', undefined, authError);
      
      throw error;
    }
  }, [emitAuthEvent]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      const currentUser = state.user;
      await authLogout();
      dispatch({ type: 'LOGOUT_SUCCESS' });
      emitAuthEvent('LOGOUT', currentUser || undefined);
    } catch (_error) {
      // Even if logout fails, clear local state
      dispatch({ type: 'LOGOUT_SUCCESS' });
      console.error('Logout error:', _error);
    }
  }, [state.user, emitAuthEvent]);

  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      const user = await authRefreshSession();
      
      if (user && isAdminUser(user)) {
        dispatch({ type: 'SET_USER', payload: user });
        emitAuthEvent('SESSION_REFRESHED', user);
      } else {
        dispatch({ type: 'SESSION_EXPIRED' });
        emitAuthEvent('SESSION_EXPIRED');
      }
    } catch (_error) {
      dispatch({ type: 'SESSION_EXPIRED' });
      emitAuthEvent('SESSION_EXPIRED');
      throw _error;
    }
  }, [emitAuthEvent]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const isValid = await checkAuthStatus();
      if (!isValid && state.isAuthenticated) {
        dispatch({ type: 'SESSION_EXPIRED' });
        emitAuthEvent('SESSION_EXPIRED');
      }
      return isValid;
    } catch {
      return false;
    }
  }, [state.isAuthenticated, emitAuthEvent]);

  // ========================================
  // SESSION MONITORING
  // ========================================

  const startSessionMonitoring = useCallback(() => {
    if (sessionCheckIntervalRef.current) {
      clearInterval(sessionCheckIntervalRef.current);
    }

    // Check session every 5 minutes
    sessionCheckIntervalRef.current = setInterval(async () => {
      if (state.isAuthenticated) {
        try {
          await checkAuth();
        } catch (_error) {
          console.error('Session check error:', _error);
        }
      }
    }, 5 * 60 * 1000);
  }, [state.isAuthenticated, checkAuth]);

  const stopSessionMonitoring = useCallback(() => {
    if (sessionCheckIntervalRef.current) {
      clearInterval(sessionCheckIntervalRef.current);
      sessionCheckIntervalRef.current = null;
    }
  }, []);

  // ========================================
  // EFFECTS
  // ========================================

  // Initialize authentication on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Start/stop session monitoring based on authentication state
  useEffect(() => {
    if (state.isAuthenticated && state.isInitialized) {
      startSessionMonitoring();
    } else {
      stopSessionMonitoring();
    }

    return () => {
      stopSessionMonitoring();
    };
  }, [state.isAuthenticated, state.isInitialized, startSessionMonitoring, stopSessionMonitoring]);

  // Handle visibility change to check session when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && state.isAuthenticated) {
        checkAuth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.isAuthenticated, checkAuth]);

  // Handle storage events (logout from another tab)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'payload-token' && event.newValue === null && state.isAuthenticated) {
        dispatch({ type: 'LOGOUT_SUCCESS' });
        emitAuthEvent('LOGOUT');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [state.isAuthenticated, emitAuthEvent]);

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshSession,
    clearError,
    checkAuthStatus: checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ========================================
// AUTHENTICATION HOOK
// ========================================

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}

// Export the context for advanced use cases
export { AuthContext };