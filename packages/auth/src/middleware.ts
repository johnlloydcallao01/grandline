/**
 * Authentication middleware for Next.js
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export interface AuthMiddlewareConfig {
  cookieName?: string;
  loginPath?: string;
  publicPaths?: string[];
  protectedPaths?: string[];
  redirectTo?: string;
  debug?: boolean;
}

/**
 * Create authentication middleware
 */
export function createAuthMiddleware(config: AuthMiddlewareConfig = {}) {
  const {
    cookieName = 'payload-token',
    loginPath = '/admin/login',
    publicPaths = ['/admin/login'],
    protectedPaths = ['/admin'],
    redirectTo = '/admin/dashboard',
    debug = false,
  } = config;

  return async function authMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Redirect root to default protected route
    if (pathname === '/') {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // Allow access to public paths
    if (publicPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // Check if path needs protection
    const needsAuth = protectedPaths.some(path => pathname.startsWith(path));
    if (!needsAuth) {
      return NextResponse.next();
    }

    // Check for authentication cookie
    const authToken = request.cookies.get(cookieName);

    if (debug) {
      // Debug: Log all cookies
      const allCookies: Record<string, string> = {};
      request.cookies.getAll().forEach(cookie => {
        allCookies[cookie.name] = cookie.value;
      });
      console.log('🍪 All cookies:', allCookies);
      console.log('🔍 Auth token found:', !!authToken);
    }

    if (!authToken) {
      if (debug) {
        console.log('❌ No auth cookie found, redirecting to login');
      }
      return NextResponse.redirect(new URL(loginPath, request.url));
    }

    if (debug) {
      console.log('✅ Auth cookie found, allowing access');
    }
    return NextResponse.next();
  };
}

/**
 * Default admin middleware configuration
 */
export const adminAuthMiddleware = createAuthMiddleware({
  cookieName: 'payload-token',
  loginPath: '/admin/login',
  publicPaths: ['/admin/login'],
  protectedPaths: ['/', '/admin'],
  redirectTo: '/admin/dashboard',
  debug: process.env.NODE_ENV === 'development',
});

/**
 * Custom trainee middleware that doesn't redirect root path
 */
export const traineeAuthMiddleware = async function(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieName = 'payload-token';
  const loginPath = '/signin';
  const debug = process.env.NODE_ENV === 'development';

  // Allow access to signin page
  if (pathname.startsWith(loginPath)) {
    return NextResponse.next();
  }

  // Check for authentication cookie
  const authToken = request.cookies.get(cookieName);

  if (debug) {
    // Debug: Log all cookies
    const allCookies: Record<string, string> = {};
    request.cookies.getAll().forEach(cookie => {
      allCookies[cookie.name] = cookie.value;
    });
    console.log('🍪 All cookies:', allCookies);
    console.log('🔍 Auth token found:', !!authToken);
    console.log('📍 Current path:', pathname);
  }

  if (!authToken) {
    if (debug) {
      console.log('❌ No auth cookie found, redirecting to login');
    }
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  if (debug) {
    console.log('✅ Auth cookie found, allowing access');
  }
  return NextResponse.next();
};

/**
 * Middleware configuration for different apps
 */
export const createMiddlewareConfig = (paths: string[]) => ({
  matcher: paths,
});
