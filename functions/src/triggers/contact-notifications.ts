/**
 * Contact Form Notification Triggers
 * 
 * Cloud Functions that send notifications when contact forms are submitted.
 */

import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { FCMService } from "../services/fcm-service";
import { getFirestore } from "firebase-admin/firestore";

const fcmService = new FCMService();
const db = getFirestore();

// ========================================
// CONTACT FORM SUBMITTED TRIGGER
// ========================================

export const onContactSubmitted = onDocumentCreated(
  {
    document: "contacts/{contactId}",
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  async (event) => {
    try {
      const contactData = event.data?.data();
      const contactId = event.params.contactId;

      if (!contactData) {
        logger.error("No contact data found");
        return;
      }

      logger.info(`Processing contact form submission: ${contactId}`, contactData);

      // ========================================
      // SEND ADMIN NOTIFICATIONS
      // ========================================

      // Get admin users who should receive contact notifications
      const adminUsersQuery = await db
        .collection("notification_preferences")
        .where("preferences.contactForm", "==", true)
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
        // Send notification to admin tokens
        const adminNotification = {
          notification: {
            title: "New Contact Form Submission",
            body: `${contactData.name} from ${contactData.company || "Unknown Company"} sent a message`,
            icon: "/icons/contact-icon.png",
            clickAction: `/admin/contacts/${contactId}`,
          },
          data: {
            type: "contact_form",
            contactId,
            contactName: contactData.name,
            contactEmail: contactData.email,
            contactCompany: contactData.company || "",
            priority: contactData.priority || "normal",
            timestamp: Date.now().toString(),
          },
        };

        const adminResult = await fcmService.sendToTokens(
          adminTokens,
          adminNotification,
          "high"
        );

        logger.info(`Admin notification result:`, adminResult);
      }

      // ========================================
      // SEND TO ADMIN TOPIC
      // ========================================

      // Also send to admin topic for broader reach
      const topicNotification = {
        notification: {
          title: "📧 New Contact Inquiry",
          body: `${contactData.name} needs assistance with: ${contactData.message.substring(0, 100)}...`,
          icon: "/icons/admin-contact-icon.png",
          clickAction: `/admin/contacts/${contactId}`,
        },
        data: {
          type: "contact_form",
          contactId,
          contactName: contactData.name,
          contactEmail: contactData.email,
          source: contactData.source || "website",
          timestamp: Date.now().toString(),
        },
      };

      const topicResult = await fcmService.sendToTopic(
        "admin-contacts",
        topicNotification,
        "high"
      );

      logger.info(`Topic notification result:`, topicResult);

      // ========================================
      // SEND CONFIRMATION TO USER (Optional)
      // ========================================

      // Check if user has opted in for confirmations
      const userPrefsDoc = await db
        .collection("notification_preferences")
        .where("email", "==", contactData.email)
        .limit(1)
        .get();

      if (!userPrefsDoc.empty) {
        const userPrefs = userPrefsDoc.docs[0].data();
        
        if (userPrefs.preferences?.contactForm && userPrefs.fcmTokens?.length > 0) {
          const confirmationNotification = {
            notification: {
              title: "Message Received - Encreasl",
              body: "Thank you for contacting us! We'll get back to you within 24 hours.",
              icon: "/icons/confirmation-icon.png",
              clickAction: "/contact/confirmation",
            },
            data: {
              type: "contact_confirmation",
              contactId,
              timestamp: Date.now().toString(),
            },
          };

          const confirmationResult = await fcmService.sendToTokens(
            userPrefs.fcmTokens,
            confirmationNotification,
            "normal"
          );

          logger.info(`User confirmation result:`, confirmationResult);
        }
      }

      // ========================================
      // URGENT CONTACT HANDLING
      // ========================================

      // Check if this is an urgent contact (based on keywords or priority)
      const urgentKeywords = ["urgent", "emergency", "asap", "immediately", "critical"];
      const isUrgent = urgentKeywords.some(keyword => 
        contactData.message.toLowerCase().includes(keyword)
      ) || contactData.priority === "urgent";

      if (isUrgent) {
        // Send urgent notification to super admins
        const urgentNotification = {
          notification: {
            title: "🚨 URGENT Contact Form",
            body: `URGENT: ${contactData.name} needs immediate assistance!`,
            icon: "/icons/urgent-icon.png",
            clickAction: `/admin/contacts/${contactId}?urgent=true`,
          },
          data: {
            type: "urgent_contact",
            contactId,
            contactName: contactData.name,
            contactEmail: contactData.email,
            priority: "urgent",
            timestamp: Date.now().toString(),
            requireInteraction: "true",
          },
        };

        const urgentResult = await fcmService.sendToTopic(
          "super-admin",
          urgentNotification,
          "urgent"
        );

        logger.info(`Urgent notification result:`, urgentResult);

        // Also update the contact document to mark as urgent
        await db.collection("contacts").doc(contactId).update({
          priority: "urgent",
          isUrgent: true,
          urgentNotificationSent: true,
          updatedAt: new Date(),
        });
      }

      logger.info(`Contact notification processing completed for: ${contactId}`);

    } catch (error) {
      logger.error("Error processing contact form notification:", error);
      throw error;
    }
  }
);
