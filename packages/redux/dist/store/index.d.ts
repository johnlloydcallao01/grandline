/**
 * Enterprise Redux Store Configuration
 *
 * This file configures the main Redux store with RTK Query, persistence,
 * middleware, and development tools for the Encreasl monorepo.
 */
declare const persistedRootReducer: import("@reduxjs/toolkit").Reducer<{
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
}, import("@reduxjs/toolkit").UnknownAction, Partial<{
    auth: (import("..").AuthState & import("redux-persist/es/persistReducer").PersistPartial) | undefined;
    ui: (import("..").UIState & import("redux-persist/es/persistReducer").PersistPartial) | undefined;
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
    }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api"> | undefined;
}>>;
export declare const createStore: (preloadedState?: any) => import("@reduxjs/toolkit").EnhancedStore<{
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
declare const store: import("@reduxjs/toolkit").EnhancedStore<{
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
export declare const persistor: import("redux-persist").Persistor;
export type RootState = ReturnType<typeof persistedRootReducer>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
export { store };
export declare const resetStore: () => void;
export declare const getAuthState: () => import("..").AuthState & import("redux-persist/es/persistReducer").PersistPartial;
export declare const getUIState: () => import("..").UIState & import("redux-persist/es/persistReducer").PersistPartial;
export declare const isAuthenticated: () => boolean;
export declare const getCurrentUser: () => import("..").User | null;
export default store;
export * from './selectors';
//# sourceMappingURL=index.d.ts.map