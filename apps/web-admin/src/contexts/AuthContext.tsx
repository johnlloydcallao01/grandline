'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { payloadAuth, PayloadUser } from '@/lib/payload-auth';

// Auth context type
interface AuthContextType {
  user: PayloadUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<PayloadUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have a token
        const isAuth = payloadAuth.isAuthenticated();

        if (isAuth) {
          // Try to get user info
          const currentUser = await payloadAuth.me();

          if (currentUser) {
            setUser(currentUser);
          } else {
            // Token is invalid, clear it
            await payloadAuth.logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        payloadAuth.logout();
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await payloadAuth.login(email, password);

      if (response.user) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await payloadAuth.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh auth function
  const refreshAuth = useCallback(async () => {
    if (!payloadAuth.isAuthenticated()) {
      setUser(null);
      return;
    }

    try {
      const currentUser = await payloadAuth.me();
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        payloadAuth.logout();
      }
    } catch (error) {
      console.error('Auth refresh failed:', error);
      setUser(null);
      payloadAuth.logout();
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading && !isInitialized,
    error,
    login,
    logout,
    refreshAuth,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Custom hook for auth state only
export function useAuthState() {
  const { user, isLoading } = useAuth();
  return {
    user: user,
    loading: isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'super-admin',
  };
}

// Custom hook for admin user
export function useAdminUser() {
  const { user } = useAuth();
  return user;
}
