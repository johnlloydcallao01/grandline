/**
 * CRITICAL: Vercel Session-Based Authentication Middleware
 *
 * This middleware ensures session-based authentication works properly on Vercel
 * by handling CORS, cookies, and session persistence across serverless functions.
 */

import { NextRequest, NextResponse } from 'next/server'

// Allowed origins for CORS - CRITICAL for session-based auth
const allowedOrigins = [
  process.env.ADMIN_PROD_URL!, // https://grandline-web-admin.vercel.app
  process.env.ADMIN_LOCAL_URL!, // http://localhost:3002
  process.env.WEB_PROD_URL!, // https://grandline-web.vercel.app
  process.env.WEB_LOCAL_URL!, // http://localhost:3000
  process.env.CMS_PROD_URL!, // https://grandline-cms.vercel.app
  process.env.CMS_LOCAL_URL!, // http://localhost:3001
].filter(Boolean)

export function middleware(request: NextRequest) {
  // Handle CORS for API routes - CRITICAL for session-based auth
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')

    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 })

      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin)
      }

      response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin,Cache-Control,Pragma')
      response.headers.set('Access-Control-Allow-Credentials', 'true') // CRITICAL for session cookies
      response.headers.set('Access-Control-Max-Age', '86400') // 24 hours

      return response
    }

    // For non-OPTIONS requests, continue to the API route
    const response = NextResponse.next()

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true') // CRITICAL for session cookies
    }

    // CRITICAL: Disable caching for session-based auth endpoints
    if (request.nextUrl.pathname.includes('/users/login') ||
        request.nextUrl.pathname.includes('/users/logout') ||
        request.nextUrl.pathname.includes('/users/me')) {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
    }

    return response
  }

  // For non-API routes, continue normally
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}
