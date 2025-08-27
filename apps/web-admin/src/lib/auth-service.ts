/**
 * PayloadCMS Authentication Service for Web Admin
 * 
 * Handles authentication with PayloadCMS backend for admin users
 */

import { env } from './env';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'instructor' | 'trainee';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  message?: string;
  user?: AdminUser;
  token?: string;
  exp?: number;
}

export interface AuthError {
  message: string;
  status: number;
  details?: unknown;
}

class AuthService {
  private baseUrl: string;
  private token: string | null = null;
  private user: AdminUser | null = null;

  constructor() {
    this.baseUrl = env.NEXT_PUBLIC_API_URL || 'https://grandline-cms.vercel.app/api';
    
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin_token');
    }
  }

  /**
   * Login admin user with PayloadCMS
   */
  async login(credentials: LoginCredentials): Promise<{ user: AdminUser; token: string }> {
    try {
      console.log('🔐 Attempting admin login...');
      console.log('📍 API URL:', `${this.baseUrl}/users/login`);
      
      const response = await fetch(`${this.baseUrl}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('📡 Login response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Login failed:', errorData);
        
        throw new Error(
          errorData.message || 
          errorData.errors?.[0]?.message || 
          `Login failed with status ${response.status}`
        );
      }

      const data: AuthResponse = await response.json();
      console.log('✅ Login successful:', { hasUser: !!data.user, hasToken: !!data.token });

      if (!data.user || !data.token) {
        throw new Error('Invalid response from server');
      }

      // Verify user has admin or instructor role
      if (!['admin', 'instructor'].includes(data.user.role)) {
        throw new Error('Access denied. Admin or instructor role required.');
      }

      // Store token and user
      this.token = data.token;
      this.user = data.user;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
      }

      return { user: data.user, token: data.token };
    } catch (error) {
      console.error('🚨 Login error:', error);
      throw error;
    }
  }

  /**
   * Logout admin user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint if we have a token
      if (this.token) {
        await fetch(`${this.baseUrl}/users/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `JWT ${this.token}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {
          // Ignore logout API errors - always clear local state
        });
      }
    } finally {
      // Always clear local state
      this.token = null;
      this.user = null;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<AdminUser | null> {
    if (!this.token) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/users/me`, {
        headers: {
          'Authorization': `JWT ${this.token}`,
        },
      });

      if (!response.ok) {
        // Token is invalid, clear it
        await this.logout();
        return null;
      }

      const data = await response.json();
      this.user = data.user;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_user', JSON.stringify(data.user));
      }
      
      return data.user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      await this.logout();
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Get current user
   */
  getUser(): AdminUser | null {
    // Try to load from localStorage if not in memory
    if (!this.user && typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('admin_user');
      if (storedUser) {
        try {
          this.user = JSON.parse(storedUser);
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
    }
    return this.user;
  }

  /**
   * Initialize auth state from localStorage
   */
  initialize(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin_token');
      const storedUser = localStorage.getItem('admin_user');
      if (storedUser) {
        try {
          this.user = JSON.parse(storedUser);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('admin_user');
        }
      }
    }
  }
}

// Create singleton instance
export const authService = new AuthService();

// Initialize on module load
authService.initialize();
