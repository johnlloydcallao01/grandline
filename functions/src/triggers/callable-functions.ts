/**
 * Callable Notification Functions
 * 
 * Cloud Functions that can be called directly from client applications
 * for managing FCM subscriptions and notification preferences.
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import { FCMService } from "../services/fcm-service";
import { getFirestore } from "firebase-admin/firestore";
const fcmService = new FCMService();
const db = getFirestore();

// ========================================
// SUBSCRIBE TO TOPIC
// ========================================

export const subscribeToTopic = onCall(
  {
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  async (request) => {
    try {
      // Verify authentication
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
      }

      const { topic, token } = request.data;
      const userId = request.auth.uid;

      if (!topic || !token) {
        throw new HttpsError("invalid-argument", "Topic and token are required");
      }

      // Validate topic name (only allow alphanumeric, hyphens, and underscores)
      if (!/^[a-zA-Z0-9_-]+$/.test(topic)) {
        throw new HttpsError("invalid-argument", "Invalid topic name format");
      }

      logger.info(`Subscribing user ${userId} to topic ${topic}`);

      // Subscribe token to topic
      const result = await fcmService.subscribeToTopic([token], topic);

      if (!result.success) {
        throw new HttpsError("internal", `Failed to subscribe to topic: ${result.error}`);
      }

      // Update user's notification preferences
      const userPrefsRef = db.collection("notification_preferences").doc(userId);
      
      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(userPrefsRef);
        
        if (doc.exists) {
          const currentData = doc.data()!;
          const topics = currentData.topics || [];
          
          if (!topics.includes(topic)) {
            topics.push(topic);
            transaction.update(userPrefsRef, {
              topics,
              updatedAt: new Date(),
            });
          }
        } else {
          transaction.set(userPrefsRef, {
            userId,
            topics: [topic],
            fcmTokens: [token],
            preferences: {
              contactForm: false,
              newsletter: true,
              userUpdates: true,
              campaigns: false,
              dailyDigest: false,
              weeklyReport: false,
              systemAlerts: false,
              marketing: true,
            },
            timezone: "UTC",
            language: "en",
            quietHours: {
              enabled: false,
              start: "22:00",
              end: "08:00",
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      });

      logger.info(`Successfully subscribed user ${userId} to topic ${topic}`);

      return {
        success: true,
        message: `Successfully subscribed to topic: ${topic}`,
        topic,
      };

    } catch (error) {
      logger.error("Error subscribing to topic:", error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError("internal", "Failed to subscribe to topic");
    }
  }
);

// ========================================
// UNSUBSCRIBE FROM TOPIC
// ========================================

export const unsubscribeFromTopic = onCall(
  {
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  async (request) => {
    try {
      // Verify authentication
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
      }

      const { topic, token } = request.data;
      const userId = request.auth.uid;

      if (!topic || !token) {
        throw new HttpsError("invalid-argument", "Topic and token are required");
      }

      logger.info(`Unsubscribing user ${userId} from topic ${topic}`);

      // Unsubscribe token from topic
      const result = await fcmService.unsubscribeFromTopic([token], topic);

      if (!result.success) {
        throw new HttpsError("internal", `Failed to unsubscribe from topic: ${result.error}`);
      }

      // Update user's notification preferences
      const userPrefsRef = db.collection("notification_preferences").doc(userId);
      
      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(userPrefsRef);
        
        if (doc.exists) {
          const currentData = doc.data()!;
          const topics = currentData.topics || [];
          const updatedTopics = topics.filter((t: string) => t !== topic);
          
          transaction.update(userPrefsRef, {
            topics: updatedTopics,
            updatedAt: new Date(),
          });
        }
      });

      logger.info(`Successfully unsubscribed user ${userId} from topic ${topic}`);

      return {
        success: true,
        message: `Successfully unsubscribed from topic: ${topic}`,
        topic,
      };

    } catch (error) {
      logger.error("Error unsubscribing from topic:", error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError("internal", "Failed to unsubscribe from topic");
    }
  }
);

// ========================================
// GET USER NOTIFICATION PREFERENCES
// ========================================

export const getUserNotificationPreferences = onCall(
  {
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 30,
  },
  async (request) => {
    try {
      // Verify authentication
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
      }

      const userId = request.auth.uid;

      logger.info(`Getting notification preferences for user ${userId}`);

      // Get user's notification preferences
      const userPrefsDoc = await db.collection("notification_preferences").doc(userId).get();

      if (!userPrefsDoc.exists) {
        // Return default preferences if none exist
        return {
          userId,
          topics: [],
          fcmTokens: [],
          preferences: {
            contactForm: false,
            newsletter: true,
            userUpdates: true,
            campaigns: false,
            dailyDigest: false,
            weeklyReport: false,
            systemAlerts: false,
            marketing: true,
          },
          timezone: "UTC",
          language: "en",
          quietHours: {
            enabled: false,
            start: "22:00",
            end: "08:00",
          },
        };
      }

      const preferences = userPrefsDoc.data()!;

      // Remove sensitive data before returning
      delete preferences.fcmTokens;

      return preferences;

    } catch (error) {
      logger.error("Error getting notification preferences:", error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError("internal", "Failed to get notification preferences");
    }
  }
);

// ========================================
// UPDATE NOTIFICATION PREFERENCES
// ========================================

export const updateNotificationPreferences = onCall(
  {
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  async (request) => {
    try {
      // Verify authentication
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
      }

      const { preferences, timezone, language, quietHours } = request.data;
      const userId = request.auth.uid;

      if (!preferences && !timezone && !language && !quietHours) {
        throw new HttpsError("invalid-argument", "At least one preference field is required");
      }

      logger.info(`Updating notification preferences for user ${userId}`);

      // Validate preferences structure if provided
      if (preferences) {
        const validKeys = [
          "contactForm", "newsletter", "userUpdates", "campaigns",
          "dailyDigest", "weeklyReport", "systemAlerts", "marketing"
        ];
        
        for (const key of Object.keys(preferences)) {
          if (!validKeys.includes(key)) {
            throw new HttpsError("invalid-argument", `Invalid preference key: ${key}`);
          }
          
          if (typeof preferences[key] !== "boolean") {
            throw new HttpsError("invalid-argument", `Preference ${key} must be a boolean`);
          }
        }
      }

      // Update user's notification preferences
      const userPrefsRef = db.collection("notification_preferences").doc(userId);
      
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (preferences) {
        updateData.preferences = preferences;
      }

      if (timezone) {
        updateData.timezone = timezone;
      }

      if (language) {
        updateData.language = language;
      }

      if (quietHours) {
        updateData.quietHours = quietHours;
      }

      await userPrefsRef.update(updateData);

      logger.info(`Successfully updated notification preferences for user ${userId}`);

      return {
        success: true,
        message: "Notification preferences updated successfully",
        updatedFields: Object.keys(updateData).filter(key => key !== "updatedAt"),
      };

    } catch (error) {
      logger.error("Error updating notification preferences:", error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError("internal", "Failed to update notification preferences");
    }
  }
);
