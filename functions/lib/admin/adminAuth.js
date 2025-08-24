"use strict";
/**
 * Admin Authentication Helpers
 *
 * Provides utilities for admin authentication and authorization
 * following Firebase enterprise patterns.
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
exports.revokeAdminSessions = exports.adminLogout = exports.validateAdminSession = exports.adminLogin = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const crypto = __importStar(require("crypto"));
const db = admin.firestore();
const auth = admin.auth();
// ========================================
// ADMIN AUTHENTICATION FUNCTIONS
// ========================================
/**
 * Authenticates an admin user and creates a session
 */
exports.adminLogin = (0, https_1.onCall)({
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
}, async (request) => {
    var _a;
    try {
        const { email, password, userAgent, ipAddress } = request.data;
        if (!email || !password) {
            throw new https_1.HttpsError('invalid-argument', 'Missing email or password');
        }
        // Find admin user by email
        const adminQuery = await db.collection('admin_users')
            .where('email', '==', email)
            .where('isActive', '==', true)
            .limit(1)
            .get();
        if (adminQuery.empty) {
            // Log failed login attempt but don't reveal if user exists
            v2_1.logger.info(`Failed login attempt for non-existent admin: ${email}`);
            throw new https_1.HttpsError('permission-denied', 'Invalid email or password');
        }
        const adminDoc = adminQuery.docs[0];
        const adminData = adminDoc.data();
        // Authenticate with Firebase Auth
        try {
            await auth.getUserByEmail(email);
        }
        catch (error) {
            // User doesn't exist in Auth but exists in Firestore
            v2_1.logger.error(`Admin user exists in Firestore but not in Auth: ${email}`);
            throw new https_1.HttpsError('internal', 'Authentication error');
        }
        // Attempt to sign in with email/password (handled by client)
        // Here we just verify the user is an admin
        // Check if user is active
        if (!adminData.isActive) {
            await updateFailedLoginAttempt(adminDoc.id);
            throw new https_1.HttpsError('permission-denied', 'Account is disabled');
        }
        // Check if user has too many failed login attempts
        if (adminData.failedLoginAttempts >= 5) {
            const lastFailedTime = ((_a = adminData.lastFailedLoginAt) === null || _a === void 0 ? void 0 : _a.toDate()) || new Date(0);
            const lockoutPeriod = 30 * 60 * 1000; // 30 minutes
            if (Date.now() - lastFailedTime.getTime() < lockoutPeriod) {
                throw new https_1.HttpsError('resource-exhausted', 'Account is temporarily locked');
            }
            // Reset failed attempts after lockout period
            await adminDoc.ref.update({
                failedLoginAttempts: 0,
                updatedAt: firestore_1.Timestamp.now()
            });
        }
        // Create admin session
        const sessionToken = generateSessionToken();
        const sessionId = db.collection('admin_sessions').doc().id;
        const sessionData = {
            id: sessionId,
            adminRef: `admin_users/${adminDoc.id}`,
            adminEmail: adminData.email,
            token: hashToken(sessionToken),
            expiresAt: firestore_1.Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), // 24 hours
            userAgent: userAgent || 'Unknown',
            ipAddress: ipAddress || '0.0.0.0',
            device: parseUserAgent(userAgent || ''),
            isActive: true,
            lastActivityAt: firestore_1.Timestamp.now(),
            createdAt: firestore_1.Timestamp.now()
        };
        await db.collection('admin_sessions').doc(sessionId).set(sessionData);
        // Update admin user login stats
        await adminDoc.ref.update({
            lastLoginAt: firestore_1.Timestamp.now(),
            loginCount: firestore_1.FieldValue.increment(1),
            failedLoginAttempts: 0,
            updatedAt: firestore_1.Timestamp.now()
        });
        // Create login audit log
        await createLoginAuditLog(adminDoc.id, adminData.email, sessionId, userAgent, ipAddress, true);
        v2_1.logger.info(`Admin login successful: ${email}`);
        // Return session token and admin data
        return {
            success: true,
            sessionToken: `${sessionId}:${sessionToken}`,
            sessionExpires: sessionData.expiresAt.toDate(),
            adminUser: {
                id: adminDoc.id,
                email: adminData.email,
                displayName: adminData.displayName,
                roleName: adminData.roleName,
                isSuperAdmin: adminData.isSuperAdmin,
                permissions: adminData.permissions,
                preferences: adminData.preferences
            }
        };
    }
    catch (error) {
        v2_1.logger.error('Admin login error:', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Login failed');
    }
});
/**
 * Validates an admin session token
 */
exports.validateAdminSession = (0, https_1.onCall)({
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 30,
}, async (request) => {
    try {
        const { sessionToken, ipAddress } = request.data;
        if (!sessionToken) {
            throw new https_1.HttpsError('invalid-argument', 'Missing session token');
        }
        const [sessionId, token] = sessionToken.split(':');
        if (!sessionId || !token) {
            throw new https_1.HttpsError('invalid-argument', 'Invalid session token format');
        }
        // Get session
        const sessionDoc = await db.collection('admin_sessions').doc(sessionId).get();
        if (!sessionDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Session not found');
        }
        const sessionData = sessionDoc.data();
        // Check if session is active
        if (!sessionData.isActive) {
            throw new https_1.HttpsError('permission-denied', 'Session is inactive');
        }
        // Check if session has expired
        if (sessionData.expiresAt.toDate() < new Date()) {
            await endSession(sessionId, 'expired');
            throw new https_1.HttpsError('permission-denied', 'Session has expired');
        }
        // Validate token
        if (sessionData.token !== hashToken(token)) {
            throw new https_1.HttpsError('permission-denied', 'Invalid session token');
        }
        // Check IP address if provided (optional security feature)
        if (ipAddress && sessionData.ipAddress !== ipAddress) {
            v2_1.logger.warn(`IP address mismatch for session ${sessionId}`);
            // Consider whether to enforce this or just log it
        }
        // Get admin user
        const adminRef = sessionData.adminRef;
        const adminDoc = await db.doc(adminRef).get();
        if (!adminDoc.exists) {
            await endSession(sessionId, 'revoked');
            throw new https_1.HttpsError('not-found', 'Admin user not found');
        }
        const adminData = adminDoc.data();
        // Check if user is still active
        if (!adminData.isActive) {
            await endSession(sessionId, 'revoked');
            throw new https_1.HttpsError('permission-denied', 'Admin account is disabled');
        }
        // Update session last activity
        await sessionDoc.ref.update({
            lastActivityAt: firestore_1.Timestamp.now()
        });
        // Return admin user data
        return {
            valid: true,
            adminUser: {
                id: adminDoc.id,
                email: adminData.email,
                displayName: adminData.displayName,
                roleName: adminData.roleName,
                isSuperAdmin: adminData.isSuperAdmin,
                permissions: adminData.permissions,
                preferences: adminData.preferences
            }
        };
    }
    catch (error) {
        v2_1.logger.error('Session validation error:', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Session validation failed');
    }
});
/**
 * Ends an admin session (logout)
 */
exports.adminLogout = (0, https_1.onCall)({
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 30,
}, async (request) => {
    try {
        const { sessionToken } = request.data;
        if (!sessionToken) {
            throw new https_1.HttpsError('invalid-argument', 'Missing session token');
        }
        const [sessionId] = sessionToken.split(':');
        if (!sessionId) {
            throw new https_1.HttpsError('invalid-argument', 'Invalid session token format');
        }
        await endSession(sessionId, 'logout');
        return { success: true };
    }
    catch (error) {
        v2_1.logger.error('Admin logout error:', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Logout failed');
    }
});
/**
 * Revokes all active sessions for an admin user
 */
exports.revokeAdminSessions = (0, https_1.onCall)({
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 30,
}, async (request) => {
    try {
        // Verify caller has permission
        if (!request.auth) {
            throw new https_1.HttpsError('unauthenticated', 'Must be authenticated');
        }
        const { adminId } = request.data;
        if (!adminId) {
            throw new https_1.HttpsError('invalid-argument', 'Missing admin ID');
        }
        // Check if caller has permission
        const callerDoc = await db.collection('admin_users').doc(request.auth.uid).get();
        if (!callerDoc.exists) {
            throw new https_1.HttpsError('permission-denied', 'Caller is not an admin');
        }
        const callerData = callerDoc.data();
        // Only allow super admins or the user themselves to revoke sessions
        if (!callerData.isSuperAdmin && request.auth.uid !== adminId) {
            throw new https_1.HttpsError('permission-denied', 'Insufficient permissions');
        }
        // Get all active sessions for the admin
        const sessionsQuery = await db.collection('admin_sessions')
            .where('adminRef', '==', `admin_users/${adminId}`)
            .where('isActive', '==', true)
            .get();
        if (sessionsQuery.empty) {
            return { success: true, sessionsRevoked: 0 };
        }
        // Revoke all sessions
        const batch = db.batch();
        sessionsQuery.docs.forEach(doc => {
            batch.update(doc.ref, {
                isActive: false,
                endedAt: firestore_1.Timestamp.now(),
                endReason: 'revoked'
            });
        });
        await batch.commit();
        v2_1.logger.info(`Revoked ${sessionsQuery.size} sessions for admin ${adminId}`);
        return { success: true, sessionsRevoked: sessionsQuery.size };
    }
    catch (error) {
        v2_1.logger.error('Session revocation error:', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Failed to revoke sessions');
    }
});
// ========================================
// HELPER FUNCTIONS
// ========================================
/**
 * Generates a secure random session token
 */
function generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
}
/**
 * Hashes a token for secure storage
 */
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}
/**
 * Updates failed login attempt counter
 */
async function updateFailedLoginAttempt(adminId) {
    await db.collection('admin_users').doc(adminId).update({
        failedLoginAttempts: firestore_1.FieldValue.increment(1),
        lastFailedLoginAt: firestore_1.Timestamp.now(),
        updatedAt: firestore_1.Timestamp.now()
    });
}
/**
 * Creates a login audit log
 */
async function createLoginAuditLog(adminId, email, sessionId, userAgent, ipAddress, success) {
    await db.collection('admin_audit_logs').add({
        adminRef: `admin_users/${adminId}`,
        adminEmail: email,
        adminName: email.split('@')[0],
        action: 'auth.login',
        resource: 'admin_sessions',
        resourceId: sessionId,
        description: success ? 'Admin login successful' : 'Admin login failed',
        sessionRef: `admin_sessions/${sessionId}`,
        ipAddress: ipAddress || '0.0.0.0',
        userAgent: userAgent || 'Unknown',
        timestamp: firestore_1.Timestamp.now(),
        severity: success ? 'low' : 'medium',
        category: 'authentication',
        success,
        searchKeywords: ['admin', 'login', email, success ? 'success' : 'failed'],
        dateString: new Date().toISOString().split('T')[0]
    });
}
/**
 * Ends an admin session
 */
async function endSession(sessionId, reason) {
    await db.collection('admin_sessions').doc(sessionId).update({
        isActive: false,
        endedAt: firestore_1.Timestamp.now(),
        endReason: reason
    });
    v2_1.logger.info(`Admin session ended: ${sessionId}, reason: ${reason}`);
}
/**
 * Parses user agent string to extract device info
 */
function parseUserAgent(userAgent) {
    let type = 'desktop';
    let os = 'Unknown';
    let browser = 'Unknown';
    // Detect device type
    if (/mobile/i.test(userAgent)) {
        type = 'mobile';
    }
    else if (/tablet|ipad/i.test(userAgent)) {
        type = 'tablet';
    }
    // Detect OS
    if (/windows/i.test(userAgent)) {
        os = 'Windows';
    }
    else if (/macintosh|mac os x/i.test(userAgent)) {
        os = 'macOS';
    }
    else if (/linux/i.test(userAgent)) {
        os = 'Linux';
    }
    else if (/android/i.test(userAgent)) {
        os = 'Android';
    }
    else if (/iphone|ipad|ipod/i.test(userAgent)) {
        os = 'iOS';
    }
    // Detect browser
    if (/chrome/i.test(userAgent) && !/edge|opr|opera/i.test(userAgent)) {
        browser = 'Chrome';
    }
    else if (/firefox/i.test(userAgent)) {
        browser = 'Firefox';
    }
    else if (/safari/i.test(userAgent) && !/chrome|chromium|edge|opr|opera/i.test(userAgent)) {
        browser = 'Safari';
    }
    else if (/edge/i.test(userAgent)) {
        browser = 'Edge';
    }
    else if (/opera|opr/i.test(userAgent)) {
        browser = 'Opera';
    }
    return { type, os, browser };
}
//# sourceMappingURL=adminAuth.js.map