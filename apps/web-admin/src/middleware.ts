import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Redirect root to admin dashboard
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // Allow access to login page
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Check for PayloadCMS authentication cookie
  const payloadToken = request.cookies.get('payload-token')

  if (!payloadToken) {
    console.log('❌ No auth cookie found, redirecting to login')
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // 🛡️ SECURITY ENHANCEMENT: Real-time role validation
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

      // Check if user role is still admin
      if (user && user.role !== 'admin') {
        console.log('🚨 MIDDLEWARE SECURITY: User role changed to non-admin, blocking access')
        console.log('Current role:', user.role)

        // Clear the invalid cookie and redirect to login
        const response = NextResponse.redirect(new URL('/admin/login', request.url))
        response.cookies.delete('payload-token')
        return response
      }

      // Check if user account is still active
      if (user && !user.isActive) {
        console.log('🚨 MIDDLEWARE SECURITY: User account deactivated, blocking access')

        // Clear the invalid cookie and redirect to login
        const response = NextResponse.redirect(new URL('/admin/login', request.url))
        response.cookies.delete('payload-token')
        return response
      }

      console.log('✅ Auth cookie and role validated, allowing access')
      return NextResponse.next()
    } else {
      console.log('❌ Token validation failed, redirecting to login')
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
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
  matcher: ['/', '/admin/:path*'],
}
