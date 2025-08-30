/**
 * Authentication utility functions
 */
import type { AuthUser, RoleConfig } from './types';
/**
 * Validate user role against configuration
 */
export declare function validateUserRole(user: AuthUser, config: RoleConfig): boolean;
/**
 * Create role validation error message
 */
export declare function createRoleErrorMessage(user: AuthUser, config: RoleConfig): string;
/**
 * Check if user has specific role
 */
export declare function hasRole(user: AuthUser | null, role: string): boolean;
/**
 * Check if user has any of the specified roles
 */
export declare function hasAnyRole(user: AuthUser | null, roles: string[]): boolean;
/**
 * Check if user is admin
 */
export declare function isAdmin(user: AuthUser | null): boolean;
/**
 * Check if user is trainee
 */
export declare function isTrainee(user: AuthUser | null): boolean;
/**
 * Check if user is instructor
 */
export declare function isInstructor(user: AuthUser | null): boolean;
/**
 * Get user display name
 */
export declare function getUserDisplayName(user: AuthUser | null): string;
/**
 * Format user role for display
 */
export declare function formatRole(role: string): string;
//# sourceMappingURL=utils.d.ts.map