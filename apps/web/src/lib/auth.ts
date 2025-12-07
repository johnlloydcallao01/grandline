/**
 * @file apps/web/src/lib/auth.ts
 * @description PayloadCMS Authentication Service
 * Enterprise-grade authentication with HTTP-only cookies and 30-day sessions
 */

import type {
  User,
  AuthResponse,
  LoginCredentials,
  PayloadAuthResponse,
  PayloadMeResponse,
  SessionInfo,
  AuthErrorDetails,
  AuthErrorType
} from '@/types/auth';

// ========================================
// CONFIGURATION
// ========================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://grandline-cms.vercel.app/api';
const COLLECTION_SLUG = 'users'; // Authentication is on users collection, not trainees

// Request configuration for cookie-based authentication
const REQUEST_CONFIG: RequestInit = {
  credentials: 'include', // Essential for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
};

// ========================================
// ERROR HANDLING UTILITIES
// ========================================

function createAuthError(type: AuthErrorType, message: string, field?: string): AuthErrorDetails {
  return {
    type,
    message,
    field,
    retryable: type === 'NETWORK_ERROR',
  };
}

function handleApiError(error: any): AuthErrorDetails {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return createAuthError('NETWORK_ERROR', 'Network connection failed. Please check your internet connection.');
  }

  // PayloadCMS error response
  if (error.errors && Array.isArray(error.errors)) {
    const firstError = error.errors[0];
    if (firstError.message.toLowerCase().includes('invalid login credentials')) {
      return createAuthError('INVALID_CREDENTIALS', 'Invalid email or password.');
    }
    if (firstError.message.toLowerCase().includes('account locked')) {
      return createAuthError('ACCOUNT_LOCKED', 'Account is temporarily locked. Please try again later.');
    }
    return createAuthError('VALIDATION_ERROR', firstError.message, firstError.field);
  }

  // HTTP status errors
  if (error.status === 401) {
    return createAuthError('INVALID_CREDENTIALS', 'Invalid email or password.');
  }
  if (error.status === 423) {
    return createAuthError('ACCOUNT_LOCKED', 'Account is temporarily locked. Please try again later.');
  }
  if (error.status >= 500) {
    return createAuthError('NETWORK_ERROR', 'Server error. Please try again later.');
  }

  return createAuthError('UNKNOWN_ERROR', error.message || 'An unexpected error occurred.');
}

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

/**
 * Login user with email and password
 * Uses PayloadCMS cookie strategy for secure session management
 * Only allows users with 'trainee' role to authenticate
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await makeAuthRequest<PayloadAuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Check if user has trainee role
    if (response.user.role !== 'trainee') {
      throw new Error('Access denied. Only trainees can access this application.');
    }

    // Store token for persistent authentication (30 days)
    if (response.token) {
      localStorage.setItem('grandline_auth_token', response.token);

      // Store expiration time (30 days from now)
      const expirationTime = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
      localStorage.setItem('grandline_auth_expires', expirationTime.toString());
    }

    try {
      localStorage.setItem('grandline_auth_user', JSON.stringify(response.user));
    } catch { void 0; }

    return {
      message: response.message,
      user: response.user,
      token: response.token,
      exp: response.exp,
    };
  } catch (error) {
    const authError = handleApiError(error);
    throw new Error(authError.message);
  }
}

/**
 * Logout current user
 * Clears stored token and HTTP-only cookies on the server
 */
export async function logout(): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (user) {
      try {
        await makeAuthRequest('/logout', {
          method: 'POST',
          suppressErrorLog: true,
        });
      } catch (error: any) {
        if (!(error && typeof error === 'object' && 'status' in error && error.status === 400)) {
          console.error('Logout error:', error);
        }
      }
    }
  } finally {
    clearAuthState();
  }
}

/**
 * Get current authenticated user
 * Validates session using HTTP-only cookies
 * Only returns user if they have 'trainee' role
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await makeAuthRequest<PayloadMeResponse>('/me?depth=2');

    if (!response.user) {
      clearAuthState();
      return null;
    }

    if (response.user.role !== 'trainee') {
      clearAuthState();
      return null;
    }

    try {
      localStorage.setItem('grandline_auth_user', JSON.stringify(response.user));
    } catch { void 0; }

    return response.user;
  } catch {
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
    // Check if we have a valid token to refresh
    const currentToken = localStorage.getItem('grandline_auth_token');
    if (!currentToken) {
      throw new Error('No authentication token available for refresh');
    }

    // Make refresh request to the new enterprise endpoint
    const response = await makeAuthRequest<PayloadAuthResponse>('/refresh-token', {
      method: 'POST',
    });

    // Security validation: Check if user has trainee role
    if (response.user.role !== 'trainee') {
      clearAuthState(); // Clear invalid session
      throw new Error('Access denied during refresh');
    }

    // Update stored token if a new one was provided
    if (response.token) {
      localStorage.setItem('grandline_auth_token', response.token);

      // Extend session expiration (30 days)
      const expirationTime = Date.now() + (30 * 24 * 60 * 60 * 1000);
      localStorage.setItem('grandline_auth_expires', expirationTime.toString());
    }

    try {
      localStorage.setItem('grandline_auth_user', JSON.stringify(response.user));
    } catch { void 0; }

    return {
      message: response.message,
      user: response.user,
      token: response.token,
      exp: response.exp,
    };
  } catch (error) {
    const authError = handleApiError(error);
    throw new Error(authError.message);
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

  const storedToken = localStorage.getItem('grandline_auth_token');
  const storedExpires = localStorage.getItem('grandline_auth_expires');
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
    const response = await makeAuthRequest<PayloadMeResponse>('/me');

    return {
      isValid: response.user !== null,
      user: response.user || undefined,
      expiresAt: response.exp ? new Date(response.exp * 1000) : undefined,
    };
  } catch {
    return {
      isValid: false,
    };
  }
}

/**
 * Clear local authentication state
 * Clears stored tokens and dispatches logout event
 */
export function clearAuthState(): void {
  // Clear stored authentication tokens
  if (typeof window !== 'undefined') {
    localStorage.removeItem('grandline_auth_token');
    localStorage.removeItem('grandline_auth_expires');
    localStorage.removeItem('grandline_auth_user');
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
        emitAuthEvent('session_expired');
        clearInterval(intervalId);
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
