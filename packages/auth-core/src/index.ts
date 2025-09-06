/**
 * @grandline/auth-core
 * 
 * Shared authentication core logic for Grandline monorepo
 * Provides configurable authentication hooks, middleware, and utilities
 * for PayloadCMS-based authentication across all apps.
 */

// Types - simplified
export type {
  AuthUser,
  AuthState,
} from './hooks/useAuth';

// Additional types from auth types
export type {
  SecurityAlert,
  AuthConfig,
  SecurityConfig,
  AuthMiddlewareConfig,
} from './types/auth';

// Hooks
export { useAuth, getFullName, getUserInitials } from './hooks/useAuth';

// API Utilities
export { PayloadCMSAuth } from './utils/auth-api';
export type { LoginCredentials, LoginResponse } from './utils/auth-api';

// Validation Utilities
export { AuthValidator, ValidationUtils } from './utils/validation';

// Token Blacklist System - TODO: Implement when needed
// export { TokenBlacklist, TokenBlacklistUtils, type BlacklistedToken } from './utils/token-blacklist';

// Session Heartbeat System - TODO: Implement when needed
// export { SessionHeartbeat, SessionHeartbeatUtils, type HeartbeatConfig, type HeartbeatStatus } from './utils/session-heartbeat';

// Middleware
export {
  createAuthMiddleware,
  createAdminAuthMiddleware,
  createTraineeAuthMiddleware,
  createInstructorAuthMiddleware,
  createMultiRoleAuthMiddleware,
} from './middleware/auth-middleware';

// Configuration Presets
export {
  defaultSecurityConfig,
  highSecurityConfig,
  standardSecurityConfig,
  createAdminAuthConfig,
  createTraineeAuthConfig,
  createInstructorAuthConfig,
  createMultiRoleAuthConfig,
  DEFAULT_API_URL,
  AuthPresets,
} from './config/auth-presets';
