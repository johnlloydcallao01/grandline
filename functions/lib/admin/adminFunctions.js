"use strict";
/**
 * Admin Management Cloud Functions
 *
 * Following Firebase enterprise patterns:
 * - Reference-based architecture
 * - Strategic denormalization
 * - Event-driven consistency
 * - Parallel data fetching
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
exports.onAdminUserUpdated = exports.onAdminUserCreated = exports.updateAdminUser = exports.createAdminUser = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const v2_1 = require("firebase-functions/v2");
const admin = __importStar(require("firebase-admin"));
const firestore_2 = require("firebase-admin/firestore");
const db = admin.firestore();
const auth = admin.auth();
// ========================================
// ADMIN USER CREATION FUNCTIONS
// ========================================
/**
 * Creates a new admin user
 * Callable function for creating admin users
 */
exports.createAdminUser = (0, https_1.onCall)({
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
}, async (request) => {
    try {
        // Verify caller is authenticated and has permission
        if (!request.auth) {
            throw new https_1.HttpsError('unauthenticated', 'Must be authenticated to create admin users');
        }
        // Check if caller has admin creation permissions
        const callerRef = db.collection('admin_users').doc(request.auth.uid);
        const callerDoc = await callerRef.get();
        if (!callerDoc.exists) {
            throw new https_1.HttpsError('permission-denied', 'Caller is not an admin user');
        }
        const callerData = callerDoc.data();
        if (!callerData.permissions.includes('users.create') && !callerData.isSuperAdmin) {
            throw new https_1.HttpsError('permission-denied', 'Insufficient permissions to create admin users');
        }
        const { email, displayName, roleRef, firstName, lastName, title, department } = request.data;
        // Validate required fields
        if (!email || !displayName || !roleRef || !firstName || !lastName) {
            throw new https_1.HttpsError('invalid-argument', 'Missing required fields');
        }
        // Check if user already exists
        const existingUsers = await db.collection('admin_users')
            .where('email', '==', email)
            .limit(1)
            .get();
        if (!existingUsers.empty) {
            throw new https_1.HttpsError('already-exists', 'Admin user with this email already exists');
        }
        // Validate role exists
        const roleDoc = await db.doc(roleRef).get();
        if (!roleDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Specified role does not exist');
        }
        const roleData = roleDoc.data();
        if (!(roleData === null || roleData === void 0 ? void 0 : roleData.isActive)) {
            throw new https_1.HttpsError('invalid-argument', 'Specified role is not active');
        }
        // Create Firebase Auth user
        const userRecord = await auth.createUser({
            email,
            displayName,
            emailVerified: false, // Will be verified via email
        });
        // Get role permissions for denormalization
        const rolePermissions = await getRolePermissions(roleRef);
        // Create admin user document
        const adminUser = {
            id: userRecord.uid,
            email,
            displayName,
            authProvider: 'email',
            emailVerified: false,
            // Role information (denormalized)
            roleRef,
            roleName: roleData.displayName,
            permissions: rolePermissions,
            isActive: true,
            isSuperAdmin: roleData.name === 'super-admin',
            // Profile information
            firstName,
            lastName,
            title,
            department,
            // CMS capabilities based on role
            cmsPermissions: generateCMSPermissions(rolePermissions),
            // Workflow permissions based on role
            workflowPermissions: generateWorkflowPermissions(roleData.level),
            // Default access restrictions
            accessRestrictions: {
                requireMFA: false,
                sessionTimeout: 60,
                maxConcurrentSessions: 3,
            },
            // Activity tracking
            loginCount: 0,
            failedLoginAttempts: 0,
            // Default preferences
            preferences: {
                theme: 'light',
                language: 'en',
                timezone: 'UTC',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12h',
                dashboardLayout: 'grid',
                notificationsEnabled: true,
                emailNotifications: true,
            },
            // Metadata
            createdAt: firestore_2.Timestamp.now(),
            updatedAt: firestore_2.Timestamp.now(),
            createdBy: request.auth.uid,
            updatedBy: request.auth.uid,
            version: 1,
            // Soft delete
            isDeleted: false,
        };
        // Create admin user document
        await db.collection('admin_users').doc(userRecord.uid).set(adminUser);
        // Update role user count (denormalized data)
        await db.doc(roleRef).update({
            userCount: firestore_2.FieldValue.increment(1),
            lastUsedAt: firestore_2.Timestamp.now()
        });
        // Create admin preferences document
        await db.collection('admin_preferences').doc(userRecord.uid).set(Object.assign(Object.assign({ userId: userRecord.uid }, adminUser.preferences), { createdAt: firestore_2.Timestamp.now(), updatedAt: firestore_2.Timestamp.now() }));
        v2_1.logger.info(`Admin user created successfully: ${email}`, { userId: userRecord.uid });
        return {
            success: true,
            userId: userRecord.uid
        };
    }
    catch (error) {
        v2_1.logger.error('Error creating admin user:', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Failed to create admin user');
    }
});
/**
 * Updates an existing admin user
 */
exports.updateAdminUser = (0, https_1.onCall)({
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
}, async (request) => {
    try {
        // Verify caller is authenticated
        if (!request.auth) {
            throw new https_1.HttpsError('unauthenticated', 'Must be authenticated to update admin users');
        }
        const { userId, updates, updatedBy } = request.data;
        // Check if caller has permission to update users
        const callerRef = db.collection('admin_users').doc(request.auth.uid);
        const callerDoc = await callerRef.get();
        if (!callerDoc.exists) {
            throw new https_1.HttpsError('permission-denied', 'Caller is not an admin user');
        }
        const callerData = callerDoc.data();
        if (!callerData.permissions.includes('users.edit') && !callerData.isSuperAdmin) {
            throw new https_1.HttpsError('permission-denied', 'Insufficient permissions to update admin users');
        }
        // Get current user data
        const userRef = db.collection('admin_users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Admin user not found');
        }
        const currentData = userDoc.data();
        // Prepare update data
        const updateData = Object.assign(Object.assign({}, updates), { updatedAt: firestore_2.Timestamp.now(), updatedBy, version: firestore_2.FieldValue.increment(1) });
        // If role is being changed, update denormalized data
        if (updates.roleRef && updates.roleRef !== currentData.roleRef) {
            const [newRoleDoc, newPermissions] = await Promise.all([
                db.doc(updates.roleRef).get(),
                getRolePermissions(updates.roleRef)
            ]);
            if (!newRoleDoc.exists) {
                throw new https_1.HttpsError('not-found', 'New role does not exist');
            }
            const newRoleData = newRoleDoc.data();
            // Update denormalized role data
            updateData.roleName = newRoleData === null || newRoleData === void 0 ? void 0 : newRoleData.displayName;
            updateData.permissions = newPermissions;
            updateData.isSuperAdmin = (newRoleData === null || newRoleData === void 0 ? void 0 : newRoleData.name) === 'super-admin';
            updateData.cmsPermissions = generateCMSPermissions(newPermissions);
            updateData.workflowPermissions = generateWorkflowPermissions(newRoleData === null || newRoleData === void 0 ? void 0 : newRoleData.level);
            // Update role user counts
            await Promise.all([
                db.doc(currentData.roleRef).update({ userCount: firestore_2.FieldValue.increment(-1) }),
                db.doc(updates.roleRef).update({
                    userCount: firestore_2.FieldValue.increment(1),
                    lastUsedAt: firestore_2.Timestamp.now()
                })
            ]);
        }
        // Update admin user
        await userRef.update(updateData);
        v2_1.logger.info(`Admin user updated successfully: ${userId}`, { updatedBy });
        return { success: true };
    }
    catch (error) {
        v2_1.logger.error('Error updating admin user:', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Failed to update admin user');
    }
});
// ========================================
// FIRESTORE TRIGGERS
// ========================================
/**
 * Trigger when admin user is created
 * Handles event-driven consistency updates
 */
exports.onAdminUserCreated = (0, firestore_1.onDocumentCreated)({
    document: 'admin_users/{userId}',
    region: 'us-central1',
    memory: '256MiB',
}, async (event) => {
    var _a;
    try {
        const adminData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
        const userId = event.params.userId;
        if (!adminData) {
            v2_1.logger.error('No admin data found in created document');
            return;
        }
        // Create audit log
        await db.collection('admin_audit_logs').add({
            adminRef: `admin_users/${adminData.createdBy}`,
            adminEmail: 'system', // Will be updated by another trigger
            adminName: 'System',
            action: 'user.create',
            resource: 'admin_users',
            resourceId: userId,
            description: `Created admin user: ${adminData.email}`,
            ipAddress: '0.0.0.0',
            userAgent: 'Cloud Function',
            timestamp: firestore_2.Timestamp.now(),
            severity: 'medium',
            category: 'users',
            success: true,
            searchKeywords: ['admin', 'create', 'user', adminData.email, adminData.roleName],
            dateString: new Date().toISOString().split('T')[0]
        });
        // Send welcome email (if email service is configured)
        // await sendWelcomeEmail(adminData.email, adminData.displayName);
        v2_1.logger.info(`Admin user creation processed: ${adminData.email}`);
    }
    catch (error) {
        v2_1.logger.error('Error processing admin user creation:', error);
    }
});
/**
 * Trigger when admin user is updated
 * Handles denormalized data consistency
 */
exports.onAdminUserUpdated = (0, firestore_1.onDocumentUpdated)({
    document: 'admin_users/{userId}',
    region: 'us-central1',
    memory: '256MiB',
}, async (event) => {
    var _a, _b;
    try {
        const beforeData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
        const afterData = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
        const userId = event.params.userId;
        if (!beforeData || !afterData) {
            v2_1.logger.error('Missing before/after data in admin user update');
            return;
        }
        // Determine what changed
        const changes = [];
        if (beforeData.email !== afterData.email)
            changes.push('email');
        if (beforeData.roleRef !== afterData.roleRef)
            changes.push('role');
        if (beforeData.isActive !== afterData.isActive)
            changes.push('status');
        if (beforeData.displayName !== afterData.displayName)
            changes.push('name');
        // Create audit log
        await db.collection('admin_audit_logs').add({
            adminRef: `admin_users/${afterData.updatedBy}`,
            adminEmail: 'system',
            adminName: 'System',
            action: 'user.update',
            resource: 'admin_users',
            resourceId: userId,
            description: `Updated admin user: ${afterData.email} (${changes.join(', ')})`,
            changes: {
                before: beforeData,
                after: afterData,
                fields: changes
            },
            ipAddress: '0.0.0.0',
            userAgent: 'Cloud Function',
            timestamp: firestore_2.Timestamp.now(),
            severity: 'low',
            category: 'users',
            success: true,
            searchKeywords: ['admin', 'update', 'user', afterData.email, ...changes],
            dateString: new Date().toISOString().split('T')[0]
        });
        v2_1.logger.info(`Admin user update processed: ${afterData.email}`, { changes });
    }
    catch (error) {
        v2_1.logger.error('Error processing admin user update:', error);
    }
});
// ========================================
// HELPER FUNCTIONS
// ========================================
/**
 * Gets all permissions for a role (including inherited permissions)
 */
async function getRolePermissions(roleRef) {
    const roleDoc = await db.doc(roleRef).get();
    if (!roleDoc.exists)
        return [];
    const roleData = roleDoc.data();
    return (roleData === null || roleData === void 0 ? void 0 : roleData.permissions) || [];
}
/**
 * Gets all available permissions
 */
// async function getAllPermissions(): Promise<string[]> { // Available for future use
//   const permissionsSnapshot = await db.collection('admin_permissions')
//     .where('isActive', '==', true)
//     .get();
//
//   return permissionsSnapshot.docs.map(doc => doc.data().name);
// }
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
/**
 * Generates workflow permissions based on role level
 */
function generateWorkflowPermissions(roleLevel) {
    return {
        canApproveContent: roleLevel >= 6,
        canRejectContent: roleLevel >= 6,
        canAssignTasks: roleLevel >= 4,
        canCreateWorkflows: roleLevel >= 8,
        approvalLevel: Math.min(Math.floor(roleLevel / 2), 5),
    };
}
//# sourceMappingURL=adminFunctions.js.map