"use strict";
/**
 * Firebase Cloud Messaging Service
 *
 * Comprehensive FCM service for sending notifications, managing tokens,
 * and handling topics with advanced features.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FCMService = void 0;
const messaging_1 = require("firebase-admin/messaging");
const firestore_1 = require("firebase-admin/firestore");
const v2_1 = require("firebase-functions/v2");
class FCMService {
    constructor() {
        this.messaging = (0, messaging_1.getMessaging)();
        this.db = (0, firestore_1.getFirestore)();
    }
    // ========================================
    // CORE MESSAGING METHODS
    // ========================================
    /**
     * Send notification to a single device token
     */
    async sendToToken(token, notification, priority = "normal") {
        var _a, _b, _c, _d;
        try {
            const message = {
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
                title: ((_a = notification.notification) === null || _a === void 0 ? void 0 : _a.title) || "Notification",
                body: ((_b = notification.notification) === null || _b === void 0 ? void 0 : _b.body) || "",
                recipients: [token],
                priority,
                metadata: {
                    messageId,
                    timestamp: new Date().toISOString(),
                },
            });
            return { success: true, messageId };
        }
        catch (error) {
            v2_1.logger.error("Failed to send notification to token:", error);
            await this.logNotification({
                type: "custom",
                title: ((_c = notification.notification) === null || _c === void 0 ? void 0 : _c.title) || "Notification",
                body: ((_d = notification.notification) === null || _d === void 0 ? void 0 : _d.body) || "",
                recipients: [token],
                priority,
            });
            return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
    }
    /**
     * Send notification to multiple device tokens
     */
    async sendToTokens(tokens, notification, priority = "normal") {
        var _a, _b;
        try {
            const message = {
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
                title: ((_a = notification.notification) === null || _a === void 0 ? void 0 : _a.title) || "Notification",
                body: ((_b = notification.notification) === null || _b === void 0 ? void 0 : _b.body) || "",
                recipients: tokens,
                priority,
            });
            return {
                success: response.failureCount === 0,
                successCount: response.successCount,
                failureCount: response.failureCount,
                responses: response.responses.map(r => {
                    var _a;
                    return ({
                        success: r.success,
                        messageId: r.messageId,
                        error: (_a = r.error) === null || _a === void 0 ? void 0 : _a.message,
                    });
                }),
            };
        }
        catch (error) {
            v2_1.logger.error("Failed to send multicast notification:", error);
            return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
    }
    /**
     * Send notification to a topic
     */
    async sendToTopic(topic, notification, priority = "normal") {
        var _a, _b;
        try {
            const message = {
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
                title: ((_a = notification.notification) === null || _a === void 0 ? void 0 : _a.title) || "Notification",
                body: ((_b = notification.notification) === null || _b === void 0 ? void 0 : _b.body) || "",
                recipients: [topic],
                priority,
            });
            return { success: true, messageId };
        }
        catch (error) {
            v2_1.logger.error("Failed to send notification to topic:", error);
            return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
    }
    /**
     * Send notification using condition (complex topic logic)
     */
    async sendToCondition(condition, notification, priority = "normal") {
        var _a, _b;
        try {
            const message = {
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
                title: ((_a = notification.notification) === null || _a === void 0 ? void 0 : _a.title) || "Notification",
                body: ((_b = notification.notification) === null || _b === void 0 ? void 0 : _b.body) || "",
                recipients: [condition],
                priority,
            });
            return { success: true, messageId };
        }
        catch (error) {
            v2_1.logger.error("Failed to send notification to condition:", error);
            return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
    }
    // ========================================
    // TEMPLATE-BASED MESSAGING
    // ========================================
    /**
     * Send notification using a template
     */
    async sendFromTemplate(templateId, recipients, variables = {}, priority = "normal") {
        try {
            const template = await this.getTemplate(templateId);
            if (!template) {
                throw new Error(`Template not found: ${templateId}`);
            }
            const notification = this.processTemplate(template, variables);
            // Send based on recipient type
            if (recipients.tokens && recipients.tokens.length > 0) {
                return await this.sendToTokens(recipients.tokens, notification, priority);
            }
            else if (recipients.topics && recipients.topics.length > 0) {
                // Send to multiple topics using condition
                const condition = recipients.topics.map(topic => `'${topic}' in topics`).join(" || ");
                return await this.sendToCondition(condition, notification, priority);
            }
            else if (recipients.condition) {
                return await this.sendToCondition(recipients.condition, notification, priority);
            }
            else {
                throw new Error("No valid recipients specified");
            }
        }
        catch (error) {
            v2_1.logger.error("Failed to send template notification:", error);
            return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
    }
    /**
     * Process template with variables
     */
    processTemplate(template, variables) {
        const processString = (str) => {
            return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
                var _a;
                return ((_a = variables[key]) === null || _a === void 0 ? void 0 : _a.toString()) || match;
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
            data: template.data ? Object.assign({}, template.data) : undefined,
        };
    }
    // ========================================
    // TOKEN MANAGEMENT
    // ========================================
    /**
     * Validate FCM token
     */
    async validateToken(token) {
        try {
            await this.messaging.send({
                token,
                data: { test: "true" },
            }, true); // dry run
            return true;
        }
        catch (error) {
            return false;
        }
    }
    // ========================================
    // DATABASE OPERATIONS
    // ========================================
    /**
     * Get notification template
     */
    async getTemplate(templateId) {
        try {
            const doc = await this.db.collection("notification_templates").doc(templateId).get();
            return doc.exists ? Object.assign({ id: doc.id }, doc.data()) : null;
        }
        catch (error) {
            v2_1.logger.error("Failed to get template:", error);
            return null;
        }
    }
    /**
     * Get user notification preferences
     */
    async getUserPreferences(userId) {
        try {
            const doc = await this.db.collection("notification_preferences").doc(userId).get();
            return doc.exists ? doc.data() : null;
        }
        catch (error) {
            v2_1.logger.error("Failed to get user preferences:", error);
            return null;
        }
    }
    /**
     * Update user FCM token
     */
    async updateUserToken(userId, token, platform) {
        try {
            const deviceData = {
                userId,
                token,
                platform,
                isActive: true,
                lastSeen: firestore_1.Timestamp.now(),
                createdAt: firestore_1.Timestamp.now(),
                updatedAt: firestore_1.Timestamp.now(),
            };
            // Deactivate old tokens for this user
            const oldTokensQuery = await this.db
                .collection("fcm_devices")
                .where("userId", "==", userId)
                .where("platform", "==", platform)
                .get();
            const batch = this.db.batch();
            oldTokensQuery.docs.forEach(doc => {
                batch.update(doc.ref, { isActive: false, updatedAt: firestore_1.Timestamp.now() });
            });
            // Add new token
            const newTokenRef = this.db.collection("fcm_devices").doc();
            batch.set(newTokenRef, deviceData);
            await batch.commit();
            v2_1.logger.info(`Updated FCM token for user ${userId}`);
        }
        catch (error) {
            v2_1.logger.error("Failed to update user token:", error);
            throw error;
        }
    }
    // ========================================
    // TOPIC SUBSCRIPTION METHODS
    // ========================================
    /**
     * Subscribe tokens to a topic
     */
    async subscribeToTopic(tokens, topic) {
        try {
            await this.messaging.subscribeToTopic(tokens, topic);
            v2_1.logger.info(`Subscribed ${tokens.length} tokens to topic: ${topic}`);
            return { success: true };
        }
        catch (error) {
            v2_1.logger.error(`Failed to subscribe to topic ${topic}:`, error);
            return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
    }
    /**
     * Unsubscribe tokens from a topic
     */
    async unsubscribeFromTopic(tokens, topic) {
        try {
            await this.messaging.unsubscribeFromTopic(tokens, topic);
            v2_1.logger.info(`Unsubscribed ${tokens.length} tokens from topic: ${topic}`);
            return { success: true };
        }
        catch (error) {
            v2_1.logger.error(`Failed to unsubscribe from topic ${topic}:`, error);
            return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
    }
    // ========================================
    // DEVICE MANAGEMENT METHODS
    // ========================================
    /**
     * Register a new FCM device
     */
    async registerDevice(userId, token, deviceInfo) {
        try {
            const deviceData = {
                userId,
                token,
                platform: deviceInfo.platform || "web",
                deviceInfo: Object.assign({ userAgent: deviceInfo.userAgent, language: deviceInfo.language, timezone: deviceInfo.timezone }, deviceInfo),
                isActive: true,
                lastSeen: firestore_1.Timestamp.now(),
                createdAt: firestore_1.Timestamp.now(),
                updatedAt: firestore_1.Timestamp.now(),
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
                    lastSeen: firestore_1.Timestamp.now(),
                    updatedAt: firestore_1.Timestamp.now(),
                });
                return { success: true, deviceId: existingDoc.id };
            }
            else {
                // Create new device record
                const newDeviceRef = await this.db.collection("fcm_devices").add(deviceData);
                return { success: true, deviceId: newDeviceRef.id };
            }
        }
        catch (error) {
            v2_1.logger.error("Failed to register device:", error);
            return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
    }
    /**
     * Unregister an FCM device
     */
    async unregisterDevice(userId, token) {
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
                    updatedAt: firestore_1.Timestamp.now(),
                });
            }
            v2_1.logger.info(`Unregistered device for user ${userId}`);
            return { success: true };
        }
        catch (error) {
            v2_1.logger.error("Failed to unregister device:", error);
            return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
    }
    /**
     * Send notification to multiple tokens (alias for sendToTokens for compatibility)
     */
    async sendToMultipleTokens(tokens, notification, priority = "normal") {
        return this.sendToTokens(tokens, notification, priority);
    }
    // ========================================
    // LOGGING METHODS
    // ========================================
    /**
     * Log notification with enhanced context
     */
    async logNotification(logData) {
        try {
            const notificationLog = {
                type: logData.type,
                title: logData.title,
                body: logData.body,
                recipients: {
                    tokens: logData.recipients.filter(r => !r.includes('-')),
                    topics: logData.recipients.filter(r => r.includes('-') || r.includes('_')),
                },
                status: "sent",
                priority: logData.priority,
                sentAt: firestore_1.Timestamp.now(),
                metadata: logData.metadata || {},
                context: logData.context || {},
                analytics: {
                    sent: 1,
                    delivered: 0,
                    failed: 0,
                    clicked: 0,
                    dismissed: 0,
                },
                createdAt: firestore_1.Timestamp.now(),
                updatedAt: firestore_1.Timestamp.now(),
            };
            await this.db.collection("notification_logs").add(notificationLog);
        }
        catch (error) {
            v2_1.logger.error("Failed to log notification:", error);
            // Don't throw error for logging failures
        }
    }
}
exports.FCMService = FCMService;
//# sourceMappingURL=fcm-service.js.map