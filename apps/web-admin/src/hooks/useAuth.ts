/**
 * Mock authentication hook for apps/web-admin
 * Returns mock data without actual authentication
 */
import { useState } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

/**
 * Mock authentication hook for admin (no actual authentication)
 */
export function useAuth() {
  const [user] = useState<AuthUser | null>({
    id: 'mock-admin-id',
    email: 'admin@example.com',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const isAuthenticated = true; // Always authenticated

  const authState: AuthState = {
    user,
    loading,
    error,
    isAuthenticated
  };

  return authState;
}

/**
 * Utility function to get full name
 */
export function getFullName(user: AuthUser | null): string {
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
export function getUserInitials(user: AuthUser | null): string {
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
