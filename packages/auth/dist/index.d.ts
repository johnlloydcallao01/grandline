/**
 * @encreasl/auth - Shared authentication package
 *
 * Provides authentication utilities, hooks, and middleware
 * for PayloadCMS integration across the monorepo.
 */
export type { AuthUser, AuthResponse, LoginCredentials, AuthConfig, AuthError, AuthState, AuthContextValue, RoleValidator, RoleConfig, } from './types';
export { AuthClient } from './auth-client';
export { useAuth, useAdminAuth, useRoleAuth, useTraineeAuth, } from './hooks';
export { createAuthMiddleware, adminAuthMiddleware, traineeAuthMiddleware, createMiddlewareConfig, } from './middleware';
export { validateUserRole, createRoleErrorMessage, hasRole, hasAnyRole, isAdmin, isTrainee, isInstructor, getUserDisplayName, formatRole, } from './utils';
//# sourceMappingURL=index.d.ts.map