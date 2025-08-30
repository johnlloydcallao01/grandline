/**
 * @encreasl/auth - Shared authentication package
 * 
 * Provides authentication utilities, hooks, and middleware
 * for PayloadCMS integration across the monorepo.
 */

// Types
export type {
  AuthUser,
  AuthResponse,
  LoginCredentials,
  AuthConfig,
  AuthError,
  AuthState,
  AuthContextValue,
  RoleValidator,
  RoleConfig,
} from './types';

// Core authentication client
export { AuthClient } from './auth-client';

// React hooks
export {
  useAuth,
  useAdminAuth,
  useRoleAuth,
  useTraineeAuth,
} from './hooks';

// Middleware
export {
  createAuthMiddleware,
  adminAuthMiddleware,
  traineeAuthMiddleware,
  createMiddlewareConfig,
} from './middleware';

// Utilities
export {
  validateUserRole,
  createRoleErrorMessage,
  hasRole,
  hasAnyRole,
  isAdmin,
  isTrainee,
  isInstructor,
  getUserDisplayName,
  formatRole,
} from './utils';
