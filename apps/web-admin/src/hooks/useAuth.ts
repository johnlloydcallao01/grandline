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
 * Custom hook for PayloadCMS authentication
 * Fetches and manages current authenticated user state
 */
export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [securityAlert, setSecurityAlert] = useState<AuthState['securityAlert']>(null);

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const apiUrl = 'https://grandline-cms.vercel.app/api';

        // Get the payload token from cookies
        const payloadToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('payload-token='))
          ?.split('=')[1];

        const response = await fetch(`${apiUrl}/users/me`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(payloadToken && { 'Authorization': `Bearer ${payloadToken}` })
          }
        });

        if (response.ok) {
          const userData = await response.json();

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
            // SECURITY CHECK: Validate current role in real-time
            if (extractedUser.role !== 'admin') {
              console.error('🚨 SECURITY ALERT: User role changed to non-admin, logging out');
              console.error('Current role:', extractedUser.role);

              // Show security alert
              setSecurityAlert({
                show: true,
                type: 'role-changed',
                message: `Your role has been changed from admin to ${extractedUser.role}. You no longer have access to the admin panel.`
              });

              // Clear authentication
              document.cookie.split(";").forEach(function(c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
              });

              setError(`Access denied. Admin role required. Current role: ${extractedUser.role}`);
              setUser(null);

              return;
            }

            // SECURITY CHECK: Validate account is still active
            if (!extractedUser.isActive) {
              console.error('🚨 SECURITY ALERT: User account deactivated, logging out');

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

            setUser(extractedUser);
            setError(null);
          } else {
            setError('Unable to extract user data from response');
          }
        } else {
          const errorText = await response.text();
          setError(`Authentication failed: ${response.status} ${errorText}`);
        }
      } catch (err) {
        setError(`Network error: ${err}`);
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentUser();

    // Set up periodic role validation (every 30 seconds)
    const roleValidationInterval = setInterval(() => {
      if (user) {
        console.log('🔍 Performing periodic role validation...');
        fetchCurrentUser();
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(roleValidationInterval);
    };
  }, [user]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user && !error,
    securityAlert
  };
}

/**
 * Get user's full name
 */
export function getFullName(user: AuthUser | null): string {
  if (!user) return 'Admin User';
  
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
 * Get user's initials for avatar
 */
export function getUserInitials(user: AuthUser | null): string {
  if (!user) return 'A';
  
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
