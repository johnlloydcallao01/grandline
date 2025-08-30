import { adminAuthMiddleware } from '@encreasl/auth'

export const middleware = adminAuthMiddleware

export const config = {
  matcher: ['/', '/admin/:path*'],
}
