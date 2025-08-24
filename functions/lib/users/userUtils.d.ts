/**
 * User Management Utilities
 *
 * Utility functions for user CRUD operations, validation, and data management.
 * These functions are used by Cloud Functions and other services.
 */
import * as admin from 'firebase-admin';
import { User, UserPreferences, UserValidation, UserAccountType, UserPreferencesCore } from '../types/users';
/**
 * Creates a user document in Firestore
 */
export declare function createUserDocument(uid: string, userData: Partial<User>, createdBy?: string): Promise<User>;
/**
 * Creates user preferences document
 */
export declare function createUserPreferences(userId: string, preferences?: Partial<UserPreferences>): Promise<UserPreferences>;
/**
 * Gets a user by ID
 */
export declare function getUserById(userId: string): Promise<User | null>;
/**
 * Gets a user by email
 */
export declare function getUserByEmail(email: string): Promise<User | null>;
/**
 * Updates a user document
 */
export declare function updateUserDocument(userId: string, updateData: Partial<User>, updatedBy?: string): Promise<void>;
/**
 * Soft deletes a user
 */
export declare function softDeleteUser(userId: string, deletedBy?: string, reason?: string): Promise<void>;
/**
 * Restores a soft-deleted user
 */
export declare function restoreUser(userId: string, restoredBy?: string): Promise<void>;
/**
 * Gets active users with pagination
 */
export declare function getActiveUsers(limit?: number, startAfter?: admin.firestore.DocumentSnapshot): Promise<{
    users: User[];
    lastDoc?: admin.firestore.DocumentSnapshot;
}>;
/**
 * Gets users by account type
 */
export declare function getUsersByAccountType(accountType: UserAccountType): Promise<User[]>;
/**
 * Searches users by display name or email
 */
export declare function searchUsers(searchTerm: string, limit?: number): Promise<User[]>;
/**
 * Gets default user preferences
 */
export declare function getDefaultPreferences(): UserPreferencesCore;
/**
 * Validates user data
 */
export declare const userValidation: UserValidation;
/**
 * Generates a unique username suggestion
 */
export declare function generateUniqueUsername(baseName: string): Promise<string>;
//# sourceMappingURL=userUtils.d.ts.map