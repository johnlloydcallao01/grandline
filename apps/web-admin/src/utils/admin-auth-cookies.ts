/**
 * Professional Admin Cookie Management Utility for Persistent Authentication
 * 
 * Provides secure, persistent admin login functionality with proper expiration handling,
 * session recovery, and professional-grade security features specifically for admin users.
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

export interface AdminPersistentSessionConfig {
  defaultExpirationDays: number;
  sessionExpirationHours: number;
  enableSessionRecovery: boolean;
  secureOnly: boolean;
}

export interface AdminSessionBackup {
  token: string;
  expires: string;
  created: string;
  userAgent: string;
  role: string; // Admin-specific: track role
}

/**
 * Professional Admin Cookie Manager for Authentication
 */
export class AdminAuthCookieManager {
  private static readonly COOKIE_NAME = 'payload-token';
  private static readonly BACKUP_KEY = 'admin_auth_session_backup';
  private static readonly CONFIG_KEY = 'admin_auth_session_config';

  private config: AdminPersistentSessionConfig;

  constructor(config?: Partial<AdminPersistentSessionConfig>) {
    this.config = {
      defaultExpirationDays: 30, // Like Facebook/LinkedIn
      sessionExpirationHours: 24, // For non-persistent sessions
      enableSessionRecovery: true,
      secureOnly: typeof window !== 'undefined' && window.location.protocol === 'https:',
      ...config
    };
  }

  /**
   * Set persistent admin authentication cookie with professional settings
   */
  setPersistentAdminAuthCookie(token: string, persistent: boolean = true): void {
    if (!token) {
      console.error('❌ Cannot set admin auth cookie: token is required');
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

    this.setCookie(AdminAuthCookieManager.COOKIE_NAME, token, cookieOptions);

    // Create admin session backup for recovery
    if (persistent && this.config.enableSessionRecovery) {
      this.createAdminSessionBackup(token, expires);
    }

    console.log(`✅ Persistent admin auth cookie set (${persistent ? 'persistent' : 'session'})`, {
      expires: expires.toISOString(),
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite
    });
  }

  /**
   * Get admin authentication token from cookie
   */
  getAdminAuthToken(): string | null {
    return this.getCookie(AdminAuthCookieManager.COOKIE_NAME);
  }

  /**
   * Check if admin is authenticated
   */
  isAdminAuthenticated(): boolean {
    return !!this.getAdminAuthToken();
  }

  /**
   * Clear admin authentication cookie and session data
   */
  clearAdminAuthCookie(): void {
    // Clear the main cookie
    this.deleteCookie(AdminAuthCookieManager.COOKIE_NAME);
    
    // Clear admin session backup
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(AdminAuthCookieManager.BACKUP_KEY);
      localStorage.removeItem(AdminAuthCookieManager.CONFIG_KEY);
    }

    console.log('✅ Admin auth cookie and session data cleared');
  }

  /**
   * Attempt to recover admin session from backup
   */
  recoverAdminSession(): boolean {
    if (!this.config.enableSessionRecovery || typeof localStorage === 'undefined') {
      return false;
    }

    try {
      const backupData = localStorage.getItem(AdminAuthCookieManager.BACKUP_KEY);
      if (!backupData) {
        return false;
      }

      const backup: AdminSessionBackup = JSON.parse(backupData);
      const expirationDate = new Date(backup.expires);

      // Check if backup is still valid
      if (new Date() >= expirationDate) {
        console.log('🗑️ Admin session backup expired, cleaning up');
        localStorage.removeItem(AdminAuthCookieManager.BACKUP_KEY);
        return false;
      }

      // Verify user agent for security
      if (typeof navigator !== 'undefined' && backup.userAgent !== navigator.userAgent) {
        console.log('🚨 Admin session backup user agent mismatch, security cleanup');
        localStorage.removeItem(AdminAuthCookieManager.BACKUP_KEY);
        return false;
      }

      // Admin-specific: Verify role is still admin
      if (backup.role !== 'admin') {
        console.log('🚨 Admin session backup role mismatch, security cleanup');
        localStorage.removeItem(AdminAuthCookieManager.BACKUP_KEY);
        return false;
      }

      // Restore the cookie
      const cookieOptions: CookieOptions = {
        expires: expirationDate,
        path: '/',
        sameSite: 'lax',
        secure: this.config.secureOnly
      };

      this.setCookie(AdminAuthCookieManager.COOKIE_NAME, backup.token, cookieOptions);
      
      console.log('✅ Admin session recovered from backup', {
        expires: expirationDate.toISOString(),
        created: backup.created,
        role: backup.role
      });

      return true;
    } catch (error) {
      console.error('❌ Admin session recovery failed:', error);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(AdminAuthCookieManager.BACKUP_KEY);
      }
      return false;
    }
  }

  /**
   * Create admin session backup for recovery
   */
  private createAdminSessionBackup(token: string, expires: Date): void {
    if (typeof localStorage === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    const backup: AdminSessionBackup = {
      token,
      expires: expires.toISOString(),
      created: new Date().toISOString(),
      userAgent: navigator.userAgent,
      role: 'admin' // Admin-specific role tracking
    };

    try {
      localStorage.setItem(AdminAuthCookieManager.BACKUP_KEY, JSON.stringify(backup));
      console.log('💾 Admin session backup created');
    } catch (error) {
      console.warn('⚠️ Failed to create admin session backup:', error);
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
   * Get admin session info for debugging
   */
  getAdminSessionInfo(): {
    isAuthenticated: boolean;
    hasBackup: boolean;
    cookieExpiry: string | null;
    backupExpiry: string | null;
    role: string | null;
  } {
    const hasBackup = typeof localStorage !== 'undefined' && 
                     !!localStorage.getItem(AdminAuthCookieManager.BACKUP_KEY);
    
    let backupExpiry: string | null = null;
    let role: string | null = null;
    
    if (hasBackup && typeof localStorage !== 'undefined') {
      try {
        const backup = JSON.parse(localStorage.getItem(AdminAuthCookieManager.BACKUP_KEY) || '{}');
        backupExpiry = backup.expires || null;
        role = backup.role || null;
      } catch {
        backupExpiry = null;
        role = null;
      }
    }

    return {
      isAuthenticated: this.isAdminAuthenticated(),
      hasBackup,
      cookieExpiry: null, // Cookie expiry not easily readable from client-side
      backupExpiry,
      role
    };
  }
}

/**
 * Default instance with professional admin settings
 */
export const adminAuthCookieManager = new AdminAuthCookieManager({
  defaultExpirationDays: 30, // Facebook/LinkedIn standard
  sessionExpirationHours: 24,
  enableSessionRecovery: true,
  secureOnly: typeof window !== 'undefined' && window.location.protocol === 'https:'
});

/**
 * Utility functions for easy admin access
 */
export const AdminAuthCookies = {
  /**
   * Set persistent admin login (30 days)
   */
  setPersistentAdminLogin: (token: string) => adminAuthCookieManager.setPersistentAdminAuthCookie(token, true),
  
  /**
   * Set session admin login (24 hours)
   */
  setSessionAdminLogin: (token: string) => adminAuthCookieManager.setPersistentAdminAuthCookie(token, false),
  
  /**
   * Get current admin auth token
   */
  getAdminToken: () => adminAuthCookieManager.getAdminAuthToken(),
  
  /**
   * Check if admin authenticated
   */
  isAdminAuthenticated: () => adminAuthCookieManager.isAdminAuthenticated(),
  
  /**
   * Admin logout and clear all data
   */
  adminLogout: () => adminAuthCookieManager.clearAdminAuthCookie(),
  
  /**
   * Attempt admin session recovery
   */
  recoverAdminSession: () => adminAuthCookieManager.recoverAdminSession(),
  
  /**
   * Get admin session debug info
   */
  getAdminSessionInfo: () => adminAuthCookieManager.getAdminSessionInfo()
};
