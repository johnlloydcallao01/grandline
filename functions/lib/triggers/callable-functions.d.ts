/**
 * Callable Notification Functions
 *
 * Cloud Functions that can be called directly from client applications
 * for managing FCM subscriptions and notification preferences.
 */
export declare const subscribeToTopic: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    message: string;
    topic: any;
}>>;
export declare const unsubscribeFromTopic: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    message: string;
    topic: any;
}>>;
export declare const getUserNotificationPreferences: import("firebase-functions/v2/https").CallableFunction<any, Promise<FirebaseFirestore.DocumentData>>;
export declare const updateNotificationPreferences: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    message: string;
    updatedFields: string[];
}>>;
//# sourceMappingURL=callable-functions.d.ts.map