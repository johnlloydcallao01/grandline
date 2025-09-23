import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Redirect root to dashboard
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Allow access to all pages - no authentication required
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/(main)/:path*'],
}
