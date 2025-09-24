import type { User, Notification } from '../types';
export declare const useAppDispatch: import("react-redux").UseDispatch<import("@reduxjs/toolkit").ThunkDispatch<{
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
}, undefined, import("@reduxjs/toolkit").UnknownAction> & import("@reduxjs/toolkit").Dispatch<import("@reduxjs/toolkit").UnknownAction>>;
export declare const useAppSelector: import("react-redux").UseSelector<{
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
}>;
export declare const useAppStore: import("react-redux").UseStore<import("@reduxjs/toolkit").EnhancedStore<{
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
}>]>>>;
/**
 * Hook for accessing authentication state
 */
export declare const useAuth: () => {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    loginAttempts: number;
    lastActivity: number;
    sessionExpiry: number | null;
    isSessionExpired: boolean;
    timeUntilExpiry: number | null;
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
    }, undefined, import("@reduxjs/toolkit").UnknownAction> & import("@reduxjs/toolkit").Dispatch<import("@reduxjs/toolkit").UnknownAction>;
};
/**
 * Hook for accessing current user information
 */
export declare const useCurrentUser: () => {
    fullName: string;
    initials: string;
    isAdmin: boolean;
    isInstructor: boolean;
    isStudent: boolean;
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    nameExtension?: string;
    avatar?: string;
    role: import("..").UserRole;
    permissions: import("..").Permission[];
    preferences: import("..").UserPreferences;
    profile: import("..").UserProfile;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
} | null;
/**
 * Hook for managing user preferences
 */
export declare const useUserPreferences: () => {
    preferences: {
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
    updatePreferences: (updates: Partial<User["preferences"]>) => void;
};
/**
 * Hook for checking user permissions
 */
export declare const usePermissions: () => {
    permissions: import("..").Permission[];
    role: import("..").UserRole;
    hasPermission: (resource: string, action: string) => boolean;
    hasRole: (role: User["role"]) => boolean;
    hasAnyRole: (roles: User["role"][]) => boolean;
    isAdmin: boolean;
    isInstructor: boolean;
    isStudent: boolean;
};
/**
 * Hook for accessing UI state
 */
export declare const useUI: () => {
    theme: "light" | "dark" | "system";
    sidebarOpen: boolean;
    mobileMenuOpen: boolean;
    notifications: Notification[];
    modals: import("..").ModalState;
    loading: import("..").LoadingState;
    errors: import("..").ErrorState;
    unreadNotifications: Notification[];
    unreadCount: number;
    activeModals: string[];
    isAnyModalOpen: boolean;
    isLoading: boolean;
    hasErrors: boolean;
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
    }, undefined, import("@reduxjs/toolkit").UnknownAction> & import("@reduxjs/toolkit").Dispatch<import("@reduxjs/toolkit").UnknownAction>;
};
/**
 * Hook for managing theme
 */
export declare const useTheme: () => {
    theme: "light" | "dark" | "system";
    effectiveTheme: string;
    isDark: boolean;
    isLight: boolean;
    isSystem: boolean;
    setTheme: (newTheme: "light" | "dark" | "system") => void;
    toggleTheme: () => void;
};
/**
 * Hook for managing notifications
 */
export declare const useNotifications: () => {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
    showSuccess: (message: string, title?: string) => void;
    showError: (message: string, title?: string) => void;
    showWarning: (message: string, title?: string) => void;
    showInfo: (message: string, title?: string) => void;
};
/**
 * Hook for managing modals
 */
export declare const useModal: (modalId: string) => {
    isOpen: boolean;
    data: any;
    options: import("..").ModalOptions | undefined;
    openModal: (modalData?: any, modalOptions?: any) => void;
    closeModal: () => void;
    updateData: (newData: any) => void;
};
/**
 * Hook for managing loading states
 */
export declare const useLoading: (key?: string) => {
    isLoading: boolean;
    setLoading: (loadingState: boolean) => void;
    clearLoading: () => void;
};
/**
 * Hook for managing error states
 */
export declare const useError: (key?: string) => {
    error: string | null;
    hasError: boolean;
    setError: (errorMessage: string | null) => void;
    clearError: () => void;
};
/**
 * Hook for session management
 */
export declare const useSession: () => {
    isAuthenticated: boolean;
    isSessionExpired: boolean;
    timeUntilExpiry: number | null;
    updateActivity: () => void;
};
/**
 * Hook for responsive design
 */
export declare const useResponsive: () => {
    sidebarOpen: boolean;
    mobileMenuOpen: boolean;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
};
//# sourceMappingURL=index.d.ts.map