/**
 * User Authentication Triggers
 * 
 * Cloud Functions that handle Firebase Auth events and sync with Firestore.
 * These triggers ensure user documents are created/updated when auth events occur.
 */

import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { createUserPreferences, getUserById } from "../users/userUtils";
import { User } from "../types/users";

const db = getFirestore();
const auth = getAuth();

// ========================================
// FIREBASE AUTH USER CREATED TRIGGER
// ========================================

/**
 * Triggered when a new user signs up via Firebase Auth
 * Creates corresponding Firestore documents
 */
export const onAuthUserCreated = onDocumentCreated(
  {
    document: "users/{userId}",
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  async (event) => {
    try {
      const userData = event.data?.data();
      const userId = event.params.userId;

      if (!userData) {
        logger.error("No user data found in trigger");
        return;
      }

      logger.info(`Processing auth user creation: ${userId}`);

      // Check if this is a new user document that needs initialization
      const existingUser = await getUserById(userId);
      if (existingUser && existingUser.version > 1) {
        logger.info(`User ${userId} already initialized, skipping`);
        return;
      }

      // Get Firebase Auth user data for additional info
      let authUser;
      try {
        authUser = await auth.getUser(userId);
      } catch (error) {
        logger.warn(`Could not get auth user ${userId}:`, error);
      }

      // Ensure user document has all required fields
      const updates: Partial<User> = {};
      let needsUpdate = false;

      // Check and set missing required fields
      if (!userData.analytics) {
        updates.analytics = {
          signupSource: 'web',
          totalSessions: 0,
          totalTimeSpent: 0,
          firstVisitAt: Timestamp.now(),
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
          let authProvider: 'email' | 'google' | 'facebook' | 'apple' = 'email';
          
          if (provider.includes('google')) authProvider = 'google';
          else if (provider.includes('facebook')) authProvider = 'facebook';
          else if (provider.includes('apple')) authProvider = 'apple';
          
          if (userData.authProvider !== authProvider) {
            updates.authProvider = authProvider;
            needsUpdate = true;
          }
        }
      }

      // Update user document if needed
      if (needsUpdate) {
        await db.collection('users').doc(userId).update({
          ...updates,
          updatedAt: Timestamp.now(),
          version: (userData.version || 0) + 1,
        });
        logger.info(`Updated user document for ${userId}`);
      }

      // Create user preferences document if it doesn't exist
      const preferencesDoc = await db.collection('user_preferences').doc(userId).get();
      if (!preferencesDoc.exists) {
        await createUserPreferences(userId);
        logger.info(`Created preferences document for ${userId}`);
      }

      logger.info(`Auth user creation processing completed for: ${userId}`);

    } catch (error) {
      logger.error("Error processing auth user creation:", error);
      throw error;
    }
  }
);

// ========================================
// USER DOCUMENT UPDATED TRIGGER
// ========================================

/**
 * Triggered when a user document is updated
 * Handles side effects and data consistency
 */
export const onUserUpdated = onDocumentUpdated(
  {
    document: "users/{userId}",
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  async (event) => {
    try {
      const beforeData = event.data?.before.data();
      const afterData = event.data?.after.data();
      const userId = event.params.userId;

      if (!beforeData || !afterData) {
        logger.error("Missing user data in update trigger");
        return;
      }

      logger.info(`Processing user update: ${userId}`);

      // Track login activity
      if (beforeData.lastLoginAt !== afterData.lastLoginAt && afterData.lastLoginAt) {
        // Update analytics
        await db.collection('users').doc(userId).update({
          'analytics.totalSessions': (afterData.analytics?.totalSessions || 0) + 1,
          'analytics.lastLoginAt': afterData.lastLoginAt,
        });
      }

      // Sync preferences changes to user_preferences collection
      if (JSON.stringify(beforeData.preferences) !== JSON.stringify(afterData.preferences)) {
        const preferencesUpdate = {
          ...afterData.preferences,
          updatedAt: Timestamp.now(),
        };
        
        await db.collection('user_preferences').doc(userId).update(preferencesUpdate);
        logger.info(`Synced preferences for user ${userId}`);
      }

      // Handle account status changes
      if (beforeData.isActive !== afterData.isActive) {
        if (!afterData.isActive) {
          // User deactivated - revoke sessions, send notification
          logger.info(`User ${userId} deactivated`);
          // TODO: Implement session revocation
        } else {
          // User reactivated
          logger.info(`User ${userId} reactivated`);
        }
      }

      // Handle soft delete
      if (!beforeData.isDeleted && afterData.isDeleted) {
        logger.info(`User ${userId} soft deleted`);
        // TODO: Implement cleanup tasks (anonymize data, etc.)
      }

      logger.info(`User update processing completed for: ${userId}`);

    } catch (error) {
      logger.error("Error processing user update:", error);
      throw error;
    }
  }
);

// ========================================
// USER PREFERENCES UPDATED TRIGGER
// ========================================

/**
 * Triggered when user preferences are updated
 * Syncs core preferences back to user document
 */
export const onUserPreferencesUpdated = onDocumentUpdated(
  {
    document: "user_preferences/{userId}",
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 30,
  },
  async (event) => {
    try {
      const afterData = event.data?.after.data();
      const userId = event.params.userId;

      if (!afterData) {
        logger.error("Missing preferences data in update trigger");
        return;
      }

      logger.info(`Processing preferences update: ${userId}`);

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
        updatedAt: Timestamp.now(),
      });

      logger.info(`Synced core preferences to user document for: ${userId}`);

    } catch (error) {
      logger.error("Error processing preferences update:", error);
      throw error;
    }
  }
);
