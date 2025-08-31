/**
 * Authentication validation utilities
 */

import type { AuthUser, RoleValidationResult, SecurityAlert } from '../types/auth';

export class AuthValidator {
  /**
   * Validate if user has required role
   */
  static validateUserRole(user: AuthUser | null, allowedRoles: string[]): RoleValidationResult {
    if (!user) {
      return {
        isValid: false,
        expectedRoles: allowedRoles,
        reason: 'User not authenticated'
      };
    }

    if (!allowedRoles.includes(user.role)) {
      return {
        isValid: false,
        currentRole: user.role,
        expectedRoles: allowedRoles,
        reason: `User role '${user.role}' not in allowed roles: ${allowedRoles.join(', ')}`
      };
    }

    return {
      isValid: true,
      currentRole: user.role,
      expectedRoles: allowedRoles
    };
  }

  /**
   * Validate if user account is active
   */
  static validateUserActive(user: AuthUser | null): { isValid: boolean; reason?: string } {
    if (!user) {
      return {
        isValid: false,
        reason: 'User not authenticated'
      };
    }

    if (!user.isActive) {
      return {
        isValid: false,
        reason: 'User account is deactivated'
      };
    }

    return { isValid: true };
  }

  /**
   * Generate security alert for role change
   */
  static createRoleChangeAlert(currentRole: string, allowedRoles: string[]): SecurityAlert {
    return {
      show: true,
      type: 'role-changed',
      message: `Your role has been changed from ${allowedRoles.join('/')} to ${currentRole}. You no longer have access to this application.`
    };
  }

  /**
   * Generate security alert for account deactivation
   */
  static createAccountDeactivatedAlert(): SecurityAlert {
    return {
      show: true,
      type: 'account-deactivated',
      message: 'Your account has been deactivated by an administrator. Please contact support for assistance.'
    };
  }

  /**
   * Generate security alert for session expiration
   */
  static createSessionExpiredAlert(): SecurityAlert {
    return {
      show: true,
      type: 'session-expired',
      message: 'Your session has expired. Please log in again to continue.'
    };
  }
}

/**
 * Utility functions for common validation patterns
 */
export const ValidationUtils = {
  /**
   * Check if user is admin
   */
  isAdmin: (user: AuthUser | null): boolean => {
    return AuthValidator.validateUserRole(user, ['admin']).isValid;
  },

  /**
   * Check if user is trainee
   */
  isTrainee: (user: AuthUser | null): boolean => {
    return AuthValidator.validateUserRole(user, ['trainee']).isValid;
  },

  /**
   * Check if user is instructor
   */
  isInstructor: (user: AuthUser | null): boolean => {
    return AuthValidator.validateUserRole(user, ['instructor']).isValid;
  },

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole: (user: AuthUser | null, roles: string[]): boolean => {
    return AuthValidator.validateUserRole(user, roles).isValid;
  }
};
