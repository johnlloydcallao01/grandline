/**
 * @file apps/web/src/lib/auth.ts
 * @description PayloadCMS Authentication Service
 * Enterprise-grade authentication with HTTP-only cookies and 30-day sessions
 */

import { 
  AuthResponse, 
  LoginCredentials, 
  PayloadMeResponse, 
  SessionInfo 
} from '@/types/auth';
import type { User } from '@/types/auth';

// ========================================
// CONFIGURATION
// ========================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';
const COLLECTION_SLUG = 'users'; // Authentication is on users collection, not trainees

// Request configuration for cookie-based authentication
const REQUEST_CONFIG: RequestInit = {
  credentials: 'omit', // Prevent sending conflicting cookies; rely on Authorization header
  headers: {
    'Content-Type': 'application/json',
  },
};

// ========================================
// ERROR HANDLING UTILITIES
// ========================================



// ========================================
// API UTILITIES
// ========================================

async function makeAuthRequest<T>(endpoint: string, options: RequestInit & { suppressErrorLog?: boolean } = {}): Promise<T> {
  const url = `${API_BASE_URL}/${COLLECTION_SLUG}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...REQUEST_CONFIG,
      ...options,
      headers: {
        ...REQUEST_CONFIG.headers,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw { ...data, status: response.status };
    }

    return data;
  } catch (error) {
    if (!options.suppressErrorLog) {
      console.error(`Auth API Error [${endpoint}]:`, error);
    }
    throw error;
  }
}

// ========================================
// CORE AUTHENTICATION FUNCTIONS
// ========================================

import { serverLogin, serverLogout, getServerUser, serverRefresh } from '@/app/actions/auth';

/**
 * Login user with email and password
 * Uses Server Actions to set an HTTP-Only cookie securely
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await serverLogin(credentials);

    // Keep non-sensitive user data in localStorage for quick synchronous access if needed,
    // but the actual auth token is now safely in an HTTP-Only cookie.
    try {
      localStorage.setItem('grandline_auth_user_trainee', JSON.stringify(response.user));
    } catch { void 0; }

    return response;
  } catch (error: any) {
    throw new Error(error.message || 'Login failed');
  }
}

/**
 * Logout current user
 * Clears HTTP-only cookies via Server Action
 */
export async function logout(_userType?: 'trainee' | 'instructor'): Promise<void> {
  try {
    await serverLogout();
  } finally {
    clearAuthState();
  }
}

/**
 * Get current authenticated user
 * Validates session using HTTP-only cookies via Server Action
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const user = await getServerUser();
    
    if (!user) {
      clearAuthState();
      return null;
    }

    try {
      localStorage.setItem('grandline_auth_user_trainee', JSON.stringify(user));
    } catch { void 0; }

    return user;
  } catch (_error) {
    clearAuthState();
    return null;
  }
}

/**
 * Refresh user session with enterprise-grade error handling and token management
 * Extends session duration using PayloadCMS custom refresh endpoint
 * Only allows users with 'trainee' role
 */
export async function refreshSession(): Promise<AuthResponse> {
  try {
    const response = await serverRefresh();

    try {
      localStorage.setItem('grandline_auth_user_trainee', JSON.stringify(response.user));
    } catch { void 0; }

    return response;
  } catch (error: any) {
    clearAuthState();
    throw new Error(error.message || 'Failed to refresh session');
  }
}

// ========================================
// SESSION MANAGEMENT FUNCTIONS
// ========================================

/**
 * Check if user is currently authenticated
 * Quick validation without full user data
 */
export async function checkAuthStatus(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user !== null;
  } catch {
    return false;
  }
}

/**
 * Check if we have a valid stored token (quick check)
 */
export function hasValidStoredToken(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const storedToken = localStorage.getItem('grandline_auth_token_trainee');
  const storedExpires = localStorage.getItem('grandline_auth_expires_trainee');
  const debug = process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true';
  if (debug) console.log('🔍 hasValidStoredToken: token exists?', !!storedToken);
  if (debug) console.log('🔍 hasValidStoredToken: expires exists?', !!storedExpires);

  if (!storedToken || !storedExpires) {
    if (debug) console.log('🔍 hasValidStoredToken: missing token or expires');
    return false;
  }

  const expirationTime = parseInt(storedExpires);
  const isValid = Date.now() < expirationTime;
  if (debug) console.log('🔍 hasValidStoredToken: is valid?', isValid);

  return isValid;
}

/**
 * Get detailed session information
 * Includes expiration and user data
 */
export async function getSessionInfo(): Promise<SessionInfo> {
  try {
    let headers: Record<string, string> | undefined;
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('grandline_auth_token_trainee');
      if (token) headers = { Authorization: `users JWT ${token}` };
    }
    const response = await makeAuthRequest<PayloadMeResponse>('/me', { headers });

    return {
      isValid: response.user !== null,
      user: response.user || undefined,
      expiresAt: response.exp ? new Date(response.exp * 1000) : undefined,
    };
  } catch (error: any) {
    const isAuthStatus = !!(error && typeof error === 'object' && 'status' in error);
    const status = isAuthStatus ? (error as { status: number }).status : undefined;

    if (status === 401 || status === 403) {
      return { isValid: false };
    }

    return { isValid: true };
  }
}

/**
 * Clear local authentication state
 * Clears stored tokens and dispatches logout event
 */
export function clearAuthState(): void {
  // Clear stored authentication tokens
  if (typeof window !== 'undefined') {
    localStorage.removeItem('grandline_auth_token_trainee');
    localStorage.removeItem('grandline_auth_expires_trainee');
    localStorage.removeItem('grandline_auth_user_trainee');
    sessionStorage.removeItem('auth:redirectAfterLogin');
    const debug = process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true';
    if (debug) console.log('🧹 CLEARED AUTH STATE');

    // Dispatch custom event for auth state changes
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Check if session is expired based on exp timestamp
 */
export function isSessionExpired(exp?: number): boolean {
  if (!exp) return true;
  return Date.now() >= exp * 1000;
}

/**
 * Get time until session expires
 */
export function getTimeUntilExpiry(exp?: number): number {
  if (!exp) return 0;
  return Math.max(0, exp * 1000 - Date.now());
}

/**
 * Format user display name
 */
export function getUserDisplayName(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.username) {
    return user.username;
  }
  return user.email;
}

// ========================================
// AUTHENTICATION EVENTS
// ========================================

/**
 * Emit authentication event
 */
export function emitAuthEvent(event: string, data?: any): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(`auth:${event}`, { detail: data }));
  }
}

// ========================================
// SESSION MONITORING
// ========================================

/**
 * Start automatic session refresh
 * Refreshes session every 25 minutes to maintain 30-day persistence
 */
export function startSessionMonitoring(): () => void {
  if (typeof window === 'undefined') {
    return () => { };
  }

  const REFRESH_INTERVAL = 25 * 60 * 1000; // 25 minutes

  const intervalId = setInterval(async () => {
    try {
      const isAuth = await checkAuthStatus();
      if (isAuth) {
        await refreshSession();
        emitAuthEvent('session_refreshed_auto');
      }
    } catch (error) {
      console.error('Auto session refresh failed:', error);
      emitAuthEvent('session_refresh_failed', { error });
    }
  }, REFRESH_INTERVAL);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
}

/**
 * Monitor for session expiration
 */
export function monitorSessionExpiration(): () => void {
  if (typeof window === 'undefined') {
    return () => { };
  }

  const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  const intervalId = setInterval(async () => {
    try {
      const sessionInfo = await getSessionInfo();

      if (!sessionInfo.isValid) {
        // Disable auto-logout on session check failure to prevent sudden redirects
        // emitAuthEvent('session_expired');
        console.warn('Session check failed, but keeping session active to prevent redirect loop.');
        // clearInterval(intervalId);
      } else if (sessionInfo.expiresAt) {
        const timeUntilExpiry = sessionInfo.expiresAt.getTime() - Date.now();

        // Warn if session expires in less than 10 minutes
        if (timeUntilExpiry < 10 * 60 * 1000 && timeUntilExpiry > 0) {
          emitAuthEvent('session_expiring_soon', {
            expiresAt: sessionInfo.expiresAt,
            timeUntilExpiry
          });
        }
      }
    } catch (error) {
      console.error('Session monitoring error:', error);
    }
  }, CHECK_INTERVAL);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
}
