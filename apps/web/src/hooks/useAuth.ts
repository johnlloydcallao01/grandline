/**
 * Trainee authentication hook - uses shared logic with 'trainee' role
 */
import { useAuth as useSharedAuth, getFullName, getUserInitials } from '@grandline/auth-core';

// Re-export types
export type { AuthUser, AuthState } from '@grandline/auth-core';

/**
 * Trainee-specific authentication hook
 */
export function useAuth() {
  return useSharedAuth('trainee'); // Only difference: role = 'trainee'
}

// Re-export utility functions
export { getFullName, getUserInitials };
