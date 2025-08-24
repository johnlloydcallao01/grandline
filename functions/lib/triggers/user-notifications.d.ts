/**
 * User Management Notification Triggers
 *
 * Cloud Functions that send notifications for user lifecycle events.
 */
export declare const onUserCreated: import("firebase-functions/v2").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").QueryDocumentSnapshot | undefined, {
    userId: string;
}>>;
export declare const onUserDeleted: import("firebase-functions/v2").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").QueryDocumentSnapshot | undefined, {
    userId: string;
}>>;
//# sourceMappingURL=user-notifications.d.ts.map