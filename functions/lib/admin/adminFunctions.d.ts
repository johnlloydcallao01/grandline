/**
 * Admin Management Cloud Functions
 *
 * Following Firebase enterprise patterns:
 * - Reference-based architecture
 * - Strategic denormalization
 * - Event-driven consistency
 * - Parallel data fetching
 */
import { CreateAdminUserRequest, CreateAdminUserResponse, UpdateAdminUserRequest, UpdateAdminUserResponse } from './adminTypes';
/**
 * Creates a new admin user
 * Callable function for creating admin users
 */
export declare const createAdminUser: import("firebase-functions/v2/https").CallableFunction<CreateAdminUserRequest, Promise<CreateAdminUserResponse>>;
/**
 * Updates an existing admin user
 */
export declare const updateAdminUser: import("firebase-functions/v2/https").CallableFunction<UpdateAdminUserRequest, Promise<UpdateAdminUserResponse>>;
/**
 * Trigger when admin user is created
 * Handles event-driven consistency updates
 */
export declare const onAdminUserCreated: import("firebase-functions/v2").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").QueryDocumentSnapshot | undefined, {
    userId: string;
}>>;
/**
 * Trigger when admin user is updated
 * Handles denormalized data consistency
 */
export declare const onAdminUserUpdated: import("firebase-functions/v2").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2").Change<import("firebase-functions/v2/firestore").QueryDocumentSnapshot> | undefined, {
    userId: string;
}>>;
//# sourceMappingURL=adminFunctions.d.ts.map