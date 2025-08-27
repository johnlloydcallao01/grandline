/**
 * PayloadCMS Authentication Service for Web Admin
 * 
 * Authenticates admin users from Supabase PostgreSQL database through PayloadCMS
 * Only allows users with 'admin' or 'instructor' roles to access web-admin
 */

import { env } from './env';

// ============================================================================
// Database Schema Types (matching Supabase PostgreSQL)
// ============================================================================

export interface PayloadUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  nameExtension?: string;
  username?: string;
  role: 'admin' | 'instructor' | 'trainee';
  isActive: boolean;
  lastLogin?: string;
  phone?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRecord {
  id: number;
  user: number;
  adminLevel: 'system' | 'department' | 'content';
  systemPermissions?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PayloadAuthResponse {
  message?: string;
  user: PayloadUser;
  token: string;
  exp?: number;
}

export interface AdminUserWithPermissions extends PayloadUser {
  adminRecord?: AdminRecord;
  permissions: {
    level: 'system' | 'department' | 'content' | 'instructor';
    canManageUsers: boolean;
    canManageContent: boolean;
    canManagePosts: boolean;
    canManageMedia: boolean;
    canViewAnalytics: boolean;
  };
}

// ============================================================================
// Authentication Service Class
// ============================================================================

class PayloadAuthService {
  private baseUrl: string;
  private token: string | null = null;
  private user: AdminUserWithPermissions | null = null;

  constructor() {
    this.baseUrl = env.NEXT_PUBLIC_API_URL || 'https://grandline-cms.vercel.app/api';
    this.initializeFromStorage();
  }

  /**
   * Initialize auth state from localStorage
   */
  private initializeFromStorage(): void {
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

  /**
   * Login admin user with PayloadCMS
   */
  async login(credentials: LoginCredentials): Promise<{ user: AdminUserWithPermissions; token: string }> {
    try {
      console.log('🔐 Attempting PayloadCMS admin login...');
      console.log('📍 API URL:', `${this.baseUrl}/users/login`);
      console.log('📧 Email:', credentials.email);

      const response = await fetch(`${this.baseUrl}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Login failed:', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `HTTP ${response.status}` };
        }

        throw new Error(
          errorData.message ||
          errorData.errors?.[0]?.message ||
          `Authentication failed with status ${response.status}`
        );
      }

      const data: PayloadAuthResponse = await response.json();
      console.log('✅ PayloadCMS response:', {
        hasUser: !!data.user,
        hasToken: !!data.token,
        userRole: data.user?.role,
        userActive: data.user?.isActive
      });

      if (!data.user || !data.token) {
        throw new Error('Invalid response from PayloadCMS');
      }

      if (!data.user.isActive) {
        throw new Error('Account is inactive');
      }

      if (!['admin', 'instructor'].includes(data.user.role)) {
        throw new Error(`Access denied. Required role: admin or instructor. Current: ${data.user.role}`);
      }

      const userWithPermissions: AdminUserWithPermissions = {
        ...data.user,
        permissions: {
          level: data.user.role === 'admin' ? 'system' : 'instructor',
          canManageUsers: data.user.role === 'admin',
          canManageContent: true,
          canManagePosts: true,
          canManageMedia: true,
          canViewAnalytics: data.user.role === 'admin',
        }
      };

      this.token = data.token;
      this.user = userWithPermissions;

      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(userWithPermissions));
      }

      console.log('✅ Authentication successful');
      return { user: userWithPermissions, token: data.token };
    } catch (error) {
      console.error('🚨 Login error:', error);
      throw error;
    }
  }



  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      if (this.token) {
        await fetch(`${this.baseUrl}/users/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `JWT ${this.token}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {
          // Ignore logout errors
        });
      }
    } finally {
      this.token = null;
      this.user = null;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }
  }

  /**
   * Get current user
   */
  getUser(): AdminUserWithPermissions | null {
    return this.user;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!(this.token && this.user);
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: keyof AdminUserWithPermissions['permissions']): boolean {
    return Boolean(this.user?.permissions[permission]) || false;
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const authService = new PayloadAuthService();
export default authService;
