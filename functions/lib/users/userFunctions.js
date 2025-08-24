"use strict";
/**
 * User Management Cloud Functions
 *
 * Handles user creation, updates, and management operations for regular users.
 * Follows the same patterns as admin functions but tailored for end users.
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.updateUser = exports.createUser = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const db = admin.firestore();
const auth = admin.auth();
/**
 * Creates a new regular user in the system
 */
exports.createUser = (0, https_1.onCall)({
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
}, async (request) => {
    var _a, _b;
    try {
        const { email, displayName, firstName, lastName, phoneNumber, accountType, preferences } = request.data;
        // Validate required fields
        if (!email || !displayName) {
            throw new https_1.HttpsError('invalid-argument', 'Email and display name are required');
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new https_1.HttpsError('invalid-argument', 'Invalid email format');
        }
        // Check if user already exists
        try {
            await auth.getUserByEmail(email);
            throw new https_1.HttpsError('already-exists', 'User with this email already exists');
        }
        catch (error) {
            if (error.code !== 'auth/user-not-found') {
                throw error;
            }
            // User doesn't exist, continue with creation
        }
        // Create Firebase Auth user
        const userRecord = await auth.createUser({
            email,
            displayName,
            emailVerified: false, // Will be verified via email
            phoneNumber: phoneNumber || undefined,
        });
        // Create default preferences
        const defaultPreferences = Object.assign({ theme: 'light', language: 'en', timezone: 'UTC', dateFormat: 'MM/DD/YYYY', timeFormat: '12h', currency: 'USD', notifications: {
                email: true,
                push: true,
                sms: false,
                marketing: false,
            }, privacy: {
                profileVisibility: 'public',
                showEmail: false,
                showPhone: false,
                allowSearchByEmail: true,
            } }, preferences);
        // Create user document
        const user = {
            id: userRecord.uid,
            email,
            displayName,
            authProvider: 'email',
            emailVerified: false,
            phoneNumber: phoneNumber || undefined,
            // Profile information
            firstName: firstName || displayName.split(' ')[0],
            lastName: lastName || displayName.split(' ').slice(1).join(' '),
            // Contact
            phoneVerified: false,
            // Status & permissions
            isActive: true,
            isVerified: false,
            accountType: accountType || 'free',
            // Activity tracking
            loginCount: 0,
            failedLoginAttempts: 0,
            // Preferences (denormalized)
            preferences: defaultPreferences,
            // Analytics
            analytics: {
                signupSource: 'api',
                totalSessions: 0,
                totalTimeSpent: 0,
            },
            // Compliance
            compliance: {
                gdprCompliant: true,
                ccpaCompliant: true,
            },
            // Metadata
            createdAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
            createdBy: (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid, // Admin ID if created by admin
            updatedBy: (_b = request.auth) === null || _b === void 0 ? void 0 : _b.uid,
            version: 1,
            // Soft delete
            isDeleted: false,
        };
        // Create user document in Firestore
        await db.collection('users').doc(userRecord.uid).set(user);
        // Create detailed user preferences document
        const userPreferences = Object.assign(Object.assign({ userId: userRecord.uid }, defaultPreferences), { notifications: {
                email: true,
                push: true,
                sms: false,
                marketing: false,
                productUpdates: true,
                securityAlerts: true,
                weeklyDigest: false,
                monthlyReport: false,
            }, privacy: {
                profileVisibility: 'public',
                showEmail: false,
                showPhone: false,
                allowSearchByEmail: true,
                allowDataCollection: true,
                allowPersonalization: true,
            }, communication: {
                preferredContactMethod: 'email',
                quietHours: {
                    enabled: false,
                    start: '22:00',
                    end: '08:00',
                    timezone: 'UTC',
                },
                frequency: {
                    marketing: 'weekly',
                    updates: 'immediate',
                },
            }, createdAt: firestore_1.Timestamp.now(), updatedAt: firestore_1.Timestamp.now(), version: 1 });
        await db.collection('user_preferences').doc(userRecord.uid).set(userPreferences);
        v2_1.logger.info(`User created successfully: ${email}`, { userId: userRecord.uid });
        return {
            success: true,
            userId: userRecord.uid
        };
    }
    catch (error) {
        v2_1.logger.error('Error creating user:', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Failed to create user');
    }
});
/**
 * Updates an existing user
 */
exports.updateUser = (0, https_1.onCall)({
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
}, async (request) => {
    var _a, _b, _c, _d;
    try {
        const _e = request.data, { userId } = _e, updateData = __rest(_e, ["userId"]);
        // Validate required fields
        if (!userId) {
            throw new https_1.HttpsError('invalid-argument', 'User ID is required');
        }
        // Check if user exists
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            throw new https_1.HttpsError('not-found', 'User not found');
        }
        // Check permissions - users can only update their own data, admins can update any
        if (((_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid) !== userId && !((_c = (_b = request.auth) === null || _b === void 0 ? void 0 : _b.token) === null || _c === void 0 ? void 0 : _c.admin)) {
            throw new https_1.HttpsError('permission-denied', 'Insufficient permissions');
        }
        // Prepare update data
        const updateFields = Object.assign(Object.assign({}, updateData), { updatedAt: firestore_1.Timestamp.now(), updatedBy: (_d = request.auth) === null || _d === void 0 ? void 0 : _d.uid, version: firestore_1.FieldValue.increment(1) });
        // Update user document
        await db.collection('users').doc(userId).update(updateFields);
        // Update preferences if provided
        if (updateData.preferences) {
            await db.collection('user_preferences').doc(userId).update(Object.assign(Object.assign({}, updateData.preferences), { updatedAt: firestore_1.Timestamp.now(), version: firestore_1.FieldValue.increment(1) }));
        }
        v2_1.logger.info(`User updated successfully: ${userId}`);
        return {
            success: true
        };
    }
    catch (error) {
        v2_1.logger.error('Error updating user:', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Failed to update user');
    }
});
/**
 * Gets a user by ID
 */
exports.getUser = (0, https_1.onCall)({
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 30,
}, async (request) => {
    var _a, _b, _c;
    try {
        const { userId } = request.data;
        // Validate required fields
        if (!userId) {
            throw new https_1.HttpsError('invalid-argument', 'User ID is required');
        }
        // Check permissions - users can only get their own data, admins can get any
        if (((_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid) !== userId && !((_c = (_b = request.auth) === null || _b === void 0 ? void 0 : _b.token) === null || _c === void 0 ? void 0 : _c.admin)) {
            throw new https_1.HttpsError('permission-denied', 'Insufficient permissions');
        }
        // Get user document
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            throw new https_1.HttpsError('not-found', 'User not found');
        }
        const user = userDoc.data();
        return {
            success: true,
            user
        };
    }
    catch (error) {
        v2_1.logger.error('Error getting user:', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Failed to get user');
    }
});
//# sourceMappingURL=userFunctions.js.map