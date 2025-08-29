import { NextRequest, NextResponse } from 'next/server'

// Allowed origins for CORS
const allowedOrigins = [
  process.env.ADMIN_PROD_URL!,
  process.env.ADMIN_LOCAL_URL!,
  process.env.WEB_PROD_URL!,
  process.env.WEB_LOCAL_URL!,
  process.env.CMS_PROD_URL!,
  process.env.CMS_LOCAL_URL!,
]

export function middleware(request: NextRequest) {
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    
    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 })
      
      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin)
      }
      
      response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Access-Control-Max-Age', '86400') // 24 hours
      
      return response
    }
    
    // For non-OPTIONS requests, continue to the API route
    const response = NextResponse.next()
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
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
