"use strict";
/**
 * User Authentication Triggers
 *
 * Cloud Functions that handle Firebase Auth events and sync with Firestore.
 * These triggers ensure user documents are created/updated when auth events occur.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserPreferencesUpdated = exports.onUserUpdated = exports.onAuthUserCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const v2_1 = require("firebase-functions/v2");
const firestore_2 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
const userUtils_1 = require("../users/userUtils");
const db = (0, firestore_2.getFirestore)();
const auth = (0, auth_1.getAuth)();
// ========================================
// FIREBASE AUTH USER CREATED TRIGGER
// ========================================
/**
 * Triggered when a new user signs up via Firebase Auth
 * Creates corresponding Firestore documents
 */
exports.onAuthUserCreated = (0, firestore_1.onDocumentCreated)({
    document: "users/{userId}",
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
}, async (event) => {
    var _a;
    try {
        const userData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
        const userId = event.params.userId;
        if (!userData) {
            v2_1.logger.error("No user data found in trigger");
            return;
        }
        v2_1.logger.info(`Processing auth user creation: ${userId}`);
        // Check if this is a new user document that needs initialization
        const existingUser = await (0, userUtils_1.getUserById)(userId);
        if (existingUser && existingUser.version > 1) {
            v2_1.logger.info(`User ${userId} already initialized, skipping`);
            return;
        }
        // Get Firebase Auth user data for additional info
        let authUser;
        try {
            authUser = await auth.getUser(userId);
        }
        catch (error) {
            v2_1.logger.warn(`Could not get auth user ${userId}:`, error);
        }
        // Ensure user document has all required fields
        const updates = {};
        let needsUpdate = false;
        // Check and set missing required fields
        if (!userData.analytics) {
            updates.analytics = {
                signupSource: 'web',
                totalSessions: 0,
                totalTimeSpent: 0,
                firstVisitAt: firestore_2.Timestamp.now(),
            };
            needsUpdate = true;
        }
        if (!userData.compliance) {
            updates.compliance = {
                gdprCompliant: true,
                ccpaCompliant: true,
            };
            needsUpdate = true;
        }
        if (!userData.preferences) {
            updates.preferences = {
                theme: 'light',
                language: 'en',
                timezone: 'UTC',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12h',
                currency: 'USD',
                notifications: {
                    email: true,
                    push: true,
                    sms: false,
                    marketing: false,
                },
                privacy: {
                    profileVisibility: 'public',
                    showEmail: false,
                    showPhone: false,
                    allowSearchByEmail: true,
                },
            };
            needsUpdate = true;
        }
        // Sync with Firebase Auth data if available
        if (authUser) {
            if (userData.emailVerified !== authUser.emailVerified) {
                updates.emailVerified = authUser.emailVerified;
                needsUpdate = true;
            }
            if (authUser.photoURL && !userData.photoURL) {
                updates.photoURL = authUser.photoURL;
                needsUpdate = true;
            }
            // Determine auth provider
            if (authUser.providerData.length > 0) {
                const provider = authUser.providerData[0].providerId;
                let authProvider = 'email';
                if (provider.includes('google'))
                    authProvider = 'google';
                else if (provider.includes('facebook'))
                    authProvider = 'facebook';
                else if (provider.includes('apple'))
                    authProvider = 'apple';
                if (userData.authProvider !== authProvider) {
                    updates.authProvider = authProvider;
                    needsUpdate = true;
                }
            }
        }
        // Update user document if needed
        if (needsUpdate) {
            await db.collection('users').doc(userId).update(Object.assign(Object.assign({}, updates), { updatedAt: firestore_2.Timestamp.now(), version: (userData.version || 0) + 1 }));
            v2_1.logger.info(`Updated user document for ${userId}`);
        }
        // Create user preferences document if it doesn't exist
        const preferencesDoc = await db.collection('user_preferences').doc(userId).get();
        if (!preferencesDoc.exists) {
            await (0, userUtils_1.createUserPreferences)(userId);
            v2_1.logger.info(`Created preferences document for ${userId}`);
        }
        v2_1.logger.info(`Auth user creation processing completed for: ${userId}`);
    }
    catch (error) {
        v2_1.logger.error("Error processing auth user creation:", error);
        throw error;
    }
});
// ========================================
// USER DOCUMENT UPDATED TRIGGER
// ========================================
/**
 * Triggered when a user document is updated
 * Handles side effects and data consistency
 */
exports.onUserUpdated = (0, firestore_1.onDocumentUpdated)({
    document: "users/{userId}",
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
}, async (event) => {
    var _a, _b, _c;
    try {
        const beforeData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
        const afterData = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
        const userId = event.params.userId;
        if (!beforeData || !afterData) {
            v2_1.logger.error("Missing user data in update trigger");
            return;
        }
        v2_1.logger.info(`Processing user update: ${userId}`);
        // Track login activity
        if (beforeData.lastLoginAt !== afterData.lastLoginAt && afterData.lastLoginAt) {
            // Update analytics
            await db.collection('users').doc(userId).update({
                'analytics.totalSessions': (((_c = afterData.analytics) === null || _c === void 0 ? void 0 : _c.totalSessions) || 0) + 1,
                'analytics.lastLoginAt': afterData.lastLoginAt,
            });
        }
        // Sync preferences changes to user_preferences collection
        if (JSON.stringify(beforeData.preferences) !== JSON.stringify(afterData.preferences)) {
            const preferencesUpdate = Object.assign(Object.assign({}, afterData.preferences), { updatedAt: firestore_2.Timestamp.now() });
            await db.collection('user_preferences').doc(userId).update(preferencesUpdate);
            v2_1.logger.info(`Synced preferences for user ${userId}`);
        }
        // Handle account status changes
        if (beforeData.isActive !== afterData.isActive) {
            if (!afterData.isActive) {
                // User deactivated - revoke sessions, send notification
                v2_1.logger.info(`User ${userId} deactivated`);
                // TODO: Implement session revocation
            }
            else {
                // User reactivated
                v2_1.logger.info(`User ${userId} reactivated`);
            }
        }
        // Handle soft delete
        if (!beforeData.isDeleted && afterData.isDeleted) {
            v2_1.logger.info(`User ${userId} soft deleted`);
            // TODO: Implement cleanup tasks (anonymize data, etc.)
        }
        v2_1.logger.info(`User update processing completed for: ${userId}`);
    }
    catch (error) {
        v2_1.logger.error("Error processing user update:", error);
        throw error;
    }
});
// ========================================
// USER PREFERENCES UPDATED TRIGGER
// ========================================
/**
 * Triggered when user preferences are updated
 * Syncs core preferences back to user document
 */
exports.onUserPreferencesUpdated = (0, firestore_1.onDocumentUpdated)({
    document: "user_preferences/{userId}",
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 30,
}, async (event) => {
    var _a;
    try {
        const afterData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.after.data();
        const userId = event.params.userId;
        if (!afterData) {
            v2_1.logger.error("Missing preferences data in update trigger");
            return;
        }
        v2_1.logger.info(`Processing preferences update: ${userId}`);
        // Sync core preferences to user document for performance
        const corePreferences = {
            theme: afterData.theme,
            language: afterData.language,
            timezone: afterData.timezone,
            dateFormat: afterData.dateFormat,
            timeFormat: afterData.timeFormat,
            currency: afterData.currency,
            notifications: afterData.notifications,
            privacy: afterData.privacy,
        };
        await db.collection('users').doc(userId).update({
            preferences: corePreferences,
            updatedAt: firestore_2.Timestamp.now(),
        });
        v2_1.logger.info(`Synced core preferences to user document for: ${userId}`);
    }
    catch (error) {
        v2_1.logger.error("Error processing preferences update:", error);
        throw error;
    }
});
//# sourceMappingURL=user-auth-triggers.js.map