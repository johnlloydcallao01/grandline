/**
 * Campaign Notification Triggers
 *
 * Cloud Functions that send notifications when marketing campaigns are created,
 * updated, or when campaign status changes occur.
 */
export declare const onCampaignCreated: import("firebase-functions/v2").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").QueryDocumentSnapshot | undefined, {
    campaignId: string;
}>>;
export declare const onCampaignStatusChanged: import("firebase-functions/v2").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2").Change<import("firebase-functions/v2/firestore").QueryDocumentSnapshot> | undefined, {
    campaignId: string;
}>>;
//# sourceMappingURL=campaign-notifications.d.ts.map