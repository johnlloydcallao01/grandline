/**
 * Firebase Cloud Functions for Encreasl
 * 
 * This file exports all Cloud Functions for the Encreasl monorepo.
 * Functions are organized by feature and trigger type.
 */

import { initializeApp } from "firebase-admin/app";

// Initialize Firebase Admin SDK
initializeApp();

// ========================================
// FIRESTORE TRIGGERS
// ========================================

// Contact form notifications
export { onContactSubmitted } from "./triggers/contact-notifications";

// Newsletter notifications
export { onNewsletterSubscribed } from "./triggers/newsletter-notifications";

// User management notifications
export { onUserCreated, onUserDeleted } from "./triggers/user-notifications";

// User authentication triggers
export { onAuthUserCreated, onUserUpdated, onUserPreferencesUpdated } from "./triggers/user-auth-triggers";

// Campaign notifications
export { onCampaignCreated, onCampaignStatusChanged } from "./triggers/campaign-notifications";

// ========================================
// SCHEDULED FUNCTIONS
// ========================================

// Daily digest notifications
export { sendDailyDigest } from "./triggers/scheduled-notifications";

// Weekly analytics report
export { sendWeeklyReport } from "./triggers/scheduled-notifications";

// Cleanup old notifications
export { cleanupOldNotifications } from "./triggers/scheduled-notifications";

// ========================================
// HTTP TRIGGERS
// ========================================

// Send custom notifications
export { sendNotification } from "./triggers/http-notifications";

// Manage FCM tokens
export { manageFCMTokens } from "./triggers/http-notifications";

// Notification analytics
export { getNotificationAnalytics } from "./triggers/http-notifications";

// ========================================
// PUBSUB TRIGGERS
// ========================================

// Bulk notification processing
export {
  processBulkNotifications,
  processNotificationRetries,
  processNotificationAnalytics
} from "./triggers/pubsub-notifications";

// ========================================
// CALLABLE FUNCTIONS
// ========================================

// Subscribe to topics
export { subscribeToTopic } from "./triggers/callable-functions";

// Unsubscribe from topics
export { unsubscribeFromTopic } from "./triggers/callable-functions";

// Get user notification preferences
export { getUserNotificationPreferences } from "./triggers/callable-functions";

// Update notification preferences
export { updateNotificationPreferences } from "./triggers/callable-functions";

// ========================================
// ADMIN FUNCTIONS
// ========================================

// Admin user management
export { createAdminUser, updateAdminUser } from "./admin/adminFunctions";
export { onAdminUserCreated, onAdminUserUpdated } from "./admin/adminFunctions";

// Role and permission management
export { createAdminRole, updateAdminRole, deleteAdminRole } from "./admin/roleManagement";
export { createAdminPermission, checkUserPermission, getUserPermissions } from "./admin/roleManagement";

// Admin authentication
export { adminLogin, validateAdminSession, adminLogout, revokeAdminSessions } from "./admin/adminAuth";

// Admin system setup
export { initializeAdminSystem, checkAdminSystemStatus, resetAdminSystem } from "./admin/setupAdmin";

// Create specific admin user
export { createJohnAdmin } from "./admin/createJohnAdmin";

// ========================================
// USER MANAGEMENT FUNCTIONS
// ========================================

// User CRUD operations
export { createUser, updateUser, getUser } from "./users/userFunctions";
