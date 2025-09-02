/**
 * Professional Cookie Management Utility for Persistent Authentication
 * 
 * Provides secure, persistent login functionality with proper expiration handling,
 * session recovery, and professional-grade security features.
 */

export interface CookieOptions {
  expires?: Date;
  maxAge?: number; // seconds
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export interface PersistentSessionConfig {
  defaultExpirationDays: number;
  sessionExpirationHours: number;
  enableSessionRecovery: boolean;
  secureOnly: boolean;
}

export interface SessionBackup {
  token: string;
  expires: string;
  created: string;
  userAgent: string;
}

/**
 * Professional Cookie Manager for Authentication
 */
export class AuthCookieManager {
  private static readonly COOKIE_NAME = 'payload-token';
  private static readonly BACKUP_KEY = 'auth_session_backup';
  private static readonly CONFIG_KEY = 'auth_session_config';

  private config: PersistentSessionConfig;

  constructor(config?: Partial<PersistentSessionConfig>) {
    this.config = {
      defaultExpirationDays: 30, // Like Facebook/LinkedIn
      sessionExpirationHours: 24, // For non-persistent sessions
      enableSessionRecovery: true,
      secureOnly: typeof window !== 'undefined' && window.location.protocol === 'https:',
      ...config
    };
  }

  /**
   * Set persistent authentication cookie with professional settings
   */
  setPersistentAuthCookie(token: string, persistent: boolean = true): void {
    if (!token) {
      console.error('❌ Cannot set auth cookie: token is required');
      return;
    }

    const expirationDays = persistent 
      ? this.config.defaultExpirationDays 
      : this.config.sessionExpirationHours / 24;

    const expires = new Date();
    expires.setDate(expires.getDate() + expirationDays);

    const cookieOptions: CookieOptions = {
      expires,
      path: '/',
      sameSite: 'lax',
      secure: this.config.secureOnly
    };

    this.setCookie(AuthCookieManager.COOKIE_NAME, token, cookieOptions);

    // Create session backup for recovery
    if (persistent && this.config.enableSessionRecovery) {
      this.createSessionBackup(token, expires);
    }

    console.log(`✅ Persistent auth cookie set (${persistent ? 'persistent' : 'session'})`, {
      expires: expires.toISOString(),
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite
    });
  }

  /**
   * Get authentication token from cookie
   */
  getAuthToken(): string | null {
    return this.getCookie(AuthCookieManager.COOKIE_NAME);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  /**
   * Clear authentication cookie and session data
   */
  clearAuthCookie(): void {
    // Clear the main cookie
    this.deleteCookie(AuthCookieManager.COOKIE_NAME);
    
    // Clear session backup
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(AuthCookieManager.BACKUP_KEY);
      localStorage.removeItem(AuthCookieManager.CONFIG_KEY);
    }

    console.log('✅ Auth cookie and session data cleared');
  }

  /**
   * Attempt to recover session from backup
   */
  recoverSession(): boolean {
    if (!this.config.enableSessionRecovery || typeof localStorage === 'undefined') {
      return false;
    }

    try {
      const backupData = localStorage.getItem(AuthCookieManager.BACKUP_KEY);
      if (!backupData) {
        return false;
      }

      const backup: SessionBackup = JSON.parse(backupData);
      const expirationDate = new Date(backup.expires);

      // Check if backup is still valid
      if (new Date() >= expirationDate) {
        console.log('🗑️ Session backup expired, cleaning up');
        localStorage.removeItem(AuthCookieManager.BACKUP_KEY);
        return false;
      }

      // Verify user agent for security
      if (typeof navigator !== 'undefined' && backup.userAgent !== navigator.userAgent) {
        console.log('🚨 Session backup user agent mismatch, security cleanup');
        localStorage.removeItem(AuthCookieManager.BACKUP_KEY);
        return false;
      }

      // Restore the cookie
      const cookieOptions: CookieOptions = {
        expires: expirationDate,
        path: '/',
        sameSite: 'lax',
        secure: this.config.secureOnly
      };

      this.setCookie(AuthCookieManager.COOKIE_NAME, backup.token, cookieOptions);
      
      console.log('✅ Session recovered from backup', {
        expires: expirationDate.toISOString(),
        created: backup.created
      });

      return true;
    } catch (error) {
      console.error('❌ Session recovery failed:', error);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(AuthCookieManager.BACKUP_KEY);
      }
      return false;
    }
  }

  /**
   * Create session backup for recovery
   */
  private createSessionBackup(token: string, expires: Date): void {
    if (typeof localStorage === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    const backup: SessionBackup = {
      token,
      expires: expires.toISOString(),
      created: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    try {
      localStorage.setItem(AuthCookieManager.BACKUP_KEY, JSON.stringify(backup));
      console.log('💾 Session backup created');
    } catch (error) {
      console.warn('⚠️ Failed to create session backup:', error);
    }
  }

  /**
   * Set cookie with options
   */
  private setCookie(name: string, value: string, options: CookieOptions = {}): void {
    if (typeof document === 'undefined') return;

    let cookieString = `${name}=${encodeURIComponent(value)}`;

    if (options.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }

    if (options.maxAge) {
      cookieString += `; max-age=${options.maxAge}`;
    }

    if (options.path) {
      cookieString += `; path=${options.path}`;
    }

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    if (options.secure) {
      cookieString += '; secure';
    }

    if (options.httpOnly) {
      cookieString += '; httponly';
    }

    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookieString;
  }

  /**
   * Get cookie value
   */
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue ? decodeURIComponent(cookieValue) : null;
    }
    
    return null;
  }

  /**
   * Delete cookie
   */
  private deleteCookie(name: string): void {
    this.setCookie(name, '', {
      expires: new Date(0),
      path: '/',
      secure: this.config.secureOnly,
      sameSite: 'lax'
    });
  }

  /**
   * Get session info for debugging
   */
  getSessionInfo(): {
    isAuthenticated: boolean;
    hasBackup: boolean;
    cookieExpiry: string | null;
    backupExpiry: string | null;
  } {
    const hasBackup = typeof localStorage !== 'undefined' && 
                     !!localStorage.getItem(AuthCookieManager.BACKUP_KEY);
    
    let backupExpiry: string | null = null;
    if (hasBackup && typeof localStorage !== 'undefined') {
      try {
        const backup = JSON.parse(localStorage.getItem(AuthCookieManager.BACKUP_KEY) || '{}');
        backupExpiry = backup.expires || null;
      } catch {
        backupExpiry = null;
      }
    }

    return {
      isAuthenticated: this.isAuthenticated(),
      hasBackup,
      cookieExpiry: null, // Cookie expiry not easily readable from client-side
      backupExpiry
    };
  }
}

/**
 * Default instance with professional settings
 */
export const authCookieManager = new AuthCookieManager({
  defaultExpirationDays: 30, // Facebook/LinkedIn standard
  sessionExpirationHours: 24,
  enableSessionRecovery: true,
  secureOnly: typeof window !== 'undefined' && window.location.protocol === 'https:'
});

/**
 * Utility functions for easy access
 */
export const AuthCookies = {
  /**
   * Set persistent login (30 days)
   */
  setPersistentLogin: (token: string) => authCookieManager.setPersistentAuthCookie(token, true),
  
  /**
   * Set session login (24 hours)
   */
  setSessionLogin: (token: string) => authCookieManager.setPersistentAuthCookie(token, false),
  
  /**
   * Get current auth token
   */
  getToken: () => authCookieManager.getAuthToken(),
  
  /**
   * Check if authenticated
   */
  isAuthenticated: () => authCookieManager.isAuthenticated(),
  
  /**
   * Logout and clear all data
   */
  logout: () => authCookieManager.clearAuthCookie(),
  
  /**
   * Attempt session recovery
   */
  recoverSession: () => authCookieManager.recoverSession(),
  
  /**
   * Get session debug info
   */
  getSessionInfo: () => authCookieManager.getSessionInfo()
};
