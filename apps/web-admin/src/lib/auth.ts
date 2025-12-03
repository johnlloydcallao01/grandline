/**
 * @file apps/web-admin/src/lib/auth.ts
 * @description Authentication service for admin users
 * Based on apps/web auth service but restricted to admin role only
 */

/* eslint-disable no-unreachable */

import { 
  User, 
  AdminUser,
  LoginCredentials, 
  AuthResponse, 
  PayloadAuthResponse, 
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
    const authError = handleApiError(error);
    throw new AuthenticationError(authError.type, authError.message, authError.field, authError.retryable);
  }
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
    const data: PayloadAuthResponse = await makeAuthRequest('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Check if user has admin role
    if (data.user.role !== 'admin') {
      throw new AuthenticationError('ACCESS_DENIED', 'Access denied. Only admins can access this application.');
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
    
    const authError = handleApiError(error);
    throw new AuthenticationError(authError.type, authError.message, authError.field, authError.retryable);
  }
}

export async function logout(): Promise<void> {
  try {
    await makeAuthRequest('/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Continue with logout even if API call fails
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await makeAuthRequest<PayloadMeResponse>('/me');
    
    if (response.user?.role !== 'admin') {
      throw new AuthenticationError('ACCESS_DENIED', 'Access denied. Only admins can access this application.');
    }
    
    return response.user;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    
    return null;
  }
}

export async function refreshSession(): Promise<User | null> {
  try {
    const data: PayloadMeResponse = await makeAuthRequest('/refresh-token', {
      method: 'POST',
    });

    if (!data.user) {
      throw new AuthenticationError('SESSION_EXPIRED', 'Session refresh failed.');
    }

    // Validate that the user is still an admin
    validateAdminAccess(data.user);

    return data.user;
  } catch (error) {
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
  try {
    // For cookie-based auth, we can't easily check expiration client-side
    // Return basic info and let server validation determine actual status
    return {
      isValid: true, // Will be validated by server calls
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

export function clearAuthState(): void {
  emitAuthEvent('logout');
}

export { handleApiError, createAuthError };