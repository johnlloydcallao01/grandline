/**
 * Admin System Setup Script
 *
 * This script initializes the admin system by creating:
 * - Default roles and permissions
 * - Super admin user
 * - Initial collections structure
 *
 * Run this once after deploying the functions to set up the admin system.
 */
/**
 * Initializes the entire admin system
 * This is a one-time setup function
 */
export declare const initializeAdminSystem: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    message: string;
    alreadyExists: boolean;
    superAdminId?: undefined;
    superAdminEmail?: undefined;
    features?: undefined;
} | {
    success: boolean;
    message: string;
    superAdminId: string;
    superAdminEmail: any;
    features: string[];
    alreadyExists?: undefined;
}>>;
/**
 * Checks if the admin system is properly initialized
 */
export declare const checkAdminSystemStatus: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    initialized: boolean;
    message: string;
    initializedAt?: undefined;
    version?: undefined;
    features?: undefined;
    statistics?: undefined;
    collections?: undefined;
} | {
    initialized: any;
    initializedAt: any;
    version: any;
    features: any;
    statistics: {
        totalRoles: number;
        totalPermissions: number;
        totalAdminUsers: number;
    };
    collections: {
        rolesExist: boolean;
        permissionsExist: boolean;
        usersExist: boolean;
    };
    message?: undefined;
}>>;
/**
 * Resets the admin system (DANGEROUS - use with caution)
 */
export declare const resetAdminSystem: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    message: string;
    resetBy: any;
    resetAt: string;
}>>;
//# sourceMappingURL=setupAdmin.d.ts.map