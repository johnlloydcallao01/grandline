import { traineeAuthMiddleware } from '@encreasl/auth'

export const middleware = traineeAuthMiddleware

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - signin (authentication page)
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|signin|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico|.*\\.css|.*\\.js).*)',
  ],
}
