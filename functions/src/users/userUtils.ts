/**
 * User Management Utilities
 * 
 * Utility functions for user CRUD operations, validation, and data management.
 * These functions are used by Cloud Functions and other services.
 */

import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import {
  User,
  UserPreferences,
  UserValidation,
  UserAccountType,
  UserPreferencesCore
} from '../types/users';

const db = admin.firestore();
// const auth = admin.auth(); // Available for future use

// ========================================
// USER CRUD OPERATIONS
// ========================================

/**
 * Creates a user document in Firestore
 */
export async function createUserDocument(
  uid: string,
  userData: Partial<User>,
  createdBy?: string
): Promise<User> {
  const now = Timestamp.now();
  
  const user: User = {
    id: uid,
    email: userData.email || '',
    displayName: userData.displayName || '',
    authProvider: userData.authProvider || 'email',
    emailVerified: userData.emailVerified || false,
    phoneVerified: false,
    isActive: true,
    isVerified: false,
    accountType: userData.accountType || 'free',
    loginCount: 0,
    failedLoginAttempts: 0,
    preferences: userData.preferences || getDefaultPreferences(),
    analytics: {
      signupSource: 'api',
      totalSessions: 0,
      totalTimeSpent: 0,
      ...userData.analytics,
    },
    compliance: {
      gdprCompliant: true,
      ccpaCompliant: true,
      ...userData.compliance,
    },
    createdAt: now,
    updatedAt: now,
    createdBy,
    updatedBy: createdBy,
    version: 1,
    isDeleted: false,
    ...userData,
  };

  await db.collection('users').doc(uid).set(user);
  return user;
}

/**
 * Creates user preferences document
 */
export async function createUserPreferences(
  userId: string,
  preferences?: Partial<UserPreferences>
): Promise<UserPreferences> {
  const now = Timestamp.now();
  
  const userPreferences: UserPreferences = {
    userId,
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
      productUpdates: true,
      securityAlerts: true,
      weeklyDigest: false,
      monthlyReport: false,
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowSearchByEmail: true,
      allowDataCollection: true,
      allowPersonalization: true,
    },
    communication: {
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
    },
    createdAt: now,
    updatedAt: now,
    version: 1,
    ...preferences,
  };

  await db.collection('user_preferences').doc(userId).set(userPreferences);
  return userPreferences;
}

/**
 * Gets a user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    return null;
  }
  return userDoc.data() as User;
}

/**
 * Gets a user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const querySnapshot = await db.collection('users')
    .where('email', '==', email)
    .where('isDeleted', '==', false)
    .limit(1)
    .get();
  
  if (querySnapshot.empty) {
    return null;
  }
  
  return querySnapshot.docs[0].data() as User;
}

/**
 * Updates a user document
 */
export async function updateUserDocument(
  userId: string,
  updateData: Partial<User>,
  updatedBy?: string
): Promise<void> {
  const updateFields = {
    ...updateData,
    updatedAt: Timestamp.now(),
    updatedBy,
    version: admin.firestore.FieldValue.increment(1),
  };

  await db.collection('users').doc(userId).update(updateFields);
}

/**
 * Soft deletes a user
 */
export async function softDeleteUser(
  userId: string,
  deletedBy?: string,
  reason?: string
): Promise<void> {
  const now = Timestamp.now();
  
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
export async function restoreUser(userId: string, restoredBy?: string): Promise<void> {
  const now = Timestamp.now();
  
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
export async function getActiveUsers(
  limit: number = 20,
  startAfter?: admin.firestore.DocumentSnapshot
): Promise<{ users: User[]; lastDoc?: admin.firestore.DocumentSnapshot }> {
  let query = db.collection('users')
    .where('isActive', '==', true)
    .where('isDeleted', '==', false)
    .orderBy('createdAt', 'desc')
    .limit(limit);

  if (startAfter) {
    query = query.startAfter(startAfter);
  }

  const snapshot = await query.get();
  const users = snapshot.docs.map(doc => doc.data() as User);
  const lastDoc = snapshot.docs[snapshot.docs.length - 1];

  return { users, lastDoc };
}

/**
 * Gets users by account type
 */
export async function getUsersByAccountType(accountType: UserAccountType): Promise<User[]> {
  const snapshot = await db.collection('users')
    .where('accountType', '==', accountType)
    .where('isDeleted', '==', false)
    .get();

  return snapshot.docs.map(doc => doc.data() as User);
}

/**
 * Searches users by display name or email
 */
export async function searchUsers(searchTerm: string, limit: number = 10): Promise<User[]> {
  const searchTermLower = searchTerm.toLowerCase();
  
  // Note: This is a simple search. For production, consider using Algolia or Elasticsearch
  const snapshot = await db.collection('users')
    .where('isDeleted', '==', false)
    .get();

  const users = snapshot.docs
    .map(doc => doc.data() as User)
    .filter(user => 
      user.displayName.toLowerCase().includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower) ||
      (user.username && user.username.toLowerCase().includes(searchTermLower))
    )
    .slice(0, limit);

  return users;
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Gets default user preferences
 */
export function getDefaultPreferences(): UserPreferencesCore {
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
export const userValidation: UserValidation = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  username: (username: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
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

  displayName: (name: string): boolean => {
    return name.length >= 1 && name.length <= 100;
  },

  phoneNumber: (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  },

  bio: (bio: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (bio.length > 500) {
      errors.push('Bio must be less than 500 characters');
    }
    
    return { valid: errors.length === 0, errors };
  },
};

/**
 * Generates a unique username suggestion
 */
export async function generateUniqueUsername(baseName: string): Promise<string> {
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
