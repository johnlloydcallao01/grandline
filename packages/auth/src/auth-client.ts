/**
 * PayloadCMS Session-Based Authentication Client
 *
 * Handles authentication with PayloadCMS backend using session-based authentication.
 * Uses HTTP-only cookies and express-session for secure, reliable authentication.
 *
 * NO MORE JWT - 100% Session-Based Authentication
 */

import type { AuthUser, LoginCredentials } from './types';

export type Login = (args: LoginCredentials) => Promise<void>;
export type Logout = () => Promise<void>;

export interface PayloadAuthConfig {
  apiUrl: string;
  requiredRole?: string | string[];
  debug?: boolean;
  sessionTimeout?: number; // in milliseconds
  maxRetries?: number;
  retryDelay?: number; // in milliseconds
}

export class PayloadAuthClient {
  private config: PayloadAuthConfig;
  private sessionCheckInterval?: NodeJS.Timeout;

  constructor(config: PayloadAuthConfig) {
    this.config = {
      debug: false,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes default
      maxRetries: 3,
      retryDelay: 1000, // 1 second
      ...config,
    };
  }

  /**
   * Secure fetch with retry logic and proper error handling
   */
  private async secureFetch(url: string, options: RequestInit = {}, retryCount = 0): Promise<Response> {
    const secureHeaders = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // CSRF protection
      ...options.headers,
    };

    const secureOptions: RequestInit = {
      ...options,
      credentials: 'include', // Essential for PayloadCMS cookies
      headers: secureHeaders,
    };

    try {
      const response = await fetch(url, secureOptions);

      // Handle rate limiting
      if (response.status === 429 && retryCount < this.config.maxRetries!) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.config.retryDelay! * Math.pow(2, retryCount);

        if (this.config.debug) {
          console.log(`⏳ Rate limited, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.config.maxRetries})`);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
        return this.secureFetch(url, options, retryCount + 1);
      }

      return response;
    } catch (error) {
      if (retryCount < this.config.maxRetries!) {
        const delay = this.config.retryDelay! * Math.pow(2, retryCount);

        if (this.config.debug) {
          console.log(`🔄 Network error, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.config.maxRetries})`);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
        return this.secureFetch(url, options, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Login using PayloadCMS Session-Based Authentication
   * Uses HTTP-only cookies and express-session - NO JWT
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    if (this.config.debug) {
      console.log('🔐 PayloadCMS session-based login initiated...');
      console.log('📧 Email:', credentials.email);
      console.log('🌐 API URL:', this.config.apiUrl);
    }

    // Input validation
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    if (!this.isValidEmail(credentials.email)) {
      throw new Error('Invalid email format');
    }

    const res = await this.secureFetch(`${this.config.apiUrl}/users/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));

      // Enhanced error messages for different scenarios
      if (res.status === 401) {
        throw new Error('Invalid email or password');
      } else if (res.status === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      } else if (res.status === 403) {
        throw new Error('Account is disabled or requires verification');
      } else {
        throw new Error(errorData.message || `Login failed (${res.status})`);
      }
    }

    const json = await res.json();

    if (this.config.debug) {
      console.log('🔍 PayloadCMS session login response:', {
        hasUser: !!json.user,
        setCookieHeader: res.headers.get('set-cookie'),
        sessionCookie: res.headers.get('set-cookie')?.includes('payload-session'),
        userRole: json.user?.role
      });
    }

    if (!json.user) {
      throw new Error('No user data returned from login');
    }

    // PayloadCMS with express-session automatically sets HTTP-only session cookies
    // No manual token management needed - sessions are handled by the server
    if (this.config.debug) {
      console.log('✅ PayloadCMS session-based login successful');
      console.log('🍪 Session cookie set by server (HTTP-only)');
      console.log('👤 User authenticated:', {
        id: json.user.id,
        email: json.user.email,
        role: json.user.role,
        firstName: json.user.firstName,
        lastName: json.user.lastName
      });
    }

    // Validate user is active
    if (json.user.isActive === false) {
      throw new Error('Account is inactive. Please contact administrator.');
    }

    // Validate user role if required
    if (this.config.requiredRole && !this.validateUserRole(json.user)) {
      const required = Array.isArray(this.config.requiredRole)
        ? this.config.requiredRole.join(' or ')
        : this.config.requiredRole;
      throw new Error(`Access denied. Required role: ${required}. Current role: ${json.user.role}`);
    }

    if (this.config.debug) {
      console.log('✅ PayloadCMS login successful - returning user data:', {
        id: json.user.id,
        email: json.user.email,
        role: json.user.role,
        firstName: json.user.firstName,
        lastName: json.user.lastName,
        isActive: json.user.isActive,
        fullUserObject: json.user
      });
    }

    return json.user;
  }

  /**
   * Email validation utility
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Logout using PayloadCMS Session-Based Authentication
   * Destroys server-side session and clears session cookies
   */
  async logout(): Promise<void> {
    try {
      // Clear session check interval
      if (this.sessionCheckInterval) {
        clearInterval(this.sessionCheckInterval);
        this.sessionCheckInterval = undefined;
      }

      // Call PayloadCMS logout endpoint to destroy server-side session
      await this.secureFetch(`${this.config.apiUrl}/users/logout`, {
        method: 'POST',
      }).catch(() => {
        // Ignore errors from logout endpoint
        if (this.config.debug) {
          console.log('⚠️ PayloadCMS logout endpoint failed, but continuing...');
        }
      });
    } catch (error) {
      // Ignore all logout API errors
    }

    // Clear session cookies manually (backup)
    if (typeof window !== 'undefined') {
      // Clear session-based cookie names (NO JWT tokens)
      const sessionCookiesToClear = ['payload-session', 'connect.sid', 'session'];

      sessionCookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${window.location.hostname}`;
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      });
    }

    if (this.config.debug) {
      console.log('✅ Session-based logout completed (session destroyed)');
    }
  }

  /**
   * Get current user using PayloadCMS Session-Based Authentication
   * Relies entirely on HTTP-only session cookies set by express-session
   * NO JWT tokens involved - pure session-based authentication
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const result = await this.secureFetch(`${this.config.apiUrl}/users/me`);

      if (this.config.debug) {
        console.log('🔍 Session-based getCurrentUser response:', result.status);
      }

      if (!result.ok) {
        if (this.config.debug) {
          console.log('⚠️ No valid session found - user not authenticated');
        }
        return null;
      }

      const json = await result.json();
      const user = json.user || null;

      // Validate role if user exists and role is required
      if (user && this.config.requiredRole && !this.validateUserRole(user)) {
        if (this.config.debug) {
          console.log('❌ User role validation failed:', user.role);
        }
        return null;
      }

      return user;
    } catch (error) {
      if (this.config.debug) {
        console.error('Failed to get current user:', error);
      }
      return null;
    }
  }

  /**
   * Validate user role against configuration
   */
  private validateUserRole(user: AuthUser): boolean {
    if (!this.config.requiredRole) return true;

    if (Array.isArray(this.config.requiredRole)) {
      return this.config.requiredRole.includes(user.role);
    }

    return user.role === this.config.requiredRole;
  }
}
