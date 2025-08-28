import { NextRequest, NextResponse } from 'next/server'

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3002',
  'https://localhost:3002',
  'https://grandline-web-admin.vercel.app',
  // Add development origins
  'http://localhost:3000',
  'http://localhost:3001',
  'https://grandline-cms.vercel.app',
]

export function middleware(request: NextRequest) {
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const isAllowedOrigin = origin && allowedOrigins.includes(origin)

    // For development, also allow any localhost origin
    const isLocalhost = origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))
    const shouldAllowOrigin = isAllowedOrigin || (process.env.NODE_ENV === 'development' && isLocalhost)

    const corsHeaders = {
      'Access-Control-Allow-Origin': shouldAllowOrigin ? origin! : 'null',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // 24 hours
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
      })
    }

    // For other requests, add CORS headers to the response
    const response = NextResponse.next()
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}
