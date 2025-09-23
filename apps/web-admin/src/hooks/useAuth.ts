/**
 * @file apps/web-admin/src/hooks/useAuth.ts
 * @description Authentication hook for admin users
 */

'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { UseAuthReturn, User } from '@/types/auth';

export function useAuth(): UseAuthReturn {
  return useAuthContext();
}

/**
 * Utility function to get full name
 */
export function getFullName(user: User | null): string {
  if (!user) return '';
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) return user.firstName;
  if (user.lastName) return user.lastName;
  return user.email;
}

/**
 * Utility function to get user initials
 */
export function getUserInitials(user: User | null): string {
  if (!user) return '';

  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  if (user.firstName) {
    return user.firstName.charAt(0).toUpperCase();
  }

  if (user.lastName) {
    return user.lastName.charAt(0).toUpperCase();
  }

  return user.email.charAt(0).toUpperCase();
}
