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

  // Debug: Log all cookies to see what PayloadCMS actually sets
  const allCookies: Record<string, string> = {}
  request.cookies.getAll().forEach(cookie => {
    allCookies[cookie.name] = cookie.value
  })
  console.log('🍪 All cookies:', allCookies)
  console.log('🔍 PayloadCMS token found:', !!payloadToken)

  if (!payloadToken) {
    console.log('❌ No auth cookie found, redirecting to login')
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  console.log('✅ Auth cookie found, allowing access')
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/admin/:path*'],
}
