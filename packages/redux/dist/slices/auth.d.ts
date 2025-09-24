/**
 * Authentication Slice
 *
 * Manages user authentication state, login/logout actions,
 * and session management for the Encreasl platform.
 */
import { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User, LoginCredentials, RegisterData, ApiError } from '../types';
export declare const loginUser: import("@reduxjs/toolkit").AsyncThunk<{
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: number;
}, LoginCredentials, {
    state: import("../types").RootState;
    dispatch: import("../types").AppDispatch;
    rejectValue: ApiError;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const registerUser: import("@reduxjs/toolkit").AsyncThunk<{
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: number;
}, RegisterData, {
    state: import("../types").RootState;
    dispatch: import("../types").AppDispatch;
    rejectValue: ApiError;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const refreshToken: import("@reduxjs/toolkit").AsyncThunk<{
    token: string;
    refreshToken: string;
    expiresIn: number;
}, void, {
    state: import("../types").RootState;
    dispatch: import("../types").AppDispatch;
    rejectValue: ApiError;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const logoutUser: import("@reduxjs/toolkit").AsyncThunk<void, void, {
    state: import("../types").RootState;
    dispatch: import("../types").AppDispatch;
    rejectValue: ApiError;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const loadUserFromToken: import("@reduxjs/toolkit").AsyncThunk<User, void, {
    state: import("../types").RootState;
    dispatch: import("../types").AppDispatch;
    rejectValue: ApiError;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const updateUserProfile: import("@reduxjs/toolkit").AsyncThunk<User, Partial<User>, {
    state: import("../types").RootState;
    dispatch: import("../types").AppDispatch;
    rejectValue: ApiError;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
declare const authSlice: import("@reduxjs/toolkit").Slice<AuthState, {
    clearError: (state: import("immer").WritableDraft<AuthState>) => void;
    updateLastActivity: (state: import("immer").WritableDraft<AuthState>) => void;
    setSessionExpiry: (state: import("immer").WritableDraft<AuthState>, action: PayloadAction<number>) => void;
    incrementLoginAttempts: (state: import("immer").WritableDraft<AuthState>) => void;
    resetLoginAttempts: (state: import("immer").WritableDraft<AuthState>) => void;
    updateUserPreferences: (state: import("immer").WritableDraft<AuthState>, action: PayloadAction<Partial<User["preferences"]>>) => void;
    forceLogout: (state: import("immer").WritableDraft<AuthState>) => void;
}, "auth", "auth", import("@reduxjs/toolkit").SliceSelectors<AuthState>>;
export declare const clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"auth/clearError">, updateLastActivity: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"auth/updateLastActivity">, setSessionExpiry: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "auth/setSessionExpiry">, incrementLoginAttempts: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"auth/incrementLoginAttempts">, resetLoginAttempts: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"auth/resetLoginAttempts">, updateUserPreferences: import("@reduxjs/toolkit").ActionCreatorWithPayload<Partial<import("..").UserPreferences>, "auth/updateUserPreferences">, forceLogout: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"auth/forceLogout">;
export default authSlice;
//# sourceMappingURL=auth.d.ts.map