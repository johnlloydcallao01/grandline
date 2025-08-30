/**
 * Authentication client for PayloadCMS integration
 */

import type { AuthConfig, LoginCredentials, AuthResponse, AuthError, AuthUser } from './types';

export class AuthClient {
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = {
      cookieName: 'payload-token',
      debug: false,
      ...config,
    };
  }

  /**
   * Authenticate user with PayloadCMS
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      if (this.config.debug) {
        console.log('🔐 PayloadCMS login initiated...');
        console.log('📧 Email:', credentials.email);
        console.log('🌐 API URL:', this.config.apiUrl);
      }

      const response = await fetch(`${this.config.apiUrl}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // Important for cookie handling
      });

      if (this.config.debug) {
        console.log('📡 Login response status:', response.status);
        console.log('📡 Login response headers:', response.headers);
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      // Validate user is active
      if (!result.user.isActive) {
        throw new Error('Account is inactive. Please contact administrator.');
      }

      if (this.config.debug) {
        console.log('✅ PayloadCMS login successful:', {
          email: result.user.email,
          role: result.user.role,
          isActive: result.user.isActive,
          token: result.token ? 'Present' : 'Missing'
        });
      }

      // Handle cookie setting if needed
      if (typeof window !== 'undefined' && result.token && !document.cookie.includes(this.config.cookieName!)) {
        if (this.config.debug) {
          console.log('⚠️ PayloadCMS did not set cookie, setting manually...');
        }
        document.cookie = `${this.config.cookieName}=${result.token}; path=/; SameSite=Lax`;
        if (this.config.debug) {
          console.log('✅ Cookie set manually');
        }
      }

      return result;
    } catch (error) {
      if (this.config.debug) {
        console.error('❌ PayloadCMS login failed:', error);
      }
      throw error;
    }
  }

  /**
   * Validate user role against configuration
   */
  validateUserRole(user: AuthUser): boolean {
    // If no role requirements, allow all authenticated users
    if (!this.config.requiredRole && !this.config.allowedRoles) {
      return true;
    }

    // Check required role (exact match)
    if (this.config.requiredRole) {
      if (Array.isArray(this.config.requiredRole)) {
        return this.config.requiredRole.includes(user.role);
      }
      return user.role === this.config.requiredRole;
    }

    // Check allowed roles
    if (this.config.allowedRoles) {
      return this.config.allowedRoles.includes(user.role);
    }

    return false;
  }

  /**
   * Check if user has valid authentication cookie
   */
  hasAuthCookie(): boolean {
    if (typeof window === 'undefined') return false;
    return document.cookie.includes(this.config.cookieName!);
  }

  /**
   * Clear authentication cookie
   */
  clearAuthCookie(): void {
    if (typeof window === 'undefined') return;
    document.cookie = `${this.config.cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  /**
   * Get current user from API
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await fetch(`${this.config.apiUrl}/users/me`, {
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      return result.user || null;
    } catch (error) {
      if (this.config.debug) {
        console.error('Failed to get current user:', error);
      }
      return null;
    }
  }
}
