/**
 * Role-Based Access Control (RBAC) System
 *
 * Implements comprehensive role management following Firebase enterprise patterns:
 * - Hierarchical role inheritance
 * - Permission aggregation
 * - Real-time permission checking
 * - Strategic denormalization for performance
 */
/**
 * Creates a new admin role
 */
export declare const createAdminRole: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    roleId: string;
}>>;
/**
 * Updates an existing admin role
 */
export declare const updateAdminRole: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
}>>;
/**
 * Deletes an admin role (soft delete)
 */
export declare const deleteAdminRole: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
}>>;
/**
 * Creates a new permission
 */
export declare const createAdminPermission: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    permissionId: any;
}>>;
/**
 * Checks if a user has a specific permission
 */
export declare const checkUserPermission: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    hasPermission: boolean;
}>>;
/**
 * Gets all permissions for a user (including inherited)
 */
export declare const getUserPermissions: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    permissions: string[];
}>>;
//# sourceMappingURL=roleManagement.d.ts.map