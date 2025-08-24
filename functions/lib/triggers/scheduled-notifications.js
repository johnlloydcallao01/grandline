"use strict";
/**
 * Scheduled Notification Triggers
 *
 * Cloud Functions that run on schedules to send periodic notifications,
 * cleanup old data, and perform maintenance tasks.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldNotifications = exports.sendWeeklyReport = exports.sendDailyDigest = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const v2_1 = require("firebase-functions/v2");
const fcm_service_1 = require("../services/fcm-service");
const firestore_1 = require("firebase-admin/firestore");
const fcmService = new fcm_service_1.FCMService();
const db = (0, firestore_1.getFirestore)();
// ========================================
// DAILY DIGEST NOTIFICATION
// ========================================
exports.sendDailyDigest = (0, scheduler_1.onSchedule)({
    schedule: "0 9 * * *", // Every day at 9 AM UTC
    timeZone: "UTC",
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 300,
}, async (event) => {
    try {
        v2_1.logger.info("Starting daily digest notification process");
        // Get yesterday's date for data aggregation
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Aggregate daily statistics
        const stats = await aggregateDailyStats(yesterday, today);
        // Only send digest if there's meaningful activity
        if (stats.totalActivity === 0) {
            v2_1.logger.info("No activity yesterday, skipping daily digest");
            return;
        }
        // Send digest to admin users
        await fcmService.sendToTopic("admin-notifications", {
            notification: {
                title: "Daily Activity Digest",
                body: `Yesterday: ${stats.newContacts} contacts, ${stats.newSubscribers} subscribers, ${stats.notificationsSent} notifications sent`,
            },
            data: {
                type: "daily_digest",
                date: yesterday.toISOString().split('T')[0],
                newContacts: stats.newContacts.toString(),
                newSubscribers: stats.newSubscribers.toString(),
                notificationsSent: stats.notificationsSent.toString(),
                timestamp: new Date().toISOString(),
            },
        }, "normal");
        // Log the digest notification
        await fcmService.logNotification({
            type: "daily_digest",
            title: "Daily Activity Digest",
            body: `Daily digest sent for ${yesterday.toISOString().split('T')[0]}`,
            recipients: ["admin-notifications"],
            metadata: {
                date: yesterday.toISOString().split('T')[0],
                stats,
            },
            priority: "normal",
            context: {
                source: "scheduled_trigger",
                triggeredBy: "system",
                environment: process.env.NODE_ENV || "development",
            },
        });
        v2_1.logger.info("Daily digest notification sent successfully", { stats });
    }
    catch (error) {
        v2_1.logger.error("Error sending daily digest notification:", error);
        throw error;
    }
});
// ========================================
// WEEKLY REPORT NOTIFICATION
// ========================================
exports.sendWeeklyReport = (0, scheduler_1.onSchedule)({
    schedule: "0 10 * * 1", // Every Monday at 10 AM UTC
    timeZone: "UTC",
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 300,
}, async (event) => {
    try {
        v2_1.logger.info("Starting weekly report notification process");
        // Get last week's date range
        const lastWeekEnd = new Date();
        lastWeekEnd.setDate(lastWeekEnd.getDate() - 1); // Yesterday (Sunday)
        lastWeekEnd.setHours(23, 59, 59, 999);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekStart.getDate() - 6); // 7 days ago
        lastWeekStart.setHours(0, 0, 0, 0);
        // Aggregate weekly statistics
        const stats = await aggregateWeeklyStats(lastWeekStart, lastWeekEnd);
        // Send report to admin users
        await fcmService.sendToTopic("admin-notifications", {
            notification: {
                title: "Weekly Activity Report",
                body: `Last week: ${stats.totalContacts} contacts, ${stats.totalSubscribers} subscribers, ${stats.activeCampaigns} active campaigns`,
            },
            data: {
                type: "weekly_report",
                weekStart: lastWeekStart.toISOString().split('T')[0],
                weekEnd: lastWeekEnd.toISOString().split('T')[0],
                totalContacts: stats.totalContacts.toString(),
                totalSubscribers: stats.totalSubscribers.toString(),
                activeCampaigns: stats.activeCampaigns.toString(),
                timestamp: new Date().toISOString(),
            },
        }, "normal");
        // Log the report notification
        await fcmService.logNotification({
            type: "weekly_report",
            title: "Weekly Activity Report",
            body: `Weekly report sent for ${lastWeekStart.toISOString().split('T')[0]} to ${lastWeekEnd.toISOString().split('T')[0]}`,
            recipients: ["admin-notifications"],
            metadata: {
                weekStart: lastWeekStart.toISOString().split('T')[0],
                weekEnd: lastWeekEnd.toISOString().split('T')[0],
                stats,
            },
            priority: "normal",
            context: {
                source: "scheduled_trigger",
                triggeredBy: "system",
                environment: process.env.NODE_ENV || "development",
            },
        });
        v2_1.logger.info("Weekly report notification sent successfully", { stats });
    }
    catch (error) {
        v2_1.logger.error("Error sending weekly report notification:", error);
        throw error;
    }
});
// ========================================
// CLEANUP OLD NOTIFICATIONS
// ========================================
exports.cleanupOldNotifications = (0, scheduler_1.onSchedule)({
    schedule: "0 2 * * 0", // Every Sunday at 2 AM UTC
    timeZone: "UTC",
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 600,
}, async (event) => {
    try {
        v2_1.logger.info("Starting notification cleanup process");
        // Delete notifications older than 90 days
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 90);
        const oldNotificationsQuery = db
            .collection("notification_logs")
            .where("timestamp", "<", firestore_1.Timestamp.fromDate(cutoffDate))
            .limit(500); // Process in batches
        const snapshot = await oldNotificationsQuery.get();
        if (snapshot.empty) {
            v2_1.logger.info("No old notifications to cleanup");
            return;
        }
        // Delete in batches
        const batch = db.batch();
        let deleteCount = 0;
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
            deleteCount++;
        });
        await batch.commit();
        v2_1.logger.info(`Cleaned up ${deleteCount} old notification logs`);
        // Also cleanup old FCM device records that haven't been active
        await cleanupInactiveDevices();
    }
    catch (error) {
        v2_1.logger.error("Error during notification cleanup:", error);
        throw error;
    }
});
// ========================================
// HELPER FUNCTIONS
// ========================================
/**
 * Aggregate daily statistics for digest
 */
async function aggregateDailyStats(startDate, endDate) {
    const startTimestamp = firestore_1.Timestamp.fromDate(startDate);
    const endTimestamp = firestore_1.Timestamp.fromDate(endDate);
    // Get new contacts
    const contactsSnapshot = await db
        .collection("contacts")
        .where("createdAt", ">=", startTimestamp)
        .where("createdAt", "<", endTimestamp)
        .get();
    // Get new newsletter subscribers
    const subscribersSnapshot = await db
        .collection("newsletter_subscribers")
        .where("subscribedAt", ">=", startTimestamp)
        .where("subscribedAt", "<", endTimestamp)
        .get();
    // Get notifications sent
    const notificationsSnapshot = await db
        .collection("notification_logs")
        .where("timestamp", ">=", startTimestamp)
        .where("timestamp", "<", endTimestamp)
        .get();
    const stats = {
        newContacts: contactsSnapshot.size,
        newSubscribers: subscribersSnapshot.size,
        notificationsSent: notificationsSnapshot.size,
        totalActivity: contactsSnapshot.size + subscribersSnapshot.size + notificationsSnapshot.size,
    };
    return stats;
}
/**
 * Aggregate weekly statistics for report
 */
async function aggregateWeeklyStats(startDate, endDate) {
    const startTimestamp = firestore_1.Timestamp.fromDate(startDate);
    const endTimestamp = firestore_1.Timestamp.fromDate(endDate);
    // Get total contacts for the week
    const contactsSnapshot = await db
        .collection("contacts")
        .where("createdAt", ">=", startTimestamp)
        .where("createdAt", "<=", endTimestamp)
        .get();
    // Get total subscribers for the week
    const subscribersSnapshot = await db
        .collection("newsletter_subscribers")
        .where("subscribedAt", ">=", startTimestamp)
        .where("subscribedAt", "<=", endTimestamp)
        .get();
    // Get active campaigns
    const campaignsSnapshot = await db
        .collection("campaigns")
        .where("status", "==", "active")
        .get();
    const stats = {
        totalContacts: contactsSnapshot.size,
        totalSubscribers: subscribersSnapshot.size,
        activeCampaigns: campaignsSnapshot.size,
    };
    return stats;
}
/**
 * Cleanup inactive FCM device records
 */
async function cleanupInactiveDevices() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days inactive
    const inactiveDevicesQuery = db
        .collection("fcm_devices")
        .where("lastSeen", "<", firestore_1.Timestamp.fromDate(cutoffDate))
        .where("isActive", "==", false)
        .limit(100);
    const snapshot = await inactiveDevicesQuery.get();
    if (snapshot.empty) {
        return;
    }
    const batch = db.batch();
    let deleteCount = 0;
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        deleteCount++;
    });
    await batch.commit();
    v2_1.logger.info(`Cleaned up ${deleteCount} inactive FCM device records`);
}
//# sourceMappingURL=scheduled-notifications.js.map