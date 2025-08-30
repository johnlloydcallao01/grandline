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

    // PayloadCMS session-based authentication - check for session cookies
    // Session-based cookie names: 'payload-session', 'payload-token', 'connect.sid', etc.
    const possibleCookieNames = ['payload-session', 'payload-token', 'payload-auth', 'users-token', 'connect.sid', 'session', cookieName];
    let authToken: string | null = null;
    let foundCookieName = '';

    for (const name of possibleCookieNames) {
      const token = request.cookies.get(name);
      if (token) {
        authToken = token.value;
        foundCookieName = name;
        break;
      }
    }

    if (debug) {
      // Debug: Log all cookies
      const allCookies: Record<string, string> = {};
      request.cookies.getAll().forEach(cookie => {
        allCookies[cookie.name] = cookie.value;
      });
      console.log('🍪 All cookies:', allCookies);
      console.log('🔍 Auth token found:', !!authToken);
      if (authToken) {
        console.log('🔍 Found auth token in cookie:', foundCookieName);
      }
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
 * Default admin middleware configuration - SESSION-BASED AUTH
 */
export const adminAuthMiddleware = createAuthMiddleware({
  cookieName: 'payload-session', // SESSION-BASED COOKIE NAME
  loginPath: '/admin/login',
  publicPaths: ['/admin/login'],
  protectedPaths: ['/', '/admin'],
  redirectTo: '/admin/dashboard',
  debug: process.env.NODE_ENV === 'development',
});

/**
 * Custom trainee middleware that doesn't redirect root path - SESSION-BASED AUTH
 */
export const traineeAuthMiddleware = async function(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieName = 'payload-session'; // SESSION-BASED COOKIE NAME
  const loginPath = '/signin';
  const debug = process.env.NODE_ENV === 'development';

  // Allow access to signin page
  if (pathname.startsWith(loginPath)) {
    return NextResponse.next();
  }

  // Check for session-based authentication cookies
  const sessionCookieNames = ['payload-session', 'payload-token', 'connect.sid', 'session', cookieName];
  let authToken: string | undefined = undefined;

  for (const name of sessionCookieNames) {
    const cookie = request.cookies.get(name);
    if (cookie) {
      authToken = cookie.value;
      break;
    }
  }

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
