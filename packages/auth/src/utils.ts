/**
 * Authentication utility functions
 */

import type { AuthUser, RoleConfig } from './types';

/**
 * Validate user role against configuration
 */
export function validateUserRole(user: AuthUser, config: RoleConfig): boolean {
  // Custom validator takes precedence
  if (config.customValidator) {
    return config.customValidator(user);
  }

  // If no role requirements, allow all authenticated users
  if (!config.requiredRole && !config.allowedRoles) {
    return true;
  }

  // Check required role (exact match)
  if (config.requiredRole) {
    if (Array.isArray(config.requiredRole)) {
      return config.requiredRole.includes(user.role);
    }
    return user.role === config.requiredRole;
  }

  // Check allowed roles
  if (config.allowedRoles) {
    return config.allowedRoles.includes(user.role);
  }

  return false;
}

/**
 * Create role validation error message
 */
export function createRoleErrorMessage(user: AuthUser, config: RoleConfig): string {
  if (config.requiredRole) {
    const required = Array.isArray(config.requiredRole) 
      ? config.requiredRole.join(' or ')
      : config.requiredRole;
    return `Access denied. Required role: ${required}. Current role: ${user.role}`;
  }

  if (config.allowedRoles) {
    return `Access denied. Allowed roles: ${config.allowedRoles.join(', ')}. Current role: ${user.role}`;
  }

  return 'Access denied. Insufficient permissions.';
}

/**
 * Check if user has specific role
 */
export function hasRole(user: AuthUser | null, role: string): boolean {
  return user?.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: AuthUser | null, roles: string[]): boolean {
  return user ? roles.includes(user.role) : false;
}

/**
 * Check if user is admin
 */
export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, 'admin');
}

/**
 * Check if user is trainee
 */
export function isTrainee(user: AuthUser | null): boolean {
  return hasRole(user, 'trainee');
}

/**
 * Check if user is instructor
 */
export function isInstructor(user: AuthUser | null): boolean {
  return hasRole(user, 'instructor');
}

/**
 * Get user display name
 */
export function getUserDisplayName(user: AuthUser | null): string {
  if (!user) return 'Unknown User';
  
  if (user.displayName) return user.displayName;
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  if (user.firstName) return user.firstName;
  
  return user.email;
}

/**
 * Format user role for display
 */
export function formatRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
