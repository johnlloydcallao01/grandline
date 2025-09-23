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

const API_BASE_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001';
const COLLECTION_SLUG = 'users';
const TOKEN_KEY = 'payload-token';
const _SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

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
    return createAuthError('ACCESS_DENIED', 'Access denied. Admin privileges required.');
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
    const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        clearStoredToken();
        throw new AuthenticationError('SESSION_EXPIRED', 'Your session has expired. Please log in again.');
      }
      
      if (response.status === 403) {
        throw new AuthenticationError('ACCESS_DENIED', 'Access denied. Admin privileges required.');
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

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export function isTokenExpired(exp?: number): boolean {
  if (!exp) return true;
  return Date.now() >= exp * 1000;
}

// ========================================
// ROLE VALIDATION
// ========================================

export function isAdminUser(user: User | null): user is AdminUser {
  return user?.role === 'admin';
}

export function validateAdminAccess(user: User | null): void {
  if (!user) {
    throw new AuthenticationError('INVALID_CREDENTIALS', 'Authentication required.');
  }
  
  if (!isAdminUser(user)) {
    throw new AuthenticationError('ACCESS_DENIED', 'Access denied. Admin privileges required.');
  }
}

// ========================================
// CORE AUTHENTICATION FUNCTIONS
// ========================================

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/${COLLECTION_SLUG}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
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
    
    // Validate that the user is an admin
    validateAdminAccess(data.user);
    
    // Store the token if provided
    if (data.token) {
      setStoredToken(data.token);
    }

    return {
      message: data.message,
      user: data.user as AdminUser,
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
  try {
    const token = getStoredToken();
    if (!token) {
      return null;
    }

    const data: PayloadMeResponse = await makeAuthenticatedRequest(`${COLLECTION_SLUG}/me`);
    
    if (!data.user) {
      clearStoredToken();
      return null;
    }

    // Validate that the user is an admin
    validateAdminAccess(data.user);
    
    // Check if token is expired
    if (data.exp && isTokenExpired(data.exp)) {
      clearStoredToken();
      throw new AuthenticationError('SESSION_EXPIRED', 'Your session has expired. Please log in again.');
    }

    return data.user;
  } catch (error) {
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
    return user !== null && isAdminUser(user);
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
    case 'ACCESS_DENIED':
      return 'Access denied. This application is restricted to admin users only.';
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

export { handleApiError, createAuthError };