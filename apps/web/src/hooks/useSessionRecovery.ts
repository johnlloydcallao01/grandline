/**
 * Session Recovery Hook
 * 
 * Provides automatic session recovery functionality for enhanced user experience.
 * Attempts to restore authentication state from backup when the app loads.
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCookies } from '@/utils/auth-cookies';

export interface SessionRecoveryState {
  isRecovering: boolean;
  isAuthenticated: boolean;
  recoveryAttempted: boolean;
  sessionInfo: {
    isAuthenticated: boolean;
    hasBackup: boolean;
    cookieExpiry: string | null;
    backupExpiry: string | null;
  } | null;
}

export interface UseSessionRecoveryOptions {
  redirectOnSuccess?: string;
  redirectOnFailure?: string;
  enableAutoRecovery?: boolean;
  enableDebugLogging?: boolean;
}

/**
 * Hook for automatic session recovery
 */
export function useSessionRecovery(options: UseSessionRecoveryOptions = {}) {
  const {
    redirectOnSuccess = '/',
    redirectOnFailure,
    enableAutoRecovery = true,
    enableDebugLogging = process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true'
  } = options;

  const router = useRouter();
  const [state, setState] = useState<SessionRecoveryState>({
    isRecovering: false,
    isAuthenticated: false,
    recoveryAttempted: false,
    sessionInfo: null
  });

  /**
   * Attempt session recovery
   */
  const attemptRecovery = useCallback(async (): Promise<boolean> => {
    if (enableDebugLogging) {
      console.log('🔄 Attempting session recovery...');
    }

    setState(prev => ({ ...prev, isRecovering: true }));

    try {
      // Check if already authenticated
      const isCurrentlyAuthenticated = AuthCookies.isAuthenticated();
      
      if (isCurrentlyAuthenticated) {
        if (enableDebugLogging) {
          console.log('✅ User already authenticated');
        }
        
        const sessionInfo = AuthCookies.getSessionInfo();
        setState(prev => ({
          ...prev,
          isRecovering: false,
          isAuthenticated: true,
          recoveryAttempted: true,
          sessionInfo
        }));

        if (redirectOnSuccess) {
          router.push(redirectOnSuccess as any);
        }
        
        return true;
      }

      // Attempt recovery from backup
      const recovered = AuthCookies.recoverSession();
      const sessionInfo = AuthCookies.getSessionInfo();

      if (recovered) {
        if (enableDebugLogging) {
          console.log('✅ Session recovered from backup');
        }

        setState(prev => ({
          ...prev,
          isRecovering: false,
          isAuthenticated: true,
          recoveryAttempted: true,
          sessionInfo
        }));

        if (redirectOnSuccess) {
          router.push(redirectOnSuccess as any);
        }

        return true;
      } else {
        if (enableDebugLogging) {
          console.log('ℹ️ No session to recover');
        }

        setState(prev => ({
          ...prev,
          isRecovering: false,
          isAuthenticated: false,
          recoveryAttempted: true,
          sessionInfo
        }));

        if (redirectOnFailure) {
          router.push(redirectOnFailure as any);
        }

        return false;
      }
    } catch (error) {
      console.error('❌ Session recovery failed:', error);
      
      setState(prev => ({
        ...prev,
        isRecovering: false,
        isAuthenticated: false,
        recoveryAttempted: true,
        sessionInfo: AuthCookies.getSessionInfo()
      }));

      if (redirectOnFailure) {
        router.push(redirectOnFailure as any);
      }

      return false;
    }
  }, [router, redirectOnSuccess, redirectOnFailure, enableDebugLogging]);

  /**
   * Manual session refresh
   */
  const refreshSession = () => {
    const sessionInfo = AuthCookies.getSessionInfo();
    setState(prev => ({
      ...prev,
      isAuthenticated: sessionInfo.isAuthenticated,
      sessionInfo
    }));
  };

  /**
   * Clear session and logout
   */
  const clearSession = () => {
    AuthCookies.logout();
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      sessionInfo: AuthCookies.getSessionInfo()
    }));
  };

  // Auto-recovery on mount
  useEffect(() => {
    if (enableAutoRecovery && !state.recoveryAttempted) {
      attemptRecovery();
    }
  }, [enableAutoRecovery, state.recoveryAttempted, attemptRecovery]);

  return {
    ...state,
    attemptRecovery,
    refreshSession,
    clearSession,
    // Utility functions
    isReady: state.recoveryAttempted,
    shouldShowLogin: state.recoveryAttempted && !state.isAuthenticated,
    shouldShowApp: state.recoveryAttempted && state.isAuthenticated
  };
}

/**
 * Hook for session monitoring (without auto-recovery)
 */
export function useSessionMonitor() {
  const [sessionInfo, setSessionInfo] = useState(AuthCookies.getSessionInfo());

  const refreshSessionInfo = () => {
    setSessionInfo(AuthCookies.getSessionInfo());
  };

  useEffect(() => {
    // Refresh session info periodically
    const interval = setInterval(refreshSessionInfo, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return {
    sessionInfo,
    refreshSessionInfo,
    isAuthenticated: sessionInfo.isAuthenticated,
    hasBackup: sessionInfo.hasBackup
  };
}

/**
 * Hook for authentication state only
 */
export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = () => {
    setIsAuthenticated(AuthCookies.isAuthenticated());
  };

  useEffect(() => {
    checkAuth();
    
    // Listen for storage changes (logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_session_backup') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    isAuthenticated,
    checkAuth
  };
}
