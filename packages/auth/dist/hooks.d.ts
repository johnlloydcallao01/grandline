/**
 * React hooks for authentication
 */
import type { LoginCredentials, AuthConfig, AuthUser, RoleConfig } from './types';
/**
 * Hook for authentication state management
 */
export declare function useAuth(config?: AuthConfig & RoleConfig): {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<boolean>;
    clearError: () => void;
    isAuthenticated: boolean;
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    error: import("./types").AuthError | null;
};
/**
 * Hook for admin authentication (convenience wrapper)
 */
export declare function useAdminAuth(apiUrl: string, debug?: boolean): {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<boolean>;
    clearError: () => void;
    isAuthenticated: boolean;
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    error: import("./types").AuthError | null;
};
/**
 * Hook for role-based authentication
 */
export declare function useRoleAuth(apiUrl: string, roleConfig: RoleConfig, debug?: boolean): {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<boolean>;
    clearError: () => void;
    isAuthenticated: boolean;
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    error: import("./types").AuthError | null;
};
/**
 * Hook for trainee authentication (convenience wrapper)
 */
export declare function useTraineeAuth(apiUrl: string, debug?: boolean): {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<boolean>;
    clearError: () => void;
    isAuthenticated: boolean;
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    error: import("./types").AuthError | null;
};
//# sourceMappingURL=hooks.d.ts.map