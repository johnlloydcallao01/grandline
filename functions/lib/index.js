"use strict";
/**
 * Firebase Cloud Functions for Encreasl
 *
 * This file exports all Cloud Functions for the Encreasl monorepo.
 * Functions are organized by feature and trigger type.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.updateUser = exports.createUser = exports.createJohnAdmin = exports.resetAdminSystem = exports.checkAdminSystemStatus = exports.initializeAdminSystem = exports.revokeAdminSessions = exports.adminLogout = exports.validateAdminSession = exports.adminLogin = exports.getUserPermissions = exports.checkUserPermission = exports.createAdminPermission = exports.deleteAdminRole = exports.updateAdminRole = exports.createAdminRole = exports.onAdminUserUpdated = exports.onAdminUserCreated = exports.updateAdminUser = exports.createAdminUser = exports.updateNotificationPreferences = exports.getUserNotificationPreferences = exports.unsubscribeFromTopic = exports.subscribeToTopic = exports.processNotificationAnalytics = exports.processNotificationRetries = exports.processBulkNotifications = exports.getNotificationAnalytics = exports.manageFCMTokens = exports.sendNotification = exports.cleanupOldNotifications = exports.sendWeeklyReport = exports.sendDailyDigest = exports.onCampaignStatusChanged = exports.onCampaignCreated = exports.onUserPreferencesUpdated = exports.onUserUpdated = exports.onAuthUserCreated = exports.onUserDeleted = exports.onUserCreated = exports.onNewsletterSubscribed = exports.onContactSubmitted = void 0;
const app_1 = require("firebase-admin/app");
// Initialize Firebase Admin SDK
(0, app_1.initializeApp)();
// ========================================
// FIRESTORE TRIGGERS
// ========================================
// Contact form notifications
var contact_notifications_1 = require("./triggers/contact-notifications");
Object.defineProperty(exports, "onContactSubmitted", { enumerable: true, get: function () { return contact_notifications_1.onContactSubmitted; } });
// Newsletter notifications
var newsletter_notifications_1 = require("./triggers/newsletter-notifications");
Object.defineProperty(exports, "onNewsletterSubscribed", { enumerable: true, get: function () { return newsletter_notifications_1.onNewsletterSubscribed; } });
// User management notifications
var user_notifications_1 = require("./triggers/user-notifications");
Object.defineProperty(exports, "onUserCreated", { enumerable: true, get: function () { return user_notifications_1.onUserCreated; } });
Object.defineProperty(exports, "onUserDeleted", { enumerable: true, get: function () { return user_notifications_1.onUserDeleted; } });
// User authentication triggers
var user_auth_triggers_1 = require("./triggers/user-auth-triggers");
Object.defineProperty(exports, "onAuthUserCreated", { enumerable: true, get: function () { return user_auth_triggers_1.onAuthUserCreated; } });
Object.defineProperty(exports, "onUserUpdated", { enumerable: true, get: function () { return user_auth_triggers_1.onUserUpdated; } });
Object.defineProperty(exports, "onUserPreferencesUpdated", { enumerable: true, get: function () { return user_auth_triggers_1.onUserPreferencesUpdated; } });
// Campaign notifications
var campaign_notifications_1 = require("./triggers/campaign-notifications");
Object.defineProperty(exports, "onCampaignCreated", { enumerable: true, get: function () { return campaign_notifications_1.onCampaignCreated; } });
Object.defineProperty(exports, "onCampaignStatusChanged", { enumerable: true, get: function () { return campaign_notifications_1.onCampaignStatusChanged; } });
// ========================================
// SCHEDULED FUNCTIONS
// ========================================
// Daily digest notifications
var scheduled_notifications_1 = require("./triggers/scheduled-notifications");
Object.defineProperty(exports, "sendDailyDigest", { enumerable: true, get: function () { return scheduled_notifications_1.sendDailyDigest; } });
// Weekly analytics report
var scheduled_notifications_2 = require("./triggers/scheduled-notifications");
Object.defineProperty(exports, "sendWeeklyReport", { enumerable: true, get: function () { return scheduled_notifications_2.sendWeeklyReport; } });
// Cleanup old notifications
var scheduled_notifications_3 = require("./triggers/scheduled-notifications");
Object.defineProperty(exports, "cleanupOldNotifications", { enumerable: true, get: function () { return scheduled_notifications_3.cleanupOldNotifications; } });
// ========================================
// HTTP TRIGGERS
// ========================================
// Send custom notifications
var http_notifications_1 = require("./triggers/http-notifications");
Object.defineProperty(exports, "sendNotification", { enumerable: true, get: function () { return http_notifications_1.sendNotification; } });
// Manage FCM tokens
var http_notifications_2 = require("./triggers/http-notifications");
Object.defineProperty(exports, "manageFCMTokens", { enumerable: true, get: function () { return http_notifications_2.manageFCMTokens; } });
// Notification analytics
var http_notifications_3 = require("./triggers/http-notifications");
Object.defineProperty(exports, "getNotificationAnalytics", { enumerable: true, get: function () { return http_notifications_3.getNotificationAnalytics; } });
// ========================================
// PUBSUB TRIGGERS
// ========================================
// Bulk notification processing
var pubsub_notifications_1 = require("./triggers/pubsub-notifications");
Object.defineProperty(exports, "processBulkNotifications", { enumerable: true, get: function () { return pubsub_notifications_1.processBulkNotifications; } });
Object.defineProperty(exports, "processNotificationRetries", { enumerable: true, get: function () { return pubsub_notifications_1.processNotificationRetries; } });
Object.defineProperty(exports, "processNotificationAnalytics", { enumerable: true, get: function () { return pubsub_notifications_1.processNotificationAnalytics; } });
// ========================================
// CALLABLE FUNCTIONS
// ========================================
// Subscribe to topics
var callable_functions_1 = require("./triggers/callable-functions");
Object.defineProperty(exports, "subscribeToTopic", { enumerable: true, get: function () { return callable_functions_1.subscribeToTopic; } });
// Unsubscribe from topics
var callable_functions_2 = require("./triggers/callable-functions");
Object.defineProperty(exports, "unsubscribeFromTopic", { enumerable: true, get: function () { return callable_functions_2.unsubscribeFromTopic; } });
// Get user notification preferences
var callable_functions_3 = require("./triggers/callable-functions");
Object.defineProperty(exports, "getUserNotificationPreferences", { enumerable: true, get: function () { return callable_functions_3.getUserNotificationPreferences; } });
// Update notification preferences
var callable_functions_4 = require("./triggers/callable-functions");
Object.defineProperty(exports, "updateNotificationPreferences", { enumerable: true, get: function () { return callable_functions_4.updateNotificationPreferences; } });
// ========================================
// ADMIN FUNCTIONS
// ========================================
// Admin user management
var adminFunctions_1 = require("./admin/adminFunctions");
Object.defineProperty(exports, "createAdminUser", { enumerable: true, get: function () { return adminFunctions_1.createAdminUser; } });
Object.defineProperty(exports, "updateAdminUser", { enumerable: true, get: function () { return adminFunctions_1.updateAdminUser; } });
var adminFunctions_2 = require("./admin/adminFunctions");
Object.defineProperty(exports, "onAdminUserCreated", { enumerable: true, get: function () { return adminFunctions_2.onAdminUserCreated; } });
Object.defineProperty(exports, "onAdminUserUpdated", { enumerable: true, get: function () { return adminFunctions_2.onAdminUserUpdated; } });
// Role and permission management
var roleManagement_1 = require("./admin/roleManagement");
Object.defineProperty(exports, "createAdminRole", { enumerable: true, get: function () { return roleManagement_1.createAdminRole; } });
Object.defineProperty(exports, "updateAdminRole", { enumerable: true, get: function () { return roleManagement_1.updateAdminRole; } });
Object.defineProperty(exports, "deleteAdminRole", { enumerable: true, get: function () { return roleManagement_1.deleteAdminRole; } });
var roleManagement_2 = require("./admin/roleManagement");
Object.defineProperty(exports, "createAdminPermission", { enumerable: true, get: function () { return roleManagement_2.createAdminPermission; } });
Object.defineProperty(exports, "checkUserPermission", { enumerable: true, get: function () { return roleManagement_2.checkUserPermission; } });
Object.defineProperty(exports, "getUserPermissions", { enumerable: true, get: function () { return roleManagement_2.getUserPermissions; } });
// Admin authentication
var adminAuth_1 = require("./admin/adminAuth");
Object.defineProperty(exports, "adminLogin", { enumerable: true, get: function () { return adminAuth_1.adminLogin; } });
Object.defineProperty(exports, "validateAdminSession", { enumerable: true, get: function () { return adminAuth_1.validateAdminSession; } });
Object.defineProperty(exports, "adminLogout", { enumerable: true, get: function () { return adminAuth_1.adminLogout; } });
Object.defineProperty(exports, "revokeAdminSessions", { enumerable: true, get: function () { return adminAuth_1.revokeAdminSessions; } });
// Admin system setup
var setupAdmin_1 = require("./admin/setupAdmin");
Object.defineProperty(exports, "initializeAdminSystem", { enumerable: true, get: function () { return setupAdmin_1.initializeAdminSystem; } });
Object.defineProperty(exports, "checkAdminSystemStatus", { enumerable: true, get: function () { return setupAdmin_1.checkAdminSystemStatus; } });
Object.defineProperty(exports, "resetAdminSystem", { enumerable: true, get: function () { return setupAdmin_1.resetAdminSystem; } });
// Create specific admin user
var createJohnAdmin_1 = require("./admin/createJohnAdmin");
Object.defineProperty(exports, "createJohnAdmin", { enumerable: true, get: function () { return createJohnAdmin_1.createJohnAdmin; } });
// ========================================
// USER MANAGEMENT FUNCTIONS
// ========================================
// User CRUD operations
var userFunctions_1 = require("./users/userFunctions");
Object.defineProperty(exports, "createUser", { enumerable: true, get: function () { return userFunctions_1.createUser; } });
Object.defineProperty(exports, "updateUser", { enumerable: true, get: function () { return userFunctions_1.updateUser; } });
Object.defineProperty(exports, "getUser", { enumerable: true, get: function () { return userFunctions_1.getUser; } });
//# sourceMappingURL=index.js.map