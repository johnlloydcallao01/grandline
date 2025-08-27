/**
 * Payload CMS Authentication for Web Admin
 * 
 * This handles authentication with Payload CMS using email/password
 */

import { env } from './env';

export interface PayloadUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super-admin' | 'admin' | 'editor' | 'viewer';
  isActive: boolean;
  token?: string;
}

export interface PayloadAuthResponse {
  message?: string;
  user?: PayloadUser;
  token?: string;
  exp?: number;
}

export class PayloadAuthClient {
  private baseUrl: string;
  private token: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    // Try to get token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('payload-token');
      const expiry = localStorage.getItem('payload-token-expiry');
      this.tokenExpiry = expiry ? parseInt(expiry, 10) : null;

      // Check if token is expired
      if (this.tokenExpiry && Date.now() > this.tokenExpiry) {
        this.clearToken();
      }
    }
  }

  private clearToken() {
    this.token = null;
    this.tokenExpiry = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('payload-token');
      localStorage.removeItem('payload-token-expiry');
    }
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<PayloadAuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Login failed:', response.status, errorText);
      throw new Error(`Login failed: ${response.statusText}`);
    }

    const data: PayloadAuthResponse = await response.json();

    if (data.token) {
      this.token = data.token;
      // Set expiry to 24 hours from now (or use exp from response if available)
      this.tokenExpiry = data.exp ? data.exp * 1000 : Date.now() + (24 * 60 * 60 * 1000);

      if (typeof window !== 'undefined') {
        localStorage.setItem('payload-token', data.token);
        localStorage.setItem('payload-token-expiry', this.tokenExpiry.toString());
      }
    }

    return data;
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    if (!this.token) return;

    try {
      await fetch(`${this.baseUrl}/api/users/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `JWT ${this.token}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearToken();
    }
  }

  /**
   * Get current user
   */
  async me(): Promise<PayloadUser | null> {
    if (!this.token) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/users/me`, {
        headers: {
          'Authorization': `JWT ${this.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, clear it
          this.clearToken();
        }
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Me request failed:', error);
      return null;
    }
  }

  /**
   * Get authorization header for API requests
   */
  getAuthHeader(): Record<string, string> {
    if (!this.token) return {};
    return {
      'Authorization': `JWT ${this.token}`,
    };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (!this.token) return false;

    // Check if token is expired
    if (this.tokenExpiry && Date.now() > this.tokenExpiry) {
      this.clearToken();
      return false;
    }

    return true;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token;
  }
}

// Create singleton instance
export const payloadAuth = new PayloadAuthClient(
  env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://grandline-cms.vercel.app'
);

/**
 * Hook for Payload authentication state
 */
export function usePayloadAuth() {
  // This would be implemented with React state management
  // For now, return the client
  return payloadAuth;
}
