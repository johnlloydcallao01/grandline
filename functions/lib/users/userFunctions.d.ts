/**
 * User Management Cloud Functions
 *
 * Handles user creation, updates, and management operations for regular users.
 * Follows the same patterns as admin functions but tailored for end users.
 */
import { CreateUserRequest, CreateUserResponse, UpdateUserRequest, UpdateUserResponse, GetUserResponse } from '../types/users';
/**
 * Creates a new regular user in the system
 */
export declare const createUser: import("firebase-functions/v2/https").CallableFunction<CreateUserRequest, Promise<CreateUserResponse>>;
/**
 * Updates an existing user
 */
export declare const updateUser: import("firebase-functions/v2/https").CallableFunction<UpdateUserRequest, Promise<UpdateUserResponse>>;
/**
 * Gets a user by ID
 */
export declare const getUser: import("firebase-functions/v2/https").CallableFunction<{
    userId: string;
}, Promise<GetUserResponse>>;
//# sourceMappingURL=userFunctions.d.ts.map