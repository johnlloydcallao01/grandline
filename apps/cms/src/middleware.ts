import { NextRequest, NextResponse } from 'next/server'

// Centralized CORS configuration using environment variables
const getAllowedOrigins = (): string[] => {
  const localOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
  ]

  // Production origins from environment variables with fallbacks
  const productionOrigins = [
    process.env.NEXT_PUBLIC_WEB_URL || 'https://grandline-web.vercel.app',
    process.env.NEXT_PUBLIC_WEB_ADMIN_URL || 'https://grandline-web-admin.vercel.app',
    process.env.NEXT_PUBLIC_CMS_URL || 'https://grandline-cms.vercel.app',
  ]

  return [...localOrigins, ...productionOrigins]
}

const ALLOWED_ORIGINS = getAllowedOrigins()

export function middleware(request: NextRequest) {
  // Handle CORS for all API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    const allowedOrigin = isAllowedOrigin ? origin : (ALLOWED_ORIGINS[0] || 'https://grandline-web.vercel.app')

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-Token, X-Client-Version, X-Client-Platform',
          'Access-Control-Max-Age': '86400',
          'Access-Control-Allow-Credentials': 'true',
          'Vary': 'Origin',
        },
      })
    }

    // Add CORS headers to all API responses
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-Token, X-Client-Version, X-Client-Platform')
    response.headers.set('Access-Control-Max-Age', '86400')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Vary', 'Origin')

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
