/**
 * Newsletter Notification Triggers
 * 
 * Cloud Functions that send notifications for newsletter events.
 */

import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { FCMService } from "../services/fcm-service";
import { getFirestore } from "firebase-admin/firestore";

const fcmService = new FCMService();
const db = getFirestore();

// ========================================
// NEWSLETTER SUBSCRIPTION TRIGGER
// ========================================

export const onNewsletterSubscribed = onDocumentCreated(
  {
    document: "newsletter/{subscriptionId}",
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  async (event) => {
    try {
      const subscriptionData = event.data?.data();
      const subscriptionId = event.params.subscriptionId;

      if (!subscriptionData) {
        logger.error("No subscription data found");
        return;
      }

      logger.info(`Processing newsletter subscription: ${subscriptionId}`, subscriptionData);

      // ========================================
      // SEND WELCOME NOTIFICATION TO SUBSCRIBER
      // ========================================

      // Check if user has FCM tokens for welcome notifications
      const userPrefsQuery = await db
        .collection("notification_preferences")
        .where("email", "==", subscriptionData.email)
        .limit(1)
        .get();

      if (!userPrefsQuery.empty) {
        const userPrefs = userPrefsQuery.docs[0].data();
        
        if (userPrefs.preferences?.newsletter && userPrefs.fcmTokens?.length > 0) {
          const welcomeNotification = {
            notification: {
              title: "Welcome to Encreasl Newsletter! 🎉",
              body: "Thank you for subscribing! You'll receive our latest marketing insights and tips.",
              icon: "/icons/newsletter-welcome-icon.png",
              image: "/images/newsletter-welcome-banner.jpg",
              clickAction: "/newsletter/welcome",
            },
            data: {
              type: "newsletter_welcome",
              subscriptionId,
              email: subscriptionData.email,
              timestamp: Date.now().toString(),
            },
          };

          const welcomeResult = await fcmService.sendToTokens(
            userPrefs.fcmTokens,
            welcomeNotification,
            "normal"
          );

          logger.info(`Welcome notification result:`, welcomeResult);

          // Subscribe user to newsletter topic
          await fcmService.subscribeToTopic(userPrefs.fcmTokens, "newsletter");
          
          // Subscribe to preference-based topics
          if (subscriptionData.preferences?.marketing) {
            await fcmService.subscribeToTopic(userPrefs.fcmTokens, "marketing");
          }
          if (subscriptionData.preferences?.updates) {
            await fcmService.subscribeToTopic(userPrefs.fcmTokens, "product-updates");
          }
        }
      }

      // ========================================
      // NOTIFY MARKETING TEAM
      // ========================================

      // Get marketing team members who should be notified
      const marketingTeamQuery = await db
        .collection("notification_preferences")
        .where("preferences.newsletter", "==", true)
        .where("topics", "array-contains", "marketing-team")
        .get();

      const marketingTokens: string[] = [];
      marketingTeamQuery.docs.forEach(doc => {
        const prefs = doc.data();
        if (prefs.fcmTokens && prefs.fcmTokens.length > 0) {
          marketingTokens.push(...prefs.fcmTokens);
        }
      });

      if (marketingTokens.length > 0) {
        const marketingNotification = {
          notification: {
            title: "New Newsletter Subscriber",
            body: `${subscriptionData.email} just subscribed to the newsletter`,
            icon: "/icons/marketing-icon.png",
            clickAction: `/admin/newsletter/subscribers`,
          },
          data: {
            type: "newsletter_signup",
            subscriptionId,
            email: subscriptionData.email,
            source: subscriptionData.source || "website",
            timestamp: Date.now().toString(),
          },
        };

        const marketingResult = await fcmService.sendToTokens(
          marketingTokens,
          marketingNotification,
          "low"
        );

        logger.info(`Marketing team notification result:`, marketingResult);
      }

      // ========================================
      // MILESTONE NOTIFICATIONS
      // ========================================

      // Check if this subscription hits a milestone
      const totalSubscribers = await db
        .collection("newsletter")
        .where("status", "==", "active")
        .get();

      const subscriberCount = totalSubscribers.size;
      const milestones = [100, 500, 1000, 5000, 10000, 25000, 50000, 100000];
      
      if (milestones.includes(subscriberCount)) {
        // Send milestone notification to admin team
        const milestoneNotification = {
          notification: {
            title: `🎉 Newsletter Milestone Reached!`,
            body: `Congratulations! We now have ${subscriberCount.toLocaleString()} newsletter subscribers!`,
            icon: "/icons/milestone-icon.png",
            image: "/images/milestone-celebration.jpg",
            clickAction: `/admin/analytics/newsletter`,
          },
          data: {
            type: "newsletter_milestone",
            milestone: subscriberCount.toString(),
            timestamp: Date.now().toString(),
            requireInteraction: "true",
          },
        };

        const milestoneResult = await fcmService.sendToTopic(
          "admin",
          milestoneNotification,
          "high"
        );

        logger.info(`Milestone notification result:`, milestoneResult);

        // Log milestone achievement
        await db.collection("milestones").add({
          type: "newsletter_subscribers",
          count: subscriberCount,
          achievedAt: new Date(),
          notificationSent: true,
        });
      }

      // ========================================
      // SEGMENT-BASED NOTIFICATIONS
      // ========================================

      // Check if subscriber has specific interests for targeted notifications
      if (subscriptionData.preferences) {
        const interests = Object.keys(subscriptionData.preferences).filter(
          key => subscriptionData.preferences[key] === true
        );

        if (interests.length > 0) {
          // Send personalized content recommendations
          const recommendationNotification = {
            notification: {
              title: "Content Recommendations for You",
              body: `Based on your interests in ${interests.join(", ")}, here are some articles you might like!`,
              icon: "/icons/recommendation-icon.png",
              clickAction: `/content/recommendations?interests=${interests.join(",")}`,
            },
            data: {
              type: "content_recommendation",
              subscriptionId,
              interests: interests.join(","),
              timestamp: Date.now().toString(),
            },
          };

          // Send after a delay (using scheduled function would be better for production)
          setTimeout(async () => {
            if (userPrefsQuery.docs.length > 0) {
              const userPrefs = userPrefsQuery.docs[0].data();
              if (userPrefs.fcmTokens?.length > 0) {
                await fcmService.sendToTokens(
                  userPrefs.fcmTokens,
                  recommendationNotification,
                  "low"
                );
              }
            }
          }, 5 * 60 * 1000); // 5 minutes delay
        }
      }

      logger.info(`Newsletter subscription processing completed for: ${subscriptionId}`);

    } catch (error) {
      logger.error("Error processing newsletter subscription notification:", error);
      throw error;
    }
  }
);
