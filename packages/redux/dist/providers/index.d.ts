/**
 * Redux Providers
 *
 * React components that provide Redux context to applications.
 * These providers handle store initialization, persistence, and
 * development tools integration.
 */
import React from 'react';
import { type AppStore } from '../store';
export interface ReduxProviderProps {
    children: React.ReactNode;
    customStore?: AppStore;
    enablePersistence?: boolean;
    enableDevTools?: boolean;
    loadingComponent?: React.ReactNode;
    errorComponent?: React.ReactNode;
}
/**
 * Main Redux Provider component that wraps applications with Redux context
 *
 * Features:
 * - Redux store provider
 * - Redux Persist integration
 * - Automatic store initialization
 * - User authentication restoration
 * - Development tools integration
 * - Error boundary handling
 * - Loading states
 */
export declare const ReduxProvider: ({ children, customStore, enablePersistence, loadingComponent, errorComponent, }: ReduxProviderProps) => React.JSX.Element;
/**
 * Minimal Redux Provider without persistence (useful for testing or SSR)
 */
export declare const MinimalReduxProvider: ({ children, store: customStore, }: {
    children: React.ReactNode;
    store?: AppStore;
}) => React.JSX.Element;
/**
 * Development Redux Provider with enhanced debugging
 */
export declare const DevReduxProvider: ({ children }: {
    children: React.ReactNode;
}) => React.JSX.Element;
/**
 * Production Redux Provider with optimized settings
 */
export declare const ProductionReduxProvider: ({ children }: {
    children: React.ReactNode;
}) => React.JSX.Element;
/**
 * Higher-Order Component that wraps a component with Redux Provider
 */
export declare const withRedux: <P extends object>(Component: React.ComponentType<P>, options?: Partial<ReduxProviderProps>) => {
    (props: P): React.JSX.Element;
    displayName: string;
};
/**
 * Get the current store instance (useful for testing or advanced use cases)
 */
export declare const getStore: () => import("@reduxjs/toolkit").EnhancedStore<{
    auth: import("..").AuthState & import("redux-persist/es/persistReducer").PersistPartial;
    ui: import("..").UIState & import("redux-persist/es/persistReducer").PersistPartial;
    api: import("@reduxjs/toolkit/query").CombinedState<{
        login: import("@reduxjs/toolkit/query").MutationDefinition<import("..").LoginRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").LoginResponse, "api", unknown>;
        register: import("@reduxjs/toolkit/query").MutationDefinition<any, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").LoginResponse, "api", unknown>;
        logout: import("@reduxjs/toolkit/query").MutationDefinition<{
            refreshToken?: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", void, "api", unknown>;
        refreshToken: import("@reduxjs/toolkit/query").MutationDefinition<import("..").RefreshTokenRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").RefreshTokenResponse, "api", unknown>;
        forgotPassword: import("@reduxjs/toolkit/query").MutationDefinition<{
            email: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any>, "api", unknown>;
        resetPassword: import("@reduxjs/toolkit/query").MutationDefinition<{
            token: string;
            password: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any>, "api", unknown>;
        getCurrentUser: import("@reduxjs/toolkit/query").QueryDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any>, "api", unknown>;
        getUserById: import("@reduxjs/toolkit/query").QueryDefinition<import("..").GetUserRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any>, "api", unknown>;
        updateUser: import("@reduxjs/toolkit/query").MutationDefinition<import("..").UpdateUserRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any>, "api", unknown>;
        updateUserPreferences: import("@reduxjs/toolkit/query").MutationDefinition<import("..").UpdateUserPreferencesRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any>, "api", unknown>;
        uploadAvatar: import("@reduxjs/toolkit/query").MutationDefinition<{
            userId: string;
            file: File;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").FileUploadResponse, "api", unknown>;
        uploadFile: import("@reduxjs/toolkit/query").MutationDefinition<import("..").FileUploadRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").FileUploadResponse, "api", unknown>;
        deleteFile: import("@reduxjs/toolkit/query").MutationDefinition<{
            fileId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any>, "api", unknown>;
        search: import("@reduxjs/toolkit/query").QueryDefinition<import("..").SearchRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").SearchResponse, "api", unknown>;
        getSearchSuggestions: import("@reduxjs/toolkit/query").QueryDefinition<{
            query: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<string[]>, "api", unknown>;
        getNotifications: import("@reduxjs/toolkit/query").QueryDefinition<import("..").GetNotificationsRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any[]>, "api", unknown>;
        markNotificationRead: import("@reduxjs/toolkit/query").MutationDefinition<import("..").MarkNotificationReadRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any>, "api", unknown>;
        markAllNotificationsRead: import("@reduxjs/toolkit/query").MutationDefinition<{
            userId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any>, "api", unknown>;
        sendNotification: import("@reduxjs/toolkit/query").MutationDefinition<import("..").NotificationRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any>, "api", unknown>;
        trackEvents: import("@reduxjs/toolkit/query").MutationDefinition<import("..").AnalyticsTrackRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any>, "api", unknown>;
        getAnalyticsEvents: import("@reduxjs/toolkit/query").QueryDefinition<{
            userId?: string;
            startDate?: string;
            endDate?: string;
            eventType?: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any[]>, "api", unknown>;
    }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">;
}, import("@reduxjs/toolkit").UnknownAction, import("@reduxjs/toolkit").Tuple<[import("@reduxjs/toolkit").StoreEnhancer<{
    dispatch: import("@reduxjs/toolkit").ThunkDispatch<{
        auth: import("..").AuthState & import("redux-persist/es/persistReducer").PersistPartial;
        ui: import("..").UIState & import("redux-persist/es/persistReducer").PersistPartial;
        api: import("@reduxjs/toolkit/query").CombinedState<{
            login: import("@reduxjs/toolkit/query").MutationDefinition<import("..").LoginRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").LoginResponse, "api", unknown>;
            register: import("@reduxjs/toolkit/query").MutationDefinition<any, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").LoginResponse, "api", unknown>;
            logout: import("@reduxjs/toolkit/query").MutationDefinition<{
                refreshToken?: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", void, "api", unknown>;
            refreshToken: import("@reduxjs/toolkit/query").MutationDefinition<import("..").RefreshTokenRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").RefreshTokenResponse, "api", unknown>;
            forgotPassword: import("@reduxjs/toolkit/query").MutationDefinition<{
                email: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any>, "api", unknown>;
            resetPassword: import("@reduxjs/toolkit/query").MutationDefinition<{
                token: string;
                password: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any>, "api", unknown>;
            getCurrentUser: import("@reduxjs/toolkit/query").QueryDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any>, "api", unknown>;
            getUserById: import("@reduxjs/toolkit/query").QueryDefinition<import("..").GetUserRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any>, "api", unknown>;
            updateUser: import("@reduxjs/toolkit/query").MutationDefinition<import("..").UpdateUserRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any>, "api", unknown>;
            updateUserPreferences: import("@reduxjs/toolkit/query").MutationDefinition<import("..").UpdateUserPreferencesRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any>, "api", unknown>;
            uploadAvatar: import("@reduxjs/toolkit/query").MutationDefinition<{
                userId: string;
                file: File;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").FileUploadResponse, "api", unknown>;
            uploadFile: import("@reduxjs/toolkit/query").MutationDefinition<import("..").FileUploadRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").FileUploadResponse, "api", unknown>;
            deleteFile: import("@reduxjs/toolkit/query").MutationDefinition<{
                fileId: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any>, "api", unknown>;
            search: import("@reduxjs/toolkit/query").QueryDefinition<import("..").SearchRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").SearchResponse, "api", unknown>;
            getSearchSuggestions: import("@reduxjs/toolkit/query").QueryDefinition<{
                query: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<string[]>, "api", unknown>;
            getNotifications: import("@reduxjs/toolkit/query").QueryDefinition<import("..").GetNotificationsRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any[]>, "api", unknown>;
            markNotificationRead: import("@reduxjs/toolkit/query").MutationDefinition<import("..").MarkNotificationReadRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any>, "api", unknown>;
            markAllNotificationsRead: import("@reduxjs/toolkit/query").MutationDefinition<{
                userId: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any>, "api", unknown>;
            sendNotification: import("@reduxjs/toolkit/query").MutationDefinition<import("..").NotificationRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any>, "api", unknown>;
            trackEvents: import("@reduxjs/toolkit/query").MutationDefinition<import("..").AnalyticsTrackRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any>, "api", unknown>;
            getAnalyticsEvents: import("@reduxjs/toolkit/query").QueryDefinition<{
                userId?: string;
                startDate?: string;
                endDate?: string;
                eventType?: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("..").BaseApiResponse<any[]>, "api", unknown>;
        }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">;
    }, undefined, import("@reduxjs/toolkit").UnknownAction>;
}>]>>;
/**
 * Get the current persistor instance
 */
export declare const getPersistor: () => import("redux-persist/es/types").Persistor;
/**
 * Reset the entire Redux store and persistence
 */
export declare const resetReduxStore: () => Promise<void>;
export default ReduxProvider;
//# sourceMappingURL=index.d.ts.map