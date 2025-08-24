"use strict";
/**
 * Create John Admin User Cloud Function
 *
 * A callable function to create the specific admin user requested:
 * Email: john@encreasl.com
 * Password: @Iamachessgrandmaster23
 * Role: Admin
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
exports.createJohnAdmin = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const db = admin.firestore();
const auth = admin.auth();
// Admin user details
const ADMIN_EMAIL = 'john@encreasl.com';
const ADMIN_PASSWORD = '@Iamachessgrandmaster23';
const ADMIN_NAME = 'John Admin';
const ADMIN_ROLE = 'admin'; // Using 'admin' role instead of 'super-admin'
exports.createJohnAdmin = (0, https_1.onCall)({
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 120,
}, async (request) => {
    var _a, _b;
    try {
        v2_1.logger.info('Starting John admin user creation...');
        // Step 1: Create user in Firebase Auth
        v2_1.logger.info('Creating admin user in Firebase Auth...');
        let userRecord;
        try {
            // Try to create the user
            userRecord = await auth.createUser({
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                displayName: ADMIN_NAME,
                emailVerified: true,
            });
            v2_1.logger.info(`Created Firebase Auth user: ${ADMIN_EMAIL}`);
        }
        catch (error) {
            if (error.code === 'auth/email-already-exists') {
                // User already exists, get their record
                userRecord = await auth.getUserByEmail(ADMIN_EMAIL);
                v2_1.logger.info(`Firebase Auth user already exists: ${ADMIN_EMAIL}`);
                // Update password if needed
                await auth.updateUser(userRecord.uid, {
                    password: ADMIN_PASSWORD,
                    displayName: ADMIN_NAME,
                    emailVerified: true,
                });
                v2_1.logger.info('Updated existing user password and details');
            }
            else {
                throw error;
            }
        }
        // Step 2: Check if admin role exists
        v2_1.logger.info('Checking admin role...');
        const adminRoleDoc = await db.collection('admin_roles').doc(ADMIN_ROLE).get();
        if (!adminRoleDoc.exists) {
            throw new https_1.HttpsError('failed-precondition', 'Admin role not found. Please run the admin system initialization first.');
        }
        const roleData = adminRoleDoc.data();
        v2_1.logger.info(`Found admin role: ${roleData === null || roleData === void 0 ? void 0 : roleData.displayName}`);
        // Step 3: Create admin user document in Firestore
        v2_1.logger.info('Creating admin user document in Firestore...');
        const adminUserDoc = {
            id: userRecord.uid,
            email: ADMIN_EMAIL,
            displayName: ADMIN_NAME,
            authProvider: 'email',
            emailVerified: true,
            // Role information (denormalized for performance)
            roleRef: `admin_roles/${ADMIN_ROLE}`,
            roleName: roleData === null || roleData === void 0 ? void 0 : roleData.displayName,
            permissions: (roleData === null || roleData === void 0 ? void 0 : roleData.permissions) || [],
            isActive: true,
            isSuperAdmin: false, // This is an admin, not super admin
            // Profile information
            firstName: ADMIN_NAME.split(' ')[0],
            lastName: ADMIN_NAME.split(' ').slice(1).join(' '),
            title: 'Administrator',
            department: 'Administration',
            // CMS capabilities based on admin role
            cmsPermissions: {
                content: {
                    canCreate: true,
                    canEdit: true,
                    canDelete: false, // Admins can't delete content
                    canPublish: true,
                    canSchedule: true,
                },
                media: {
                    canUpload: true,
                    canDelete: true,
                    canOrganize: true,
                    maxUploadSize: 50, // 50MB for admins
                },
                users: {
                    canView: true,
                    canCreate: true,
                    canEdit: true,
                    canDelete: false, // Admins can't delete users
                    canChangeRoles: false, // Only super admins can change roles
                },
                analytics: {
                    canView: true,
                    canExport: false, // Only super admins can export
                    canConfigureDashboards: false,
                },
                settings: {
                    canViewSystem: true,
                    canEditSystem: false, // Only super admins can edit system settings
                    canManageIntegrations: false,
                    canManageBackups: false,
                },
            },
            // Workflow permissions
            workflowPermissions: {
                canApproveContent: true,
                canRejectContent: true,
                canAssignTasks: true,
                canCreateWorkflows: false, // Only super admins
                approvalLevel: 3, // Admin level
            },
            // Default access restrictions
            accessRestrictions: {
                requireMFA: false,
                sessionTimeout: 60, // 1 hour
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
            // Timestamps
            createdAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
            createdBy: ((_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid) || 'system',
            updatedBy: ((_b = request.auth) === null || _b === void 0 ? void 0 : _b.uid) || 'system',
            version: 1,
            // Soft delete
            isDeleted: false,
        };
        // Check if admin user document already exists
        const existingAdminDoc = await db.collection('admin_users').doc(userRecord.uid).get();
        if (existingAdminDoc.exists) {
            v2_1.logger.info('Admin user document already exists, updating...');
            await db.collection('admin_users').doc(userRecord.uid).update(Object.assign(Object.assign({}, adminUserDoc), { updatedAt: firestore_1.Timestamp.now() }));
        }
        else {
            await db.collection('admin_users').doc(userRecord.uid).set(adminUserDoc);
            v2_1.logger.info('Created admin user document');
        }
        // Step 4: Set custom claims for Firebase Auth
        v2_1.logger.info('Setting custom claims...');
        await auth.setCustomUserClaims(userRecord.uid, {
            admin: true,
            superAdmin: false,
            role: ADMIN_ROLE,
            permissions: (roleData === null || roleData === void 0 ? void 0 : roleData.permissions) || [],
        });
        v2_1.logger.info('Set custom claims');
        // Step 5: Update role user count
        v2_1.logger.info('Updating role user count...');
        await db.collection('admin_roles').doc(ADMIN_ROLE).update({
            userCount: firestore_1.FieldValue.increment(1),
            lastUsedAt: firestore_1.Timestamp.now(),
        });
        // Step 6: Create admin preferences document
        v2_1.logger.info('Creating admin preferences...');
        const preferencesDoc = await db.collection('admin_preferences').doc(userRecord.uid).get();
        if (!preferencesDoc.exists) {
            await db.collection('admin_preferences').doc(userRecord.uid).set({
                userId: userRecord.uid,
                theme: 'light',
                language: 'en',
                timezone: 'UTC',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12h',
                dashboardLayout: 'grid',
                notificationsEnabled: true,
                emailNotifications: true,
                createdAt: firestore_1.Timestamp.now(),
                updatedAt: firestore_1.Timestamp.now(),
            });
            v2_1.logger.info('Created admin preferences');
        }
        else {
            v2_1.logger.info('Admin preferences already exist');
        }
        v2_1.logger.info('John admin user created successfully!');
        return {
            success: true,
            message: 'John admin user created successfully',
            user: {
                uid: userRecord.uid,
                email: ADMIN_EMAIL,
                displayName: ADMIN_NAME,
                role: roleData === null || roleData === void 0 ? void 0 : roleData.displayName,
            }
        };
    }
    catch (error) {
        v2_1.logger.error('Error creating John admin user:', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Failed to create John admin user');
    }
});
//# sourceMappingURL=createJohnAdmin.js.map