/**
 * Configurable authentication middleware for Next.js
 * Extracted and enhanced from apps/web-admin/src/middleware.ts
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { AuthMiddlewareConfig } from '../types/auth';

/**
 * Create configurable authentication middleware
 */
export function createAuthMiddleware(config: AuthMiddlewareConfig) {
  return async function authMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow access to public paths
    if (config.publicPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // Check for PayloadCMS authentication cookie
    const payloadToken = request.cookies.get(config.cookieName);

    if (!payloadToken) {
      console.log('❌ No auth cookie found, redirecting to login');
      return NextResponse.redirect(new URL(config.loginPath, request.url));
    }

    // 🛡️ SECURITY ENHANCEMENT: Real-time role validation
    try {
      const response = await fetch(`${config.apiUrl}/users/me`, {
        headers: {
          'Cookie': `${config.cookieName}=${payloadToken.value}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        const user = userData.user || userData;

        // 🚨 Check if user role is in allowed roles
        if (user && !config.allowedRoles.includes(user.role)) {
          console.log('🚨 MIDDLEWARE SECURITY: User role not allowed, blocking access');
          console.log('Current role:', user.role);
          console.log('Allowed roles:', config.allowedRoles);
          
          // Clear the invalid cookie and redirect to login
          const response = NextResponse.redirect(new URL(config.loginPath, request.url));
          response.cookies.delete(config.cookieName);
          return response;
        }

        // 🚨 Check if user account is still active
        if (user && !user.isActive) {
          console.log('🚨 MIDDLEWARE SECURITY: User account deactivated, blocking access');
          
          // Clear the invalid cookie and redirect to login
          const response = NextResponse.redirect(new URL(config.loginPath, request.url));
          response.cookies.delete(config.cookieName);
          return response;
        }

        console.log('✅ Auth cookie and role validated, allowing access');
        return NextResponse.next();
      } else {
        console.log('❌ Token validation failed, redirecting to login');
        const response = NextResponse.redirect(new URL(config.loginPath, request.url));
        response.cookies.delete(config.cookieName);
        return response;
      }
    } catch (error) {
      console.error('❌ Error validating token:', error);
      // On error, allow access but log the issue (fallback to client-side validation)
      console.log('⚠️ Falling back to client-side validation');
      return NextResponse.next();
    }
  };
}

/**
 * Pre-configured middleware for admin authentication
 */
export function createAdminAuthMiddleware(apiUrl: string) {
  return createAuthMiddleware({
    apiUrl,
    allowedRoles: ['admin'],
    loginPath: '/admin/login',
    cookieName: 'admin-auth-token', // Admin-specific cookie
    publicPaths: ['/admin/login']
  });
}

/**
 * Pre-configured middleware for trainee authentication
 */
export function createTraineeAuthMiddleware(apiUrl: string) {
  return createAuthMiddleware({
    apiUrl,
    allowedRoles: ['trainee'],
    loginPath: '/login',
    cookieName: 'trainee-auth-token', // Trainee-specific cookie
    publicPaths: ['/login', '/register', '/signin']
  });
}

/**
 * Pre-configured middleware for instructor authentication
 */
export function createInstructorAuthMiddleware(apiUrl: string) {
  return createAuthMiddleware({
    apiUrl,
    allowedRoles: ['instructor'],
    loginPath: '/instructor/login',
    cookieName: 'instructor-auth-token', // Instructor-specific cookie
    publicPaths: ['/instructor/login']
  });
}

/**
 * Multi-role middleware (for apps that allow multiple roles)
 */
export function createMultiRoleAuthMiddleware(
  apiUrl: string,
  allowedRoles: string[],
  loginPath: string,
  cookieName: string,
  publicPaths: string[] = []
) {
  return createAuthMiddleware({
    apiUrl,
    allowedRoles,
    loginPath,
    cookieName,
    publicPaths: [...publicPaths, loginPath]
  });
}
