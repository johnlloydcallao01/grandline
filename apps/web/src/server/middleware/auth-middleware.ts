/**
 * @file apps/web/src/server/middleware/auth-middleware.ts
 * @description Authentication middleware for server actions
 */

import 'server-only';
import { headers } from 'next/headers';
import type { ServerActionResult } from '../types/server-types';

// ========================================
// TYPES
// ========================================

export type AuthContext = {
  userId?: string;
  sessionId?: string;
  isAuthenticated: boolean;
  userAgent?: string;
  ipAddress?: string;
  timestamp: string;
  requestId: string;
};

export type AuthRequirement = {
  required?: boolean;
  allowAnonymous?: boolean;
  requireEmailVerification?: boolean;
};

// ========================================
// AUTH UTILITIES
// ========================================

/**
 * Extract authentication context from request headers
 */
export async function getAuthContext(): Promise<AuthContext> {
  const headersList = await headers();
  
  // In a real implementation, you would:
  // 1. Extract JWT token from Authorization header
  // 2. Verify the token with Firebase Auth
  // 3. Get user information from the token
  
  const authHeader = headersList.get('authorization');
  const sessionCookie = headersList.get('cookie')?.includes('session=');
  
  return {
    userId: undefined, // Would be extracted from verified token
    sessionId: undefined, // Would be extracted from session
    isAuthenticated: Boolean(authHeader || sessionCookie),
    userAgent: headersList.get('user-agent') || undefined,
    ipAddress: headersList.get('x-forwarded-for') || 
               headersList.get('x-real-ip') || 
               'unknown',
    timestamp: new Date().toISOString(),
    requestId: globalThis.crypto.randomUUID(),
  };
}

// ========================================
// MIDDLEWARE FUNCTIONS
// ========================================

/**
 * Authentication middleware for server actions
 * Injects auth context into the function
 */
export function withAuth<T extends unknown[], R>(
  fn: (authContext: AuthContext, ...args: T) => Promise<R>,
  requirements: AuthRequirement = { required: false, allowAnonymous: true }
) {
  return async (...args: T): Promise<R> => {
    const authContext = await getAuthContext();
    
    // Check authentication requirements
    if (requirements.required && !authContext.isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    if (requirements.requireEmailVerification && authContext.isAuthenticated) {
      // In a real implementation, check if email is verified
      // const user = await getUserById(authContext.userId);
      // if (!user.emailVerified) throw new Error('Email verification required');
    }
    
    return fn(authContext, ...args);
  };
}

/**
 * Optional authentication middleware
 * Provides auth context but doesn't require authentication
 */
export function withOptionalAuth<T extends unknown[], R>(
  fn: (authContext: AuthContext, ...args: T) => Promise<R>
) {
  return withAuth(fn, { required: false, allowAnonymous: true });
}

/**
 * Required authentication middleware
 * Requires user to be authenticated
 */
export function withRequiredAuth<T extends unknown[], R>(
  fn: (authContext: AuthContext, ...args: T) => Promise<R>
) {
  return withAuth(fn, { required: true, allowAnonymous: false });
}

/**
 * Email verification middleware
 * Requires user to be authenticated and email verified
 */
export function withEmailVerification<T extends unknown[], R>(
  fn: (authContext: AuthContext, ...args: T) => Promise<R>
) {
  return withAuth(fn, { 
    required: true, 
    allowAnonymous: false, 
    requireEmailVerification: true 
  });
}

// ========================================
// ERROR HANDLING MIDDLEWARE
// ========================================

/**
 * Wrap server actions with consistent error handling
 */
export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<ServerActionResult<R>>
) {
  return async (...args: T): Promise<ServerActionResult<R>> => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('Server action error:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('Authentication required')) {
          return {
            success: false,
            error: {
              code: 'AUTHENTICATION_REQUIRED',
              message: 'You must be logged in to perform this action',
              timestamp: new Date().toISOString(),
            },
          };
        }
        
        if (error.message.includes('Email verification required')) {
          return {
            success: false,
            error: {
              code: 'EMAIL_VERIFICATION_REQUIRED',
              message: 'Please verify your email address to continue',
              timestamp: new Date().toISOString(),
            },
          };
        }
      }
      
      // Generic error response
      return {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? { error: String(error) } : undefined,
          timestamp: new Date().toISOString(),
        },
      };
    }
  };
}

// ========================================
// LOGGING MIDDLEWARE
// ========================================

/**
 * Request logging middleware
 */
export function withLogging<T extends unknown[], R>(
  actionName: string
) {
  return (fn: (...args: T) => Promise<R>) => {
    return async (...args: T): Promise<R> => {
      const startTime = Date.now();
      const requestId = globalThis.crypto.randomUUID();

      console.log(`[${actionName}] Started - Request ID: ${requestId}`);

      try {
        const result = await fn(...args);
        const duration = Date.now() - startTime;

        console.log(`[${actionName}] Completed in ${duration}ms - Request ID: ${requestId}`);

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        console.error(`[${actionName}] Failed after ${duration}ms - Request ID: ${requestId}`, error);

        throw error;
      }
    };
  };
}
