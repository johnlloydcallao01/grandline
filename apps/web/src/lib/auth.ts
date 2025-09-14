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
  PayloadErrorResponse,
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

async function makeAuthRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
    console.error(`Auth API Error [${endpoint}]:`, error);
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
  console.log('🔐 LOGIN ATTEMPT:', credentials.email);

  try {
    const response = await makeAuthRequest<PayloadAuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    console.log('✅ LOGIN SUCCESS:', {
      email: response.user.email,
      role: response.user.role,
      id: response.user.id
    });

    // Log the FULL response to see what PayloadCMS actually returns
    console.log('📋 FULL PAYLOAD RESPONSE:', response);
    console.log('🔑 TOKEN IN RESPONSE:', response.token);
    console.log('⏰ EXP IN RESPONSE:', response.exp);

    // Log cookies after login
    if (typeof document !== 'undefined') {
      console.log('🍪 CLIENT: All cookies after login:', document.cookie);
    }

    // Check if user has trainee role
    if (response.user.role !== 'trainee') {
      console.log('❌ ROLE DENIED:', response.user.role);
      throw new Error('Access denied. Only trainees can access this application.');
    }

    console.log('✅ TRAINEE ROLE CONFIRMED');

    // Store token for persistent authentication (30 days)
    if (response.token) {
      console.log('💾 STORING TOKEN for persistent auth');
      localStorage.setItem('grandline_auth_token', response.token);

      // Store expiration time (30 days from now)
      const expirationTime = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
      localStorage.setItem('grandline_auth_expires', expirationTime.toString());

      console.log('✅ TOKEN STORED for 30 days');
    }

    return {
      message: response.message,
      user: response.user,
      token: response.token,
      exp: response.exp,
    };
  } catch (error) {
    console.log('❌ LOGIN FAILED:', error);
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
    // Clear stored token first
    clearAuthState();

    // Also try to logout from PayloadCMS server (best effort)
    await makeAuthRequest('/logout', {
      method: 'POST',
    });
  } catch (error) {
    // Log error but don't throw - logout should always succeed locally
    console.error('Logout error:', error);
  }
}

/**
 * Get current authenticated user
 * Validates session using HTTP-only cookies
 * Only returns user if they have 'trainee' role
 */
export async function getCurrentUser(): Promise<User | null> {
  console.log('🔍 CHECKING CURRENT USER...');

  // Check if we have a stored token
  const storedToken = localStorage.getItem('grandline_auth_token');
  const storedExpires = localStorage.getItem('grandline_auth_expires');

  if (!storedToken || !storedExpires) {
    console.log('❌ NO STORED TOKEN');
    return null;
  }

  // Check if token is expired
  const expirationTime = parseInt(storedExpires);
  if (Date.now() > expirationTime) {
    console.log('❌ TOKEN EXPIRED');
    clearAuthState();
    return null;
  }

  console.log('✅ VALID TOKEN FOUND, checking with PayloadCMS...');

  try {
    // Use token-based authentication instead of cookies
    // Include depth parameter to fetch profilePicture with related Media data
    const response = await fetch(`${API_BASE_URL}/${COLLECTION_SLUG}/me?depth=2`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${storedToken}`, // PayloadCMS uses JWT prefix
      },
    });

    if (!response.ok) {
      console.log('❌ TOKEN VALIDATION FAILED');
      clearAuthState();
      return null;
    }

    const data = await response.json();

    if (data.user) {
      console.log('✅ USER FOUND:', {
        email: data.user.email,
        role: data.user.role,
        id: data.user.id
      });

      // Check if user exists and has trainee role
      if (data.user.role === 'trainee') {
        console.log('✅ TRAINEE ROLE CONFIRMED');
        return data.user;
      } else {
        console.log('❌ ROLE DENIED:', data.user.role);
        clearAuthState();
        return null;
      }
    } else {
      console.log('❌ NO USER IN RESPONSE');
      clearAuthState();
      return null;
    }
  } catch (error) {
    console.log('❌ GET USER FAILED:', error);
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
  const startTime = Date.now();
  console.log('🔄 INITIATING TOKEN REFRESH...');

  try {
    // Check if we have a valid token to refresh
    const currentToken = localStorage.getItem('grandline_auth_token');
    if (!currentToken) {
      console.log('❌ REFRESH FAILED: No current token available');
      throw new Error('No authentication token available for refresh');
    }

    // Make refresh request to the new enterprise endpoint
    const response = await makeAuthRequest<PayloadAuthResponse>('/refresh-token', {
      method: 'POST',
    });

    console.log('📋 REFRESH RESPONSE RECEIVED:', {
      hasUser: !!response.user,
      hasToken: !!response.token,
      userRole: response.user?.role,
      responseTime: `${Date.now() - startTime}ms`
    });

    // Security validation: Check if user has trainee role
    if (response.user.role !== 'trainee') {
      console.log('❌ REFRESH DENIED: Invalid role', response.user.role);
      clearAuthState(); // Clear invalid session
      throw new Error('Access denied. Only trainees can access this application.');
    }

    // Update localStorage with new token and expiration
    if (response.token) {
      console.log('💾 UPDATING STORED TOKEN...');
      localStorage.setItem('grandline_auth_token', response.token);
      
      // Update expiration time (30 days from now)
      const expirationTime = Date.now() + (30 * 24 * 60 * 60 * 1000);
      localStorage.setItem('grandline_auth_expires', expirationTime.toString());
      
      console.log('✅ TOKEN REFRESH SUCCESS:', {
        email: response.user.email,
        expiresAt: new Date(expirationTime).toISOString(),
        responseTime: `${Date.now() - startTime}ms`
      });
    } else {
      console.warn('⚠️ REFRESH WARNING: No token in response');
    }

    // Emit refresh success event
    emitAuthEvent('session_refreshed', {
      user: response.user,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    });

    return {
      message: response.message,
      user: response.user,
      token: response.token,
      exp: response.exp,
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
    
    console.error('❌ TOKEN REFRESH FAILED:', {
      error: errorMessage,
      responseTime: `${responseTime}ms`,
      hasStoredToken: !!localStorage.getItem('grandline_auth_token')
    });

    // Enhanced error handling with graceful degradation
    if (errorMessage.includes('Authentication required') || 
        errorMessage.includes('Invalid email or password') ||
        errorMessage.includes('Access denied')) {
      // These are authentication failures - clear state
      console.log('🧹 CLEARING AUTH STATE due to authentication failure');
      clearAuthState();
    } else if (errorMessage.includes('Network connection failed')) {
      // Network error - don't clear state, just throw error
      console.log('📡 NETWORK ERROR during refresh - keeping current state');
    } else {
      // Unknown error - log but check if we still have a valid token
      const hasValidToken = hasValidStoredToken();
      console.log('❓ UNKNOWN REFRESH ERROR - token still valid?', hasValidToken);
      
      if (!hasValidToken) {
        clearAuthState();
      }
    }

    // Emit refresh failure event
    emitAuthEvent('session_refresh_failed', {
      error: errorMessage,
      timestamp: new Date().toISOString(),
      responseTime
    });

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
  } catch (error) {
    return false;
  }
}

/**
 * Check if we have a valid stored token (quick check)
 */
export function hasValidStoredToken(): boolean {
  if (typeof window === 'undefined') {
    console.log('🔍 hasValidStoredToken: window undefined');
    return false;
  }

  const storedToken = localStorage.getItem('grandline_auth_token');
  const storedExpires = localStorage.getItem('grandline_auth_expires');

  console.log('🔍 hasValidStoredToken: token exists?', !!storedToken);
  console.log('🔍 hasValidStoredToken: expires exists?', !!storedExpires);

  if (!storedToken || !storedExpires) {
    console.log('🔍 hasValidStoredToken: missing token or expires');
    return false;
  }

  const expirationTime = parseInt(storedExpires);
  const isValid = Date.now() < expirationTime;
  console.log('🔍 hasValidStoredToken: is valid?', isValid);

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
  } catch (error) {
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
    sessionStorage.removeItem('auth:redirectAfterLogin');

    console.log('🧹 CLEARED AUTH STATE');

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
    return () => {};
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
    return () => {};
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
