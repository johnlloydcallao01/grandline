/**
 * Firebase Cloud Messaging Service
 * 
 * Comprehensive FCM service for sending notifications, managing tokens,
 * and handling topics with advanced features.
 */

import { getMessaging, Message, MulticastMessage, TopicMessage } from "firebase-admin/messaging";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";
import {
  FCMMessage,
  NotificationPreferences,
  NotificationTemplate,
  NotificationType,
  NotificationPriority,
  NotificationResponse,
  TemplateVariables,
  FCMDevice,
} from "../types/notifications";

export class FCMService {
  private messaging = getMessaging();
  private db = getFirestore();

  // ========================================
  // CORE MESSAGING METHODS
  // ========================================

  /**
   * Send notification to a single device token
   */
  async sendToToken(
    token: string,
    notification: FCMMessage,
    priority: NotificationPriority = "normal"
  ): Promise<NotificationResponse> {
    try {
      const message: Message = {
        token,
        notification: notification.notification,
        data: notification.data,
        android: {
          priority: priority === "high" || priority === "urgent" ? "high" : "normal",
        },
        webpush: {
          headers: {
            Urgency: priority === "urgent" ? "high" : priority,
          },
        },
      };

      const messageId = await this.messaging.send(message);
      
      await this.logNotification({
        type: "custom",
        title: notification.notification?.title || "Notification",
        body: notification.notification?.body || "",
        recipients: [token],


        priority,
        metadata: {
          messageId,
          timestamp: new Date().toISOString(),
        },
      });

      return { success: true, messageId };
    } catch (error) {
      logger.error("Failed to send notification to token:", error);
      
      await this.logNotification({
        type: "custom",
        title: notification.notification?.title || "Notification",
        body: notification.notification?.body || "",
        recipients: [token],


        priority,




      });

      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  /**
   * Send notification to multiple device tokens
   */
  async sendToTokens(
    tokens: string[],
    notification: FCMMessage,
    priority: NotificationPriority = "normal"
  ): Promise<NotificationResponse> {
    try {
      const message: MulticastMessage = {
        tokens,
        notification: notification.notification,
        data: notification.data,
        android: {
          priority: priority === "high" || priority === "urgent" ? "high" : "normal",
        },
        webpush: {
          headers: {
            Urgency: priority === "urgent" ? "high" : priority,
          },
        },
      };

      const response = await this.messaging.sendEachForMulticast(message);
      
      await this.logNotification({
        type: "custom",
        title: notification.notification?.title || "Notification",
        body: notification.notification?.body || "",
        recipients: tokens,


        priority,




      });

      return {
        success: response.failureCount === 0,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses.map(r => ({
          success: r.success,
          messageId: r.messageId,
          error: r.error?.message,
        })),
      };
    } catch (error) {
      logger.error("Failed to send multicast notification:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  /**
   * Send notification to a topic
   */
  async sendToTopic(
    topic: string,
    notification: FCMMessage,
    priority: NotificationPriority = "normal"
  ): Promise<NotificationResponse> {
    try {
      const message: TopicMessage = {
        topic,
        notification: notification.notification,
        data: notification.data,
        android: {
          priority: priority === "high" || priority === "urgent" ? "high" : "normal",
        },
        webpush: {
          headers: {
            Urgency: priority === "urgent" ? "high" : priority,
          },
        },
      };

      const messageId = await this.messaging.send(message);
      
      await this.logNotification({
        type: "custom",
        title: notification.notification?.title || "Notification",
        body: notification.notification?.body || "",
        recipients: [topic],


        priority,




      });

      return { success: true, messageId };
    } catch (error) {
      logger.error("Failed to send notification to topic:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  /**
   * Send notification using condition (complex topic logic)
   */
  async sendToCondition(
    condition: string,
    notification: FCMMessage,
    priority: NotificationPriority = "normal"
  ): Promise<NotificationResponse> {
    try {
      const message: Message = {
        condition,
        notification: notification.notification,
        data: notification.data,
        android: {
          priority: priority === "high" || priority === "urgent" ? "high" : "normal",
        },
        webpush: {
          headers: {
            Urgency: priority === "urgent" ? "high" : priority,
          },
        },
      };

      const messageId = await this.messaging.send(message);
      
      await this.logNotification({
        type: "custom",
        title: notification.notification?.title || "Notification",
        body: notification.notification?.body || "",
        recipients: [condition],


        priority,




      });

      return { success: true, messageId };
    } catch (error) {
      logger.error("Failed to send notification to condition:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  // ========================================
  // TEMPLATE-BASED MESSAGING
  // ========================================

  /**
   * Send notification using a template
   */
  async sendFromTemplate(
    templateId: string,
    recipients: { tokens?: string[]; topics?: string[]; condition?: string },
    variables: TemplateVariables = {},
    priority: NotificationPriority = "normal"
  ): Promise<NotificationResponse> {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      const notification = this.processTemplate(template, variables);
      
      // Send based on recipient type
      if (recipients.tokens && recipients.tokens.length > 0) {
        return await this.sendToTokens(recipients.tokens, notification, priority);
      } else if (recipients.topics && recipients.topics.length > 0) {
        // Send to multiple topics using condition
        const condition = recipients.topics.map(topic => `'${topic}' in topics`).join(" || ");
        return await this.sendToCondition(condition, notification, priority);
      } else if (recipients.condition) {
        return await this.sendToCondition(recipients.condition, notification, priority);
      } else {
        throw new Error("No valid recipients specified");
      }
    } catch (error) {
      logger.error("Failed to send template notification:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  /**
   * Process template with variables
   */
  private processTemplate(template: NotificationTemplate, variables: TemplateVariables): FCMMessage {
    const processString = (str: string): string => {
      return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key]?.toString() || match;
      });
    };

    return {
      notification: {
        title: processString(template.title),
        body: processString(template.body),
        icon: template.icon,
        image: template.image,
        clickAction: template.clickAction,
      },
      data: template.data ? { ...template.data } : undefined,
    };
  }

  // ========================================
  // TOKEN MANAGEMENT
  // ========================================



  /**
   * Validate FCM token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      await this.messaging.send({
        token,
        data: { test: "true" },
      }, true); // dry run
      return true;
    } catch (error) {
      return false;
    }
  }

  // ========================================
  // DATABASE OPERATIONS
  // ========================================



  /**
   * Get notification template
   */
  private async getTemplate(templateId: string): Promise<NotificationTemplate | null> {
    try {
      const doc = await this.db.collection("notification_templates").doc(templateId).get();
      return doc.exists ? { id: doc.id, ...doc.data() } as NotificationTemplate : null;
    } catch (error) {
      logger.error("Failed to get template:", error);
      return null;
    }
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const doc = await this.db.collection("notification_preferences").doc(userId).get();
      return doc.exists ? doc.data() as NotificationPreferences : null;
    } catch (error) {
      logger.error("Failed to get user preferences:", error);
      return null;
    }
  }

  /**
   * Update user FCM token
   */
  async updateUserToken(userId: string, token: string, platform: "web" | "android" | "ios"): Promise<void> {
    try {
      const deviceData: Omit<FCMDevice, "id"> = {
        userId,
        token,
        platform,
        isActive: true,
        lastSeen: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Deactivate old tokens for this user
      const oldTokensQuery = await this.db
        .collection("fcm_devices")
        .where("userId", "==", userId)
        .where("platform", "==", platform)
        .get();

      const batch = this.db.batch();
      oldTokensQuery.docs.forEach(doc => {
        batch.update(doc.ref, { isActive: false, updatedAt: Timestamp.now() });
      });

      // Add new token
      const newTokenRef = this.db.collection("fcm_devices").doc();
      batch.set(newTokenRef, deviceData);

      await batch.commit();
      logger.info(`Updated FCM token for user ${userId}`);
    } catch (error) {
      logger.error("Failed to update user token:", error);
      throw error;
    }
  }

  // ========================================
  // TOPIC SUBSCRIPTION METHODS
  // ========================================

  /**
   * Subscribe tokens to a topic
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<NotificationResponse> {
    try {
      await this.messaging.subscribeToTopic(tokens, topic);

      logger.info(`Subscribed ${tokens.length} tokens to topic: ${topic}`);
      return { success: true };
    } catch (error) {
      logger.error(`Failed to subscribe to topic ${topic}:`, error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  /**
   * Unsubscribe tokens from a topic
   */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<NotificationResponse> {
    try {
      await this.messaging.unsubscribeFromTopic(tokens, topic);

      logger.info(`Unsubscribed ${tokens.length} tokens from topic: ${topic}`);
      return { success: true };
    } catch (error) {
      logger.error(`Failed to unsubscribe from topic ${topic}:`, error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  // ========================================
  // DEVICE MANAGEMENT METHODS
  // ========================================

  /**
   * Register a new FCM device
   */
  async registerDevice(userId: string, token: string, deviceInfo: any): Promise<{ success: boolean; deviceId?: string; error?: string }> {
    try {
      const deviceData = {
        userId,
        token,
        platform: deviceInfo.platform || "web",
        deviceInfo: {
          userAgent: deviceInfo.userAgent,
          language: deviceInfo.language,
          timezone: deviceInfo.timezone,
          ...deviceInfo,
        },
        isActive: true,
        lastSeen: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Check if token already exists
      const existingTokenQuery = await this.db
        .collection("fcm_devices")
        .where("token", "==", token)
        .limit(1)
        .get();

      if (!existingTokenQuery.empty) {
        // Update existing token
        const existingDoc = existingTokenQuery.docs[0];
        await existingDoc.ref.update({
          userId,
          isActive: true,
          lastSeen: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        return { success: true, deviceId: existingDoc.id };
      } else {
        // Create new device record
        const newDeviceRef = await this.db.collection("fcm_devices").add(deviceData);
        return { success: true, deviceId: newDeviceRef.id };
      }
    } catch (error) {
      logger.error("Failed to register device:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  /**
   * Unregister an FCM device
   */
  async unregisterDevice(userId: string, token: string): Promise<NotificationResponse> {
    try {
      const tokenQuery = await this.db
        .collection("fcm_devices")
        .where("userId", "==", userId)
        .where("token", "==", token)
        .limit(1)
        .get();

      if (!tokenQuery.empty) {
        await tokenQuery.docs[0].ref.update({
          isActive: false,
          updatedAt: Timestamp.now(),
        });
      }

      logger.info(`Unregistered device for user ${userId}`);
      return { success: true };
    } catch (error) {
      logger.error("Failed to unregister device:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  /**
   * Send notification to multiple tokens (alias for sendToTokens for compatibility)
   */
  async sendToMultipleTokens(
    tokens: string[],
    notification: FCMMessage,
    priority: NotificationPriority = "normal"
  ): Promise<NotificationResponse> {
    return this.sendToTokens(tokens, notification, priority);
  }

  // ========================================
  // LOGGING METHODS
  // ========================================

  /**
   * Log notification with enhanced context
   */
  async logNotification(logData: {
    type: NotificationType;
    title: string;
    body: string;
    recipients: string[];
    metadata?: any;
    priority: NotificationPriority;
    context?: {
      source?: string;
      triggeredBy?: string;
      environment?: string;
    };
  }): Promise<void> {
    try {
      const notificationLog = {
        type: logData.type,
        title: logData.title,
        body: logData.body,
        recipients: {
          tokens: logData.recipients.filter(r => !r.includes('-')),
          topics: logData.recipients.filter(r => r.includes('-') || r.includes('_')),
        },
        status: "sent" as const,
        priority: logData.priority,
        sentAt: Timestamp.now(),
        metadata: logData.metadata || {},
        context: logData.context || {},
        analytics: {
          sent: 1,
          delivered: 0,
          failed: 0,
          clicked: 0,
          dismissed: 0,
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await this.db.collection("notification_logs").add(notificationLog);
    } catch (error) {
      logger.error("Failed to log notification:", error);
      // Don't throw error for logging failures
    }
  }
}
