/**
 * Admin Authentication Helpers
 *
 * Provides utilities for admin authentication and authorization
 * following Firebase enterprise patterns.
 */
/**
 * Authenticates an admin user and creates a session
 */
export declare const adminLogin: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    sessionToken: string;
    sessionExpires: Date;
    adminUser: {
        id: string;
        email: string;
        displayName: string;
        roleName: string;
        isSuperAdmin: boolean;
        permissions: string[];
        preferences: {
            theme: "light" | "dark" | "auto";
            language: string;
            timezone: string;
            dateFormat: string;
            timeFormat: "12h" | "24h";
            dashboardLayout: "grid" | "list";
            notificationsEnabled: boolean;
            emailNotifications: boolean;
        };
    };
}>>;
/**
 * Validates an admin session token
 */
export declare const validateAdminSession: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    valid: boolean;
    adminUser: {
        id: string;
        email: string;
        displayName: string;
        roleName: string;
        isSuperAdmin: boolean;
        permissions: string[];
        preferences: {
            theme: "light" | "dark" | "auto";
            language: string;
            timezone: string;
            dateFormat: string;
            timeFormat: "12h" | "24h";
            dashboardLayout: "grid" | "list";
            notificationsEnabled: boolean;
            emailNotifications: boolean;
        };
    };
}>>;
/**
 * Ends an admin session (logout)
 */
export declare const adminLogout: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
}>>;
/**
 * Revokes all active sessions for an admin user
 */
export declare const revokeAdminSessions: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    sessionsRevoked: number;
}>>;
//# sourceMappingURL=adminAuth.d.ts.map