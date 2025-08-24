/**
 * User Authentication Triggers
 *
 * Cloud Functions that handle Firebase Auth events and sync with Firestore.
 * These triggers ensure user documents are created/updated when auth events occur.
 */
/**
 * Triggered when a new user signs up via Firebase Auth
 * Creates corresponding Firestore documents
 */
export declare const onAuthUserCreated: import("firebase-functions/v2").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").QueryDocumentSnapshot | undefined, {
    userId: string;
}>>;
/**
 * Triggered when a user document is updated
 * Handles side effects and data consistency
 */
export declare const onUserUpdated: import("firebase-functions/v2").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2").Change<import("firebase-functions/v2/firestore").QueryDocumentSnapshot> | undefined, {
    userId: string;
}>>;
/**
 * Triggered when user preferences are updated
 * Syncs core preferences back to user document
 */
export declare const onUserPreferencesUpdated: import("firebase-functions/v2").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2").Change<import("firebase-functions/v2/firestore").QueryDocumentSnapshot> | undefined, {
    userId: string;
}>>;
//# sourceMappingURL=user-auth-triggers.d.ts.map