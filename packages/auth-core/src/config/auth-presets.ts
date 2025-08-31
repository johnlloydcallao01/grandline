/**
 * Pre-configured authentication configurations for different app types
 */

import type { AuthConfig, SecurityConfig } from '../types/auth';

/**
 * Default security configuration
 */
export const defaultSecurityConfig: SecurityConfig = {
  periodicValidation: 30000,        // 30 seconds
  showSecurityAlerts: true,
  autoLogoutOnRoleChange: true,
  autoLogoutOnDeactivation: true,
  alertRedirectDelay: 5000,         // 5 seconds
};

/**
 * High-security configuration (for admin apps)
 */
export const highSecurityConfig: SecurityConfig = {
  periodicValidation: 30000,        // 30 seconds - frequent validation
  showSecurityAlerts: true,
  autoLogoutOnRoleChange: true,
  autoLogoutOnDeactivation: true,
  alertRedirectDelay: 3000,         // 3 seconds - faster redirect
};

/**
 * Standard security configuration (for user apps)
 */
export const standardSecurityConfig: SecurityConfig = {
  periodicValidation: 60000,        // 60 seconds - less frequent validation
  showSecurityAlerts: true,
  autoLogoutOnRoleChange: true,
  autoLogoutOnDeactivation: true,
  alertRedirectDelay: 5000,         // 5 seconds
};

/**
 * Create admin authentication configuration
 */
export function createAdminAuthConfig(apiUrl: string): AuthConfig {
  return {
    apiUrl,
    allowedRoles: ['admin'],
    loginPath: '/admin/login',
    dashboardPath: '/admin/dashboard',
    cookieName: 'admin-auth-token', // Admin-specific cookie
    securityConfig: highSecurityConfig,
  };
}

/**
 * Create trainee authentication configuration
 */
export function createTraineeAuthConfig(apiUrl: string): AuthConfig {
  return {
    apiUrl,
    allowedRoles: ['trainee'],
    loginPath: '/login',
    dashboardPath: '/dashboard',
    cookieName: 'trainee-auth-token', // Trainee-specific cookie
    securityConfig: standardSecurityConfig,
  };
}

/**
 * Create instructor authentication configuration
 */
export function createInstructorAuthConfig(apiUrl: string): AuthConfig {
  return {
    apiUrl,
    allowedRoles: ['instructor'],
    loginPath: '/instructor/login',
    dashboardPath: '/instructor/dashboard',
    cookieName: 'instructor-auth-token', // Instructor-specific cookie
    securityConfig: standardSecurityConfig,
  };
}

/**
 * Create multi-role authentication configuration
 */
export function createMultiRoleAuthConfig(
  apiUrl: string,
  allowedRoles: string[],
  loginPath: string,
  dashboardPath: string,
  cookieName: string,
  securityConfig: SecurityConfig = defaultSecurityConfig
): AuthConfig {
  return {
    apiUrl,
    allowedRoles,
    loginPath,
    dashboardPath,
    cookieName,
    securityConfig,
  };
}

/**
 * Default API URL for PayloadCMS
 */
export const DEFAULT_API_URL = 'https://grandline-cms.vercel.app/api';

/**
 * Pre-configured auth configs using default API URL
 */
export const AuthPresets = {
  admin: createAdminAuthConfig(DEFAULT_API_URL),
  trainee: createTraineeAuthConfig(DEFAULT_API_URL),
  instructor: createInstructorAuthConfig(DEFAULT_API_URL),
} as const;
