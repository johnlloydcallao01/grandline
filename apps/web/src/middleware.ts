/**
 * @file apps/web/src/middleware.ts
 * @description Next.js middleware for authentication and route protection
 * Handles automatic redirects and session validation
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ========================================
// CONFIGURATION
// ========================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://grandline-cms.vercel.app/api';
const COLLECTION_SLUG = 'users'; // Authentication is on users collection, not trainees

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/',
  '/courses',
  '/trending',
  '/music',
  '/gaming',
  '/news',
  '/sports',
  '/subscriptions',
  '/history',
  '/liked-videos',
  '/watch-later',
  '/playlists',
  '/notifications',
  '/portal',
  '/menu',
  '/help',
  '/session-debug',
  '/auth-test',
  '/login-status',
  '/loading-test',
  '/test-home',
  '/shorts'
];

// Routes that should redirect authenticated users
const AUTH_ROUTES = [
  '/signin',
  '/register',
  '/forgot-password'
];

// Routes that are always public (no authentication check)
const PUBLIC_ROUTES = [
  '/api',
  '/_next',
  '/favicon.ico',
  '/calsiter-inc-logo.png',
  '/file.svg',
  '/globe.svg',
  '/next.svg',
  '/vercel.svg',
  '/window.svg'
];

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Check if a path matches any of the given patterns
 */
function matchesPath(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    if (pattern.endsWith('*')) {
      return pathname.startsWith(pattern.slice(0, -1));
    }
    return pathname === pattern || pathname.startsWith(pattern + '/');
  });
}

// Note: checkAuthentication function removed because we're using client-side auth protection
// instead of middleware-based auth due to cross-domain cookie limitations

/**
 * Create redirect response with proper headers
 */
function createRedirect(url: string, request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL(url, request.url));
  
  // Preserve important headers
  response.headers.set('x-middleware-cache', 'no-cache');
  
  return response;
}

// ========================================
// MAIN MIDDLEWARE FUNCTION
// ========================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  if (matchesPath(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  // Skip middleware for API routes (except auth endpoints)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // For development with external PayloadCMS, we can't rely on cookie-based auth in middleware
  // because cookies are domain-specific (grandline-cms.vercel.app vs localhost:3000).
  // Instead, we'll handle auth protection on the client side with ProtectedRoute components.

  // Handle auth routes (signin, register, etc.) - always allow access
  if (matchesPath(pathname, AUTH_ROUTES)) {
    return NextResponse.next();
  }

  // For protected routes, let the client-side ProtectedRoute component handle the auth check
  // This is necessary because PayloadCMS cookies are set for grandline-cms.vercel.app domain
  // and cannot be accessed by localhost:3000 due to browser security policies

  return NextResponse.next();
}

// ========================================
// MIDDLEWARE CONFIGURATION
// ========================================

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - public files (images, etc.)
   */
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

// ========================================
// ADDITIONAL MIDDLEWARE UTILITIES
// ========================================

/**
 * Middleware for API routes that require authentication
 */
export async function withAuth(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const isAuthenticated = await checkAuthentication(request);
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return handler(request);
  };
}

/**
 * Middleware for API routes that require specific roles
 */
export function withRole(roles: string[]) {
  return (handler: (request: NextRequest) => Promise<NextResponse>) => {
    return async (request: NextRequest) => {
      try {
        const response = await fetch(`${API_BASE_URL}/${COLLECTION_SLUG}/me`, {
          method: 'GET',
          headers: {
            'Cookie': request.headers.get('cookie') || '',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }

        const data = await response.json();
        const user = data.user;

        if (!user || !roles.includes(user.role)) {
          return NextResponse.json(
            { error: 'Forbidden' },
            { status: 403 }
          );
        }

        return handler(request);
      } catch (error) {
        return NextResponse.json(
          { error: 'Authentication check failed' },
          { status: 500 }
        );
      }
    };
  };
}
