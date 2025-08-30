/**
 * Authentication client for PayloadCMS integration
 */
import type { AuthConfig, LoginCredentials, AuthResponse, AuthUser } from './types';
export declare class AuthClient {
    private config;
    constructor(config: AuthConfig);
    /**
     * Authenticate user with PayloadCMS
     */
    login(credentials: LoginCredentials): Promise<AuthResponse>;
    /**
     * Validate user role against configuration
     */
    validateUserRole(user: AuthUser): boolean;
    /**
     * Check if user has valid authentication cookie
     */
    hasAuthCookie(): boolean;
    /**
     * Clear authentication cookie
     */
    clearAuthCookie(): void;
    /**
     * Get current user from API
     */
    getCurrentUser(): Promise<AuthUser | null>;
}
//# sourceMappingURL=auth-client.d.ts.map