/**
 * Admin Session Recovery Hook
 * 
 * Provides automatic admin session recovery functionality for enhanced admin user experience.
 * Attempts to restore admin authentication state from backup when the admin app loads.
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminAuthCookies } from '@/utils/admin-auth-cookies';

export interface AdminSessionRecoveryState {
  isRecovering: boolean;
  isAuthenticated: boolean;
  recoveryAttempted: boolean;
  sessionInfo: {
    isAuthenticated: boolean;
    hasBackup: boolean;
    cookieExpiry: string | null;
    backupExpiry: string | null;
    role: string | null;
  } | null;
}

export interface UseAdminSessionRecoveryOptions {
  redirectOnSuccess?: string;
  redirectOnFailure?: string;
  enableAutoRecovery?: boolean;
  enableDebugLogging?: boolean;
}

/**
 * Hook for automatic admin session recovery
 */
export function useAdminSessionRecovery(options: UseAdminSessionRecoveryOptions = {}) {
  const {
    redirectOnSuccess = '/admin/dashboard',
    redirectOnFailure,
    enableAutoRecovery = true,
    enableDebugLogging = process.env.NEXT_PUBLIC_DEBUG_ADMIN_AUTH === 'true'
  } = options;

  const router = useRouter();
  const [state, setState] = useState<AdminSessionRecoveryState>({
    isRecovering: false,
    isAuthenticated: false,
    recoveryAttempted: false,
    sessionInfo: null
  });

  /**
   * Attempt admin session recovery
   */
  const attemptAdminRecovery = useCallback(async (): Promise<boolean> => {
    if (enableDebugLogging) {
      console.log('🔄 Attempting admin session recovery...');
    }

    setState(prev => ({ ...prev, isRecovering: true }));

    try {
      // Check if already authenticated
      const isCurrentlyAuthenticated = AdminAuthCookies.isAdminAuthenticated();
      
      if (isCurrentlyAuthenticated) {
        if (enableDebugLogging) {
          console.log('✅ Admin already authenticated');
        }
        
        const sessionInfo = AdminAuthCookies.getAdminSessionInfo();
        setState(prev => ({
          ...prev,
          isRecovering: false,
          isAuthenticated: true,
          recoveryAttempted: true,
          sessionInfo
        }));

        if (redirectOnSuccess) {
          router.push(redirectOnSuccess);
        }
        
        return true;
      }

      // Attempt recovery from backup
      const recovered = AdminAuthCookies.recoverAdminSession();
      const sessionInfo = AdminAuthCookies.getAdminSessionInfo();

      if (recovered) {
        if (enableDebugLogging) {
          console.log('✅ Admin session recovered from backup');
        }

        setState(prev => ({
          ...prev,
          isRecovering: false,
          isAuthenticated: true,
          recoveryAttempted: true,
          sessionInfo
        }));

        if (redirectOnSuccess) {
          router.push(redirectOnSuccess);
        }

        return true;
      } else {
        if (enableDebugLogging) {
          console.log('ℹ️ No admin session to recover');
        }

        setState(prev => ({
          ...prev,
          isRecovering: false,
          isAuthenticated: false,
          recoveryAttempted: true,
          sessionInfo
        }));

        if (redirectOnFailure) {
          router.push(redirectOnFailure);
        }

        return false;
      }
    } catch (error) {
      console.error('❌ Admin session recovery failed:', error);
      
      setState(prev => ({
        ...prev,
        isRecovering: false,
        isAuthenticated: false,
        recoveryAttempted: true,
        sessionInfo: AdminAuthCookies.getAdminSessionInfo()
      }));

      if (redirectOnFailure) {
        router.push(redirectOnFailure);
      }

      return false;
    }
  }, [router, redirectOnSuccess, redirectOnFailure, enableDebugLogging]);

  /**
   * Manual admin session refresh
   */
  const refreshAdminSession = () => {
    const sessionInfo = AdminAuthCookies.getAdminSessionInfo();
    setState(prev => ({
      ...prev,
      isAuthenticated: sessionInfo.isAuthenticated,
      sessionInfo
    }));
  };

  /**
   * Clear admin session and logout
   */
  const clearAdminSession = () => {
    AdminAuthCookies.adminLogout();
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      sessionInfo: AdminAuthCookies.getAdminSessionInfo()
    }));
  };

  // Auto-recovery on mount
  useEffect(() => {
    if (enableAutoRecovery && !state.recoveryAttempted) {
      attemptAdminRecovery();
    }
  }, [enableAutoRecovery, state.recoveryAttempted, attemptAdminRecovery]);

  return {
    ...state,
    attemptAdminRecovery,
    refreshAdminSession,
    clearAdminSession,
    // Utility functions
    isReady: state.recoveryAttempted,
    shouldShowLogin: state.recoveryAttempted && !state.isAuthenticated,
    shouldShowAdminApp: state.recoveryAttempted && state.isAuthenticated
  };
}

/**
 * Hook for admin session monitoring (without auto-recovery)
 */
export function useAdminSessionMonitor() {
  const [sessionInfo, setSessionInfo] = useState(AdminAuthCookies.getAdminSessionInfo());

  const refreshAdminSessionInfo = () => {
    setSessionInfo(AdminAuthCookies.getAdminSessionInfo());
  };

  useEffect(() => {
    // Refresh admin session info periodically
    const interval = setInterval(refreshAdminSessionInfo, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return {
    sessionInfo,
    refreshAdminSessionInfo,
    isAuthenticated: sessionInfo.isAuthenticated,
    hasBackup: sessionInfo.hasBackup,
    role: sessionInfo.role
  };
}

/**
 * Hook for admin authentication state only
 */
export function useAdminAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAdminAuth = () => {
    setIsAuthenticated(AdminAuthCookies.isAdminAuthenticated());
  };

  useEffect(() => {
    checkAdminAuth();
    
    // Listen for storage changes (logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_auth_session_backup') {
        checkAdminAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    isAuthenticated,
    checkAdminAuth
  };
}
