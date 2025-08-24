/**
 * PubSub Notification Triggers
 *
 * Cloud Functions that process bulk notifications and handle
 * asynchronous notification processing via Google Cloud Pub/Sub.
 */
export declare const processBulkNotifications: import("firebase-functions/v2").CloudFunction<import("firebase-functions/v2").CloudEvent<import("firebase-functions/v2/pubsub").MessagePublishedData<any>>>;
export declare const processNotificationRetries: import("firebase-functions/v2").CloudFunction<import("firebase-functions/v2").CloudEvent<import("firebase-functions/v2/pubsub").MessagePublishedData<any>>>;
export declare const processNotificationAnalytics: import("firebase-functions/v2").CloudFunction<import("firebase-functions/v2").CloudEvent<import("firebase-functions/v2/pubsub").MessagePublishedData<any>>>;
//# sourceMappingURL=pubsub-notifications.d.ts.map