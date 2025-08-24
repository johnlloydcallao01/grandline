/**
 * Contact Form Notification Triggers
 *
 * Cloud Functions that send notifications when contact forms are submitted.
 */
export declare const onContactSubmitted: import("firebase-functions/v2").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").QueryDocumentSnapshot | undefined, {
    contactId: string;
}>>;
//# sourceMappingURL=contact-notifications.d.ts.map