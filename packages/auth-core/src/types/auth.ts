/**
 * Shared authentication types for Grandline monorepo
 * Based on PayloadCMS user structure
 */

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  username?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityAlert {
  show: boolean;
  type: 'role-changed' | 'account-deactivated' | 'session-expired';
  message: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  securityAlert: SecurityAlert | null;
}

export interface AuthConfig {
  apiUrl: string;
  allowedRoles: string[];
  loginPath: string;
  dashboardPath: string;
  cookieName: string; // App-specific cookie name
  securityConfig: SecurityConfig;
}

export interface SecurityConfig {
  periodicValidation: number;        // Validation interval in milliseconds
  showSecurityAlerts: boolean;       // Show security alerts
  autoLogoutOnRoleChange: boolean;   // Auto-logout on role change
  autoLogoutOnDeactivation: boolean; // Auto-logout on account deactivation
  alertRedirectDelay: number;        // Redirect delay for alerts in milliseconds
}

export interface AuthMiddlewareConfig {
  apiUrl: string;
  allowedRoles: string[];
  loginPath: string;
  cookieName: string;
  publicPaths: string[];
}

// Utility types for role validation
export type UserRole = 'admin' | 'instructor' | 'trainee';

export interface RoleValidationResult {
  isValid: boolean;
  currentRole?: string;
  expectedRoles: string[];
  reason?: string;
}
