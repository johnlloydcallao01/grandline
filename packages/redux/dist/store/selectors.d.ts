/**
 * Redux Selectors
 *
 * Centralized selectors for accessing Redux state with memoization
 * and computed values for optimal performance.
 */
import type { RootState } from './index';
export declare const selectAuth: (state: RootState) => import("..").AuthState & import("redux-persist/es/persistReducer").PersistPartial;
export declare const selectAuthUser: (state: RootState) => import("..").User | null;
export declare const selectAuthToken: (state: RootState) => string | null;
export declare const selectAuthIsAuthenticated: (state: RootState) => boolean;
export declare const selectAuthIsLoading: (state: RootState) => boolean;
export declare const selectAuthError: (state: RootState) => string | null;
export declare const selectUserFullName: ((state: {
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
}) => string | null) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("..").User | null) => string | null;
    memoizedResultFunc: ((resultFuncArgs_0: import("..").User | null) => string | null) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => string | null;
    dependencies: [(state: RootState) => import("..").User | null];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectUserInitials: ((state: {
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
}) => string) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("..").User | null) => string;
    memoizedResultFunc: ((resultFuncArgs_0: import("..").User | null) => string) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => string;
    dependencies: [(state: RootState) => import("..").User | null];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectUserPermissions: ((state: {
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
}) => import("..").Permission[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("..").User | null) => import("..").Permission[];
    memoizedResultFunc: ((resultFuncArgs_0: import("..").User | null) => import("..").Permission[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => import("..").Permission[];
    dependencies: [(state: RootState) => import("..").User | null];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectUserRole: ((state: {
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
}) => import("..").UserRole) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("..").User | null) => import("..").UserRole;
    memoizedResultFunc: ((resultFuncArgs_0: import("..").User | null) => import("..").UserRole) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => import("..").UserRole;
    dependencies: [(state: RootState) => import("..").User | null];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectIsAdmin: ((state: {
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
}) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("..").UserRole) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: import("..").UserRole) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [((state: {
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
    }) => import("..").UserRole) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("..").User | null) => import("..").UserRole;
        memoizedResultFunc: ((resultFuncArgs_0: import("..").User | null) => import("..").UserRole) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => import("..").UserRole;
        dependencies: [(state: RootState) => import("..").User | null];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
        argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectIsInstructor: ((state: {
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
}) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("..").UserRole) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: import("..").UserRole) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [((state: {
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
    }) => import("..").UserRole) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("..").User | null) => import("..").UserRole;
        memoizedResultFunc: ((resultFuncArgs_0: import("..").User | null) => import("..").UserRole) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => import("..").UserRole;
        dependencies: [(state: RootState) => import("..").User | null];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
        argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectIsStudent: ((state: {
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
}) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("..").UserRole) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: import("..").UserRole) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [((state: {
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
    }) => import("..").UserRole) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("..").User | null) => import("..").UserRole;
        memoizedResultFunc: ((resultFuncArgs_0: import("..").User | null) => import("..").UserRole) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => import("..").UserRole;
        dependencies: [(state: RootState) => import("..").User | null];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
        argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectUserPreferences: ((state: {
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
}) => {
    theme: string;
    language: string;
    timezone: string;
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
        inApp: boolean;
        marketing: boolean;
    };
    accessibility: {
        reducedMotion: boolean;
        highContrast: boolean;
        fontSize: string;
        screenReader: boolean;
    };
}) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("..").User | null) => {
        theme: string;
        language: string;
        timezone: string;
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
            inApp: boolean;
            marketing: boolean;
        };
        accessibility: {
            reducedMotion: boolean;
            highContrast: boolean;
            fontSize: string;
            screenReader: boolean;
        };
    };
    memoizedResultFunc: ((resultFuncArgs_0: import("..").User | null) => {
        theme: string;
        language: string;
        timezone: string;
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
            inApp: boolean;
            marketing: boolean;
        };
        accessibility: {
            reducedMotion: boolean;
            highContrast: boolean;
            fontSize: string;
            screenReader: boolean;
        };
    }) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => {
        theme: string;
        language: string;
        timezone: string;
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
            inApp: boolean;
            marketing: boolean;
        };
        accessibility: {
            reducedMotion: boolean;
            highContrast: boolean;
            fontSize: string;
            screenReader: boolean;
        };
    };
    dependencies: [(state: RootState) => import("..").User | null];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectSessionExpiry: ((state: {
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
}) => number | null) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("..").AuthState & import("redux-persist/es/persistReducer").PersistPartial) => number | null;
    memoizedResultFunc: ((resultFuncArgs_0: import("..").AuthState & import("redux-persist/es/persistReducer").PersistPartial) => number | null) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => number | null;
    dependencies: [(state: RootState) => import("..").AuthState & import("redux-persist/es/persistReducer").PersistPartial];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectIsSessionExpired: ((state: {
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
}) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: number | null) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: number | null) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [((state: {
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
    }) => number | null) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("..").AuthState & import("redux-persist/es/persistReducer").PersistPartial) => number | null;
        memoizedResultFunc: ((resultFuncArgs_0: import("..").AuthState & import("redux-persist/es/persistReducer").PersistPartial) => number | null) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => number | null;
        dependencies: [(state: RootState) => import("..").AuthState & import("redux-persist/es/persistReducer").PersistPartial];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
        argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectTimeUntilExpiry: ((state: {
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
}) => number | null) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: number | null) => number | null;
    memoizedResultFunc: ((resultFuncArgs_0: number | null) => number | null) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => number | null;
    dependencies: [((state: {
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
    }) => number | null) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("..").AuthState & import("redux-persist/es/persistReducer").PersistPartial) => number | null;
        memoizedResultFunc: ((resultFuncArgs_0: import("..").AuthState & import("redux-persist/es/persistReducer").PersistPartial) => number | null) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => number | null;
        dependencies: [(state: RootState) => import("..").AuthState & import("redux-persist/es/persistReducer").PersistPartial];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
        argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectUI: (state: RootState) => import("..").UIState & import("redux-persist/es/persistReducer").PersistPartial;
export declare const selectUITheme: (state: RootState) => "light" | "dark" | "system";
export declare const selectUISidebarOpen: (state: RootState) => boolean;
export declare const selectUIMobileMenuOpen: (state: RootState) => boolean;
export declare const selectUINotifications: (state: RootState) => import("..").Notification[];
export declare const selectUIModals: (state: RootState) => import("..").ModalState;
export declare const selectUILoading: (state: RootState) => import("..").LoadingState;
export declare const selectUIErrors: (state: RootState) => import("..").ErrorState;
export declare const selectUnreadNotifications: ((state: {
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
}) => import("..").Notification[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("..").Notification[]) => import("..").Notification[];
    memoizedResultFunc: ((resultFuncArgs_0: import("..").Notification[]) => import("..").Notification[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => import("..").Notification[];
    dependencies: [(state: RootState) => import("..").Notification[]];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectUnreadNotificationCount: ((state: {
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
}) => number) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("..").Notification[]) => number;
    memoizedResultFunc: ((resultFuncArgs_0: import("..").Notification[]) => number) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => number;
    dependencies: [((state: {
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
    }) => import("..").Notification[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("..").Notification[]) => import("..").Notification[];
        memoizedResultFunc: ((resultFuncArgs_0: import("..").Notification[]) => import("..").Notification[]) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => import("..").Notification[];
        dependencies: [(state: RootState) => import("..").Notification[]];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
        argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectNotificationsByType: ((state: {
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
}) => any) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("..").Notification[]) => any;
    memoizedResultFunc: ((resultFuncArgs_0: import("..").Notification[]) => any) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => any;
    dependencies: [(state: RootState) => import("..").Notification[]];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectActiveModals: ((state: {
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
}) => string[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("..").ModalState) => string[];
    memoizedResultFunc: ((resultFuncArgs_0: import("..").ModalState) => string[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => string[];
    dependencies: [(state: RootState) => import("..").ModalState];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectIsAnyModalOpen: ((state: {
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
}) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: string[]) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: string[]) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [((state: {
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
    }) => string[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("..").ModalState) => string[];
        memoizedResultFunc: ((resultFuncArgs_0: import("..").ModalState) => string[]) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => string[];
        dependencies: [(state: RootState) => import("..").ModalState];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
        argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectModalState: (modalId: string) => ((state: {
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
}) => {
    isOpen: boolean;
    data?: any;
    options?: import("..").ModalOptions;
}) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("..").ModalState) => {
        isOpen: boolean;
        data?: any;
        options?: import("..").ModalOptions;
    };
    memoizedResultFunc: ((resultFuncArgs_0: import("..").ModalState) => {
        isOpen: boolean;
        data?: any;
        options?: import("..").ModalOptions;
    }) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => {
        isOpen: boolean;
        data?: any;
        options?: import("..").ModalOptions;
    };
    dependencies: [(state: RootState) => import("..").ModalState];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectGlobalLoading: ((state: {
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
}) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("..").LoadingState) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: import("..").LoadingState) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: RootState) => import("..").LoadingState];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectLoadingState: (key: string) => ((state: {
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
}) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("..").LoadingState) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: import("..").LoadingState) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: RootState) => import("..").LoadingState];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectGlobalError: ((state: {
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
}) => string | null) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("..").ErrorState) => string | null;
    memoizedResultFunc: ((resultFuncArgs_0: import("..").ErrorState) => string | null) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => string | null;
    dependencies: [(state: RootState) => import("..").ErrorState];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectErrorState: (key: string) => ((state: {
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
}) => string | null) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("..").ErrorState) => string | null;
    memoizedResultFunc: ((resultFuncArgs_0: import("..").ErrorState) => string | null) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => string | null;
    dependencies: [(state: RootState) => import("..").ErrorState];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectIsLoading: ((state: {
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
}) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("..").LoadingState) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: import("..").LoadingState) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: RootState) => import("..").LoadingState];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectHasErrors: ((state: {
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
}) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("..").ErrorState) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: import("..").ErrorState) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: RootState) => import("..").ErrorState];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectUserTheme: ((state: {
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
}) => string) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        theme: string;
        language: string;
        timezone: string;
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
            inApp: boolean;
            marketing: boolean;
        };
        accessibility: {
            reducedMotion: boolean;
            highContrast: boolean;
            fontSize: string;
            screenReader: boolean;
        };
    }, resultFuncArgs_1: "light" | "dark" | "system") => string;
    memoizedResultFunc: ((resultFuncArgs_0: {
        theme: string;
        language: string;
        timezone: string;
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
            inApp: boolean;
            marketing: boolean;
        };
        accessibility: {
            reducedMotion: boolean;
            highContrast: boolean;
            fontSize: string;
            screenReader: boolean;
        };
    }, resultFuncArgs_1: "light" | "dark" | "system") => string) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => string;
    dependencies: [((state: {
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
    }) => {
        theme: string;
        language: string;
        timezone: string;
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
            inApp: boolean;
            marketing: boolean;
        };
        accessibility: {
            reducedMotion: boolean;
            highContrast: boolean;
            fontSize: string;
            screenReader: boolean;
        };
    }) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("..").User | null) => {
            theme: string;
            language: string;
            timezone: string;
            notifications: {
                email: boolean;
                push: boolean;
                sms: boolean;
                inApp: boolean;
                marketing: boolean;
            };
            accessibility: {
                reducedMotion: boolean;
                highContrast: boolean;
                fontSize: string;
                screenReader: boolean;
            };
        };
        memoizedResultFunc: ((resultFuncArgs_0: import("..").User | null) => {
            theme: string;
            language: string;
            timezone: string;
            notifications: {
                email: boolean;
                push: boolean;
                sms: boolean;
                inApp: boolean;
                marketing: boolean;
            };
            accessibility: {
                reducedMotion: boolean;
                highContrast: boolean;
                fontSize: string;
                screenReader: boolean;
            };
        }) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => {
            theme: string;
            language: string;
            timezone: string;
            notifications: {
                email: boolean;
                push: boolean;
                sms: boolean;
                inApp: boolean;
                marketing: boolean;
            };
            accessibility: {
                reducedMotion: boolean;
                highContrast: boolean;
                fontSize: string;
                screenReader: boolean;
            };
        };
        dependencies: [(state: RootState) => import("..").User | null];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
        argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    }, (state: RootState) => "light" | "dark" | "system"];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectEffectiveTheme: ((state: {
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
}) => string) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: string) => string;
    memoizedResultFunc: ((resultFuncArgs_0: string) => string) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => string;
    dependencies: [((state: {
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
    }) => string) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: {
            theme: string;
            language: string;
            timezone: string;
            notifications: {
                email: boolean;
                push: boolean;
                sms: boolean;
                inApp: boolean;
                marketing: boolean;
            };
            accessibility: {
                reducedMotion: boolean;
                highContrast: boolean;
                fontSize: string;
                screenReader: boolean;
            };
        }, resultFuncArgs_1: "light" | "dark" | "system") => string;
        memoizedResultFunc: ((resultFuncArgs_0: {
            theme: string;
            language: string;
            timezone: string;
            notifications: {
                email: boolean;
                push: boolean;
                sms: boolean;
                inApp: boolean;
                marketing: boolean;
            };
            accessibility: {
                reducedMotion: boolean;
                highContrast: boolean;
                fontSize: string;
                screenReader: boolean;
            };
        }, resultFuncArgs_1: "light" | "dark" | "system") => string) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => string;
        dependencies: [((state: {
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
        }) => {
            theme: string;
            language: string;
            timezone: string;
            notifications: {
                email: boolean;
                push: boolean;
                sms: boolean;
                inApp: boolean;
                marketing: boolean;
            };
            accessibility: {
                reducedMotion: boolean;
                highContrast: boolean;
                fontSize: string;
                screenReader: boolean;
            };
        }) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        } & {
            resultFunc: (resultFuncArgs_0: import("..").User | null) => {
                theme: string;
                language: string;
                timezone: string;
                notifications: {
                    email: boolean;
                    push: boolean;
                    sms: boolean;
                    inApp: boolean;
                    marketing: boolean;
                };
                accessibility: {
                    reducedMotion: boolean;
                    highContrast: boolean;
                    fontSize: string;
                    screenReader: boolean;
                };
            };
            memoizedResultFunc: ((resultFuncArgs_0: import("..").User | null) => {
                theme: string;
                language: string;
                timezone: string;
                notifications: {
                    email: boolean;
                    push: boolean;
                    sms: boolean;
                    inApp: boolean;
                    marketing: boolean;
                };
                accessibility: {
                    reducedMotion: boolean;
                    highContrast: boolean;
                    fontSize: string;
                    screenReader: boolean;
                };
            }) & {
                clearCache: () => void;
                resultsCount: () => number;
                resetResultsCount: () => void;
            };
            lastResult: () => {
                theme: string;
                language: string;
                timezone: string;
                notifications: {
                    email: boolean;
                    push: boolean;
                    sms: boolean;
                    inApp: boolean;
                    marketing: boolean;
                };
                accessibility: {
                    reducedMotion: boolean;
                    highContrast: boolean;
                    fontSize: string;
                    screenReader: boolean;
                };
            };
            dependencies: [(state: RootState) => import("..").User | null];
            recomputations: () => number;
            resetRecomputations: () => void;
            dependencyRecomputations: () => number;
            resetDependencyRecomputations: () => void;
        } & {
            memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
            argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
        }, (state: RootState) => "light" | "dark" | "system"];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
        argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectUserNotificationPreferences: ((state: {
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
}) => {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
    marketing: boolean;
}) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        theme: string;
        language: string;
        timezone: string;
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
            inApp: boolean;
            marketing: boolean;
        };
        accessibility: {
            reducedMotion: boolean;
            highContrast: boolean;
            fontSize: string;
            screenReader: boolean;
        };
    }) => {
        email: boolean;
        push: boolean;
        sms: boolean;
        inApp: boolean;
        marketing: boolean;
    };
    memoizedResultFunc: ((resultFuncArgs_0: {
        theme: string;
        language: string;
        timezone: string;
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
            inApp: boolean;
            marketing: boolean;
        };
        accessibility: {
            reducedMotion: boolean;
            highContrast: boolean;
            fontSize: string;
            screenReader: boolean;
        };
    }) => {
        email: boolean;
        push: boolean;
        sms: boolean;
        inApp: boolean;
        marketing: boolean;
    }) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => {
        email: boolean;
        push: boolean;
        sms: boolean;
        inApp: boolean;
        marketing: boolean;
    };
    dependencies: [((state: {
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
    }) => {
        theme: string;
        language: string;
        timezone: string;
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
            inApp: boolean;
            marketing: boolean;
        };
        accessibility: {
            reducedMotion: boolean;
            highContrast: boolean;
            fontSize: string;
            screenReader: boolean;
        };
    }) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("..").User | null) => {
            theme: string;
            language: string;
            timezone: string;
            notifications: {
                email: boolean;
                push: boolean;
                sms: boolean;
                inApp: boolean;
                marketing: boolean;
            };
            accessibility: {
                reducedMotion: boolean;
                highContrast: boolean;
                fontSize: string;
                screenReader: boolean;
            };
        };
        memoizedResultFunc: ((resultFuncArgs_0: import("..").User | null) => {
            theme: string;
            language: string;
            timezone: string;
            notifications: {
                email: boolean;
                push: boolean;
                sms: boolean;
                inApp: boolean;
                marketing: boolean;
            };
            accessibility: {
                reducedMotion: boolean;
                highContrast: boolean;
                fontSize: string;
                screenReader: boolean;
            };
        }) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => {
            theme: string;
            language: string;
            timezone: string;
            notifications: {
                email: boolean;
                push: boolean;
                sms: boolean;
                inApp: boolean;
                marketing: boolean;
            };
            accessibility: {
                reducedMotion: boolean;
                highContrast: boolean;
                fontSize: string;
                screenReader: boolean;
            };
        };
        dependencies: [(state: RootState) => import("..").User | null];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
        argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectUserAccessibilityPreferences: ((state: {
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
}) => {
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: string;
    screenReader: boolean;
}) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        theme: string;
        language: string;
        timezone: string;
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
            inApp: boolean;
            marketing: boolean;
        };
        accessibility: {
            reducedMotion: boolean;
            highContrast: boolean;
            fontSize: string;
            screenReader: boolean;
        };
    }) => {
        reducedMotion: boolean;
        highContrast: boolean;
        fontSize: string;
        screenReader: boolean;
    };
    memoizedResultFunc: ((resultFuncArgs_0: {
        theme: string;
        language: string;
        timezone: string;
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
            inApp: boolean;
            marketing: boolean;
        };
        accessibility: {
            reducedMotion: boolean;
            highContrast: boolean;
            fontSize: string;
            screenReader: boolean;
        };
    }) => {
        reducedMotion: boolean;
        highContrast: boolean;
        fontSize: string;
        screenReader: boolean;
    }) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => {
        reducedMotion: boolean;
        highContrast: boolean;
        fontSize: string;
        screenReader: boolean;
    };
    dependencies: [((state: {
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
    }) => {
        theme: string;
        language: string;
        timezone: string;
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
            inApp: boolean;
            marketing: boolean;
        };
        accessibility: {
            reducedMotion: boolean;
            highContrast: boolean;
            fontSize: string;
            screenReader: boolean;
        };
    }) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("..").User | null) => {
            theme: string;
            language: string;
            timezone: string;
            notifications: {
                email: boolean;
                push: boolean;
                sms: boolean;
                inApp: boolean;
                marketing: boolean;
            };
            accessibility: {
                reducedMotion: boolean;
                highContrast: boolean;
                fontSize: string;
                screenReader: boolean;
            };
        };
        memoizedResultFunc: ((resultFuncArgs_0: import("..").User | null) => {
            theme: string;
            language: string;
            timezone: string;
            notifications: {
                email: boolean;
                push: boolean;
                sms: boolean;
                inApp: boolean;
                marketing: boolean;
            };
            accessibility: {
                reducedMotion: boolean;
                highContrast: boolean;
                fontSize: string;
                screenReader: boolean;
            };
        }) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => {
            theme: string;
            language: string;
            timezone: string;
            notifications: {
                email: boolean;
                push: boolean;
                sms: boolean;
                inApp: boolean;
                marketing: boolean;
            };
            accessibility: {
                reducedMotion: boolean;
                highContrast: boolean;
                fontSize: string;
                screenReader: boolean;
            };
        };
        dependencies: [(state: RootState) => import("..").User | null];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
        argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectShouldShowNotification: (type: "email" | "push" | "sms" | "inApp") => ((state: {
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
}) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        email: boolean;
        push: boolean;
        sms: boolean;
        inApp: boolean;
        marketing: boolean;
    }) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: {
        email: boolean;
        push: boolean;
        sms: boolean;
        inApp: boolean;
        marketing: boolean;
    }) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [((state: {
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
    }) => {
        email: boolean;
        push: boolean;
        sms: boolean;
        inApp: boolean;
        marketing: boolean;
    }) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: {
            theme: string;
            language: string;
            timezone: string;
            notifications: {
                email: boolean;
                push: boolean;
                sms: boolean;
                inApp: boolean;
                marketing: boolean;
            };
            accessibility: {
                reducedMotion: boolean;
                highContrast: boolean;
                fontSize: string;
                screenReader: boolean;
            };
        }) => {
            email: boolean;
            push: boolean;
            sms: boolean;
            inApp: boolean;
            marketing: boolean;
        };
        memoizedResultFunc: ((resultFuncArgs_0: {
            theme: string;
            language: string;
            timezone: string;
            notifications: {
                email: boolean;
                push: boolean;
                sms: boolean;
                inApp: boolean;
                marketing: boolean;
            };
            accessibility: {
                reducedMotion: boolean;
                highContrast: boolean;
                fontSize: string;
                screenReader: boolean;
            };
        }) => {
            email: boolean;
            push: boolean;
            sms: boolean;
            inApp: boolean;
            marketing: boolean;
        }) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => {
            email: boolean;
            push: boolean;
            sms: boolean;
            inApp: boolean;
            marketing: boolean;
        };
        dependencies: [((state: {
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
        }) => {
            theme: string;
            language: string;
            timezone: string;
            notifications: {
                email: boolean;
                push: boolean;
                sms: boolean;
                inApp: boolean;
                marketing: boolean;
            };
            accessibility: {
                reducedMotion: boolean;
                highContrast: boolean;
                fontSize: string;
                screenReader: boolean;
            };
        }) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        } & {
            resultFunc: (resultFuncArgs_0: import("..").User | null) => {
                theme: string;
                language: string;
                timezone: string;
                notifications: {
                    email: boolean;
                    push: boolean;
                    sms: boolean;
                    inApp: boolean;
                    marketing: boolean;
                };
                accessibility: {
                    reducedMotion: boolean;
                    highContrast: boolean;
                    fontSize: string;
                    screenReader: boolean;
                };
            };
            memoizedResultFunc: ((resultFuncArgs_0: import("..").User | null) => {
                theme: string;
                language: string;
                timezone: string;
                notifications: {
                    email: boolean;
                    push: boolean;
                    sms: boolean;
                    inApp: boolean;
                    marketing: boolean;
                };
                accessibility: {
                    reducedMotion: boolean;
                    highContrast: boolean;
                    fontSize: string;
                    screenReader: boolean;
                };
            }) & {
                clearCache: () => void;
                resultsCount: () => number;
                resetResultsCount: () => void;
            };
            lastResult: () => {
                theme: string;
                language: string;
                timezone: string;
                notifications: {
                    email: boolean;
                    push: boolean;
                    sms: boolean;
                    inApp: boolean;
                    marketing: boolean;
                };
                accessibility: {
                    reducedMotion: boolean;
                    highContrast: boolean;
                    fontSize: string;
                    screenReader: boolean;
                };
            };
            dependencies: [(state: RootState) => import("..").User | null];
            recomputations: () => number;
            resetRecomputations: () => void;
            dependencyRecomputations: () => number;
            resetDependencyRecomputations: () => void;
        } & {
            memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
            argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
        }];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
        argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectApiState: (state: RootState) => import("@reduxjs/toolkit/query").CombinedState<{
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
export declare const selectApiQueries: ((state: {
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
}) => {
    [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
}) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("@reduxjs/toolkit/query").CombinedState<{
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
    }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">) => {
        [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
    };
    memoizedResultFunc: ((resultFuncArgs_0: import("@reduxjs/toolkit/query").CombinedState<{
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
    }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">) => {
        [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
    }) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => {
        [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
    };
    dependencies: [(state: RootState) => import("@reduxjs/toolkit/query").CombinedState<{
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
    }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectApiMutations: ((state: {
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
}) => {
    [requestId: string]: ({
        requestId?: undefined;
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        data?: undefined;
        error?: undefined;
        endpointName?: string;
        startedTimeStamp?: undefined;
        fulfilledTimeStamp?: undefined;
    } | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    } & Omit<{
        requestId: string;
        data?: unknown;
        error?: import("@reduxjs/toolkit").SerializedError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp"> & Required<Pick<{
        requestId: string;
        data?: unknown;
        error?: import("@reduxjs/toolkit").SerializedError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp">> & {
        error: undefined;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    } & {
        requestId: string;
        data?: unknown;
        error?: import("@reduxjs/toolkit").SerializedError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    } & {
        data?: undefined;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    } & Omit<{
        requestId: string;
        data?: unknown;
        error?: import("@reduxjs/toolkit").SerializedError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error"> & Required<Pick<{
        requestId: string;
        data?: unknown;
        error?: import("@reduxjs/toolkit").SerializedError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error">>)) | undefined;
}) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("@reduxjs/toolkit/query").CombinedState<{
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
    }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">) => {
        [requestId: string]: ({
            requestId?: undefined;
            status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
            data?: undefined;
            error?: undefined;
            endpointName?: string;
            startedTimeStamp?: undefined;
            fulfilledTimeStamp?: undefined;
        } | ({
            status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
        } & Omit<{
            requestId: string;
            data?: unknown;
            error?: import("@reduxjs/toolkit").SerializedError | undefined;
            endpointName: string;
            startedTimeStamp: number;
            fulfilledTimeStamp?: number;
        }, "data" | "fulfilledTimeStamp"> & Required<Pick<{
            requestId: string;
            data?: unknown;
            error?: import("@reduxjs/toolkit").SerializedError | undefined;
            endpointName: string;
            startedTimeStamp: number;
            fulfilledTimeStamp?: number;
        }, "data" | "fulfilledTimeStamp">> & {
            error: undefined;
        }) | ({
            status: import("@reduxjs/toolkit/query").QueryStatus.pending;
        } & {
            requestId: string;
            data?: unknown;
            error?: import("@reduxjs/toolkit").SerializedError | undefined;
            endpointName: string;
            startedTimeStamp: number;
            fulfilledTimeStamp?: number;
        } & {
            data?: undefined;
        }) | ({
            status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
        } & Omit<{
            requestId: string;
            data?: unknown;
            error?: import("@reduxjs/toolkit").SerializedError | undefined;
            endpointName: string;
            startedTimeStamp: number;
            fulfilledTimeStamp?: number;
        }, "error"> & Required<Pick<{
            requestId: string;
            data?: unknown;
            error?: import("@reduxjs/toolkit").SerializedError | undefined;
            endpointName: string;
            startedTimeStamp: number;
            fulfilledTimeStamp?: number;
        }, "error">>)) | undefined;
    };
    memoizedResultFunc: ((resultFuncArgs_0: import("@reduxjs/toolkit/query").CombinedState<{
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
    }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">) => {
        [requestId: string]: ({
            requestId?: undefined;
            status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
            data?: undefined;
            error?: undefined;
            endpointName?: string;
            startedTimeStamp?: undefined;
            fulfilledTimeStamp?: undefined;
        } | ({
            status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
        } & Omit<{
            requestId: string;
            data?: unknown;
            error?: import("@reduxjs/toolkit").SerializedError | undefined;
            endpointName: string;
            startedTimeStamp: number;
            fulfilledTimeStamp?: number;
        }, "data" | "fulfilledTimeStamp"> & Required<Pick<{
            requestId: string;
            data?: unknown;
            error?: import("@reduxjs/toolkit").SerializedError | undefined;
            endpointName: string;
            startedTimeStamp: number;
            fulfilledTimeStamp?: number;
        }, "data" | "fulfilledTimeStamp">> & {
            error: undefined;
        }) | ({
            status: import("@reduxjs/toolkit/query").QueryStatus.pending;
        } & {
            requestId: string;
            data?: unknown;
            error?: import("@reduxjs/toolkit").SerializedError | undefined;
            endpointName: string;
            startedTimeStamp: number;
            fulfilledTimeStamp?: number;
        } & {
            data?: undefined;
        }) | ({
            status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
        } & Omit<{
            requestId: string;
            data?: unknown;
            error?: import("@reduxjs/toolkit").SerializedError | undefined;
            endpointName: string;
            startedTimeStamp: number;
            fulfilledTimeStamp?: number;
        }, "error"> & Required<Pick<{
            requestId: string;
            data?: unknown;
            error?: import("@reduxjs/toolkit").SerializedError | undefined;
            endpointName: string;
            startedTimeStamp: number;
            fulfilledTimeStamp?: number;
        }, "error">>)) | undefined;
    }) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => {
        [requestId: string]: ({
            requestId?: undefined;
            status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
            data?: undefined;
            error?: undefined;
            endpointName?: string;
            startedTimeStamp?: undefined;
            fulfilledTimeStamp?: undefined;
        } | ({
            status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
        } & Omit<{
            requestId: string;
            data?: unknown;
            error?: import("@reduxjs/toolkit").SerializedError | undefined;
            endpointName: string;
            startedTimeStamp: number;
            fulfilledTimeStamp?: number;
        }, "data" | "fulfilledTimeStamp"> & Required<Pick<{
            requestId: string;
            data?: unknown;
            error?: import("@reduxjs/toolkit").SerializedError | undefined;
            endpointName: string;
            startedTimeStamp: number;
            fulfilledTimeStamp?: number;
        }, "data" | "fulfilledTimeStamp">> & {
            error: undefined;
        }) | ({
            status: import("@reduxjs/toolkit/query").QueryStatus.pending;
        } & {
            requestId: string;
            data?: unknown;
            error?: import("@reduxjs/toolkit").SerializedError | undefined;
            endpointName: string;
            startedTimeStamp: number;
            fulfilledTimeStamp?: number;
        } & {
            data?: undefined;
        }) | ({
            status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
        } & Omit<{
            requestId: string;
            data?: unknown;
            error?: import("@reduxjs/toolkit").SerializedError | undefined;
            endpointName: string;
            startedTimeStamp: number;
            fulfilledTimeStamp?: number;
        }, "error"> & Required<Pick<{
            requestId: string;
            data?: unknown;
            error?: import("@reduxjs/toolkit").SerializedError | undefined;
            endpointName: string;
            startedTimeStamp: number;
            fulfilledTimeStamp?: number;
        }, "error">>)) | undefined;
    };
    dependencies: [(state: RootState) => import("@reduxjs/toolkit/query").CombinedState<{
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
    }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectApiSubscriptions: ((state: {
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
}) => {
    [queryCacheKey: string]: {
        [requestId: string]: import("@reduxjs/toolkit/query").SubscriptionOptions;
    } | undefined;
}) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("@reduxjs/toolkit/query").CombinedState<{
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
    }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">) => {
        [queryCacheKey: string]: {
            [requestId: string]: import("@reduxjs/toolkit/query").SubscriptionOptions;
        } | undefined;
    };
    memoizedResultFunc: ((resultFuncArgs_0: import("@reduxjs/toolkit/query").CombinedState<{
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
    }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">) => {
        [queryCacheKey: string]: {
            [requestId: string]: import("@reduxjs/toolkit/query").SubscriptionOptions;
        } | undefined;
    }) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => {
        [queryCacheKey: string]: {
            [requestId: string]: import("@reduxjs/toolkit/query").SubscriptionOptions;
        } | undefined;
    };
    dependencies: [(state: RootState) => import("@reduxjs/toolkit/query").CombinedState<{
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
    }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectPendingQueries: ((state: {
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
}) => number) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
    }) => number;
    memoizedResultFunc: ((resultFuncArgs_0: {
        [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
    }) => number) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => number;
    dependencies: [((state: {
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
    }) => {
        [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
    }) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("@reduxjs/toolkit/query").CombinedState<{
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
        }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">) => {
            [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
        };
        memoizedResultFunc: ((resultFuncArgs_0: import("@reduxjs/toolkit/query").CombinedState<{
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
        }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">) => {
            [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
        }) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => {
            [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
        };
        dependencies: [(state: RootState) => import("@reduxjs/toolkit/query").CombinedState<{
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
        }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
        argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectFailedQueries: ((state: {
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
}) => number) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
    }) => number;
    memoizedResultFunc: ((resultFuncArgs_0: {
        [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
    }) => number) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => number;
    dependencies: [((state: {
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
    }) => {
        [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
    }) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("@reduxjs/toolkit/query").CombinedState<{
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
        }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">) => {
            [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
        };
        memoizedResultFunc: ((resultFuncArgs_0: import("@reduxjs/toolkit/query").CombinedState<{
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
        }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">) => {
            [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
        }) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => {
            [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
        };
        dependencies: [(state: RootState) => import("@reduxjs/toolkit/query").CombinedState<{
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
        }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
        argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const selectCachedQueries: ((state: {
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
}) => number) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
    }) => number;
    memoizedResultFunc: ((resultFuncArgs_0: {
        [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
    }) => number) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => number;
    dependencies: [((state: {
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
    }) => {
        [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
    }) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("@reduxjs/toolkit/query").CombinedState<{
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
        }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">) => {
            [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
        };
        memoizedResultFunc: ((resultFuncArgs_0: import("@reduxjs/toolkit/query").CombinedState<{
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
        }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">) => {
            [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
        }) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => {
            [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
        };
        dependencies: [(state: RootState) => import("@reduxjs/toolkit/query").CombinedState<{
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
        }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
        argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
    argsMemoize: typeof import("@reduxjs/toolkit").weakMapMemoize;
};
export declare const createDynamicSelector: <T, R>(selector: (state: RootState, props: T) => R) => (props: T) => any;
export declare const selectUserById: (props: string) => any;
//# sourceMappingURL=selectors.d.ts.map