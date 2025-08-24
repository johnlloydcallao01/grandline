"use strict";
/**
 * PubSub Notification Triggers
 *
 * Cloud Functions that process bulk notifications and handle
 * asynchronous notification processing via Google Cloud Pub/Sub.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.processNotificationAnalytics = exports.processNotificationRetries = exports.processBulkNotifications = void 0;
const pubsub_1 = require("firebase-functions/v2/pubsub");
const v2_1 = require("firebase-functions/v2");
const fcm_service_1 = require("../services/fcm-service");
const firestore_1 = require("firebase-admin/firestore");
const fcmService = new fcm_service_1.FCMService();
const db = (0, firestore_1.getFirestore)();
// ========================================
// BULK NOTIFICATION PROCESSOR
// ========================================
exports.processBulkNotifications = (0, pubsub_1.onMessagePublished)({
    topic: "bulk-notifications",
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 540, // 9 minutes
}, async (event) => {
    try {
        const messageData = event.data.message.json;
        v2_1.logger.info("Processing bulk notification request", { messageData });
        const { batchId, notification, targets, priority = "normal", type = "bulk", metadata = {}, } = messageData;
        if (!batchId || !notification || !targets || !Array.isArray(targets)) {
            v2_1.logger.error("Invalid bulk notification message format", { messageData });
            return;
        }
        // Process notifications in smaller batches to avoid timeouts
        const batchSize = 500;
        const batches = [];
        for (let i = 0; i < targets.length; i += batchSize) {
            batches.push(targets.slice(i, i + batchSize));
        }
        let totalSent = 0;
        let totalFailed = 0;
        // Process each batch
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            v2_1.logger.info(`Processing batch ${i + 1}/${batches.length} with ${batch.length} targets`);
            try {
                const result = await fcmService.sendToMultipleTokens(batch, { notification, data: Object.assign({ batchId, type }, metadata) }, priority);
                totalSent += result.successCount || 0;
                totalFailed += result.failureCount || 0;
                // Log failed tokens for retry
                if ((result.failureCount || 0) > 0 && result.responses) {
                    const failedTokens = batch.filter((_, index) => !result.responses[index].success);
                    v2_1.logger.warn(`Batch ${i + 1} had ${result.failureCount} failures`, {
                        failedTokens: failedTokens.slice(0, 10) // Log first 10 failed tokens
                    });
                }
            }
            catch (error) {
                v2_1.logger.error(`Error processing batch ${i + 1}:`, error);
                totalFailed += batch.length;
            }
            // Small delay between batches to avoid rate limiting
            if (i < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        // Update batch status in Firestore
        await db.collection("notification_batches").doc(batchId).update({
            status: "completed",
            totalTargets: targets.length,
            totalSent,
            totalFailed,
            completedAt: new Date(),
        });
        // Log the bulk notification
        await fcmService.logNotification({
            type: type,
            title: notification.title,
            body: notification.body,
            recipients: [`bulk-${batchId}`],
            metadata: Object.assign({ batchId, totalTargets: targets.length, totalSent,
                totalFailed }, metadata),
            priority: priority,
            context: {
                source: "pubsub_trigger",
                triggeredBy: "system",
                environment: process.env.NODE_ENV || "development",
            },
        });
        v2_1.logger.info(`Bulk notification batch ${batchId} completed`, {
            totalTargets: targets.length,
            totalSent,
            totalFailed,
        });
    }
    catch (error) {
        v2_1.logger.error("Error processing bulk notification:", error);
        throw error;
    }
});
// ========================================
// NOTIFICATION RETRY PROCESSOR
// ========================================
exports.processNotificationRetries = (0, pubsub_1.onMessagePublished)({
    topic: "notification-retries",
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 300,
}, async (event) => {
    try {
        const messageData = event.data.message.json;
        v2_1.logger.info("Processing notification retry", { messageData });
        const { originalMessageId, token, notification, data, priority = "normal", retryCount = 1, maxRetries = 3, } = messageData;
        if (!token || !notification || retryCount > maxRetries) {
            v2_1.logger.warn("Skipping retry - invalid data or max retries exceeded", {
                token: token ? "present" : "missing",
                notification: notification ? "present" : "missing",
                retryCount,
                maxRetries,
            });
            return;
        }
        try {
            const result = await fcmService.sendToToken(token, { notification, data }, priority);
            if (result.success) {
                v2_1.logger.info(`Retry successful for message ${originalMessageId}`, {
                    token: token.substring(0, 20) + "...",
                    retryCount,
                });
                // Log successful retry
                await fcmService.logNotification({
                    type: "retry_success",
                    title: notification.title,
                    body: notification.body,
                    recipients: [token],
                    metadata: {
                        originalMessageId,
                        retryCount,
                        finalAttempt: true,
                    },
                    priority: priority,
                    context: {
                        source: "retry_processor",
                        triggeredBy: "system",
                        environment: process.env.NODE_ENV || "development",
                    },
                });
            }
            else {
                throw new Error(`Retry failed: ${result.error}`);
            }
        }
        catch (error) {
            v2_1.logger.error(`Retry ${retryCount} failed for message ${originalMessageId}:`, error);
            // If we haven't reached max retries, schedule another retry
            if (retryCount < maxRetries) {
                // Exponential backoff: 2^retryCount minutes
                const delayMinutes = Math.pow(2, retryCount);
                // Note: In a real implementation, you would publish this to a delayed topic
                // or use Cloud Tasks for delayed execution
                v2_1.logger.info(`Scheduling retry ${retryCount + 1} in ${delayMinutes} minutes`);
                // For now, we'll just log that a retry should be scheduled
                await fcmService.logNotification({
                    type: "retry_scheduled",
                    title: "Retry Scheduled",
                    body: `Retry ${retryCount + 1} scheduled for ${delayMinutes} minutes`,
                    recipients: [token],
                    metadata: {
                        originalMessageId,
                        retryCount: retryCount + 1,
                        delayMinutes,
                    },
                    priority: "low",
                    context: {
                        source: "retry_processor",
                        triggeredBy: "system",
                        environment: process.env.NODE_ENV || "development",
                    },
                });
            }
            else {
                // Max retries reached, log final failure
                await fcmService.logNotification({
                    type: "retry_failed",
                    title: "Retry Failed",
                    body: `All ${maxRetries} retry attempts failed`,
                    recipients: [token],
                    metadata: {
                        originalMessageId,
                        finalRetryCount: retryCount,
                        maxRetries,
                    },
                    priority: "low",
                    context: {
                        source: "retry_processor",
                        triggeredBy: "system",
                        environment: process.env.NODE_ENV || "development",
                    },
                });
            }
        }
    }
    catch (error) {
        v2_1.logger.error("Error processing notification retry:", error);
        throw error;
    }
});
// ========================================
// NOTIFICATION ANALYTICS PROCESSOR
// ========================================
exports.processNotificationAnalytics = (0, pubsub_1.onMessagePublished)({
    topic: "notification-analytics",
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 180,
}, async (event) => {
    try {
        const messageData = event.data.message.json;
        v2_1.logger.info("Processing notification analytics", { messageData });
        const { type, action, // 'delivered', 'opened', 'clicked', 'dismissed'
        notificationId, userId, timestamp, metadata = {}, } = messageData;
        if (!type || !action || !notificationId) {
            v2_1.logger.warn("Invalid analytics message format", { messageData });
            return;
        }
        // Store analytics data
        await db.collection("notification_analytics").add({
            type,
            action,
            notificationId,
            userId: userId || null,
            timestamp: timestamp ? new Date(timestamp) : new Date(),
            metadata,
            processedAt: new Date(),
        });
        // Update aggregated analytics
        const analyticsRef = db.collection("notification_analytics_summary").doc(`${type}-${action}`);
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(analyticsRef);
            if (doc.exists) {
                const currentData = doc.data();
                transaction.update(analyticsRef, {
                    count: currentData.count + 1,
                    lastUpdated: new Date(),
                });
            }
            else {
                transaction.set(analyticsRef, {
                    type,
                    action,
                    count: 1,
                    createdAt: new Date(),
                    lastUpdated: new Date(),
                });
            }
        });
        v2_1.logger.info(`Analytics processed for ${type}-${action}`, { notificationId });
    }
    catch (error) {
        v2_1.logger.error("Error processing notification analytics:", error);
        throw error;
    }
});
//# sourceMappingURL=pubsub-notifications.js.map