/**
 * User Management Notification Triggers
 * 
 * Cloud Functions that send notifications for user lifecycle events.
 */

import { onDocumentCreated, onDocumentDeleted } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { FCMService } from "../services/fcm-service";
import { getFirestore } from "firebase-admin/firestore";


const fcmService = new FCMService();
const db = getFirestore();


// ========================================
// USER CREATED TRIGGER
// ========================================

export const onUserCreated = onDocumentCreated(
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
        logger.error("No user data found");
        return;
      }

      logger.info(`Processing new user creation: ${userId}`, userData);

      // ========================================
      // SEND WELCOME NOTIFICATION TO USER
      // ========================================

      // Create default notification preferences for new user
      const defaultPreferences = {
        userId,
        email: userData.email,
        fcmTokens: [],
        topics: ["general"],
        preferences: {
          contactForm: false, // Users don't need contact form notifications
          newsletter: userData.preferences?.notifications?.marketing || true,
          userUpdates: userData.preferences?.notifications?.email || true,
          campaigns: false,
          dailyDigest: false,
          weeklyReport: false,
          systemAlerts: userData.preferences?.notifications?.push || false,
          marketing: userData.preferences?.notifications?.marketing || true,
        },
        timezone: userData.preferences?.timezone || "UTC",
        language: userData.preferences?.language || "en",
        quietHours: {
          enabled: false,
          start: "22:00",
          end: "08:00",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection("notification_preferences").doc(userId).set(defaultPreferences);

      // If user has FCM tokens, send welcome notification
      if (userData.fcmTokens && userData.fcmTokens.length > 0) {
        const welcomeNotification = {
          notification: {
            title: "Welcome to Encreasl! 🎉",
            body: "Thank you for joining us! Discover powerful marketing insights and grow your business.",
            icon: "/icons/welcome-icon.png",
            image: "/images/welcome-banner.jpg",
            clickAction: "/onboarding/welcome",
          },
          data: {
            type: "user_welcome",
            userId,
            email: userData.email,
            timestamp: Date.now().toString(),
          },
        };

        const welcomeResult = await fcmService.sendToTokens(
          userData.fcmTokens,
          welcomeNotification,
          "normal"
        );

        logger.info(`Welcome notification result:`, welcomeResult);

        // Subscribe to general topic
        await fcmService.subscribeToTopic(userData.fcmTokens, "general");
        await fcmService.subscribeToTopic(userData.fcmTokens, "marketing");
      }

      // ========================================
      // NOTIFY ADMIN TEAM
      // ========================================

      // Get admin users who should be notified of new signups
      const adminUsersQuery = await db
        .collection("notification_preferences")
        .where("preferences.userUpdates", "==", true)
        .where("topics", "array-contains", "admin")
        .get();

      const adminTokens: string[] = [];
      adminUsersQuery.docs.forEach(doc => {
        const prefs = doc.data();
        if (prefs.fcmTokens && prefs.fcmTokens.length > 0) {
          adminTokens.push(...prefs.fcmTokens);
        }
      });

      if (adminTokens.length > 0) {
        const adminNotification = {
          notification: {
            title: "New User Signup",
            body: `${userData.displayName || userData.email} just joined Encreasl`,
            icon: "/icons/user-signup-icon.png",
            clickAction: `/admin/users/${userId}`,
          },
          data: {
            type: "user_signup",
            userId,
            userEmail: userData.email,
            userName: userData.displayName || "",
            timestamp: Date.now().toString(),
          },
        };

        const adminResult = await fcmService.sendToTokens(
          adminTokens,
          adminNotification,
          "low"
        );

        logger.info(`Admin notification result:`, adminResult);
      }

      // ========================================
      // ONBOARDING SEQUENCE
      // ========================================

      // Schedule onboarding notifications (in production, use Cloud Scheduler)
      if (userData.fcmTokens && userData.fcmTokens.length > 0) {
        // Day 1: Getting started tips
        setTimeout(async () => {
          const onboardingNotification = {
            notification: {
              title: "Getting Started with Encreasl",
              body: "Here are some quick tips to help you get the most out of our platform!",
              icon: "/icons/tips-icon.png",
              clickAction: "/onboarding/tips",
            },
            data: {
              type: "onboarding_tips",
              userId,
              day: "1",
              timestamp: Date.now().toString(),
            },
          };

          await fcmService.sendToTokens(
            userData.fcmTokens,
            onboardingNotification,
            "normal"
          );
        }, 24 * 60 * 60 * 1000); // 24 hours

        // Day 3: Feature highlights
        setTimeout(async () => {
          const featureNotification = {
            notification: {
              title: "Discover Powerful Features",
              body: "Did you know you can track your marketing campaigns in real-time?",
              icon: "/icons/features-icon.png",
              clickAction: "/features/highlights",
            },
            data: {
              type: "feature_highlight",
              userId,
              day: "3",
              timestamp: Date.now().toString(),
            },
          };

          await fcmService.sendToTokens(
            userData.fcmTokens,
            featureNotification,
            "normal"
          );
        }, 3 * 24 * 60 * 60 * 1000); // 3 days
      }

      // ========================================
      // USER MILESTONE TRACKING
      // ========================================

      // Check total user count for milestones
      const totalUsers = await db.collection("users").get();
      const userCount = totalUsers.size;
      const milestones = [100, 500, 1000, 5000, 10000, 25000, 50000, 100000];
      
      if (milestones.includes(userCount)) {
        const milestoneNotification = {
          notification: {
            title: `🎉 User Milestone Reached!`,
            body: `Congratulations! We now have ${userCount.toLocaleString()} registered users!`,
            icon: "/icons/milestone-icon.png",
            image: "/images/user-milestone.jpg",
            clickAction: `/admin/analytics/users`,
          },
          data: {
            type: "user_milestone",
            milestone: userCount.toString(),
            timestamp: Date.now().toString(),
            requireInteraction: "true",
          },
        };

        await fcmService.sendToTopic("admin", milestoneNotification, "high");

        // Log milestone
        await db.collection("milestones").add({
          type: "total_users",
          count: userCount,
          achievedAt: new Date(),
          notificationSent: true,
        });
      }

      logger.info(`User creation processing completed for: ${userId}`);

    } catch (error) {
      logger.error("Error processing user creation notification:", error);
      throw error;
    }
  }
);

// ========================================
// USER DELETED TRIGGER
// ========================================

export const onUserDeleted = onDocumentDeleted(
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
        logger.error("No user data found for deletion");
        return;
      }

      logger.info(`Processing user deletion: ${userId}`, userData);

      // ========================================
      // CLEANUP USER DATA
      // ========================================

      // Remove notification preferences
      await db.collection("notification_preferences").doc(userId).delete();

      // Remove FCM devices
      const devicesQuery = await db
        .collection("fcm_devices")
        .where("userId", "==", userId)
        .get();

      const batch = db.batch();
      devicesQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // ========================================
      // NOTIFY ADMIN TEAM
      // ========================================

      const adminUsersQuery = await db
        .collection("notification_preferences")
        .where("preferences.userUpdates", "==", true)
        .where("topics", "array-contains", "admin")
        .get();

      const adminTokens: string[] = [];
      adminUsersQuery.docs.forEach(doc => {
        const prefs = doc.data();
        if (prefs.fcmTokens && prefs.fcmTokens.length > 0) {
          adminTokens.push(...prefs.fcmTokens);
        }
      });

      if (adminTokens.length > 0) {
        const adminNotification = {
          notification: {
            title: "User Account Deleted",
            body: `${userData.displayName || userData.email} has deleted their account`,
            icon: "/icons/user-deleted-icon.png",
            clickAction: `/admin/users/deleted`,
          },
          data: {
            type: "user_deleted",
            userId,
            userEmail: userData.email,
            userName: userData.displayName || "",
            timestamp: Date.now().toString(),
          },
        };

        const adminResult = await fcmService.sendToTokens(
          adminTokens,
          adminNotification,
          "low"
        );

        logger.info(`Admin deletion notification result:`, adminResult);
      }

      logger.info(`User deletion processing completed for: ${userId}`);

    } catch (error) {
      logger.error("Error processing user deletion notification:", error);
      throw error;
    }
  }
);
