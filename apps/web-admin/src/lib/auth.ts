/**
 * @file apps/web-admin/src/lib/auth.ts
 * @description Authentication service for admin users
 * Based on apps/web auth service but restricted to admin role only
 */

import { 
  User, 
  AdminUser,
  LoginCredentials, 
  AuthResponse, 
  PayloadAuthResponse, 
  PayloadErrorResponse, 
  PayloadMeResponse,
  SessionInfo,
  AuthErrorType,
  AuthErrorDetails
} from '@/types/auth';

// ========================================
// CONFIGURATION
// ========================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';
const COLLECTION_SLUG = 'users';
const TOKEN_KEY = 'grandline_auth_token';
const EXPIRES_KEY = 'grandline_auth_expires';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// ========================================
// ERROR HANDLING UTILITIES
// ========================================

export class AuthenticationError extends Error {
  public type: AuthErrorType;
  public field?: string;
  public retryable: boolean;

  constructor(type: AuthErrorType, message: string, field?: string, retryable = false) {
    super(message);
    this.name = 'AuthenticationError';
    this.type = type;
    this.field = field;
    this.retryable = retryable;
  }
}

function createAuthError(type: AuthErrorType, message: string, field?: string, retryable = false): AuthErrorDetails {
  return {
    type,
    message,
    field,
    retryable
  };
}

// Type guard functions for error handling
function isErrorWithName(error: unknown): error is { name: string } {
  return typeof error === 'object' && error !== null && 'name' in error;
}

function isErrorWithCode(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}

function isErrorWithStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}

function isErrorWithStatusCode(error: unknown): error is { statusCode: number } {
  return typeof error === 'object' && error !== null && 'statusCode' in error;
}

function isErrorWithMessage(error: unknown): error is { message: string } {
  return typeof error === 'object' && error !== null && 'message' in error;
}

function handleApiError(error: unknown): AuthErrorDetails {
  if (error instanceof AuthenticationError) {
    return createAuthError(error.type, error.message, error.field, error.retryable);
  }

  if ((isErrorWithName(error) && error.name === 'NetworkError') || (isErrorWithCode(error) && error.code === 'NETWORK_ERROR')) {
    return createAuthError('NETWORK_ERROR', 'Network connection failed. Please check your internet connection.', undefined, true);
  }

  if ((isErrorWithStatus(error) && error.status === 401) || (isErrorWithStatusCode(error) && error.statusCode === 401)) {
    return createAuthError('INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  if ((isErrorWithStatus(error) && error.status === 403) || (isErrorWithStatusCode(error) && error.statusCode === 403)) {
    return createAuthError('INVALID_CREDENTIALS', 'Access denied. Admin privileges required.');
  }

  if ((isErrorWithStatus(error) && error.status === 429) || (isErrorWithStatusCode(error) && error.statusCode === 429)) {
    return createAuthError('ACCOUNT_LOCKED', 'Too many login attempts. Please try again later.', undefined, true);
  }

  const errorMessage = isErrorWithMessage(error) ? error.message : 'An unexpected error occurred.';
  return createAuthError('UNKNOWN_ERROR', errorMessage);
}

// ========================================
// API REQUEST UTILITIES
// ========================================

async function makeAuthenticatedRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `JWT ${token}` }),
    ...options.headers,
  };

  try {
    const requestUrl = `${API_BASE_URL}/${endpoint}`;
    console.log('🔗 Making authenticated request:', {
      url: requestUrl,
      endpoint,
      hasToken: !!token
    });
    
    const response = await fetch(requestUrl, {
      ...options,
      headers,
      credentials: 'include',
    });
    
    console.log('🔗 Authenticated request response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      ok: response.ok
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        clearStoredToken();
        throw new AuthenticationError('SESSION_EXPIRED', 'Your session has expired. Please log in again.');
      }
      
      if (response.status === 403) {
        throw new AuthenticationError('INVALID_CREDENTIALS', 'Access denied. Admin privileges required.');
      }

      const errorMessage = errorData.errors?.[0]?.message || errorData.message || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new Error(`Network request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ========================================
// TOKEN MANAGEMENT
// ========================================

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredExpires(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(EXPIRES_KEY);
}

export function setStoredToken(token: string, exp?: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  
  // Store expiration time (30 days from now if not provided)
  const expirationTime = exp ? exp * 1000 : Date.now() + SESSION_DURATION;
  localStorage.setItem(EXPIRES_KEY, expirationTime.toString());
}

export function clearStoredToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_KEY);
}

export function hasValidStoredToken(): boolean {
  const token = getStoredToken();
  const expires = getStoredExpires();
  
  if (!token || !expires) return false;
  
  const expirationTime = parseInt(expires);
  return Date.now() < expirationTime;
}

export function isTokenExpired(exp?: number): boolean {
  if (!exp) return true;
  return Date.now() >= exp * 1000;
}

// ========================================
// ROLE VALIDATION
// ========================================

// Admin user validation
export function isAdminUser(user: User): user is AdminUser {
  return user.role === 'admin';
}

// Validate admin access
export function validateAdminAccess(user: User): void {
  if (!isAdminUser(user)) {
    throw new AuthenticationError(
      'ACCESS_DENIED',
      'Admin access required. Only administrators can access this application.',
      'role'
    );
  }
}

// ========================================
// CORE AUTHENTICATION FUNCTIONS
// ========================================

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const loginUrl = `${API_BASE_URL}/${COLLECTION_SLUG}/login`;
    console.log('🔐 Login attempt:', {
      url: loginUrl,
      apiBaseUrl: API_BASE_URL,
      collectionSlug: COLLECTION_SLUG,
      email: credentials.email
    });
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    
    console.log('🔐 Login response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      ok: response.ok
    });

    if (!response.ok) {
      const errorData: PayloadErrorResponse = await response.json().catch(() => ({ 
        errors: [{ message: `HTTP ${response.status}` }] 
      }));
      
      const errorMessage = errorData.errors?.[0]?.message || 'Login failed';
      
      if (response.status === 401) {
        throw new AuthenticationError('INVALID_CREDENTIALS', 'Invalid email or password.');
      }
      
      if (response.status === 429) {
        throw new AuthenticationError('ACCOUNT_LOCKED', 'Too many login attempts. Please try again later.', undefined, true);
      }
      
      throw new AuthenticationError('UNKNOWN_ERROR', errorMessage);
    }

    const data: PayloadAuthResponse = await response.json();
    
    // Check if user has admin role
    if (data.user.role !== 'admin') {
      console.log('❌ ROLE DENIED:', data.user.role);
      throw new AuthenticationError('ACCESS_DENIED', 'Access denied. Only admins can access this application.');
    }

    console.log('✅ ADMIN ROLE CONFIRMED');
    
    // Store the token if provided
    if (data.token) {
      setStoredToken(data.token, data.exp);
      console.log('💾 Token stored with expiration:', data.exp);
    }

    return {
      message: data.message,
      user: data.user,
      token: data.token,
      exp: data.exp,
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError('NETWORK_ERROR', 'Network connection failed. Please check your internet connection.', undefined, true);
  }
}

export async function logout(): Promise<void> {
  try {
    await makeAuthenticatedRequest(`${COLLECTION_SLUG}/logout`, {
      method: 'POST',
    });
  } catch (error) {
    // Continue with logout even if API call fails
    console.warn('Logout API call failed:', error);
  } finally {
    clearStoredToken();
  }
}

export async function getCurrentUser(): Promise<User | null> {
  console.log('🔍 CHECKING CURRENT USER...');

  // Check if we have a valid stored token first
  if (!hasValidStoredToken()) {
    console.log('❌ NO VALID STORED TOKEN');
    return null;
  }

  const token = getStoredToken();
  console.log('✅ VALID TOKEN FOUND, checking with PayloadCMS...');

  try {
    // Use token-based authentication with depth parameter
    const response = await fetch(`${API_BASE_URL}/${COLLECTION_SLUG}/me?depth=2`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${token}`, // PayloadCMS uses JWT prefix
      },
    });

    if (!response.ok) {
      console.log('❌ TOKEN VALIDATION FAILED');
      clearStoredToken();
      return null;
    }

    const data = await response.json();

    if (data.user) {
      console.log('✅ USER FOUND:', {
        email: data.user.email,
        role: data.user.role,
        id: data.user.id
      });

      // Check if user has admin role
      if (data.user.role !== 'admin') {
        console.log('❌ ACCESS DENIED: User is not admin');
        clearStoredToken();
        throw new AuthenticationError('ACCESS_DENIED', 'Access denied. Admin role required.');
      }

      console.log('✅ ADMIN ROLE CONFIRMED');
      return data.user as AdminUser;
    } else {
      console.log('❌ NO USER DATA IN RESPONSE');
      clearStoredToken();
      return null;
    }
  } catch (error) {
    console.log('❌ getCurrentUser ERROR:', error);
    clearStoredToken();
    if (error instanceof AuthenticationError) {
      throw error;
    }
    return null;
  }
}

export async function refreshSession(): Promise<User | null> {
  try {
    const token = getStoredToken();
    if (!token) {
      throw new AuthenticationError('SESSION_EXPIRED', 'No active session found.');
    }

    const data: PayloadMeResponse = await makeAuthenticatedRequest(`${COLLECTION_SLUG}/refresh-token`, {
      method: 'POST',
    });

    if (!data.user) {
      clearStoredToken();
      throw new AuthenticationError('SESSION_EXPIRED', 'Session refresh failed.');
    }

    // Validate that the user is still an admin
    validateAdminAccess(data.user);

    return data.user;
  } catch (error) {
    clearStoredToken();
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError('SESSION_EXPIRED', 'Session refresh failed.');
  }
}

export async function checkAuthStatus(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user !== null && user.role === 'admin';
  } catch {
    return false;
  }
}

export function getSessionInfo(): SessionInfo {
  const token = getStoredToken();
  
  if (!token) {
    return { isValid: false };
  }

  try {
    // Decode JWT token to get expiration (basic implementation)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = new Date(payload.exp * 1000);
    
    return {
      isValid: !isTokenExpired(payload.exp),
      expiresAt,
    };
  } catch {
    return { isValid: false };
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

export function formatAuthError(error: AuthErrorDetails): string {
  switch (error.type) {
    case 'INVALID_CREDENTIALS':
      return 'Invalid email or password. Please check your credentials and try again.';

    case 'SESSION_EXPIRED':
      return 'Your session has expired. Please log in again.';
    case 'ACCOUNT_LOCKED':
      return 'Account temporarily locked due to multiple failed attempts. Please try again later.';
    case 'NETWORK_ERROR':
      return 'Network connection failed. Please check your internet connection and try again.';
    case 'VALIDATION_ERROR':
      return error.message || 'Please check your input and try again.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
}

// ========================================
// EVENT EMISSION
// ========================================

export function emitAuthEvent(event: string, data?: unknown): void {
  if (typeof window !== 'undefined') {
    const customEvent = new CustomEvent(`auth:${event}`, {
      detail: {
        event,
        data,
        timestamp: new Date().toISOString(),
      },
    });
    window.dispatchEvent(customEvent);
  }
}

// ========================================
// SESSION MONITORING
// ========================================

export function startSessionMonitoring(): () => void {
  let intervalId: NodeJS.Timeout;
  
  const checkSession = async () => {
    try {
      if (!hasValidStoredToken()) {
        emitAuthEvent('session_expired');
        return;
      }
      
      // Periodically validate with server
      const user = await getCurrentUser();
      if (!user) {
        emitAuthEvent('session_expired');
      }
    } catch (error) {
      console.log('Session check failed:', error);
      emitAuthEvent('session_expired');
    }
  };
  
  // Check every 5 minutes
  intervalId = setInterval(checkSession, 5 * 60 * 1000);
  
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}

export function monitorSessionExpiration(): () => void {
  let timeoutId: NodeJS.Timeout;
  
  const scheduleExpirationCheck = () => {
    const expires = getStoredExpires();
    if (!expires) return;
    
    const expirationTime = parseInt(expires);
    const timeUntilExpiration = expirationTime - Date.now();
    
    if (timeUntilExpiration > 0) {
      timeoutId = setTimeout(() => {
        emitAuthEvent('session_expired');
      }, timeUntilExpiration);
    }
  };
  
  scheduleExpirationCheck();
  
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}

export function clearAuthState(): void {
  clearStoredToken();
  emitAuthEvent('logout');
}

export { handleApiError, createAuthError };