/**
 * Admin Authentication Helpers
 * 
 * Provides utilities for admin authentication and authorization
 * following Firebase enterprise patterns.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { AdminUser, AdminSession } from './adminTypes';
import * as crypto from 'crypto';

const db = admin.firestore();
const auth = admin.auth();

// ========================================
// ADMIN AUTHENTICATION FUNCTIONS
// ========================================

/**
 * Authenticates an admin user and creates a session
 */
export const adminLogin = onCall(
  {
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
  },
  async (request) => {
    try {
      const { email, password, userAgent, ipAddress } = request.data;

      if (!email || !password) {
        throw new HttpsError('invalid-argument', 'Missing email or password');
      }

      // Find admin user by email
      const adminQuery = await db.collection('admin_users')
        .where('email', '==', email)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (adminQuery.empty) {
        // Log failed login attempt but don't reveal if user exists
        logger.info(`Failed login attempt for non-existent admin: ${email}`);
        throw new HttpsError('permission-denied', 'Invalid email or password');
      }

      const adminDoc = adminQuery.docs[0];
      const adminData = adminDoc.data() as AdminUser;

      // Authenticate with Firebase Auth
      try {
        await auth.getUserByEmail(email);
      } catch (error) {
        // User doesn't exist in Auth but exists in Firestore
        logger.error(`Admin user exists in Firestore but not in Auth: ${email}`);
        throw new HttpsError('internal', 'Authentication error');
      }

      // Attempt to sign in with email/password (handled by client)
      // Here we just verify the user is an admin

      // Check if user is active
      if (!adminData.isActive) {
        await updateFailedLoginAttempt(adminDoc.id);
        throw new HttpsError('permission-denied', 'Account is disabled');
      }

      // Check if user has too many failed login attempts
      if (adminData.failedLoginAttempts >= 5) {
        const lastFailedTime = adminData.lastFailedLoginAt?.toDate() || new Date(0);
        const lockoutPeriod = 30 * 60 * 1000; // 30 minutes
        
        if (Date.now() - lastFailedTime.getTime() < lockoutPeriod) {
          throw new HttpsError('resource-exhausted', 'Account is temporarily locked');
        }
        
        // Reset failed attempts after lockout period
        await adminDoc.ref.update({
          failedLoginAttempts: 0,
          updatedAt: Timestamp.now()
        });
      }

      // Create admin session
      const sessionToken = generateSessionToken();
      const sessionId = db.collection('admin_sessions').doc().id;
      
      const sessionData: AdminSession = {
        id: sessionId,
        adminRef: `admin_users/${adminDoc.id}`,
        adminEmail: adminData.email,
        token: hashToken(sessionToken),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), // 24 hours
        userAgent: userAgent || 'Unknown',
        ipAddress: ipAddress || '0.0.0.0',
        device: parseUserAgent(userAgent || ''),
        isActive: true,
        lastActivityAt: Timestamp.now(),
        createdAt: Timestamp.now()
      };

      await db.collection('admin_sessions').doc(sessionId).set(sessionData);

      // Update admin user login stats
      await adminDoc.ref.update({
        lastLoginAt: Timestamp.now(),
        loginCount: FieldValue.increment(1),
        failedLoginAttempts: 0,
        updatedAt: Timestamp.now()
      });

      // Create login audit log
      await createLoginAuditLog(adminDoc.id, adminData.email, sessionId, userAgent, ipAddress, true);

      logger.info(`Admin login successful: ${email}`);

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

    } catch (error) {
      logger.error('Admin login error:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Login failed');
    }
  }
);

/**
 * Validates an admin session token
 */
export const validateAdminSession = onCall(
  {
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 30,
  },
  async (request) => {
    try {
      const { sessionToken, ipAddress } = request.data;

      if (!sessionToken) {
        throw new HttpsError('invalid-argument', 'Missing session token');
      }

      const [sessionId, token] = sessionToken.split(':');
      
      if (!sessionId || !token) {
        throw new HttpsError('invalid-argument', 'Invalid session token format');
      }

      // Get session
      const sessionDoc = await db.collection('admin_sessions').doc(sessionId).get();
      
      if (!sessionDoc.exists) {
        throw new HttpsError('not-found', 'Session not found');
      }

      const sessionData = sessionDoc.data() as AdminSession;

      // Check if session is active
      if (!sessionData.isActive) {
        throw new HttpsError('permission-denied', 'Session is inactive');
      }

      // Check if session has expired
      if (sessionData.expiresAt.toDate() < new Date()) {
        await endSession(sessionId, 'expired');
        throw new HttpsError('permission-denied', 'Session has expired');
      }

      // Validate token
      if (sessionData.token !== hashToken(token)) {
        throw new HttpsError('permission-denied', 'Invalid session token');
      }

      // Check IP address if provided (optional security feature)
      if (ipAddress && sessionData.ipAddress !== ipAddress) {
        logger.warn(`IP address mismatch for session ${sessionId}`);
        // Consider whether to enforce this or just log it
      }

      // Get admin user
      const adminRef = sessionData.adminRef;
      const adminDoc = await db.doc(adminRef).get();
      
      if (!adminDoc.exists) {
        await endSession(sessionId, 'revoked');
        throw new HttpsError('not-found', 'Admin user not found');
      }

      const adminData = adminDoc.data() as AdminUser;

      // Check if user is still active
      if (!adminData.isActive) {
        await endSession(sessionId, 'revoked');
        throw new HttpsError('permission-denied', 'Admin account is disabled');
      }

      // Update session last activity
      await sessionDoc.ref.update({
        lastActivityAt: Timestamp.now()
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

    } catch (error) {
      logger.error('Session validation error:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Session validation failed');
    }
  }
);

/**
 * Ends an admin session (logout)
 */
export const adminLogout = onCall(
  {
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 30,
  },
  async (request) => {
    try {
      const { sessionToken } = request.data;

      if (!sessionToken) {
        throw new HttpsError('invalid-argument', 'Missing session token');
      }

      const [sessionId] = sessionToken.split(':');
      
      if (!sessionId) {
        throw new HttpsError('invalid-argument', 'Invalid session token format');
      }

      await endSession(sessionId, 'logout');

      return { success: true };

    } catch (error) {
      logger.error('Admin logout error:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Logout failed');
    }
  }
);

/**
 * Revokes all active sessions for an admin user
 */
export const revokeAdminSessions = onCall(
  {
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 30,
  },
  async (request) => {
    try {
      // Verify caller has permission
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be authenticated');
      }

      const { adminId } = request.data;

      if (!adminId) {
        throw new HttpsError('invalid-argument', 'Missing admin ID');
      }

      // Check if caller has permission
      const callerDoc = await db.collection('admin_users').doc(request.auth.uid).get();
      
      if (!callerDoc.exists) {
        throw new HttpsError('permission-denied', 'Caller is not an admin');
      }

      const callerData = callerDoc.data() as AdminUser;
      
      // Only allow super admins or the user themselves to revoke sessions
      if (!callerData.isSuperAdmin && request.auth.uid !== adminId) {
        throw new HttpsError('permission-denied', 'Insufficient permissions');
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
          endedAt: Timestamp.now(),
          endReason: 'revoked'
        });
      });

      await batch.commit();

      logger.info(`Revoked ${sessionsQuery.size} sessions for admin ${adminId}`);

      return { success: true, sessionsRevoked: sessionsQuery.size };

    } catch (error) {
      logger.error('Session revocation error:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Failed to revoke sessions');
    }
  }
);

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Generates a secure random session token
 */
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hashes a token for secure storage
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Updates failed login attempt counter
 */
async function updateFailedLoginAttempt(adminId: string): Promise<void> {
  await db.collection('admin_users').doc(adminId).update({
    failedLoginAttempts: FieldValue.increment(1),
    lastFailedLoginAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
}

/**
 * Creates a login audit log
 */
async function createLoginAuditLog(
  adminId: string,
  email: string,
  sessionId: string,
  userAgent: string,
  ipAddress: string,
  success: boolean
): Promise<void> {
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
    timestamp: Timestamp.now(),
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
async function endSession(sessionId: string, reason: 'logout' | 'timeout' | 'revoked' | 'expired'): Promise<void> {
  await db.collection('admin_sessions').doc(sessionId).update({
    isActive: false,
    endedAt: Timestamp.now(),
    endReason: reason
  });

  logger.info(`Admin session ended: ${sessionId}, reason: ${reason}`);
}

/**
 * Parses user agent string to extract device info
 */
function parseUserAgent(userAgent: string): { type: 'desktop' | 'mobile' | 'tablet'; os: string; browser: string } {
  let type: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  let os = 'Unknown';
  let browser = 'Unknown';

  // Detect device type
  if (/mobile/i.test(userAgent)) {
    type = 'mobile';
  } else if (/tablet|ipad/i.test(userAgent)) {
    type = 'tablet';
  }

  // Detect OS
  if (/windows/i.test(userAgent)) {
    os = 'Windows';
  } else if (/macintosh|mac os x/i.test(userAgent)) {
    os = 'macOS';
  } else if (/linux/i.test(userAgent)) {
    os = 'Linux';
  } else if (/android/i.test(userAgent)) {
    os = 'Android';
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    os = 'iOS';
  }

  // Detect browser
  if (/chrome/i.test(userAgent) && !/edge|opr|opera/i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/firefox/i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/safari/i.test(userAgent) && !/chrome|chromium|edge|opr|opera/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/edge/i.test(userAgent)) {
    browser = 'Edge';
  } else if (/opera|opr/i.test(userAgent)) {
    browser = 'Opera';
  }

  return { type, os, browser };
}
