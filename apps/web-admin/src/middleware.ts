import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Redirect root to admin dashboard
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Allow access to login page
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Check for PayloadCMS authentication cookie
  const payloadToken = request.cookies.get('payload-token')

  if (!payloadToken) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/admin/:path*'],
}
