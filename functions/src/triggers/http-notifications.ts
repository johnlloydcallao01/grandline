/**
 * HTTP Notification Triggers
 * 
 * Cloud Functions that provide HTTP endpoints for sending notifications,
 * managing FCM tokens, and retrieving notification analytics.
 */

import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import { FCMService } from "../services/fcm-service";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { NotificationType, NotificationPriority } from "../types/notifications";

const fcmService = new FCMService();
const db = getFirestore();
const auth = getAuth();

// ========================================
// SEND CUSTOM NOTIFICATION ENDPOINT
// ========================================

export const sendNotification = onRequest(
  {
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
    cors: true,
  },
  async (req, res) => {
    try {
      // Only allow POST requests
      if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
      }

      // Verify authentication
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
        return;
      }

      const idToken = authHeader.split("Bearer ")[1];
      let decodedToken;
      
      try {
        decodedToken = await auth.verifyIdToken(idToken);
      } catch (error) {
        res.status(401).json({ error: "Unauthorized: Invalid token" });
        return;
      }

      // Check if user has admin privileges
      if (!decodedToken.admin) {
        res.status(403).json({ error: "Forbidden: Admin access required" });
        return;
      }

      // Validate request body
      const { target, type, notification, data, priority = "normal" } = req.body;

      if (!target || !notification || !notification.title || !notification.body) {
        res.status(400).json({ 
          error: "Bad request: Missing required fields (target, notification.title, notification.body)" 
        });
        return;
      }

      logger.info("Sending custom notification", { 
        target, 
        type, 
        title: notification.title,
        userId: decodedToken.uid 
      });

      let result;

      // Send notification based on target type
      if (target.type === "token") {
        result = await fcmService.sendToToken(
          target.value,
          { notification, data },
          priority as NotificationPriority
        );
      } else if (target.type === "topic") {
        result = await fcmService.sendToTopic(
          target.value,
          { notification, data },
          priority as NotificationPriority
        );
      } else if (target.type === "tokens") {
        result = await fcmService.sendToMultipleTokens(
          target.value,
          { notification, data },
          priority as NotificationPriority
        );
      } else {
        res.status(400).json({ 
          error: "Bad request: Invalid target type. Must be 'token', 'topic', or 'tokens'" 
        });
        return;
      }

      // Log the notification
      await fcmService.logNotification({
        type: (type || "custom") as NotificationType,
        title: notification.title,
        body: notification.body,
        recipients: [target.value],
        metadata: {
          sentBy: decodedToken.uid,
          targetType: target.type,
          customData: data,
        },
        priority: priority as NotificationPriority,
        context: {
          source: "http_endpoint",
          triggeredBy: decodedToken.uid,
          environment: process.env.NODE_ENV || "development",
        },
      });

      res.status(200).json({
        success: true,
        message: "Notification sent successfully",
        result,
      });

    } catch (error) {
      logger.error("Error sending custom notification:", error);
      res.status(500).json({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
);

// ========================================
// MANAGE FCM TOKENS ENDPOINT
// ========================================

export const manageFCMTokens = onRequest(
  {
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
    cors: true,
  },
  async (req, res) => {
    try {
      // Verify authentication
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
        return;
      }

      const idToken = authHeader.split("Bearer ")[1];
      let decodedToken;
      
      try {
        decodedToken = await auth.verifyIdToken(idToken);
      } catch (error) {
        res.status(401).json({ error: "Unauthorized: Invalid token" });
        return;
      }

      const userId = decodedToken.uid;

      if (req.method === "GET") {
        // Get user's FCM tokens
        const userTokensSnapshot = await db
          .collection("fcm_devices")
          .where("userId", "==", userId)
          .where("isActive", "==", true)
          .get();

        const tokens = userTokensSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        res.status(200).json({
          success: true,
          tokens,
        });

      } else if (req.method === "POST") {
        // Add new FCM token
        const { token, platform, deviceInfo } = req.body;

        if (!token) {
          res.status(400).json({ error: "Bad request: Missing token" });
          return;
        }

        const result = await fcmService.registerDevice(userId, token, {
          platform: platform || "web",
          ...deviceInfo,
        });

        res.status(200).json({
          success: true,
          message: "Token registered successfully",
          deviceId: result.deviceId,
        });

      } else if (req.method === "DELETE") {
        // Remove FCM token
        const { token } = req.body;

        if (!token) {
          res.status(400).json({ error: "Bad request: Missing token" });
          return;
        }

        await fcmService.unregisterDevice(userId, token);

        res.status(200).json({
          success: true,
          message: "Token removed successfully",
        });

      } else {
        res.status(405).json({ error: "Method not allowed" });
      }

    } catch (error) {
      logger.error("Error managing FCM tokens:", error);
      res.status(500).json({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
);

// ========================================
// NOTIFICATION ANALYTICS ENDPOINT
// ========================================

export const getNotificationAnalytics = onRequest(
  {
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
    cors: true,
  },
  async (req, res) => {
    try {
      // Only allow GET requests
      if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
      }

      // Verify authentication
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
        return;
      }

      const idToken = authHeader.split("Bearer ")[1];
      let decodedToken;
      
      try {
        decodedToken = await auth.verifyIdToken(idToken);
      } catch (error) {
        res.status(401).json({ error: "Unauthorized: Invalid token" });
        return;
      }

      // Check if user has admin privileges
      if (!decodedToken.admin) {
        res.status(403).json({ error: "Forbidden: Admin access required" });
        return;
      }

      // Get query parameters
      const { startDate, endDate, type, limit = "100" } = req.query;

      // Build query
      let query = db.collection("notification_logs") as any;

      if (startDate) {
        query = query.where("timestamp", ">=", new Date(startDate as string));
      }

      if (endDate) {
        query = query.where("timestamp", "<=", new Date(endDate as string));
      }

      if (type) {
        query = query.where("type", "==", type);
      }

      query = query.orderBy("timestamp", "desc").limit(parseInt(limit as string));

      const snapshot = await query.get();
      const analytics = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get summary statistics
      const totalNotifications = snapshot.size;
      const typeBreakdown = analytics.reduce((acc: any, notification: any) => {
        acc[notification.type] = (acc[notification.type] || 0) + 1;
        return acc;
      }, {});

      res.status(200).json({
        success: true,
        analytics: {
          total: totalNotifications,
          typeBreakdown,
          notifications: analytics,
        },
      });

    } catch (error) {
      logger.error("Error getting notification analytics:", error);
      res.status(500).json({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
);
