import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('🔍 MIDDLEWARE: Processing request for:', pathname);

  // ALWAYS allow access to signin page - NO EXCEPTIONS
  if (pathname === '/signin') {
    console.log('✅ MIDDLEWARE: Allowing access to /signin page');
    return NextResponse.next();
  }

  // For root path, check authentication and redirect appropriately
  if (pathname === '/') {
    const payloadToken = request.cookies.get('payload-token');
    if (payloadToken) {
      console.log('✅ MIDDLEWARE: User has auth cookie, allowing access to home');
      return NextResponse.next();
    } else {
      console.log('❌ MIDDLEWARE: No auth cookie found, redirecting to signin');
      return NextResponse.redirect(new URL('/signin', request.url));
    }
  }

  // For all other protected routes, check authentication
  const payloadToken = request.cookies.get('payload-token');

  if (!payloadToken) {
    console.log('❌ MIDDLEWARE: No auth cookie found for protected route, redirecting to signin');
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // 🛡️ SECURITY ENHANCEMENT: Real-time role validation (EXACT same as web-admin)
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://grandline-cms.vercel.app/api';
    console.log('🔍 MIDDLEWARE: Validating token with API:', apiUrl);
    const response = await fetch(`${apiUrl}/users/me`, {
      headers: {
        'Cookie': `payload-token=${payloadToken.value}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const userData = await response.json()
      const user = userData.user || userData

      // Check if user role is still trainee (same logic as web-admin checks admin)
      if (user && user.role !== 'trainee') {
        console.log('🚨 MIDDLEWARE SECURITY: User role changed to non-trainee, blocking access')
        console.log('Current role:', user.role)

        // Clear the invalid cookie and redirect to signin
        const response = NextResponse.redirect(new URL('/signin', request.url))
        response.cookies.delete('payload-token')
        return response
      }

      // Check if user account is still active
      if (user && !user.isActive) {
        console.log('🚨 MIDDLEWARE SECURITY: User account deactivated, blocking access')

        // Clear the invalid cookie and redirect to signin
        const response = NextResponse.redirect(new URL('/signin', request.url))
        response.cookies.delete('payload-token')
        return response
      }

      console.log('✅ Auth cookie and role validated, allowing access')
      return NextResponse.next()
    } else {
      console.log('❌ Token validation failed, redirecting to signin')
      const response = NextResponse.redirect(new URL('/signin', request.url))
      response.cookies.delete('payload-token')
      return response
    }
  } catch (error) {
    console.error('❌ MIDDLEWARE: Error validating token:', error);

    // CRITICAL FIX: On API errors, allow access and let client-side handle it
    // This prevents redirect loops when the API is down or unreachable
    console.log('⚠️ MIDDLEWARE: API error detected, allowing access (client-side will handle auth)');
    console.log('⚠️ MIDDLEWARE: This prevents redirect loops when API is unreachable');
    return NextResponse.next();
  }
}

export const config = {
  // CRITICAL: Always exclude /signin to prevent redirect loops
  // Also exclude Next.js internal routes and static assets
  matcher: ['/', '/((?!signin|api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
