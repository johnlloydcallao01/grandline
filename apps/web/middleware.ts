import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * SIMPLE MIDDLEWARE - Only basic cookie check
 * AuthGuard component handles detailed authentication
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('🔍 MIDDLEWARE: Processing request for:', pathname);

  // ALWAYS allow access to signin page - NO EXCEPTIONS
  if (pathname === '/signin') {
    console.log('✅ MIDDLEWARE: Allowing access to /signin page');
    return NextResponse.next();
  }

  // For all routes, just check if cookie exists
  // AuthGuard will handle detailed validation
  const payloadToken = request.cookies.get('payload-token');

  if (!payloadToken) {
    console.log('❌ MIDDLEWARE: No auth cookie found, redirecting to signin');
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Cookie exists, let AuthGuard handle the rest
  console.log('✅ MIDDLEWARE: Auth cookie found, allowing access (AuthGuard will validate)');
  return NextResponse.next();
}

export const config = {
  // CRITICAL: Always exclude /signin to prevent redirect loops
  // Also exclude Next.js internal routes and static assets
  matcher: ['/', '/((?!signin|api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
