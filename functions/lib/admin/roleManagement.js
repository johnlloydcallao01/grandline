"use strict";
/**
 * Role-Based Access Control (RBAC) System
 *
 * Implements comprehensive role management following Firebase enterprise patterns:
 * - Hierarchical role inheritance
 * - Permission aggregation
 * - Real-time permission checking
 * - Strategic denormalization for performance
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPermissions = exports.checkUserPermission = exports.createAdminPermission = exports.deleteAdminRole = exports.updateAdminRole = exports.createAdminRole = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const db = admin.firestore();
// ========================================
// ROLE MANAGEMENT FUNCTIONS
// ========================================
/**
 * Creates a new admin role
 */
exports.createAdminRole = (0, https_1.onCall)({
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
}, async (request) => {
    try {
        // Verify caller permissions
        await verifyAdminPermission(request.auth, 'roles.create');
        const { name, displayName, description, permissions, level, parentRoleRef } = request.data;
        // Validate required fields
        if (!name || !displayName || !description || !permissions || !level) {
            throw new https_1.HttpsError('invalid-argument', 'Missing required fields');
        }
        // Check if role name already exists
        const existingRole = await db.collection('admin_roles')
            .where('name', '==', name)
            .limit(1)
            .get();
        if (!existingRole.empty) {
            throw new https_1.HttpsError('already-exists', 'Role with this name already exists');
        }
        // Validate parent role if specified
        // Parent role data would be used for hierarchical permissions if needed
        if (parentRoleRef) {
            const parentDoc = await db.doc(parentRoleRef).get();
            if (!parentDoc.exists) {
                throw new https_1.HttpsError('not-found', 'Parent role does not exist');
            }
            // const parentRoleData = parentDoc.data(); // Available for future hierarchical permissions
        }
        // Validate permissions exist
        const validPermissions = await validatePermissions(permissions);
        if (validPermissions.length !== permissions.length) {
            throw new https_1.HttpsError('invalid-argument', 'Some permissions do not exist');
        }
        // Create role document
        const roleId = db.collection('admin_roles').doc().id;
        const roleData = {
            id: roleId,
            name,
            displayName,
            description,
            permissions: validPermissions,
            permissionRefs: validPermissions.map(p => `admin_permissions/${p}`),
            level,
            parentRoleRef,
            childRoleRefs: [],
            isSystemRole: false,
            isCustomRole: true,
            userCount: 0,
            createdAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
            createdBy: request.auth.uid,
            isActive: true
        };
        // Create role
        await db.collection('admin_roles').doc(roleId).set(roleData);
        // Update parent role's child references
        if (parentRoleRef) {
            await db.doc(parentRoleRef).update({
                childRoleRefs: firestore_1.FieldValue.arrayUnion(`admin_roles/${roleId}`)
            });
        }
        // Update permission role counts
        await updatePermissionRoleCounts(validPermissions, 1);
        v2_1.logger.info(`Admin role created: ${name}`, { roleId });
        return { success: true, roleId };
    }
    catch (error) {
        v2_1.logger.error('Error creating admin role:', error);
        if (error instanceof https_1.HttpsError)
            throw error;
        throw new https_1.HttpsError('internal', 'Failed to create admin role');
    }
});
/**
 * Updates an existing admin role
 */
exports.updateAdminRole = (0, https_1.onCall)({
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
}, async (request) => {
    try {
        await verifyAdminPermission(request.auth, 'roles.edit');
        const { roleId, updates } = request.data;
        // Get current role data
        const roleRef = db.collection('admin_roles').doc(roleId);
        const roleDoc = await roleRef.get();
        if (!roleDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Role not found');
        }
        const currentRole = roleDoc.data();
        // Prevent editing system roles
        if (currentRole.isSystemRole) {
            throw new https_1.HttpsError('permission-denied', 'Cannot edit system roles');
        }
        // Validate permission changes
        if (updates.permissions) {
            const validPermissions = await validatePermissions(updates.permissions);
            if (validPermissions.length !== updates.permissions.length) {
                throw new https_1.HttpsError('invalid-argument', 'Some permissions do not exist');
            }
            // Update permission role counts
            const oldPermissions = currentRole.permissions;
            const addedPermissions = validPermissions.filter(p => !oldPermissions.includes(p));
            const removedPermissions = oldPermissions.filter(p => !validPermissions.includes(p));
            await Promise.all([
                updatePermissionRoleCounts(addedPermissions, 1),
                updatePermissionRoleCounts(removedPermissions, -1)
            ]);
            updates.permissionRefs = validPermissions.map(p => `admin_permissions/${p}`);
        }
        // Update role
        await roleRef.update(Object.assign(Object.assign({}, updates), { updatedAt: firestore_1.Timestamp.now(), updatedBy: request.auth.uid }));
        // If permissions changed, update all users with this role
        if (updates.permissions) {
            await updateUsersWithRole(roleId, updates.permissions);
        }
        v2_1.logger.info(`Admin role updated: ${roleId}`);
        return { success: true };
    }
    catch (error) {
        v2_1.logger.error('Error updating admin role:', error);
        if (error instanceof https_1.HttpsError)
            throw error;
        throw new https_1.HttpsError('internal', 'Failed to update admin role');
    }
});
/**
 * Deletes an admin role (soft delete)
 */
exports.deleteAdminRole = (0, https_1.onCall)({
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
}, async (request) => {
    try {
        await verifyAdminPermission(request.auth, 'roles.delete');
        const { roleId } = request.data;
        // Get role data
        const roleRef = db.collection('admin_roles').doc(roleId);
        const roleDoc = await roleRef.get();
        if (!roleDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Role not found');
        }
        const roleData = roleDoc.data();
        // Prevent deleting system roles
        if (roleData.isSystemRole) {
            throw new https_1.HttpsError('permission-denied', 'Cannot delete system roles');
        }
        // Check if role has users
        if (roleData.userCount > 0) {
            throw new https_1.HttpsError('failed-precondition', 'Cannot delete role with active users');
        }
        // Soft delete role
        await roleRef.update({
            isActive: false,
            deletedAt: firestore_1.Timestamp.now(),
            deletedBy: request.auth.uid,
            updatedAt: firestore_1.Timestamp.now()
        });
        // Update permission role counts
        await updatePermissionRoleCounts(roleData.permissions, -1);
        // Remove from parent's child references
        if (roleData.parentRoleRef) {
            await db.doc(roleData.parentRoleRef).update({
                childRoleRefs: firestore_1.FieldValue.arrayRemove(`admin_roles/${roleId}`)
            });
        }
        v2_1.logger.info(`Admin role deleted: ${roleId}`);
        return { success: true };
    }
    catch (error) {
        v2_1.logger.error('Error deleting admin role:', error);
        if (error instanceof https_1.HttpsError)
            throw error;
        throw new https_1.HttpsError('internal', 'Failed to delete admin role');
    }
});
// ========================================
// PERMISSION MANAGEMENT FUNCTIONS
// ========================================
/**
 * Creates a new permission
 */
exports.createAdminPermission = (0, https_1.onCall)({
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 30,
}, async (request) => {
    try {
        await verifyAdminPermission(request.auth, 'permissions.create');
        const { name, displayName, description, category, resource, action } = request.data;
        // Validate required fields
        if (!name || !displayName || !description || !category || !resource || !action) {
            throw new https_1.HttpsError('invalid-argument', 'Missing required fields');
        }
        // Check if permission already exists
        const existingPermission = await db.collection('admin_permissions')
            .where('name', '==', name)
            .limit(1)
            .get();
        if (!existingPermission.empty) {
            throw new https_1.HttpsError('already-exists', 'Permission with this name already exists');
        }
        // Create permission
        const permissionId = name; // Use name as ID for easy reference
        const permissionData = {
            id: permissionId,
            name,
            displayName,
            description,
            category,
            resource,
            action,
            isSystemPermission: false,
            isActive: true,
            createdAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
            roleCount: 0,
            userCount: 0
        };
        await db.collection('admin_permissions').doc(permissionId).set(permissionData);
        v2_1.logger.info(`Admin permission created: ${name}`);
        return { success: true, permissionId };
    }
    catch (error) {
        v2_1.logger.error('Error creating admin permission:', error);
        if (error instanceof https_1.HttpsError)
            throw error;
        throw new https_1.HttpsError('internal', 'Failed to create admin permission');
    }
});
// ========================================
// PERMISSION CHECKING FUNCTIONS
// ========================================
/**
 * Checks if a user has a specific permission
 */
exports.checkUserPermission = (0, https_1.onCall)({
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 10,
}, async (request) => {
    try {
        const { userId, permission } = request.data;
        if (!userId || !permission) {
            throw new https_1.HttpsError('invalid-argument', 'Missing userId or permission');
        }
        const hasPermission = await userHasPermission(userId, permission);
        return { hasPermission };
    }
    catch (error) {
        v2_1.logger.error('Error checking user permission:', error);
        if (error instanceof https_1.HttpsError)
            throw error;
        throw new https_1.HttpsError('internal', 'Failed to check user permission');
    }
});
/**
 * Gets all permissions for a user (including inherited)
 */
exports.getUserPermissions = (0, https_1.onCall)({
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 15,
}, async (request) => {
    try {
        const { userId } = request.data;
        if (!userId) {
            throw new https_1.HttpsError('invalid-argument', 'Missing userId');
        }
        // Get user data
        const userDoc = await db.collection('admin_users').doc(userId).get();
        if (!userDoc.exists) {
            throw new https_1.HttpsError('not-found', 'User not found');
        }
        const userData = userDoc.data();
        // Get role permissions (including inherited)
        const allPermissions = await getRolePermissionsRecursive(userData.roleRef);
        return { permissions: allPermissions };
    }
    catch (error) {
        v2_1.logger.error('Error getting user permissions:', error);
        if (error instanceof https_1.HttpsError)
            throw error;
        throw new https_1.HttpsError('internal', 'Failed to get user permissions');
    }
});
// ========================================
// HELPER FUNCTIONS
// ========================================
/**
 * Verifies if the authenticated user has a specific permission
 */
async function verifyAdminPermission(auth, permission) {
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'Must be authenticated');
    }
    const hasPermission = await userHasPermission(auth.uid, permission);
    if (!hasPermission) {
        throw new https_1.HttpsError('permission-denied', `Insufficient permissions: ${permission}`);
    }
}
/**
 * Checks if a user has a specific permission
 */
async function userHasPermission(userId, permission) {
    try {
        // Get user data
        const userDoc = await db.collection('admin_users').doc(userId).get();
        if (!userDoc.exists)
            return false;
        const userData = userDoc.data();
        // Check if user is active
        if (!userData.isActive)
            return false;
        // Super admin has all permissions
        if (userData.isSuperAdmin || userData.permissions.includes('*'))
            return true;
        // Check direct permissions (denormalized for performance)
        if (userData.permissions.includes(permission))
            return true;
        // Check inherited permissions from role hierarchy
        const allPermissions = await getRolePermissionsRecursive(userData.roleRef);
        return allPermissions.includes(permission);
    }
    catch (error) {
        v2_1.logger.error('Error checking user permission:', error);
        return false;
    }
}
/**
 * Gets all permissions for a role including inherited permissions
 */
async function getRolePermissionsRecursive(roleRef) {
    const visited = new Set();
    const permissions = new Set();
    async function collectPermissions(currentRoleRef) {
        if (visited.has(currentRoleRef))
            return;
        visited.add(currentRoleRef);
        const roleDoc = await db.doc(currentRoleRef).get();
        if (!roleDoc.exists)
            return;
        const roleData = roleDoc.data();
        // Add current role permissions
        roleData.permissions.forEach(p => permissions.add(p));
        // Recursively collect parent permissions
        if (roleData.parentRoleRef) {
            await collectPermissions(roleData.parentRoleRef);
        }
    }
    await collectPermissions(roleRef);
    return Array.from(permissions);
}
/**
 * Validates that all permissions exist
 */
async function validatePermissions(permissions) {
    if (permissions.includes('*'))
        return ['*']; // Wildcard permission
    const permissionDocs = await Promise.all(permissions.map(p => db.collection('admin_permissions').doc(p).get()));
    return permissionDocs
        .filter(doc => { var _a; return doc.exists && ((_a = doc.data()) === null || _a === void 0 ? void 0 : _a.isActive); })
        .map(doc => doc.id);
}
/**
 * Updates permission role counts (denormalized data)
 */
async function updatePermissionRoleCounts(permissions, increment) {
    if (permissions.includes('*'))
        return; // Skip wildcard
    const batch = db.batch();
    permissions.forEach(permission => {
        const permissionRef = db.collection('admin_permissions').doc(permission);
        batch.update(permissionRef, {
            roleCount: firestore_1.FieldValue.increment(increment),
            updatedAt: firestore_1.Timestamp.now()
        });
    });
    await batch.commit();
}
/**
 * Updates all users with a specific role when role permissions change
 */
async function updateUsersWithRole(roleId, newPermissions) {
    const usersWithRole = await db.collection('admin_users')
        .where('roleRef', '==', `admin_roles/${roleId}`)
        .where('isActive', '==', true)
        .get();
    if (usersWithRole.empty)
        return;
    const batch = db.batch();
    usersWithRole.docs.forEach(userDoc => {
        batch.update(userDoc.ref, {
            permissions: newPermissions,
            cmsPermissions: generateCMSPermissions(newPermissions),
            updatedAt: firestore_1.Timestamp.now()
        });
    });
    await batch.commit();
    v2_1.logger.info(`Updated ${usersWithRole.size} users with role ${roleId}`);
}
/**
 * Generates CMS permissions based on role permissions
 */
function generateCMSPermissions(permissions) {
    return {
        content: {
            canCreate: permissions.includes('content.create') || permissions.includes('*'),
            canEdit: permissions.includes('content.edit') || permissions.includes('*'),
            canDelete: permissions.includes('content.delete') || permissions.includes('*'),
            canPublish: permissions.includes('content.publish') || permissions.includes('*'),
            canSchedule: permissions.includes('content.schedule') || permissions.includes('*'),
        },
        media: {
            canUpload: permissions.includes('media.upload') || permissions.includes('*'),
            canDelete: permissions.includes('media.delete') || permissions.includes('*'),
            canOrganize: permissions.includes('media.organize') || permissions.includes('*'),
            maxUploadSize: permissions.includes('*') ? 100 : 50,
        },
        users: {
            canView: permissions.includes('users.view') || permissions.includes('*'),
            canCreate: permissions.includes('users.create') || permissions.includes('*'),
            canEdit: permissions.includes('users.edit') || permissions.includes('*'),
            canDelete: permissions.includes('users.delete') || permissions.includes('*'),
            canChangeRoles: permissions.includes('users.change-roles') || permissions.includes('*'),
        },
        analytics: {
            canView: permissions.includes('analytics.view') || permissions.includes('*'),
            canExport: permissions.includes('analytics.export') || permissions.includes('*'),
            canConfigureDashboards: permissions.includes('analytics.configure-dashboards') || permissions.includes('*'),
        },
        settings: {
            canViewSystem: permissions.includes('settings.view') || permissions.includes('*'),
            canEditSystem: permissions.includes('settings.edit') || permissions.includes('*'),
            canManageIntegrations: permissions.includes('settings.manage-integrations') || permissions.includes('*'),
            canManageBackups: permissions.includes('settings.manage-backups') || permissions.includes('*'),
        },
    };
}
//# sourceMappingURL=roleManagement.js.map