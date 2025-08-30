'use client';

import React, { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { PayloadAuthClient, type PayloadAuthConfig } from './auth-client';
import { AuthErrorBoundary } from './components/AuthErrorBoundary';
import { authDebugger } from './utils/debug';
import type { AuthUser, LoginCredentials } from './types';

type Login = (args: LoginCredentials) => Promise<void>;
type Logout = () => Promise<void>;

type AuthContext = {
  user?: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: Logout;
  login: Login;
  isLoading: boolean;
  isCheckingSession: boolean;
  error?: { message: string } | null;
  clearError: () => void;
};

const Context = createContext({} as AuthContext);

export interface AuthProviderProps {
  children: React.ReactNode;
  config: PayloadAuthConfig;
}

/**
 * PayloadCMS Authentication Provider
 * Based on official PayloadCMS documentation pattern
 */
export const AuthProvider = ({ children, config }: AuthProviderProps): React.ReactElement => {
  const [user, setUser] = useState<AuthUser | null>();
  const [isLoading, setIsLoading] = useState(false); // Only true during actual login attempts
  const [isCheckingSession, setIsCheckingSession] = useState(true); // True during initial session check
  const [error, setError] = useState<{ message: string } | null>(null);

  const authClient = new PayloadAuthClient(config);

  // Enable debugging if requested
  useEffect(() => {
    if (config.debug) {
      authDebugger.enable(true);
      authDebugger.info('AuthProvider initialized', {
        apiUrl: config.apiUrl,
        requiredRole: config.requiredRole
      });
    }
  }, [config.debug, config.apiUrl, config.requiredRole]);

  const login = useCallback<Login>(async (args) => {
    setIsLoading(true);
    setError(null);

    authDebugger.info('Login attempt started', { email: args.email });

    try {
      const userData = await authClient.login(args);
      setUser(userData);

      authDebugger.info('Login successful', {
        userId: userData.id,
        email: userData.email,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName
      });

      if (config.debug) {
        console.log('✅ Login successful - setting user in context:', {
          email: userData.email,
          role: userData.role,
          firstName: userData.firstName,
          lastName: userData.lastName,
          id: userData.id
        });
      }
    } catch (error) {
      setUser(null);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError({ message: errorMessage });

      authDebugger.error('Login failed', {
        error: errorMessage,
        email: args.email
      });

      if (config.debug) {
        console.error('❌ Login failed:', errorMessage);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authClient, config.debug]);

  const logout = useCallback<Logout>(async () => {
    setIsLoading(true);
    try {
      await authClient.logout();
    } catch (error) {
      // Ignore logout errors - we'll clear state anyway
      if (config.debug) {
        console.log('⚠️ Logout API error ignored:', error);
      }
    }

    // Always clear user state regardless of API response
    setUser(null);
    setIsLoading(false);
  }, [authClient, config.debug]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsCheckingSession(true);
      try {
        const currentUser = await authClient.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          if (config.debug) {
            console.log('✅ Session restored for user:', {
              email: currentUser.email,
              role: currentUser.role,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              id: currentUser.id
            });
          }
        } else {
          setUser(null);
          if (config.debug) {
            console.log('ℹ️ No active session found - user will see placeholder data');
          }
        }
      } catch (error) {
        if (config.debug) {
          console.log('⚠️ Session check failed:', error);
        }
        setUser(null);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkAuthStatus();
  }, [authClient, config.debug]);

  return (
    <AuthErrorBoundary
      onError={(error, errorInfo) => {
        if (config.debug) {
          console.error('🚨 Auth Provider Error:', error, errorInfo);
        }
      }}
    >
      <Context.Provider
        value={{
          user,
          setUser,
          login,
          logout,
          isLoading,
          isCheckingSession,
          error,
          clearError,
        }}
      >
        {children}
      </Context.Provider>
    </AuthErrorBoundary>
  );
};

type UseAuth<T = AuthUser> = () => AuthContext;

export const useAuth: UseAuth = () => useContext(Context);

// Convenience hook for trainee authentication
export function useTraineeAuth(apiUrl?: string, debug?: boolean) {
  const auth = useAuth();

  // Return auth context with additional computed properties
  return {
    ...auth,
    isAuthenticated: !!auth.user,
    isTrainee: auth.user?.role === 'trainee',
  };
}

// Convenience hook for admin authentication
export function useAdminAuth(apiUrl?: string, debug?: boolean) {
  const auth = useAuth();

  // Return auth context with additional computed properties
  return {
    ...auth,
    isAuthenticated: !!auth.user,
    isAdmin: auth.user?.role === 'admin',
  };
}

/**
 * LOGIN-ONLY hook for admin authentication
 * Does NOT check existing sessions - only provides login functionality
 * Use this on login pages for proper enterprise UX
 */
export function useAdminLogin(apiUrl: string = 'https://grandline-cms.vercel.app/api', debug: boolean = false) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string } | null>(null);

  const authClient = new PayloadAuthClient({
    apiUrl,
    requiredRole: 'admin',
    debug,
  });

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const userData = await authClient.login(credentials);

      if (debug) {
        console.log('✅ Admin login successful:', userData.email);
      }

      return userData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError({ message: errorMessage });

      if (debug) {
        console.error('❌ Admin login failed:', errorMessage);
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authClient, debug]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    login,
    isLoading,
    error,
    clearError,
  };
}

/**
 * LOGIN-ONLY hook for trainee authentication
 * Does NOT check existing sessions - only provides login functionality
 * Use this on login pages for proper enterprise UX
 */
export function useTraineeLogin(apiUrl: string = 'https://grandline-cms.vercel.app/api', debug: boolean = false) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string } | null>(null);

  const authClient = new PayloadAuthClient({
    apiUrl,
    requiredRole: 'trainee',
    debug,
  });

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const userData = await authClient.login(credentials);

      if (debug) {
        console.log('✅ Trainee login successful:', userData.email);
      }

      return userData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError({ message: errorMessage });

      if (debug) {
        console.error('❌ Trainee login failed:', errorMessage);
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authClient, debug]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    login,
    isLoading,
    error,
    clearError,
  };
}
