"use strict";
/**
 * Campaign Notification Triggers
 *
 * Cloud Functions that send notifications when marketing campaigns are created,
 * updated, or when campaign status changes occur.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.onCampaignStatusChanged = exports.onCampaignCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const v2_1 = require("firebase-functions/v2");
const fcm_service_1 = require("../services/fcm-service");
const fcmService = new fcm_service_1.FCMService();
// ========================================
// CAMPAIGN CREATED TRIGGER
// ========================================
exports.onCampaignCreated = (0, firestore_1.onDocumentCreated)({
    document: "campaigns/{campaignId}",
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
}, async (event) => {
    var _a;
    try {
        const campaignData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
        const campaignId = event.params.campaignId;
        if (!campaignData) {
            v2_1.logger.warn(`No campaign data found for campaign ${campaignId}`);
            return;
        }
        v2_1.logger.info(`Campaign created: ${campaignId}`, { campaignData });
        // Notify admin users about new campaign
        await fcmService.sendToTopic("admin-notifications", {
            notification: {
                title: "New Campaign Created",
                body: `Campaign "${campaignData.name}" has been created and is ready for review.`,
            },
            data: {
                type: "campaign_created",
                campaignId,
                campaignName: campaignData.name,
                status: campaignData.status || "draft",
                timestamp: new Date().toISOString(),
            },
        }, "normal");
        // Log the notification
        await fcmService.logNotification({
            type: "campaign_created",
            title: "New Campaign Created",
            body: `Campaign "${campaignData.name}" has been created`,
            recipients: ["admin-notifications"],
            metadata: {
                campaignId,
                campaignName: campaignData.name,
                status: campaignData.status,
            },
            priority: "normal",
            context: {
                source: "campaign_trigger",
                triggeredBy: "system",
                environment: process.env.NODE_ENV || "development",
            },
        });
        v2_1.logger.info(`Campaign creation notification sent for campaign ${campaignId}`);
    }
    catch (error) {
        v2_1.logger.error(`Error processing campaign creation for ${event.params.campaignId}:`, error);
        throw error;
    }
});
// ========================================
// CAMPAIGN STATUS CHANGED TRIGGER
// ========================================
exports.onCampaignStatusChanged = (0, firestore_1.onDocumentUpdated)({
    document: "campaigns/{campaignId}",
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
}, async (event) => {
    var _a, _b;
    try {
        const beforeData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
        const afterData = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
        const campaignId = event.params.campaignId;
        if (!beforeData || !afterData) {
            v2_1.logger.warn(`Missing campaign data for status change ${campaignId}`);
            return;
        }
        const oldStatus = beforeData.status;
        const newStatus = afterData.status;
        // Only process if status actually changed
        if (oldStatus === newStatus) {
            return;
        }
        v2_1.logger.info(`Campaign status changed: ${campaignId}`, {
            oldStatus,
            newStatus,
            campaignName: afterData.name,
        });
        // Determine notification priority based on status
        let priority = "normal";
        let notificationTitle = "";
        let notificationBody = "";
        switch (newStatus) {
            case "active":
                priority = "high";
                notificationTitle = "Campaign Activated";
                notificationBody = `Campaign "${afterData.name}" is now live and sending notifications.`;
                break;
            case "paused":
                priority = "normal";
                notificationTitle = "Campaign Paused";
                notificationBody = `Campaign "${afterData.name}" has been paused.`;
                break;
            case "completed":
                priority = "normal";
                notificationTitle = "Campaign Completed";
                notificationBody = `Campaign "${afterData.name}" has finished successfully.`;
                break;
            case "cancelled":
                priority = "normal";
                notificationTitle = "Campaign Cancelled";
                notificationBody = `Campaign "${afterData.name}" has been cancelled.`;
                break;
            default:
                notificationTitle = "Campaign Status Updated";
                notificationBody = `Campaign "${afterData.name}" status changed to ${newStatus}.`;
        }
        // Send notification to admin users
        await fcmService.sendToTopic("admin-notifications", {
            notification: {
                title: notificationTitle,
                body: notificationBody,
            },
            data: {
                type: "campaign_status_changed",
                campaignId,
                campaignName: afterData.name,
                oldStatus,
                newStatus,
                timestamp: new Date().toISOString(),
            },
        }, priority);
        // If campaign is activated, notify subscribers if they opted in
        if (newStatus === "active" && afterData.notifySubscribers) {
            await notifySubscribersOfActiveCampaign(campaignId, afterData);
        }
        // Log the notification
        await fcmService.logNotification({
            type: "campaign_status_changed",
            title: notificationTitle,
            body: notificationBody,
            recipients: ["admin-notifications"],
            metadata: {
                campaignId,
                campaignName: afterData.name,
                oldStatus,
                newStatus,
            },
            priority,
            context: {
                source: "campaign_trigger",
                triggeredBy: "system",
                environment: process.env.NODE_ENV || "development",
            },
        });
        v2_1.logger.info(`Campaign status change notification sent for campaign ${campaignId}`);
    }
    catch (error) {
        v2_1.logger.error(`Error processing campaign status change for ${event.params.campaignId}:`, error);
        throw error;
    }
});
// ========================================
// HELPER FUNCTIONS
// ========================================
/**
 * Notify subscribers when a campaign becomes active
 */
async function notifySubscribersOfActiveCampaign(campaignId, campaignData) {
    try {
        // Get campaign topic or target audience
        const targetTopic = campaignData.targetTopic || "general";
        // Send campaign notification to subscribers
        await fcmService.sendToTopic(targetTopic, {
            notification: {
                title: campaignData.notificationTitle || campaignData.name,
                body: campaignData.notificationBody || "New campaign is now available!",
                image: campaignData.imageUrl,
            },
            data: {
                type: "campaign_notification",
                campaignId,
                campaignName: campaignData.name,
                campaignType: campaignData.type || "general",
                actionUrl: campaignData.actionUrl || "",
                timestamp: new Date().toISOString(),
            },
        }, "normal");
        v2_1.logger.info(`Campaign activation notification sent to topic: ${targetTopic}`);
    }
    catch (error) {
        v2_1.logger.error(`Error notifying subscribers of active campaign ${campaignId}:`, error);
    }
}
//# sourceMappingURL=campaign-notifications.js.map