import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple authentication hook - EXACT copy from apps/web-admin
 * Only configurable parameter: allowedRole
 */
interface AuthUser$1 {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    username?: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
interface AuthState {
    user: AuthUser$1 | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    securityAlert: {
        show: boolean;
        type: 'role-changed' | 'account-deactivated' | 'session-expired';
        message: string;
    } | null;
}
/**
 * Simple authentication hook with configurable role
 * EXACT same logic as apps/web-admin, just different role
 */
declare function useAuth(allowedRole: string): AuthState;
/**
 * Get user's full name - EXACT same as apps/web-admin
 */
declare function getFullName(user: AuthUser$1 | null): string;
/**
 * Get user's initials - EXACT same as apps/web-admin
 */
declare function getUserInitials(user: AuthUser$1 | null): string;

/**
 * Shared authentication types for Grandline monorepo
 * Based on PayloadCMS user structure
 */
interface AuthUser {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    username?: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
interface SecurityAlert {
    show: boolean;
    type: 'role-changed' | 'account-deactivated' | 'session-expired';
    message: string;
}
interface AuthConfig {
    apiUrl: string;
    allowedRoles: string[];
    loginPath: string;
    dashboardPath: string;
    cookieName: string;
    securityConfig: SecurityConfig;
}
interface SecurityConfig {
    periodicValidation: number;
    showSecurityAlerts: boolean;
    autoLogoutOnRoleChange: boolean;
    autoLogoutOnDeactivation: boolean;
    alertRedirectDelay: number;
}
interface AuthMiddlewareConfig {
    apiUrl: string;
    allowedRoles: string[];
    loginPath: string;
    cookieName: string;
    publicPaths: string[];
}
interface RoleValidationResult {
    isValid: boolean;
    currentRole?: string;
    expectedRoles: string[];
    reason?: string;
}

/**
 * PayloadCMS Authentication API utilities
 * Extracted from apps/web-admin/src/hooks/useAuth.ts
 */

interface LoginCredentials {
    email: string;
    password: string;
}
interface LoginResponse {
    user: AuthUser;
    token?: string;
    message?: string;
}
declare class PayloadCMSAuth {
    private apiUrl;
    private cookieName;
    constructor(apiUrl: string, cookieName?: string);
    /**
     * Login user with email and password
     */
    login(credentials: LoginCredentials): Promise<LoginResponse>;
    /**
     * Get current authenticated user
     */
    getCurrentUser(): Promise<AuthUser | null>;
    /**
     * Logout user
     */
    logout(): Promise<void>;
    /**
     * Get PayloadCMS token from cookies
     */
    private getPayloadToken;
    /**
     * Clear authentication cookies
     */
    clearAuthCookies(): void;
}

/**
 * Authentication validation utilities
 */

declare class AuthValidator {
    /**
     * Validate if user has required role
     */
    static validateUserRole(user: AuthUser | null, allowedRoles: string[]): RoleValidationResult;
    /**
     * Validate if user account is active
     */
    static validateUserActive(user: AuthUser | null): {
        isValid: boolean;
        reason?: string;
    };
    /**
     * Generate security alert for role change
     */
    static createRoleChangeAlert(currentRole: string, allowedRoles: string[]): SecurityAlert;
    /**
     * Generate security alert for account deactivation
     */
    static createAccountDeactivatedAlert(): SecurityAlert;
    /**
     * Generate security alert for session expiration
     */
    static createSessionExpiredAlert(): SecurityAlert;
}
/**
 * Utility functions for common validation patterns
 */
declare const ValidationUtils: {
    /**
     * Check if user is admin
     */
    isAdmin: (user: AuthUser | null) => boolean;
    /**
     * Check if user is trainee
     */
    isTrainee: (user: AuthUser | null) => boolean;
    /**
     * Check if user is instructor
     */
    isInstructor: (user: AuthUser | null) => boolean;
    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole: (user: AuthUser | null, roles: string[]) => boolean;
};

/**
 * Configurable authentication middleware for Next.js
 * Extracted and enhanced from apps/web-admin/src/middleware.ts
 */

/**
 * Create configurable authentication middleware
 */
declare function createAuthMiddleware(config: AuthMiddlewareConfig): (request: NextRequest) => Promise<NextResponse<unknown>>;
/**
 * Pre-configured middleware for admin authentication
 */
declare function createAdminAuthMiddleware(apiUrl: string): (request: NextRequest) => Promise<NextResponse<unknown>>;
/**
 * Pre-configured middleware for trainee authentication
 */
declare function createTraineeAuthMiddleware(apiUrl: string): (request: NextRequest) => Promise<NextResponse<unknown>>;
/**
 * Pre-configured middleware for instructor authentication
 */
declare function createInstructorAuthMiddleware(apiUrl: string): (request: NextRequest) => Promise<NextResponse<unknown>>;
/**
 * Multi-role middleware (for apps that allow multiple roles)
 */
declare function createMultiRoleAuthMiddleware(apiUrl: string, allowedRoles: string[], loginPath: string, cookieName: string, publicPaths?: string[]): (request: NextRequest) => Promise<NextResponse<unknown>>;

/**
 * Pre-configured authentication configurations for different app types
 */

/**
 * Default security configuration
 */
declare const defaultSecurityConfig: SecurityConfig;
/**
 * High-security configuration (for admin apps)
 */
declare const highSecurityConfig: SecurityConfig;
/**
 * Standard security configuration (for user apps)
 */
declare const standardSecurityConfig: SecurityConfig;
/**
 * Create admin authentication configuration
 */
declare function createAdminAuthConfig(apiUrl: string): AuthConfig;
/**
 * Create trainee authentication configuration
 */
declare function createTraineeAuthConfig(apiUrl: string): AuthConfig;
/**
 * Create instructor authentication configuration
 */
declare function createInstructorAuthConfig(apiUrl: string): AuthConfig;
/**
 * Create multi-role authentication configuration
 */
declare function createMultiRoleAuthConfig(apiUrl: string, allowedRoles: string[], loginPath: string, dashboardPath: string, cookieName: string, securityConfig?: SecurityConfig): AuthConfig;
/**
 * Default API URL for PayloadCMS
 */
declare const DEFAULT_API_URL = "https://grandline-cms.vercel.app/api";
/**
 * Pre-configured auth configs using default API URL
 */
declare const AuthPresets: {
    readonly admin: AuthConfig;
    readonly trainee: AuthConfig;
    readonly instructor: AuthConfig;
};

export { type AuthConfig, type AuthMiddlewareConfig, AuthPresets, type AuthState, type AuthUser$1 as AuthUser, AuthValidator, DEFAULT_API_URL, type LoginCredentials, type LoginResponse, PayloadCMSAuth, type SecurityAlert, type SecurityConfig, ValidationUtils, createAdminAuthConfig, createAdminAuthMiddleware, createAuthMiddleware, createInstructorAuthConfig, createInstructorAuthMiddleware, createMultiRoleAuthConfig, createMultiRoleAuthMiddleware, createTraineeAuthConfig, createTraineeAuthMiddleware, defaultSecurityConfig, getFullName, getUserInitials, highSecurityConfig, standardSecurityConfig, useAuth };
