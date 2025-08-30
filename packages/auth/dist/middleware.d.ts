/**
 * Authentication middleware for Next.js
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export interface AuthMiddlewareConfig {
    cookieName?: string;
    loginPath?: string;
    publicPaths?: string[];
    protectedPaths?: string[];
    redirectTo?: string;
    debug?: boolean;
}
/**
 * Create authentication middleware
 */
export declare function createAuthMiddleware(config?: AuthMiddlewareConfig): (request: NextRequest) => Promise<NextResponse<unknown>>;
/**
 * Default admin middleware configuration
 */
export declare const adminAuthMiddleware: (request: NextRequest) => Promise<NextResponse<unknown>>;
/**
 * Custom trainee middleware that doesn't redirect root path
 */
export declare const traineeAuthMiddleware: (request: NextRequest) => Promise<NextResponse<unknown>>;
/**
 * Middleware configuration for different apps
 */
export declare const createMiddlewareConfig: (paths: string[]) => {
    matcher: string[];
};
//# sourceMappingURL=middleware.d.ts.map