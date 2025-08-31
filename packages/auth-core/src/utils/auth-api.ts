/**
 * PayloadCMS Authentication API utilities
 * Extracted from apps/web-admin/src/hooks/useAuth.ts
 */

import type { AuthUser } from '../types/auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token?: string;
  message?: string;
}

export class PayloadCMSAuth {
  private apiUrl: string;
  private cookieName: string;

  constructor(apiUrl: string, cookieName: string = 'payload-token') {
    this.apiUrl = apiUrl;
    this.cookieName = cookieName;
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${this.apiUrl}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include', // Important for cookie handling
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || 'Login failed');
    }

    const result = await response.json();

    // If we have a custom cookie name (not the default), we need to copy the cookie
    if (this.cookieName !== 'payload-token' && typeof document !== 'undefined') {
      console.log('🔄 Setting up custom cookie:', this.cookieName);

      // Get the PayloadCMS token that was just set
      const payloadToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('payload-token='))
        ?.split('=')[1];

      console.log('🍪 PayloadCMS token found:', payloadToken ? 'Yes' : 'No');

      if (payloadToken) {
        // Set our custom cookie with the same token
        const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
        const cookieString = `${this.cookieName}=${payloadToken}; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`;
        document.cookie = cookieString;
        console.log('✅ Custom cookie set:', cookieString);

        // Clear the default PayloadCMS cookie to avoid conflicts
        document.cookie = 'payload-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        console.log('🗑️ Default PayloadCMS cookie cleared');

        // Verify the cookie was set
        const verification = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${this.cookieName}=`));
        console.log('🔍 Cookie verification:', verification ? 'Success' : 'Failed');
      } else {
        console.warn('⚠️ No PayloadCMS token found to copy');
      }
    }

    return result;
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // Get the payload token from cookies
      const payloadToken = this.getPayloadToken();

      const response = await fetch(`${this.apiUrl}/users/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': payloadToken ? `payload-token=${payloadToken}` : '',
          ...(payloadToken && { 'Authorization': `Bearer ${payloadToken}` })
        }
      });

      if (!response.ok) {
        return null;
      }

      const userData = await response.json();
      
      // Handle PayloadCMS complex response structure
      let extractedUser: any = null;
      if (userData.user) {
        // Structure: { user: {...}, message: "Account", token: "..." }
        extractedUser = userData.user;
      } else if (userData.id && userData.email) {
        // Structure: { id, email, firstName, ... }
        extractedUser = userData;
      }

      return extractedUser;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/users/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear cookies regardless of API response
      this.clearAuthCookies();
    }
  }

  /**
   * Get PayloadCMS token from cookies
   */
  private getPayloadToken(): string | undefined {
    if (typeof document === 'undefined') return undefined;

    return document.cookie
      .split('; ')
      .find(row => row.startsWith(`${this.cookieName}=`))
      ?.split('=')[1];
  }

  /**
   * Clear authentication cookies
   */
  clearAuthCookies(): void {
    if (typeof document === 'undefined') return;

    // Clear our app-specific cookie
    document.cookie = `${this.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

    // Also clear the default PayloadCMS cookie if it exists
    document.cookie = 'payload-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
}
