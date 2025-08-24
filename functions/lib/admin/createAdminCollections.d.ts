/**
 * Admin Collections Setup
 *
 * This file contains functions to create and initialize the admin collections
 * for the CMS system. It follows the schema defined in docs/admin-schema.md.
 */
/**
 * Creates the initial admin collections structure
 */
export declare function createAdminCollections(): Promise<{
    success: boolean;
}>;
/**
 * Creates a super admin user
 */
export declare function createSuperAdmin(email: string, uid: string, displayName: string): Promise<{
    success: boolean;
    exists: boolean;
    userId: string;
} | {
    success: boolean;
    userId: string;
    exists?: undefined;
}>;
//# sourceMappingURL=createAdminCollections.d.ts.map