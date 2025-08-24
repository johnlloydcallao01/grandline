/**
 * User Management Cloud Functions
 * 
 * Handles user creation, updates, and management operations for regular users.
 * Follows the same patterns as admin functions but tailored for end users.
 */

import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import {
  User,
  UserPreferences,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  GetUserResponse,

  UserPreferencesCore
} from '../types/users';

const db = admin.firestore();
const auth = admin.auth();

/**
 * Creates a new regular user in the system
 */
export const createUser = onCall(
  {
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
  },
  async (request: CallableRequest<CreateUserRequest>): Promise<CreateUserResponse> => {
    try {
      const { email, displayName, firstName, lastName, phoneNumber, accountType, preferences } = request.data;

      // Validate required fields
      if (!email || !displayName) {
        throw new HttpsError('invalid-argument', 'Email and display name are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new HttpsError('invalid-argument', 'Invalid email format');
      }

      // Check if user already exists
      try {
        await auth.getUserByEmail(email);
        throw new HttpsError('already-exists', 'User with this email already exists');
      } catch (error: any) {
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
      const defaultPreferences: UserPreferencesCore = {
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
        ...preferences, // Override with provided preferences
      };

      // Create user document
      const user: User = {
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
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: request.auth?.uid, // Admin ID if created by admin
        updatedBy: request.auth?.uid,
        version: 1,
        
        // Soft delete
        isDeleted: false,
      };

      // Create user document in Firestore
      await db.collection('users').doc(userRecord.uid).set(user);

      // Create detailed user preferences document
      const userPreferences: UserPreferences = {
        userId: userRecord.uid,
        ...defaultPreferences,
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
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        version: 1,
      };

      await db.collection('user_preferences').doc(userRecord.uid).set(userPreferences);

      logger.info(`User created successfully: ${email}`, { userId: userRecord.uid });

      return {
        success: true,
        userId: userRecord.uid
      } as CreateUserResponse;

    } catch (error) {
      logger.error('Error creating user:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Failed to create user');
    }
  }
);

/**
 * Updates an existing user
 */
export const updateUser = onCall(
  {
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
  },
  async (request: CallableRequest<UpdateUserRequest>): Promise<UpdateUserResponse> => {
    try {
      const { userId, ...updateData } = request.data;

      // Validate required fields
      if (!userId) {
        throw new HttpsError('invalid-argument', 'User ID is required');
      }

      // Check if user exists
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'User not found');
      }

      // Check permissions - users can only update their own data, admins can update any
      if (request.auth?.uid !== userId && !request.auth?.token?.admin) {
        throw new HttpsError('permission-denied', 'Insufficient permissions');
      }

      // Prepare update data
      const updateFields: any = {
        ...updateData,
        updatedAt: Timestamp.now(),
        updatedBy: request.auth?.uid,
        version: FieldValue.increment(1),
      };

      // Update user document
      await db.collection('users').doc(userId).update(updateFields);

      // Update preferences if provided
      if (updateData.preferences) {
        await db.collection('user_preferences').doc(userId).update({
          ...updateData.preferences,
          updatedAt: Timestamp.now(),
          version: FieldValue.increment(1),
        });
      }

      logger.info(`User updated successfully: ${userId}`);

      return {
        success: true
      } as UpdateUserResponse;

    } catch (error) {
      logger.error('Error updating user:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Failed to update user');
    }
  }
);

/**
 * Gets a user by ID
 */
export const getUser = onCall(
  {
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 30,
  },
  async (request: CallableRequest<{ userId: string }>): Promise<GetUserResponse> => {
    try {
      const { userId } = request.data;

      // Validate required fields
      if (!userId) {
        throw new HttpsError('invalid-argument', 'User ID is required');
      }

      // Check permissions - users can only get their own data, admins can get any
      if (request.auth?.uid !== userId && !request.auth?.token?.admin) {
        throw new HttpsError('permission-denied', 'Insufficient permissions');
      }

      // Get user document
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'User not found');
      }

      const user = userDoc.data() as User;

      return {
        success: true,
        user
      } as GetUserResponse;

    } catch (error) {
      logger.error('Error getting user:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Failed to get user');
    }
  }
);
