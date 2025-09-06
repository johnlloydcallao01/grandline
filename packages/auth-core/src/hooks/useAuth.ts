/**
 * Simple authentication hook - EXACT copy from apps/web-admin
 * Only configurable parameter: allowedRole
 */

import { useState, useEffect } from 'react';

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  username?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  securityAlert: {
    show: boolean;
    type: 'role-changed' | 'account-deactivated' | 'session-expired';
    message: string;
  } | null;
}

/**
 * Simple authentication hook with configurable role
 * EXACT same logic as apps/web-admin, just different role
 */
export function useAuth(allowedRole: string): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true); // Start with true to prevent premature redirects
  const [error, setError] = useState<string | null>(null);
  const [securityAlert, setSecurityAlert] = useState<AuthState['securityAlert']>(null);

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const apiUrl = 'https://grandline-cms.vercel.app/api';

        // Get the payload token from cookies - more robust parsing
        const payloadToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('payload-token='))
          ?.split('=')[1];

        console.log('🔍 USEAUTH: Checking for payload-token cookie');
        console.log('Available cookies:', document.cookie);
        console.log('Found payload-token:', payloadToken ? 'Yes' : 'No');

        // If no token, set unauthenticated state
        if (!payloadToken) {
          console.log('❌ USEAUTH: No authentication token found');
          setLoading(false);
          setUser(null);
          setError('No authentication token found');
          return;
        }

        console.log('✅ USEAUTH: Token found, validating with server');

        const response = await fetch(`${apiUrl}/users/me`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${payloadToken}`
          }
        });

        console.log('🌐 USEAUTH: Server response status:', response.status);

        if (response.ok) {
          const userData = await response.json();
          console.log('📋 USEAUTH: User data received:', userData);

          // Handle PayloadCMS complex response structure
          let extractedUser: any = null;
          if (userData.user) {
            // Structure: { user: {...}, message: "Account", token: "..." }
            extractedUser = userData.user;
          } else if (userData.id && userData.email) {
            // Structure: { id, email, firstName, ... }
            extractedUser = userData;
          }

          if (extractedUser) {
            console.log('👤 USEAUTH: Extracted user:', extractedUser);

            // SECURITY CHECK: Validate current role in real-time
            if (extractedUser.role !== allowedRole) {
              console.log('🚨 USEAUTH: Role mismatch - expected:', allowedRole, 'got:', extractedUser.role);

              // Show security alert
              setSecurityAlert({
                show: true,
                type: 'role-changed',
                message: `Your role has been changed from ${allowedRole} to ${extractedUser.role}. You no longer have access to this application.`
              });

              // Clear authentication
              document.cookie.split(";").forEach(function(c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
              });

              setError(`Access denied. ${allowedRole} role required. Current role: ${extractedUser.role}`);
              setUser(null);

              return;
            }

            // SECURITY CHECK: Validate account is still active
            if (!extractedUser.isActive) {
              console.log('🚨 USEAUTH: Account deactivated');

              // Show security alert
              setSecurityAlert({
                show: true,
                type: 'account-deactivated',
                message: 'Your account has been deactivated by an administrator. Please contact support for assistance.'
              });

              // Clear authentication
              document.cookie.split(";").forEach(function(c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
              });

              setError('Account has been deactivated. Please contact administrator.');
              setUser(null);

              return;
            }

            console.log('✅ USEAUTH: Authentication successful');
            setUser(extractedUser);
            setError(null);
          } else {
            console.log('❌ USEAUTH: Unable to extract user data from response');
            setError('Unable to extract user data from response');
          }
        } else {
          const errorText = await response.text();

          // CRITICAL SECURITY FIX: Handle user deletion/unauthorized access
          if (response.status === 404 || response.status === 401 || response.status === 403) {

            // Clear ALL authentication cookies immediately
            document.cookie.split(";").forEach(function(c) {
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });

            // Clear user state
            setUser(null);
            setError(`Access denied: ${response.status === 404 ? 'User not found' : 'Unauthorized access'}`);
            setLoading(false);

            // Don't redirect immediately - let AuthGuard handle it to prevent loops
            return;
          }

          // For other errors, just set error message
          setError(`Authentication failed: ${response.status} ${errorText}`);
        }
      } catch (err) {

        // Check if this might be due to user deletion or server issues
        const errorMessage = err instanceof Error ? err.message : String(err);

        // If it's a fetch error that might indicate user deletion or server rejection
        if (errorMessage.includes('404') || errorMessage.includes('401') || errorMessage.includes('403')) {

          // Clear authentication immediately
          document.cookie.split(";").forEach(function(c) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });

          setUser(null);
          setError('Access denied: Authentication failed');
          setLoading(false);

          // Don't redirect immediately - let AuthGuard handle it
          return;
        }

        // For genuine network errors, just set error
        setError(`Network error: ${err}`);
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentUser();
  }, [allowedRole]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user && !error,
    securityAlert
  };
}

/**
 * Get user's full name - EXACT same as apps/web-admin
 */
export function getFullName(user: AuthUser | null): string {
  if (!user) return 'User';

  const firstName = user.firstName || '';
  const lastName = user.lastName || '';

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  } else {
    return user.email?.split('@')[0] || 'User';
  }
}

/**
 * Get user's initials - EXACT same as apps/web-admin
 */
export function getUserInitials(user: AuthUser | null): string {
  if (!user) return 'U';

  const firstName = user.firstName || '';
  const lastName = user.lastName || '';

  if (firstName && lastName) {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  } else if (firstName) {
    return firstName.charAt(0).toUpperCase();
  } else if (lastName) {
    return lastName.charAt(0).toUpperCase();
  } else {
    return user.email?.charAt(0).toUpperCase() || 'U';
  }
}
