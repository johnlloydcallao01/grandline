/**
 * RTK Query API Configuration
 *
 * Centralized API configuration using RTK Query for efficient data fetching,
 * caching, and synchronization across the Encreasl platform.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_TAGS } from '../types/api';
// ============================================================================
// Base Query Configuration
// ============================================================================
const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        // Get token from Redux state
        const token = getState().auth.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        // Set common headers
        headers.set('content-type', 'application/json');
        headers.set('x-client-version', process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0');
        headers.set('x-client-platform', 'web');
        return headers;
    },
});
// Enhanced base query with automatic token refresh
const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    // If we get a 401, try to refresh the token
    if (result.error && result.error.status === 401) {
        const state = api.getState();
        const refreshToken = state.auth.refreshToken;
        if (refreshToken) {
            // Try to refresh the token
            const refreshResult = await baseQuery({
                url: '/auth/refresh',
                method: 'POST',
                body: { refreshToken },
            }, api, extraOptions);
            if (refreshResult.data) {
                // Store the new token
                const { token, refreshToken: newRefreshToken, expiresIn } = refreshResult.data;
                api.dispatch({
                    type: 'auth/refreshToken/fulfilled',
                    payload: { token, refreshToken: newRefreshToken, expiresIn },
                });
                // Retry the original query with new token
                result = await baseQuery(args, api, extraOptions);
            }
            else {
                // Refresh failed, force logout
                api.dispatch({ type: 'auth/forceLogout' });
            }
        }
        else {
            // No refresh token, force logout
            api.dispatch({ type: 'auth/forceLogout' });
        }
    }
    return result;
};
// ============================================================================
// API Definition
// ============================================================================
export const api = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: Object.values(API_TAGS),
    keepUnusedDataFor: 60, // Keep unused data for 60 seconds
    refetchOnMountOrArgChange: 30, // Refetch if data is older than 30 seconds
    refetchOnFocus: true,
    refetchOnReconnect: true,
    endpoints: (builder) => ({
        // ========================================================================
        // Authentication Endpoints
        // ========================================================================
        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: [API_TAGS.Auth, API_TAGS.User],
        }),
        register: builder.mutation({
            query: (userData) => ({
                url: '/auth/register',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: [API_TAGS.Auth, API_TAGS.User],
        }),
        logout: builder.mutation({
            query: (body) => ({
                url: '/auth/logout',
                method: 'POST',
                body,
            }),
            invalidatesTags: [API_TAGS.Auth, API_TAGS.User],
        }),
        refreshToken: builder.mutation({
            query: (body) => ({
                url: '/auth/refresh',
                method: 'POST',
                body,
            }),
        }),
        forgotPassword: builder.mutation({
            query: (body) => ({
                url: '/auth/forgot-password',
                method: 'POST',
                body,
            }),
        }),
        resetPassword: builder.mutation({
            query: (body) => ({
                url: '/auth/reset-password',
                method: 'POST',
                body,
            }),
        }),
        // ========================================================================
        // User Endpoints
        // ========================================================================
        getCurrentUser: builder.query({
            query: () => '/auth/me',
            providesTags: [API_TAGS.User],
        }),
        getUserById: builder.query({
            query: ({ userId }) => `/users/${userId}`,
            providesTags: (_result, _error, { userId }) => [
                { type: API_TAGS.User, id: userId },
            ],
        }),
        updateUser: builder.mutation({
            query: ({ userId, data }) => ({
                url: `/users/${userId}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (_result, _error, { userId }) => [
                { type: API_TAGS.User, id: userId },
                API_TAGS.User,
            ],
        }),
        updateUserPreferences: builder.mutation({
            query: ({ userId, preferences }) => ({
                url: `/users/${userId}/preferences`,
                method: 'PATCH',
                body: preferences,
            }),
            invalidatesTags: (_result, _error, { userId }) => [
                { type: API_TAGS.User, id: userId },
            ],
        }),
        uploadAvatar: builder.mutation({
            query: ({ userId, file }) => {
                const formData = new FormData();
                formData.append('avatar', file);
                return {
                    url: `/users/${userId}/avatar`,
                    method: 'POST',
                    body: formData,
                    formData: true,
                };
            },
            invalidatesTags: (_result, _error, { userId }) => [
                { type: API_TAGS.User, id: userId },
            ],
        }),
        // ========================================================================
        // File Upload Endpoints
        // ========================================================================
        uploadFile: builder.mutation({
            query: ({ file, folder, public: isPublic }) => {
                const formData = new FormData();
                formData.append('file', file);
                if (folder)
                    formData.append('folder', folder);
                if (isPublic !== undefined)
                    formData.append('public', String(isPublic));
                return {
                    url: '/files/upload',
                    method: 'POST',
                    body: formData,
                    formData: true,
                };
            },
            invalidatesTags: [API_TAGS.File],
        }),
        deleteFile: builder.mutation({
            query: ({ fileId }) => ({
                url: `/files/${fileId}`,
                method: 'DELETE',
            }),
            invalidatesTags: [API_TAGS.File],
        }),
        // ========================================================================
        // Search Endpoints
        // ========================================================================
        search: builder.query({
            query: ({ query, type, filters, pagination }) => ({
                url: '/search',
                params: {
                    q: query,
                    type,
                    ...filters,
                    ...pagination,
                },
            }),
            providesTags: [API_TAGS.Search],
        }),
        getSearchSuggestions: builder.query({
            query: ({ query }) => ({
                url: '/search/suggestions',
                params: { q: query },
            }),
            providesTags: [API_TAGS.Search],
        }),
        // ========================================================================
        // Notification Endpoints
        // ========================================================================
        getNotifications: builder.query({
            query: ({ userId, unreadOnly, type, ...pagination }) => ({
                url: `/users/${userId}/notifications`,
                params: {
                    unreadOnly,
                    type,
                    ...pagination,
                },
            }),
            providesTags: [API_TAGS.Notification],
        }),
        markNotificationRead: builder.mutation({
            query: ({ notificationId, userId }) => ({
                url: `/users/${userId}/notifications/${notificationId}/read`,
                method: 'PATCH',
            }),
            invalidatesTags: [API_TAGS.Notification],
        }),
        markAllNotificationsRead: builder.mutation({
            query: ({ userId }) => ({
                url: `/users/${userId}/notifications/read-all`,
                method: 'PATCH',
            }),
            invalidatesTags: [API_TAGS.Notification],
        }),
        sendNotification: builder.mutation({
            query: (notification) => ({
                url: '/notifications/send',
                method: 'POST',
                body: notification,
            }),
            invalidatesTags: [API_TAGS.Notification],
        }),
        // ========================================================================
        // Analytics Endpoints
        // ========================================================================
        trackEvents: builder.mutation({
            query: (body) => ({
                url: '/analytics/track',
                method: 'POST',
                body,
            }),
        }),
        getAnalyticsEvents: builder.query({
            query: (params) => ({
                url: '/analytics/events',
                params,
            }),
            providesTags: [API_TAGS.Analytics],
        }),
    }),
});
// ============================================================================
// Export hooks for components
// ============================================================================
export const { 
// Auth hooks
useLoginMutation, useRegisterMutation, useLogoutMutation, useRefreshTokenMutation, useForgotPasswordMutation, useResetPasswordMutation, 
// User hooks
useGetCurrentUserQuery, useGetUserByIdQuery, useUpdateUserMutation, useUpdateUserPreferencesMutation, useUploadAvatarMutation, 
// File hooks
useUploadFileMutation, useDeleteFileMutation, 
// Search hooks
useSearchQuery, useGetSearchSuggestionsQuery, 
// Notification hooks
useGetNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation, useSendNotificationMutation, 
// Analytics hooks
useTrackEventsMutation, useGetAnalyticsEventsQuery, } = api;
// ============================================================================
// Export API for store configuration
// ============================================================================
export default api;
