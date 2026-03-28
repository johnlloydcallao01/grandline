/**
 * @file apps/web-admin/src/lib/auth.ts
 * @description PayloadCMS Authentication Service
 * Enterprise-grade authentication with HTTP-only cookies and 30-day sessions
 */

import type {
  User,
  AuthResponse,
  LoginCredentials,
  SessionInfo
} from '@/types/auth';

function normalizeApiBaseUrl(raw?: string): string {
  const fallback = 'https://cms.grandlinemaritime.com/api';
  const trimmed = (raw || '').trim();
  let base = trimmed || fallback;

  if (!/^https?:\/\//i.test(base)) {
    base = `https://${base}`;
  }

  base = base.replace(/\/+$/, '');

  if (!/\/api$/i.test(base)) {
    base = `${base}/api`;
  }

  return base;
}

export const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);

export const COLLECTION_SLUG = 'users';

// Request Config
export const REQUEST_CONFIG: RequestInit = {
  credentials: 'omit', // Prevent sending conflicting cookies; rely on Authorization header
  headers: {
    'Content-Type': 'application/json',
  },
};


export async function makeAuthRequest<T>(
  endpoint: string,
  options: RequestInit & { suppressErrorLog?: boolean } = {}
): Promise<T> {
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

import { serverLogin, serverLogout, getServerUser, serverRefresh, getServerToken } from '@/app/actions/auth';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await serverLogin(credentials);

    try {
      localStorage.setItem('grandline_auth_user_admin', JSON.stringify(response.user));
    } catch { void 0; }

    return response;
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : 'Login failed');
  }
}

export async function logout(): Promise<void> {
  try {
    await serverLogout();
  } finally {
    clearAuthState();
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const user = await getServerUser();

    if (!user) {
      clearAuthState();
      return null;
    }

    try {
      localStorage.setItem('grandline_auth_user_admin', JSON.stringify(user));
    } catch { void 0; }

    return user;
  } catch (_error) {
    clearAuthState();
    return null;
  }
}

export async function refreshSession(): Promise<AuthResponse> {
  try {
    const response = await serverRefresh();

    try {
      localStorage.setItem('grandline_auth_user_admin', JSON.stringify(response.user));
    } catch { void 0; }

    return response;
  } catch (error: unknown) {
    clearAuthState();
    throw new Error(error instanceof Error ? error.message : 'Failed to refresh session');
  }
}

export async function checkAuthStatus(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user !== null;
  } catch {
    return false;
  }
}

export function hasValidStoredToken(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const storedToken = localStorage.getItem('grandline_auth_token_admin');
  const storedExpires = localStorage.getItem('grandline_auth_expires_admin');
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

export async function getSessionInfo(): Promise<SessionInfo> {
  try {
    const user = await getServerUser();
    const token = await getServerToken();

    if (!user || !token) {
      return { isValid: false };
    }

    return {
      isValid: true,
      user,
      // Since getServerUser doesn't return exp, we can loosely assume it's valid if user is returned.
      // For precise expiration, we rely on the token itself or let the server reject when expired.
      expiresAt: undefined,
    };
  } catch (_error) {
    return { isValid: false };
  }
}

export function clearAuthState(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('grandline_auth_token_admin');
    localStorage.removeItem('grandline_auth_expires_admin');
    localStorage.removeItem('grandline_auth_user_admin');
    sessionStorage.removeItem('auth:redirectAfterLogin');
    const debug = process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true';
    if (debug) console.log('🧹 CLEARED AUTH STATE');

    window.dispatchEvent(new CustomEvent('auth:logout'));
  }
}

export function isSessionExpired(exp?: number): boolean {
  if (!exp) return true;
  return Date.now() >= exp * 1000;
}

export function getTimeUntilExpiry(exp?: number): number {
  if (!exp) return 0;
  return Math.max(0, exp * 1000 - Date.now());
}

export function getUserDisplayName(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.username) {
    return user.username;
  }
  return user.email;
}

export function emitAuthEvent(event: string, data?: any): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(`auth:${event}`, { detail: data }));
  }
}

export function startSessionMonitoring(): () => void {
  if (typeof window === 'undefined') {
    return () => { };
  }

  const REFRESH_INTERVAL = 25 * 60 * 1000;

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

  return () => {
    clearInterval(intervalId);
  };
}

export function monitorSessionExpiration(): () => void {
  if (typeof window === 'undefined') {
    return () => { };
  }

  const CHECK_INTERVAL = 5 * 60 * 1000;

  const intervalId = setInterval(async () => {
    try {
      const sessionInfo = await getSessionInfo();

      if (!sessionInfo.isValid) {
        // Do not throw an error or trigger loops.
        // The middleware handles hard redirects.
      } else if (sessionInfo.expiresAt) {
        const timeUntilExpiry = sessionInfo.expiresAt.getTime() - Date.now();

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

  return () => {
    clearInterval(intervalId);
  };
}