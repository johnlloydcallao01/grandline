"use strict";
/**
 * Contact Form Notification Triggers
 *
 * Cloud Functions that send notifications when contact forms are submitted.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.onContactSubmitted = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const v2_1 = require("firebase-functions/v2");
const fcm_service_1 = require("../services/fcm-service");
const firestore_2 = require("firebase-admin/firestore");
const fcmService = new fcm_service_1.FCMService();
const db = (0, firestore_2.getFirestore)();
// ========================================
// CONTACT FORM SUBMITTED TRIGGER
// ========================================
exports.onContactSubmitted = (0, firestore_1.onDocumentCreated)({
    document: "contacts/{contactId}",
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
}, async (event) => {
    var _a, _b, _c;
    try {
        const contactData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
        const contactId = event.params.contactId;
        if (!contactData) {
            v2_1.logger.error("No contact data found");
            return;
        }
        v2_1.logger.info(`Processing contact form submission: ${contactId}`, contactData);
        // ========================================
        // SEND ADMIN NOTIFICATIONS
        // ========================================
        // Get admin users who should receive contact notifications
        const adminUsersQuery = await db
            .collection("notification_preferences")
            .where("preferences.contactForm", "==", true)
            .where("topics", "array-contains", "admin")
            .get();
        const adminTokens = [];
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
            const adminResult = await fcmService.sendToTokens(adminTokens, adminNotification, "high");
            v2_1.logger.info(`Admin notification result:`, adminResult);
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
        const topicResult = await fcmService.sendToTopic("admin-contacts", topicNotification, "high");
        v2_1.logger.info(`Topic notification result:`, topicResult);
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
            if (((_b = userPrefs.preferences) === null || _b === void 0 ? void 0 : _b.contactForm) && ((_c = userPrefs.fcmTokens) === null || _c === void 0 ? void 0 : _c.length) > 0) {
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
                const confirmationResult = await fcmService.sendToTokens(userPrefs.fcmTokens, confirmationNotification, "normal");
                v2_1.logger.info(`User confirmation result:`, confirmationResult);
            }
        }
        // ========================================
        // URGENT CONTACT HANDLING
        // ========================================
        // Check if this is an urgent contact (based on keywords or priority)
        const urgentKeywords = ["urgent", "emergency", "asap", "immediately", "critical"];
        const isUrgent = urgentKeywords.some(keyword => contactData.message.toLowerCase().includes(keyword)) || contactData.priority === "urgent";
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
            const urgentResult = await fcmService.sendToTopic("super-admin", urgentNotification, "urgent");
            v2_1.logger.info(`Urgent notification result:`, urgentResult);
            // Also update the contact document to mark as urgent
            await db.collection("contacts").doc(contactId).update({
                priority: "urgent",
                isUrgent: true,
                urgentNotificationSent: true,
                updatedAt: new Date(),
            });
        }
        v2_1.logger.info(`Contact notification processing completed for: ${contactId}`);
    }
    catch (error) {
        v2_1.logger.error("Error processing contact form notification:", error);
        throw error;
    }
});
//# sourceMappingURL=contact-notifications.js.map