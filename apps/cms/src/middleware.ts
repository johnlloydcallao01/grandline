import { NextRequest, NextResponse } from 'next/server'

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002', // web-admin dev server
  'https://grandline-web-admin.vercel.app',
  'https://grandline-cms.vercel.app',
  // Add any other production domains
]

export function middleware(request: NextRequest) {
  // Handle CORS for all API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': isAllowedOrigin ? origin : ALLOWED_ORIGINS[0],
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-Token',
          'Access-Control-Max-Age': '86400',
          'Access-Control-Allow-Credentials': 'true',
          'Vary': 'Origin',
        },
      })
    }

    // Add CORS headers to all API responses
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', isAllowedOrigin ? origin : ALLOWED_ORIGINS[0])
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-Token')
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
