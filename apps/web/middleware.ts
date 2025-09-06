import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * PROFESSIONAL MIDDLEWARE - Robust authentication with proper error handling
 * Prevents redirect loops and handles edge cases gracefully
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('🔍 MIDDLEWARE: Processing request for:', pathname);

  // ALWAYS allow access to signin page - NO EXCEPTIONS
  if (pathname === '/signin') {
    console.log('✅ MIDDLEWARE: Allowing access to /signin page');
    return NextResponse.next();
  }

  // Allow access to auth-related pages
  if (pathname.startsWith('/(auth)') || pathname.includes('/signin')) {
    console.log('✅ MIDDLEWARE: Allowing access to auth page:', pathname);
    return NextResponse.next();
  }

  // For all protected routes, check if cookie exists
  const payloadToken = request.cookies.get('payload-token');

  if (!payloadToken || !payloadToken.value) {
    console.log('❌ MIDDLEWARE: No auth cookie found, redirecting to signin');
    console.log('Available cookies:', request.cookies.getAll().map(c => c.name));

    // Prevent redirect loops by checking if we're already redirecting
    if (request.nextUrl.searchParams.get('redirected') === 'true') {
      console.log('⚠️ MIDDLEWARE: Redirect loop detected, allowing access');
      return NextResponse.next();
    }

    const redirectUrl = new URL('/signin', request.url);
    redirectUrl.searchParams.set('redirected', 'true');
    redirectUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Cookie exists, let AuthGuard handle detailed validation
  console.log('✅ MIDDLEWARE: Auth cookie found, allowing access (AuthGuard will validate)');
  return NextResponse.next();
}

export const config = {
  // CRITICAL: Always exclude /signin to prevent redirect loops
  // Also exclude Next.js internal routes and static assets
  matcher: ['/', '/((?!signin|api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
