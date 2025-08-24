"use strict";
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
exports.resetAdminSystem = exports.checkAdminSystemStatus = exports.initializeAdminSystem = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const admin = __importStar(require("firebase-admin"));
const createAdminCollections_1 = require("./createAdminCollections");
const db = admin.firestore();
const auth = admin.auth();
/**
 * Initializes the entire admin system
 * This is a one-time setup function
 */
exports.initializeAdminSystem = (0, https_1.onCall)({
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 300, // 5 minutes
}, async (request) => {
    try {
        v2_1.logger.info('Starting admin system initialization...');
        const { superAdminEmail, superAdminPassword, superAdminName } = request.data;
        // Validate required parameters
        if (!superAdminEmail || !superAdminPassword || !superAdminName) {
            throw new https_1.HttpsError('invalid-argument', 'Missing required fields: superAdminEmail, superAdminPassword, superAdminName');
        }
        // Check if admin system is already initialized
        const existingRoles = await db.collection('admin_roles').limit(1).get();
        if (!existingRoles.empty) {
            v2_1.logger.info('Admin system already initialized');
            return {
                success: true,
                message: 'Admin system already initialized',
                alreadyExists: true
            };
        }
        // Step 1: Create admin collections structure
        v2_1.logger.info('Creating admin collections structure...');
        await (0, createAdminCollections_1.createAdminCollections)();
        // Step 2: Create super admin user in Firebase Auth
        v2_1.logger.info('Creating super admin user in Firebase Auth...');
        let superAdminUid;
        try {
            const userRecord = await auth.createUser({
                email: superAdminEmail,
                password: superAdminPassword,
                displayName: superAdminName,
                emailVerified: true,
            });
            superAdminUid = userRecord.uid;
            // Set custom claims for super admin
            await auth.setCustomUserClaims(superAdminUid, {
                admin: true,
                superAdmin: true,
                role: 'super-admin',
                permissions: ['*']
            });
            v2_1.logger.info(`Super admin created in Firebase Auth: ${superAdminEmail}`);
        }
        catch (error) {
            if (error.code === 'auth/email-already-exists') {
                // User already exists, get their UID
                const existingUser = await auth.getUserByEmail(superAdminEmail);
                superAdminUid = existingUser.uid;
                // Update custom claims
                await auth.setCustomUserClaims(superAdminUid, {
                    admin: true,
                    superAdmin: true,
                    role: 'super-admin',
                    permissions: ['*']
                });
                v2_1.logger.info(`Using existing Firebase Auth user: ${superAdminEmail}`);
            }
            else {
                throw error;
            }
        }
        // Step 3: Create super admin user in Firestore
        v2_1.logger.info('Creating super admin user in Firestore...');
        await (0, createAdminCollections_1.createSuperAdmin)(superAdminEmail, superAdminUid, superAdminName);
        // Step 4: Create initial audit log
        await db.collection('admin_audit_logs').add({
            adminRef: `admin_users/${superAdminUid}`,
            adminEmail: superAdminEmail,
            adminName: superAdminName,
            action: 'system.initialize',
            resource: 'admin_system',
            description: 'Admin system initialized successfully',
            ipAddress: '0.0.0.0',
            userAgent: 'Setup Script',
            timestamp: admin.firestore.Timestamp.now(),
            severity: 'high',
            category: 'system',
            success: true,
            searchKeywords: ['system', 'initialize', 'setup', 'admin'],
            dateString: new Date().toISOString().split('T')[0]
        });
        // Step 5: Create system configuration document
        await db.collection('system_config').doc('admin_system').set({
            initialized: true,
            initializedAt: admin.firestore.Timestamp.now(),
            initializedBy: superAdminUid,
            version: '1.0.0',
            features: {
                roleBasedAccess: true,
                auditLogging: true,
                sessionManagement: true,
                permissionInheritance: true,
                multiFactorAuth: false, // Can be enabled later
            },
            settings: {
                sessionTimeout: 60, // minutes
                maxFailedLogins: 5,
                lockoutDuration: 30, // minutes
                passwordPolicy: {
                    minLength: 8,
                    requireUppercase: true,
                    requireLowercase: true,
                    requireNumbers: true,
                    requireSpecialChars: true,
                }
            }
        });
        v2_1.logger.info('Admin system initialization completed successfully');
        return {
            success: true,
            message: 'Admin system initialized successfully',
            superAdminId: superAdminUid,
            superAdminEmail,
            features: [
                'Role-based access control',
                'Permission inheritance',
                'Audit logging',
                'Session management',
                'User management',
                'Content management permissions'
            ]
        };
    }
    catch (error) {
        v2_1.logger.error('Error initializing admin system:', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Failed to initialize admin system');
    }
});
/**
 * Checks if the admin system is properly initialized
 */
exports.checkAdminSystemStatus = (0, https_1.onCall)({
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 30,
}, async (request) => {
    try {
        // Check if system config exists
        const systemConfigDoc = await db.collection('system_config').doc('admin_system').get();
        if (!systemConfigDoc.exists) {
            return {
                initialized: false,
                message: 'Admin system not initialized'
            };
        }
        const systemConfig = systemConfigDoc.data();
        // Check if required collections exist
        const [rolesSnapshot, permissionsSnapshot, usersSnapshot] = await Promise.all([
            db.collection('admin_roles').limit(1).get(),
            db.collection('admin_permissions').limit(1).get(),
            db.collection('admin_users').limit(1).get()
        ]);
        const collectionsExist = !rolesSnapshot.empty && !permissionsSnapshot.empty && !usersSnapshot.empty;
        // Count system entities
        const [roleCount, permissionCount, userCount] = await Promise.all([
            db.collection('admin_roles').where('isActive', '==', true).get().then(snap => snap.size),
            db.collection('admin_permissions').where('isActive', '==', true).get().then(snap => snap.size),
            db.collection('admin_users').where('isActive', '==', true).get().then(snap => snap.size)
        ]);
        return {
            initialized: (systemConfig === null || systemConfig === void 0 ? void 0 : systemConfig.initialized) && collectionsExist,
            initializedAt: systemConfig === null || systemConfig === void 0 ? void 0 : systemConfig.initializedAt,
            version: systemConfig === null || systemConfig === void 0 ? void 0 : systemConfig.version,
            features: systemConfig === null || systemConfig === void 0 ? void 0 : systemConfig.features,
            statistics: {
                totalRoles: roleCount,
                totalPermissions: permissionCount,
                totalAdminUsers: userCount
            },
            collections: {
                rolesExist: !rolesSnapshot.empty,
                permissionsExist: !permissionsSnapshot.empty,
                usersExist: !usersSnapshot.empty
            }
        };
    }
    catch (error) {
        v2_1.logger.error('Error checking admin system status:', error);
        throw new https_1.HttpsError('internal', 'Failed to check admin system status');
    }
});
/**
 * Resets the admin system (DANGEROUS - use with caution)
 */
exports.resetAdminSystem = (0, https_1.onCall)({
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 300,
}, async (request) => {
    var _a, _b;
    try {
        // Verify caller is super admin
        if (!request.auth) {
            throw new https_1.HttpsError('unauthenticated', 'Must be authenticated');
        }
        const callerDoc = await db.collection('admin_users').doc(request.auth.uid).get();
        if (!callerDoc.exists) {
            throw new https_1.HttpsError('permission-denied', 'Caller is not an admin user');
        }
        const callerData = callerDoc.data();
        if (!(callerData === null || callerData === void 0 ? void 0 : callerData.isSuperAdmin)) {
            throw new https_1.HttpsError('permission-denied', 'Only super admins can reset the system');
        }
        const { confirmationCode } = request.data;
        if (confirmationCode !== 'RESET_ADMIN_SYSTEM_CONFIRM') {
            throw new https_1.HttpsError('invalid-argument', 'Invalid confirmation code');
        }
        v2_1.logger.warn(`Admin system reset initiated by ${callerData.email}`);
        // Delete all admin collections (except the caller)
        const collections = [
            'admin_roles',
            'admin_permissions',
            'admin_sessions',
            'admin_audit_logs',
            'admin_preferences'
        ];
        for (const collectionName of collections) {
            const snapshot = await db.collection(collectionName).get();
            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            // Check if batch has operations (using internal property for Firebase Admin SDK)
            if (!((_a = batch._ops) === null || _a === void 0 ? void 0 : _a.length))
                continue;
            await batch.commit();
        }
        // Delete other admin users (keep the caller)
        const adminUsersSnapshot = await db.collection('admin_users').get();
        const userBatch = db.batch();
        adminUsersSnapshot.docs.forEach(doc => {
            if (doc.id !== request.auth.uid) {
                userBatch.delete(doc.ref);
            }
        });
        if (((_b = userBatch._ops) === null || _b === void 0 ? void 0 : _b.length) > 0) {
            await userBatch.commit();
        }
        // Reset system config
        await db.collection('system_config').doc('admin_system').delete();
        v2_1.logger.warn('Admin system reset completed');
        return {
            success: true,
            message: 'Admin system reset successfully',
            resetBy: callerData.email,
            resetAt: new Date().toISOString()
        };
    }
    catch (error) {
        v2_1.logger.error('Error resetting admin system:', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Failed to reset admin system');
    }
});
//# sourceMappingURL=setupAdmin.js.map