/**
 * Independent authentication hook for apps/web-admin
 * Uses PayloadCMS official HTTP-only cookie authentication
 */
import { useState, useEffect } from 'react';

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
 * PayloadCMS authentication hook for admin
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://grandline-cms.vercel.app/api';
        const response = await fetch(`${apiUrl}/users/me`, {
          method: 'GET',
          credentials: 'include', // Essential for PayloadCMS HTTP-only cookies
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          const extractedUser = userData.user || userData;

          if (extractedUser && extractedUser.id) {
            // Check if user has admin role (for this app)
            if (extractedUser.role !== 'admin') {
              setError(`Access denied. Admin role required. Current role: ${extractedUser.role}`);
              setUser(null);
              setLoading(false);
              return;
            }

            // Check if user account is active
            if (!extractedUser.isActive) {
              setError('Account has been deactivated. Please contact administrator.');
              setUser(null);
              setLoading(false);
              return;
            }

            setUser(extractedUser);
            setError(null);
          } else {
            setUser(null);
            setError('Invalid user data received');
          }
        } else {
          setUser(null);
          setError('Authentication failed');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError('Authentication check failed');
        console.error('Authentication error:', errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentUser();
  }, []);

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
