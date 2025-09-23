/**
 * @file apps/web-admin/src/middleware.ts
 * @description Next.js middleware for admin authentication and route protection
 * Based on apps/web middleware but adapted for admin-only access
 */

import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/auth';

// ========================================
// CONFIGURATION
// ========================================

const API_BASE_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001';
const COLLECTION_SLUG = 'users';
const TOKEN_COOKIE_NAME = 'payload-token';

// Define route patterns
const PUBLIC_ROUTES = ['/login', '/access-denied'];
const AUTH_ROUTES = ['/login'];
const PROTECTED_ROUTES = ['/dashboard', '/users', '/settings', '/analytics'];

// ========================================
// UTILITY FUNCTIONS
// ========================================

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(route => pathname.startsWith(route));
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route)) || 
         pathname === '/' || 
         (!isPublicRoute(pathname) && !pathname.startsWith('/_next') && !pathname.startsWith('/api'));
}

function getTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('JWT ')) {
    return authHeader.substring(4);
  }

  // Fallback to cookie
  return request.cookies.get(TOKEN_COOKIE_NAME)?.value || null;
}

// ========================================
// AUTHENTICATION VERIFICATION
// ========================================

async function verifyAdminToken(token: string): Promise<{ isValid: boolean; user?: User }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/${COLLECTION_SLUG}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return { isValid: false };
    }

    const data = await response.json();
    
    // Check if user exists and is an admin
    if (!data.user || data.user.role !== 'admin') {
      return { isValid: false };
    }

    return { isValid: true, user: data.user };
  } catch (error) {
    console.error('Token verification failed:', error);
    return { isValid: false };
  }
}

// ========================================
// MIDDLEWARE FUNCTION
// ========================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for Next.js internal routes and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const token = getTokenFromRequest(request);
  const hasToken = !!token;

  // Handle root path - redirect to dashboard if authenticated, login if not
  if (pathname === '/') {
    if (hasToken) {
      const { isValid } = await verifyAdminToken(token);
      if (isValid) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Handle public routes
  if (isPublicRoute(pathname)) {
    // If user is on auth routes (like login) and has a valid token, redirect to dashboard
    if (isAuthRoute(pathname) && hasToken) {
      const { isValid } = await verifyAdminToken(token);
      if (isValid) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (isProtectedRoute(pathname)) {
    // No token - redirect to login
    if (!hasToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify token and admin role
    const { isValid, user } = await verifyAdminToken(token);
    
    if (!isValid) {
      // Invalid token or not admin - clear token and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete(TOKEN_COOKIE_NAME);
      return response;
    }

    // Valid admin user - allow access
    const response = NextResponse.next();
    
    // Add user info to headers for use in components (optional)
    if (user) {
      response.headers.set('x-user-id', user.id.toString());
      response.headers.set('x-user-role', user.role);
      response.headers.set('x-user-email', user.email);
    }
    
    return response;
  }

  // Default: allow access to other routes
  return NextResponse.next();
}

// ========================================
// MIDDLEWARE CONFIGURATION
// ========================================

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
