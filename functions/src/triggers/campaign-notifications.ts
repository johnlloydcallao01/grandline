/**
 * Campaign Notification Triggers
 * 
 * Cloud Functions that send notifications when marketing campaigns are created,
 * updated, or when campaign status changes occur.
 */

import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { FCMService } from "../services/fcm-service";
import { NotificationType, NotificationPriority } from "../types/notifications";

const fcmService = new FCMService();

// ========================================
// CAMPAIGN CREATED TRIGGER
// ========================================

export const onCampaignCreated = onDocumentCreated(
  {
    document: "campaigns/{campaignId}",
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  async (event) => {
    try {
      const campaignData = event.data?.data();
      const campaignId = event.params.campaignId;

      if (!campaignData) {
        logger.warn(`No campaign data found for campaign ${campaignId}`);
        return;
      }

      logger.info(`Campaign created: ${campaignId}`, { campaignData });

      // Notify admin users about new campaign
      await fcmService.sendToTopic(
        "admin-notifications",
        {
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
        },
        "normal"
      );

      // Log the notification
      await fcmService.logNotification({
        type: "campaign_created" as NotificationType,
        title: "New Campaign Created",
        body: `Campaign "${campaignData.name}" has been created`,
        recipients: ["admin-notifications"],
        metadata: {
          campaignId,
          campaignName: campaignData.name,
          status: campaignData.status,
        },
        priority: "normal" as NotificationPriority,
        context: {
          source: "campaign_trigger",
          triggeredBy: "system",
          environment: process.env.NODE_ENV || "development",
        },
      });

      logger.info(`Campaign creation notification sent for campaign ${campaignId}`);
    } catch (error) {
      logger.error(`Error processing campaign creation for ${event.params.campaignId}:`, error);
      throw error;
    }
  }
);

// ========================================
// CAMPAIGN STATUS CHANGED TRIGGER
// ========================================

export const onCampaignStatusChanged = onDocumentUpdated(
  {
    document: "campaigns/{campaignId}",
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  async (event) => {
    try {
      const beforeData = event.data?.before.data();
      const afterData = event.data?.after.data();
      const campaignId = event.params.campaignId;

      if (!beforeData || !afterData) {
        logger.warn(`Missing campaign data for status change ${campaignId}`);
        return;
      }

      const oldStatus = beforeData.status;
      const newStatus = afterData.status;

      // Only process if status actually changed
      if (oldStatus === newStatus) {
        return;
      }

      logger.info(`Campaign status changed: ${campaignId}`, {
        oldStatus,
        newStatus,
        campaignName: afterData.name,
      });

      // Determine notification priority based on status
      let priority: NotificationPriority = "normal";
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
      await fcmService.sendToTopic(
        "admin-notifications",
        {
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
        },
        priority
      );

      // If campaign is activated, notify subscribers if they opted in
      if (newStatus === "active" && afterData.notifySubscribers) {
        await notifySubscribersOfActiveCampaign(campaignId, afterData);
      }

      // Log the notification
      await fcmService.logNotification({
        type: "campaign_status_changed" as NotificationType,
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

      logger.info(`Campaign status change notification sent for campaign ${campaignId}`);
    } catch (error) {
      logger.error(`Error processing campaign status change for ${event.params.campaignId}:`, error);
      throw error;
    }
  }
);

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Notify subscribers when a campaign becomes active
 */
async function notifySubscribersOfActiveCampaign(campaignId: string, campaignData: any) {
  try {
    // Get campaign topic or target audience
    const targetTopic = campaignData.targetTopic || "general";
    
    // Send campaign notification to subscribers
    await fcmService.sendToTopic(
      targetTopic,
      {
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
      },
      "normal"
    );

    logger.info(`Campaign activation notification sent to topic: ${targetTopic}`);
  } catch (error) {
    logger.error(`Error notifying subscribers of active campaign ${campaignId}:`, error);
  }
}
