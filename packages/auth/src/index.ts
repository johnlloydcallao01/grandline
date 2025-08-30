/**
 * PayloadCMS Authentication Package
 * Official pattern implementation based on PayloadCMS documentation
 */

// Types
export type {
  AuthUser,
  LoginCredentials,
} from './types';

// Core authentication client
export { PayloadAuthClient, type PayloadAuthConfig } from './auth-client';

// React Provider and hooks
export {
  AuthProvider,
  useAuth,
  useAdminAuth,
  useTraineeAuth,
  useAdminLogin,
  useTraineeLogin,
  type AuthProviderProps,
} from './hooks';

// Error handling components
export {
  AuthErrorBoundary,
  useErrorHandler,
} from './components/AuthErrorBoundary';

// Debug utilities
export {
  authDebugger,
  enableAuthDebug,
  disableAuthDebug,
  getAuthReport,
  downloadAuthReport,
  type AuthDebugInfo,
} from './utils/debug';

// Middleware
export {
  createAuthMiddleware,
  adminAuthMiddleware,
  traineeAuthMiddleware,
  type AuthMiddlewareConfig,
} from './middleware';
