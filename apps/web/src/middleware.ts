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
     * - signin (login page - public)
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|signin|.*\\.).*)',
  ],
}
