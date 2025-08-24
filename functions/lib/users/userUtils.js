"use strict";
/**
 * User Management Utilities
 *
 * Utility functions for user CRUD operations, validation, and data management.
 * These functions are used by Cloud Functions and other services.
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
exports.userValidation = void 0;
exports.createUserDocument = createUserDocument;
exports.createUserPreferences = createUserPreferences;
exports.getUserById = getUserById;
exports.getUserByEmail = getUserByEmail;
exports.updateUserDocument = updateUserDocument;
exports.softDeleteUser = softDeleteUser;
exports.restoreUser = restoreUser;
exports.getActiveUsers = getActiveUsers;
exports.getUsersByAccountType = getUsersByAccountType;
exports.searchUsers = searchUsers;
exports.getDefaultPreferences = getDefaultPreferences;
exports.generateUniqueUsername = generateUniqueUsername;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const db = admin.firestore();
// const auth = admin.auth(); // Available for future use
// ========================================
// USER CRUD OPERATIONS
// ========================================
/**
 * Creates a user document in Firestore
 */
async function createUserDocument(uid, userData, createdBy) {
    const now = firestore_1.Timestamp.now();
    const user = Object.assign({ id: uid, email: userData.email || '', displayName: userData.displayName || '', authProvider: userData.authProvider || 'email', emailVerified: userData.emailVerified || false, phoneVerified: false, isActive: true, isVerified: false, accountType: userData.accountType || 'free', loginCount: 0, failedLoginAttempts: 0, preferences: userData.preferences || getDefaultPreferences(), analytics: Object.assign({ signupSource: 'api', totalSessions: 0, totalTimeSpent: 0 }, userData.analytics), compliance: Object.assign({ gdprCompliant: true, ccpaCompliant: true }, userData.compliance), createdAt: now, updatedAt: now, createdBy, updatedBy: createdBy, version: 1, isDeleted: false }, userData);
    await db.collection('users').doc(uid).set(user);
    return user;
}
/**
 * Creates user preferences document
 */
async function createUserPreferences(userId, preferences) {
    const now = firestore_1.Timestamp.now();
    const userPreferences = Object.assign({ userId, theme: 'light', language: 'en', timezone: 'UTC', dateFormat: 'MM/DD/YYYY', timeFormat: '12h', currency: 'USD', notifications: {
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
        }, createdAt: now, updatedAt: now, version: 1 }, preferences);
    await db.collection('user_preferences').doc(userId).set(userPreferences);
    return userPreferences;
}
/**
 * Gets a user by ID
 */
async function getUserById(userId) {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
        return null;
    }
    return userDoc.data();
}
/**
 * Gets a user by email
 */
async function getUserByEmail(email) {
    const querySnapshot = await db.collection('users')
        .where('email', '==', email)
        .where('isDeleted', '==', false)
        .limit(1)
        .get();
    if (querySnapshot.empty) {
        return null;
    }
    return querySnapshot.docs[0].data();
}
/**
 * Updates a user document
 */
async function updateUserDocument(userId, updateData, updatedBy) {
    const updateFields = Object.assign(Object.assign({}, updateData), { updatedAt: firestore_1.Timestamp.now(), updatedBy, version: admin.firestore.FieldValue.increment(1) });
    await db.collection('users').doc(userId).update(updateFields);
}
/**
 * Soft deletes a user
 */
async function softDeleteUser(userId, deletedBy, reason) {
    const now = firestore_1.Timestamp.now();
    await db.collection('users').doc(userId).update({
        isDeleted: true,
        deletedAt: now,
        deletedBy,
        deletionReason: reason,
        isActive: false,
        updatedAt: now,
        updatedBy: deletedBy,
        version: admin.firestore.FieldValue.increment(1),
    });
}
/**
 * Restores a soft-deleted user
 */
async function restoreUser(userId, restoredBy) {
    const now = firestore_1.Timestamp.now();
    await db.collection('users').doc(userId).update({
        isDeleted: false,
        deletedAt: admin.firestore.FieldValue.delete(),
        deletedBy: admin.firestore.FieldValue.delete(),
        deletionReason: admin.firestore.FieldValue.delete(),
        isActive: true,
        updatedAt: now,
        updatedBy: restoredBy,
        version: admin.firestore.FieldValue.increment(1),
    });
}
// ========================================
// USER QUERIES
// ========================================
/**
 * Gets active users with pagination
 */
async function getActiveUsers(limit = 20, startAfter) {
    let query = db.collection('users')
        .where('isActive', '==', true)
        .where('isDeleted', '==', false)
        .orderBy('createdAt', 'desc')
        .limit(limit);
    if (startAfter) {
        query = query.startAfter(startAfter);
    }
    const snapshot = await query.get();
    const users = snapshot.docs.map(doc => doc.data());
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    return { users, lastDoc };
}
/**
 * Gets users by account type
 */
async function getUsersByAccountType(accountType) {
    const snapshot = await db.collection('users')
        .where('accountType', '==', accountType)
        .where('isDeleted', '==', false)
        .get();
    return snapshot.docs.map(doc => doc.data());
}
/**
 * Searches users by display name or email
 */
async function searchUsers(searchTerm, limit = 10) {
    const searchTermLower = searchTerm.toLowerCase();
    // Note: This is a simple search. For production, consider using Algolia or Elasticsearch
    const snapshot = await db.collection('users')
        .where('isDeleted', '==', false)
        .get();
    const users = snapshot.docs
        .map(doc => doc.data())
        .filter(user => user.displayName.toLowerCase().includes(searchTermLower) ||
        user.email.toLowerCase().includes(searchTermLower) ||
        (user.username && user.username.toLowerCase().includes(searchTermLower)))
        .slice(0, limit);
    return users;
}
// ========================================
// UTILITY FUNCTIONS
// ========================================
/**
 * Gets default user preferences
 */
function getDefaultPreferences() {
    return {
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
}
/**
 * Validates user data
 */
exports.userValidation = {
    email: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    username: (username) => {
        const errors = [];
        if (username.length < 3) {
            errors.push('Username must be at least 3 characters long');
        }
        if (username.length > 30) {
            errors.push('Username must be less than 30 characters');
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            errors.push('Username can only contain letters, numbers, underscores, and hyphens');
        }
        return { valid: errors.length === 0, errors };
    },
    displayName: (name) => {
        return name.length >= 1 && name.length <= 100;
    },
    phoneNumber: (phone) => {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(phone);
    },
    bio: (bio) => {
        const errors = [];
        if (bio.length > 500) {
            errors.push('Bio must be less than 500 characters');
        }
        return { valid: errors.length === 0, errors };
    },
};
/**
 * Generates a unique username suggestion
 */
async function generateUniqueUsername(baseName) {
    const baseUsername = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = baseUsername;
    let counter = 1;
    while (true) {
        const existingUser = await db.collection('users')
            .where('username', '==', username)
            .limit(1)
            .get();
        if (existingUser.empty) {
            return username;
        }
        username = `${baseUsername}${counter}`;
        counter++;
    }
}
//# sourceMappingURL=userUtils.js.map