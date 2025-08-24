"use strict";
/**
 * Admin Collections Setup
 *
 * This file contains functions to create and initialize the admin collections
 * for the CMS system. It follows the schema defined in docs/admin-schema.md.
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
exports.createAdminCollections = createAdminCollections;
exports.createSuperAdmin = createSuperAdmin;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
// Initialize Firestore
const db = admin.firestore();
/**
 * Creates the initial admin collections structure
 */
async function createAdminCollections() {
    try {
        console.log('Creating admin collections structure...');
        // Create collections in batch for atomicity
        const batch = db.batch();
        // Create default admin roles
        await createDefaultRoles(batch);
        // Create default permissions
        await createDefaultPermissions(batch);
        // Commit the batch
        await batch.commit();
        console.log('Admin collections structure created successfully');
        return { success: true };
    }
    catch (error) {
        console.error('Error creating admin collections:', error);
        throw error;
    }
}
/**
 * Creates default admin roles
 */
async function createDefaultRoles(batch) {
    const rolesCollection = db.collection('admin_roles');
    // Super Admin Role
    const superAdminRole = {
        id: 'super-admin',
        name: 'super-admin',
        displayName: 'Super Admin',
        description: 'Has full access to all system features and settings',
        permissions: ['*'], // Wildcard for all permissions
        permissionRefs: [],
        level: 10,
        childRoleRefs: ['admin', 'content-manager', 'editor'],
        isSystemRole: true,
        isCustomRole: false,
        userCount: 0,
        createdAt: firestore_1.Timestamp.now(),
        updatedAt: firestore_1.Timestamp.now(),
        createdBy: 'system',
        isActive: true
    };
    // Admin Role
    const adminRole = {
        id: 'admin',
        name: 'admin',
        displayName: 'Administrator',
        description: 'Can manage most system settings and users',
        permissions: [
            'users.view', 'users.create', 'users.edit',
            'content.view', 'content.create', 'content.edit', 'content.publish',
            'media.view', 'media.upload', 'media.delete',
            'settings.view'
        ],
        permissionRefs: [],
        level: 8,
        parentRoleRef: 'admin_roles/super-admin',
        childRoleRefs: ['content-manager', 'editor'],
        isSystemRole: true,
        isCustomRole: false,
        userCount: 0,
        createdAt: firestore_1.Timestamp.now(),
        updatedAt: firestore_1.Timestamp.now(),
        createdBy: 'system',
        isActive: true
    };
    // Content Manager Role
    const contentManagerRole = {
        id: 'content-manager',
        name: 'content-manager',
        displayName: 'Content Manager',
        description: 'Can manage all content and media',
        permissions: [
            'content.view', 'content.create', 'content.edit', 'content.publish',
            'media.view', 'media.upload', 'media.delete',
            'analytics.view'
        ],
        permissionRefs: [],
        level: 6,
        parentRoleRef: 'admin_roles/admin',
        childRoleRefs: ['editor'],
        isSystemRole: true,
        isCustomRole: false,
        userCount: 0,
        createdAt: firestore_1.Timestamp.now(),
        updatedAt: firestore_1.Timestamp.now(),
        createdBy: 'system',
        isActive: true
    };
    // Editor Role
    const editorRole = {
        id: 'editor',
        name: 'editor',
        displayName: 'Editor',
        description: 'Can create and edit content but cannot publish',
        permissions: [
            'content.view', 'content.create', 'content.edit',
            'media.view', 'media.upload'
        ],
        permissionRefs: [],
        level: 4,
        parentRoleRef: 'admin_roles/content-manager',
        childRoleRefs: [],
        isSystemRole: true,
        isCustomRole: false,
        userCount: 0,
        createdAt: firestore_1.Timestamp.now(),
        updatedAt: firestore_1.Timestamp.now(),
        createdBy: 'system',
        isActive: true
    };
    // Add roles to batch
    batch.set(rolesCollection.doc('super-admin'), superAdminRole);
    batch.set(rolesCollection.doc('admin'), adminRole);
    batch.set(rolesCollection.doc('content-manager'), contentManagerRole);
    batch.set(rolesCollection.doc('editor'), editorRole);
    console.log('Default admin roles created');
}
/**
 * Creates default admin permissions
 */
async function createDefaultPermissions(batch) {
    const permissionsCollection = db.collection('admin_permissions');
    // Define permission categories
    const categories = ['content', 'media', 'users', 'settings', 'analytics'];
    // Define actions per category
    const categoryActions = {
        content: ['view', 'create', 'edit', 'delete', 'publish', 'schedule'],
        media: ['view', 'upload', 'edit', 'delete', 'organize'],
        users: ['view', 'create', 'edit', 'delete', 'change-roles'],
        settings: ['view', 'edit', 'manage-integrations', 'manage-backups'],
        analytics: ['view', 'export', 'configure-dashboards']
    };
    // Create permissions for each category and action
    for (const category of categories) {
        const actions = categoryActions[category];
        for (const action of actions) {
            const permissionId = `${category}.${action}`;
            const permission = {
                id: permissionId,
                name: permissionId,
                displayName: `${capitalizeFirstLetter(action)} ${capitalizeFirstLetter(category)}`,
                description: `Can ${action} ${category}`,
                category,
                resource: category,
                action,
                isSystemPermission: true,
                isActive: true,
                createdAt: firestore_1.Timestamp.now(),
                updatedAt: firestore_1.Timestamp.now(),
                roleCount: 0,
                userCount: 0
            };
            batch.set(permissionsCollection.doc(permissionId), permission);
        }
    }
    console.log('Default admin permissions created');
}
/**
 * Creates a super admin user
 */
async function createSuperAdmin(email, uid, displayName) {
    try {
        console.log(`Creating super admin user: ${email}`);
        // Check if user already exists
        const existingUser = await db.collection('admin_users').doc(uid).get();
        if (existingUser.exists) {
            console.log('Admin user already exists');
            return { success: true, exists: true, userId: uid };
        }
        // Create admin user document
        const adminUser = {
            id: uid,
            email,
            displayName,
            authProvider: 'email',
            emailVerified: true,
            // Role information
            roleRef: 'admin_roles/super-admin',
            roleName: 'Super Admin',
            permissions: ['*'],
            isActive: true,
            isSuperAdmin: true,
            // Profile information
            firstName: displayName.split(' ')[0],
            lastName: displayName.split(' ').slice(1).join(' '),
            title: 'Super Administrator',
            // CMS capabilities (all enabled for super admin)
            cmsPermissions: {
                content: {
                    canCreate: true,
                    canEdit: true,
                    canDelete: true,
                    canPublish: true,
                    canSchedule: true,
                },
                media: {
                    canUpload: true,
                    canDelete: true,
                    canOrganize: true,
                    maxUploadSize: 100, // 100MB
                },
                users: {
                    canView: true,
                    canCreate: true,
                    canEdit: true,
                    canDelete: true,
                    canChangeRoles: true,
                },
                analytics: {
                    canView: true,
                    canExport: true,
                    canConfigureDashboards: true,
                },
                settings: {
                    canViewSystem: true,
                    canEditSystem: true,
                    canManageIntegrations: true,
                    canManageBackups: true,
                },
            },
            // Workflow permissions
            workflowPermissions: {
                canApproveContent: true,
                canRejectContent: true,
                canAssignTasks: true,
                canCreateWorkflows: true,
                approvalLevel: 5, // Highest level
            },
            // Access control
            accessRestrictions: {
                requireMFA: false, // Initially false for setup
                sessionTimeout: 60, // 60 minutes
                maxConcurrentSessions: 3,
            },
            // Activity tracking
            loginCount: 0,
            failedLoginAttempts: 0,
            // Preferences
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
            createdAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
            createdBy: 'system',
            updatedBy: 'system',
            version: 1,
            // Soft delete
            isDeleted: false,
        };
        // Create admin user
        await db.collection('admin_users').doc(uid).set(adminUser);
        // Update role user count
        await db.collection('admin_roles').doc('super-admin').update({
            userCount: firestore_1.FieldValue.increment(1),
            lastUsedAt: firestore_1.Timestamp.now()
        });
        // Create admin preferences
        await db.collection('admin_preferences').doc(uid).set({
            userId: uid,
            theme: 'light',
            language: 'en',
            timezone: 'UTC',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h',
            dashboardLayout: 'grid',
            notificationsEnabled: true,
            emailNotifications: true,
            createdAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now()
        });
        // Log admin creation
        await db.collection('admin_audit_logs').add({
            adminRef: `admin_users/system`,
            adminEmail: 'system',
            adminName: 'System',
            action: 'user.create',
            resource: 'admin_users',
            resourceId: uid,
            description: `Created super admin user: ${email}`,
            ipAddress: '0.0.0.0',
            userAgent: 'System',
            timestamp: firestore_1.Timestamp.now(),
            severity: 'high',
            category: 'authentication',
            success: true,
            searchKeywords: ['admin', 'create', 'super-admin', email],
            dateString: new Date().toISOString().split('T')[0]
        });
        console.log(`Super admin user created successfully: ${email}`);
        return { success: true, userId: uid };
    }
    catch (error) {
        console.error('Error creating super admin:', error);
        throw error;
    }
}
// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.replace(/-/g, ' ').slice(1);
}
//# sourceMappingURL=createAdminCollections.js.map