import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Redirect root to main page for authenticated users (same pattern as web-admin)
  if (request.nextUrl.pathname === '/') {
    // Check if user is authenticated by looking for the cookie
    const payloadToken = request.cookies.get('payload-token');
    if (payloadToken) {
      // User is authenticated, allow access to main page
      return NextResponse.next();
    } else {
      // User is not authenticated, redirect to signin
      console.log('❌ No auth cookie found, redirecting to signin');
      return NextResponse.redirect(new URL('/signin', request.url));
    }
  }

  // Allow access to signin page (same as web-admin allows /admin/login)
  if (request.nextUrl.pathname === '/signin') {
    return NextResponse.next();
  }

  // Check for PayloadCMS authentication cookie for ALL other routes
  const payloadToken = request.cookies.get('payload-token')

  if (!payloadToken) {
    console.log('❌ No auth cookie found, redirecting to signin')
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // 🛡️ SECURITY ENHANCEMENT: Real-time role validation (EXACT same as web-admin)
  try {
    const apiUrl = 'https://grandline-cms.vercel.app/api'
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
    console.error('❌ Error validating token:', error)
    // On error, allow access but log the issue (fallback to client-side validation)
    console.log('⚠️ Falling back to client-side validation')
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/', '/((?!signin|_next/static|_next/image|favicon.ico).*)'],
}
