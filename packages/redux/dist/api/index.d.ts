/**
 * RTK Query API Configuration
 *
 * Centralized API configuration using RTK Query for efficient data fetching,
 * caching, and synchronization across the Encreasl platform.
 */
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { BaseApiResponse, LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse, GetUserRequest, UpdateUserRequest, UpdateUserPreferencesRequest, FileUploadRequest, FileUploadResponse, SearchRequest, SearchResponse, AnalyticsTrackRequest, GetNotificationsRequest, MarkNotificationReadRequest, NotificationRequest } from '../types/api';
export declare const api: import("@reduxjs/toolkit/query").Api<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, {
    login: import("@reduxjs/toolkit/query").MutationDefinition<LoginRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", LoginResponse, "api", unknown>;
    register: import("@reduxjs/toolkit/query").MutationDefinition<any, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", LoginResponse, "api", unknown>;
    logout: import("@reduxjs/toolkit/query").MutationDefinition<{
        refreshToken?: string;
    }, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", void, "api", unknown>;
    refreshToken: import("@reduxjs/toolkit/query").MutationDefinition<RefreshTokenRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", RefreshTokenResponse, "api", unknown>;
    forgotPassword: import("@reduxjs/toolkit/query").MutationDefinition<{
        email: string;
    }, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>;
    resetPassword: import("@reduxjs/toolkit/query").MutationDefinition<{
        token: string;
        password: string;
    }, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>;
    getCurrentUser: import("@reduxjs/toolkit/query").QueryDefinition<void, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>;
    getUserById: import("@reduxjs/toolkit/query").QueryDefinition<GetUserRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>;
    updateUser: import("@reduxjs/toolkit/query").MutationDefinition<UpdateUserRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>;
    updateUserPreferences: import("@reduxjs/toolkit/query").MutationDefinition<UpdateUserPreferencesRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>;
    uploadAvatar: import("@reduxjs/toolkit/query").MutationDefinition<{
        userId: string;
        file: File;
    }, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", FileUploadResponse, "api", unknown>;
    uploadFile: import("@reduxjs/toolkit/query").MutationDefinition<FileUploadRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", FileUploadResponse, "api", unknown>;
    deleteFile: import("@reduxjs/toolkit/query").MutationDefinition<{
        fileId: string;
    }, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>;
    search: import("@reduxjs/toolkit/query").QueryDefinition<SearchRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", SearchResponse, "api", unknown>;
    getSearchSuggestions: import("@reduxjs/toolkit/query").QueryDefinition<{
        query: string;
    }, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<string[]>, "api", unknown>;
    getNotifications: import("@reduxjs/toolkit/query").QueryDefinition<GetNotificationsRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any[]>, "api", unknown>;
    markNotificationRead: import("@reduxjs/toolkit/query").MutationDefinition<MarkNotificationReadRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>;
    markAllNotificationsRead: import("@reduxjs/toolkit/query").MutationDefinition<{
        userId: string;
    }, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>;
    sendNotification: import("@reduxjs/toolkit/query").MutationDefinition<NotificationRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>;
    trackEvents: import("@reduxjs/toolkit/query").MutationDefinition<AnalyticsTrackRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>;
    getAnalyticsEvents: import("@reduxjs/toolkit/query").QueryDefinition<{
        userId?: string;
        startDate?: string;
        endDate?: string;
        eventType?: string;
    }, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any[]>, "api", unknown>;
}, "api", "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", typeof import("@reduxjs/toolkit/query").coreModuleName | typeof import("@reduxjs/toolkit/query/react").reactHooksModuleName>;
export declare const useLoginMutation: <R extends Record<string, any> = ({
    requestId?: undefined;
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    data?: undefined;
    error?: undefined;
    endpointName?: string;
    startedTimeStamp?: undefined;
    fulfilledTimeStamp?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    isUninitialized: true;
    isLoading: false;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
} & Omit<{
    requestId: string;
    data?: LoginResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp"> & Required<Pick<{
    requestId: string;
    data?: LoginResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp">> & {
    error: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    isUninitialized: false;
    isLoading: false;
    isSuccess: true;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
} & {
    requestId: string;
    data?: LoginResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
} & {
    data?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    isUninitialized: false;
    isLoading: true;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
} & Omit<{
    requestId: string;
    data?: LoginResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error"> & Required<Pick<{
    requestId: string;
    data?: LoginResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error">> & {
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    isUninitialized: false;
    isLoading: false;
    isSuccess: false;
    isError: true;
})>(options?: {
    selectFromResult?: ((state: ({
        requestId?: undefined;
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        data?: undefined;
        error?: undefined;
        endpointName?: string;
        startedTimeStamp?: undefined;
        fulfilledTimeStamp?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        isUninitialized: true;
        isLoading: false;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    } & Omit<{
        requestId: string;
        data?: LoginResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp"> & Required<Pick<{
        requestId: string;
        data?: LoginResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp">> & {
        error: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
        isUninitialized: false;
        isLoading: false;
        isSuccess: true;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    } & {
        requestId: string;
        data?: LoginResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    } & {
        data?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
        isUninitialized: false;
        isLoading: true;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    } & Omit<{
        requestId: string;
        data?: LoginResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error"> & Required<Pick<{
        requestId: string;
        data?: LoginResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error">> & {
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
        isUninitialized: false;
        isLoading: false;
        isSuccess: false;
        isError: true;
    })) => R) | undefined;
    fixedCacheKey?: string;
} | undefined) => readonly [(arg: LoginRequest) => import("@reduxjs/toolkit/query").MutationActionCreatorResult<import("@reduxjs/toolkit/query").MutationDefinition<LoginRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", LoginResponse, "api", unknown>>, import("@reduxjs/toolkit/query").TSHelpersNoInfer<R> & {
    originalArgs?: LoginRequest | undefined;
    reset: () => void;
}], useRegisterMutation: <R extends Record<string, any> = ({
    requestId?: undefined;
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    data?: undefined;
    error?: undefined;
    endpointName?: string;
    startedTimeStamp?: undefined;
    fulfilledTimeStamp?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    isUninitialized: true;
    isLoading: false;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
} & Omit<{
    requestId: string;
    data?: LoginResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp"> & Required<Pick<{
    requestId: string;
    data?: LoginResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp">> & {
    error: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    isUninitialized: false;
    isLoading: false;
    isSuccess: true;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
} & {
    requestId: string;
    data?: LoginResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
} & {
    data?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    isUninitialized: false;
    isLoading: true;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
} & Omit<{
    requestId: string;
    data?: LoginResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error"> & Required<Pick<{
    requestId: string;
    data?: LoginResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error">> & {
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    isUninitialized: false;
    isLoading: false;
    isSuccess: false;
    isError: true;
})>(options?: {
    selectFromResult?: ((state: ({
        requestId?: undefined;
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        data?: undefined;
        error?: undefined;
        endpointName?: string;
        startedTimeStamp?: undefined;
        fulfilledTimeStamp?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        isUninitialized: true;
        isLoading: false;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    } & Omit<{
        requestId: string;
        data?: LoginResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp"> & Required<Pick<{
        requestId: string;
        data?: LoginResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp">> & {
        error: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
        isUninitialized: false;
        isLoading: false;
        isSuccess: true;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    } & {
        requestId: string;
        data?: LoginResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    } & {
        data?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
        isUninitialized: false;
        isLoading: true;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    } & Omit<{
        requestId: string;
        data?: LoginResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error"> & Required<Pick<{
        requestId: string;
        data?: LoginResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error">> & {
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
        isUninitialized: false;
        isLoading: false;
        isSuccess: false;
        isError: true;
    })) => R) | undefined;
    fixedCacheKey?: string;
} | undefined) => readonly [(arg: any) => import("@reduxjs/toolkit/query").MutationActionCreatorResult<import("@reduxjs/toolkit/query").MutationDefinition<any, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", LoginResponse, "api", unknown>>, import("@reduxjs/toolkit/query").TSHelpersNoInfer<R> & {
    originalArgs?: any;
    reset: () => void;
}], useLogoutMutation: <R extends Record<string, any> = ({
    requestId?: undefined;
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    data?: undefined;
    error?: undefined;
    endpointName?: string;
    startedTimeStamp?: undefined;
    fulfilledTimeStamp?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    isUninitialized: true;
    isLoading: false;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
} & Omit<{
    requestId: string;
    data?: void | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp"> & Required<Pick<{
    requestId: string;
    data?: void | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp">> & {
    error: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    isUninitialized: false;
    isLoading: false;
    isSuccess: true;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
} & {
    requestId: string;
    data?: void | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
} & {
    data?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    isUninitialized: false;
    isLoading: true;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
} & Omit<{
    requestId: string;
    data?: void | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error"> & Required<Pick<{
    requestId: string;
    data?: void | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error">> & {
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    isUninitialized: false;
    isLoading: false;
    isSuccess: false;
    isError: true;
})>(options?: {
    selectFromResult?: ((state: ({
        requestId?: undefined;
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        data?: undefined;
        error?: undefined;
        endpointName?: string;
        startedTimeStamp?: undefined;
        fulfilledTimeStamp?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        isUninitialized: true;
        isLoading: false;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    } & Omit<{
        requestId: string;
        data?: void | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp"> & Required<Pick<{
        requestId: string;
        data?: void | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp">> & {
        error: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
        isUninitialized: false;
        isLoading: false;
        isSuccess: true;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    } & {
        requestId: string;
        data?: void | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    } & {
        data?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
        isUninitialized: false;
        isLoading: true;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    } & Omit<{
        requestId: string;
        data?: void | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error"> & Required<Pick<{
        requestId: string;
        data?: void | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error">> & {
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
        isUninitialized: false;
        isLoading: false;
        isSuccess: false;
        isError: true;
    })) => R) | undefined;
    fixedCacheKey?: string;
} | undefined) => readonly [(arg: {
    refreshToken?: string;
}) => import("@reduxjs/toolkit/query").MutationActionCreatorResult<import("@reduxjs/toolkit/query").MutationDefinition<{
    refreshToken?: string;
}, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", void, "api", unknown>>, import("@reduxjs/toolkit/query").TSHelpersNoInfer<R> & {
    originalArgs?: {
        refreshToken?: string;
    } | undefined;
    reset: () => void;
}], useRefreshTokenMutation: <R extends Record<string, any> = ({
    requestId?: undefined;
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    data?: undefined;
    error?: undefined;
    endpointName?: string;
    startedTimeStamp?: undefined;
    fulfilledTimeStamp?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    isUninitialized: true;
    isLoading: false;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
} & Omit<{
    requestId: string;
    data?: RefreshTokenResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp"> & Required<Pick<{
    requestId: string;
    data?: RefreshTokenResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp">> & {
    error: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    isUninitialized: false;
    isLoading: false;
    isSuccess: true;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
} & {
    requestId: string;
    data?: RefreshTokenResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
} & {
    data?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    isUninitialized: false;
    isLoading: true;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
} & Omit<{
    requestId: string;
    data?: RefreshTokenResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error"> & Required<Pick<{
    requestId: string;
    data?: RefreshTokenResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error">> & {
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    isUninitialized: false;
    isLoading: false;
    isSuccess: false;
    isError: true;
})>(options?: {
    selectFromResult?: ((state: ({
        requestId?: undefined;
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        data?: undefined;
        error?: undefined;
        endpointName?: string;
        startedTimeStamp?: undefined;
        fulfilledTimeStamp?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        isUninitialized: true;
        isLoading: false;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    } & Omit<{
        requestId: string;
        data?: RefreshTokenResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp"> & Required<Pick<{
        requestId: string;
        data?: RefreshTokenResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp">> & {
        error: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
        isUninitialized: false;
        isLoading: false;
        isSuccess: true;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    } & {
        requestId: string;
        data?: RefreshTokenResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    } & {
        data?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
        isUninitialized: false;
        isLoading: true;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    } & Omit<{
        requestId: string;
        data?: RefreshTokenResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error"> & Required<Pick<{
        requestId: string;
        data?: RefreshTokenResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error">> & {
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
        isUninitialized: false;
        isLoading: false;
        isSuccess: false;
        isError: true;
    })) => R) | undefined;
    fixedCacheKey?: string;
} | undefined) => readonly [(arg: RefreshTokenRequest) => import("@reduxjs/toolkit/query").MutationActionCreatorResult<import("@reduxjs/toolkit/query").MutationDefinition<RefreshTokenRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", RefreshTokenResponse, "api", unknown>>, import("@reduxjs/toolkit/query").TSHelpersNoInfer<R> & {
    originalArgs?: RefreshTokenRequest | undefined;
    reset: () => void;
}], useForgotPasswordMutation: <R extends Record<string, any> = ({
    requestId?: undefined;
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    data?: undefined;
    error?: undefined;
    endpointName?: string;
    startedTimeStamp?: undefined;
    fulfilledTimeStamp?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    isUninitialized: true;
    isLoading: false;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
} & Omit<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp"> & Required<Pick<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp">> & {
    error: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    isUninitialized: false;
    isLoading: false;
    isSuccess: true;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
} & {
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
} & {
    data?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    isUninitialized: false;
    isLoading: true;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
} & Omit<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error"> & Required<Pick<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error">> & {
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    isUninitialized: false;
    isLoading: false;
    isSuccess: false;
    isError: true;
})>(options?: {
    selectFromResult?: ((state: ({
        requestId?: undefined;
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        data?: undefined;
        error?: undefined;
        endpointName?: string;
        startedTimeStamp?: undefined;
        fulfilledTimeStamp?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        isUninitialized: true;
        isLoading: false;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    } & Omit<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp"> & Required<Pick<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp">> & {
        error: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
        isUninitialized: false;
        isLoading: false;
        isSuccess: true;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    } & {
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    } & {
        data?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
        isUninitialized: false;
        isLoading: true;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    } & Omit<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error"> & Required<Pick<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error">> & {
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
        isUninitialized: false;
        isLoading: false;
        isSuccess: false;
        isError: true;
    })) => R) | undefined;
    fixedCacheKey?: string;
} | undefined) => readonly [(arg: {
    email: string;
}) => import("@reduxjs/toolkit/query").MutationActionCreatorResult<import("@reduxjs/toolkit/query").MutationDefinition<{
    email: string;
}, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>>, import("@reduxjs/toolkit/query").TSHelpersNoInfer<R> & {
    originalArgs?: {
        email: string;
    } | undefined;
    reset: () => void;
}], useResetPasswordMutation: <R extends Record<string, any> = ({
    requestId?: undefined;
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    data?: undefined;
    error?: undefined;
    endpointName?: string;
    startedTimeStamp?: undefined;
    fulfilledTimeStamp?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    isUninitialized: true;
    isLoading: false;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
} & Omit<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp"> & Required<Pick<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp">> & {
    error: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    isUninitialized: false;
    isLoading: false;
    isSuccess: true;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
} & {
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
} & {
    data?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    isUninitialized: false;
    isLoading: true;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
} & Omit<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error"> & Required<Pick<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error">> & {
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    isUninitialized: false;
    isLoading: false;
    isSuccess: false;
    isError: true;
})>(options?: {
    selectFromResult?: ((state: ({
        requestId?: undefined;
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        data?: undefined;
        error?: undefined;
        endpointName?: string;
        startedTimeStamp?: undefined;
        fulfilledTimeStamp?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        isUninitialized: true;
        isLoading: false;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    } & Omit<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp"> & Required<Pick<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp">> & {
        error: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
        isUninitialized: false;
        isLoading: false;
        isSuccess: true;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    } & {
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    } & {
        data?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
        isUninitialized: false;
        isLoading: true;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    } & Omit<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error"> & Required<Pick<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error">> & {
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
        isUninitialized: false;
        isLoading: false;
        isSuccess: false;
        isError: true;
    })) => R) | undefined;
    fixedCacheKey?: string;
} | undefined) => readonly [(arg: {
    token: string;
    password: string;
}) => import("@reduxjs/toolkit/query").MutationActionCreatorResult<import("@reduxjs/toolkit/query").MutationDefinition<{
    token: string;
    password: string;
}, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>>, import("@reduxjs/toolkit/query").TSHelpersNoInfer<R> & {
    originalArgs?: {
        token: string;
        password: string;
    } | undefined;
    reset: () => void;
}], useGetCurrentUserQuery: <R extends Record<string, any> = import("@reduxjs/toolkit/query").TSHelpersId<(Omit<{
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    originalArgs?: undefined | undefined;
    data?: undefined | undefined;
    error?: undefined | undefined;
    requestId?: undefined | undefined;
    endpointName?: string | undefined;
    startedTimeStamp?: undefined | undefined;
    fulfilledTimeStamp?: undefined | undefined;
} & {
    currentData?: BaseApiResponse<any> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "isUninitialized"> & {
    isUninitialized: true;
}) | import("@reduxjs/toolkit/query").TSHelpersOverride<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<void, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>> & {
    currentData?: BaseApiResponse<any> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, {
    isLoading: true;
    isFetching: boolean;
    data: undefined;
} | ({
    isSuccess: true;
    isFetching: true;
    error: undefined;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<void, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>> & {
    currentData?: BaseApiResponse<any> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "data" | "fulfilledTimeStamp">>) | ({
    isSuccess: true;
    isFetching: false;
    error: undefined;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<void, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>> & {
    currentData?: BaseApiResponse<any> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "data" | "fulfilledTimeStamp" | "currentData">>) | ({
    isError: true;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<void, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>> & {
    currentData?: BaseApiResponse<any> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "error">>)>> & {
    status: import("@reduxjs/toolkit/query").QueryStatus;
}>(arg: void | typeof import("@reduxjs/toolkit/query").skipToken, options?: (import("@reduxjs/toolkit/query").SubscriptionOptions & {
    skip?: boolean;
    refetchOnMountOrArgChange?: boolean | number;
} & {
    skip?: boolean;
    selectFromResult?: ((state: import("@reduxjs/toolkit/query").TSHelpersId<(Omit<{
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        originalArgs?: undefined | undefined;
        data?: undefined | undefined;
        error?: undefined | undefined;
        requestId?: undefined | undefined;
        endpointName?: string | undefined;
        startedTimeStamp?: undefined | undefined;
        fulfilledTimeStamp?: undefined | undefined;
    } & {
        currentData?: BaseApiResponse<any> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "isUninitialized"> & {
        isUninitialized: true;
    }) | import("@reduxjs/toolkit/query").TSHelpersOverride<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<void, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>> & {
        currentData?: BaseApiResponse<any> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, {
        isLoading: true;
        isFetching: boolean;
        data: undefined;
    } | ({
        isSuccess: true;
        isFetching: true;
        error: undefined;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<void, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>> & {
        currentData?: BaseApiResponse<any> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "data" | "fulfilledTimeStamp">>) | ({
        isSuccess: true;
        isFetching: false;
        error: undefined;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<void, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>> & {
        currentData?: BaseApiResponse<any> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "data" | "fulfilledTimeStamp" | "currentData">>) | ({
        isError: true;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<void, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>> & {
        currentData?: BaseApiResponse<any> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "error">>)>> & {
        status: import("@reduxjs/toolkit/query").QueryStatus;
    }) => R) | undefined;
}) | undefined) => [R][R extends any ? 0 : never] & {
    refetch: () => import("@reduxjs/toolkit/query").QueryActionCreatorResult<import("@reduxjs/toolkit/query").QueryDefinition<void, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>>;
}, useGetUserByIdQuery: <R extends Record<string, any> = import("@reduxjs/toolkit/query").TSHelpersId<(Omit<{
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    originalArgs?: undefined | undefined;
    data?: undefined | undefined;
    error?: undefined | undefined;
    requestId?: undefined | undefined;
    endpointName?: string | undefined;
    startedTimeStamp?: undefined | undefined;
    fulfilledTimeStamp?: undefined | undefined;
} & {
    currentData?: BaseApiResponse<any> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "isUninitialized"> & {
    isUninitialized: true;
}) | import("@reduxjs/toolkit/query").TSHelpersOverride<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<GetUserRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>> & {
    currentData?: BaseApiResponse<any> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, {
    isLoading: true;
    isFetching: boolean;
    data: undefined;
} | ({
    isSuccess: true;
    isFetching: true;
    error: undefined;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<GetUserRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>> & {
    currentData?: BaseApiResponse<any> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "data" | "fulfilledTimeStamp">>) | ({
    isSuccess: true;
    isFetching: false;
    error: undefined;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<GetUserRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>> & {
    currentData?: BaseApiResponse<any> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "data" | "fulfilledTimeStamp" | "currentData">>) | ({
    isError: true;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<GetUserRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>> & {
    currentData?: BaseApiResponse<any> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "error">>)>> & {
    status: import("@reduxjs/toolkit/query").QueryStatus;
}>(arg: GetUserRequest | typeof import("@reduxjs/toolkit/query").skipToken, options?: (import("@reduxjs/toolkit/query").SubscriptionOptions & {
    skip?: boolean;
    refetchOnMountOrArgChange?: boolean | number;
} & {
    skip?: boolean;
    selectFromResult?: ((state: import("@reduxjs/toolkit/query").TSHelpersId<(Omit<{
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        originalArgs?: undefined | undefined;
        data?: undefined | undefined;
        error?: undefined | undefined;
        requestId?: undefined | undefined;
        endpointName?: string | undefined;
        startedTimeStamp?: undefined | undefined;
        fulfilledTimeStamp?: undefined | undefined;
    } & {
        currentData?: BaseApiResponse<any> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "isUninitialized"> & {
        isUninitialized: true;
    }) | import("@reduxjs/toolkit/query").TSHelpersOverride<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<GetUserRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>> & {
        currentData?: BaseApiResponse<any> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, {
        isLoading: true;
        isFetching: boolean;
        data: undefined;
    } | ({
        isSuccess: true;
        isFetching: true;
        error: undefined;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<GetUserRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>> & {
        currentData?: BaseApiResponse<any> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "data" | "fulfilledTimeStamp">>) | ({
        isSuccess: true;
        isFetching: false;
        error: undefined;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<GetUserRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>> & {
        currentData?: BaseApiResponse<any> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "data" | "fulfilledTimeStamp" | "currentData">>) | ({
        isError: true;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<GetUserRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>> & {
        currentData?: BaseApiResponse<any> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "error">>)>> & {
        status: import("@reduxjs/toolkit/query").QueryStatus;
    }) => R) | undefined;
}) | undefined) => [R][R extends any ? 0 : never] & {
    refetch: () => import("@reduxjs/toolkit/query").QueryActionCreatorResult<import("@reduxjs/toolkit/query").QueryDefinition<GetUserRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>>;
}, useUpdateUserMutation: <R extends Record<string, any> = ({
    requestId?: undefined;
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    data?: undefined;
    error?: undefined;
    endpointName?: string;
    startedTimeStamp?: undefined;
    fulfilledTimeStamp?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    isUninitialized: true;
    isLoading: false;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
} & Omit<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp"> & Required<Pick<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp">> & {
    error: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    isUninitialized: false;
    isLoading: false;
    isSuccess: true;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
} & {
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
} & {
    data?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    isUninitialized: false;
    isLoading: true;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
} & Omit<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error"> & Required<Pick<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error">> & {
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    isUninitialized: false;
    isLoading: false;
    isSuccess: false;
    isError: true;
})>(options?: {
    selectFromResult?: ((state: ({
        requestId?: undefined;
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        data?: undefined;
        error?: undefined;
        endpointName?: string;
        startedTimeStamp?: undefined;
        fulfilledTimeStamp?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        isUninitialized: true;
        isLoading: false;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    } & Omit<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp"> & Required<Pick<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp">> & {
        error: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
        isUninitialized: false;
        isLoading: false;
        isSuccess: true;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    } & {
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    } & {
        data?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
        isUninitialized: false;
        isLoading: true;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    } & Omit<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error"> & Required<Pick<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error">> & {
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
        isUninitialized: false;
        isLoading: false;
        isSuccess: false;
        isError: true;
    })) => R) | undefined;
    fixedCacheKey?: string;
} | undefined) => readonly [(arg: UpdateUserRequest) => import("@reduxjs/toolkit/query").MutationActionCreatorResult<import("@reduxjs/toolkit/query").MutationDefinition<UpdateUserRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>>, import("@reduxjs/toolkit/query").TSHelpersNoInfer<R> & {
    originalArgs?: UpdateUserRequest | undefined;
    reset: () => void;
}], useUpdateUserPreferencesMutation: <R extends Record<string, any> = ({
    requestId?: undefined;
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    data?: undefined;
    error?: undefined;
    endpointName?: string;
    startedTimeStamp?: undefined;
    fulfilledTimeStamp?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    isUninitialized: true;
    isLoading: false;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
} & Omit<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp"> & Required<Pick<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp">> & {
    error: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    isUninitialized: false;
    isLoading: false;
    isSuccess: true;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
} & {
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
} & {
    data?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    isUninitialized: false;
    isLoading: true;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
} & Omit<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error"> & Required<Pick<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error">> & {
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    isUninitialized: false;
    isLoading: false;
    isSuccess: false;
    isError: true;
})>(options?: {
    selectFromResult?: ((state: ({
        requestId?: undefined;
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        data?: undefined;
        error?: undefined;
        endpointName?: string;
        startedTimeStamp?: undefined;
        fulfilledTimeStamp?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        isUninitialized: true;
        isLoading: false;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    } & Omit<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp"> & Required<Pick<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp">> & {
        error: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
        isUninitialized: false;
        isLoading: false;
        isSuccess: true;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    } & {
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    } & {
        data?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
        isUninitialized: false;
        isLoading: true;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    } & Omit<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error"> & Required<Pick<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error">> & {
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
        isUninitialized: false;
        isLoading: false;
        isSuccess: false;
        isError: true;
    })) => R) | undefined;
    fixedCacheKey?: string;
} | undefined) => readonly [(arg: UpdateUserPreferencesRequest) => import("@reduxjs/toolkit/query").MutationActionCreatorResult<import("@reduxjs/toolkit/query").MutationDefinition<UpdateUserPreferencesRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>>, import("@reduxjs/toolkit/query").TSHelpersNoInfer<R> & {
    originalArgs?: UpdateUserPreferencesRequest | undefined;
    reset: () => void;
}], useUploadAvatarMutation: <R extends Record<string, any> = ({
    requestId?: undefined;
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    data?: undefined;
    error?: undefined;
    endpointName?: string;
    startedTimeStamp?: undefined;
    fulfilledTimeStamp?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    isUninitialized: true;
    isLoading: false;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
} & Omit<{
    requestId: string;
    data?: FileUploadResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp"> & Required<Pick<{
    requestId: string;
    data?: FileUploadResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp">> & {
    error: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    isUninitialized: false;
    isLoading: false;
    isSuccess: true;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
} & {
    requestId: string;
    data?: FileUploadResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
} & {
    data?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    isUninitialized: false;
    isLoading: true;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
} & Omit<{
    requestId: string;
    data?: FileUploadResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error"> & Required<Pick<{
    requestId: string;
    data?: FileUploadResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error">> & {
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    isUninitialized: false;
    isLoading: false;
    isSuccess: false;
    isError: true;
})>(options?: {
    selectFromResult?: ((state: ({
        requestId?: undefined;
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        data?: undefined;
        error?: undefined;
        endpointName?: string;
        startedTimeStamp?: undefined;
        fulfilledTimeStamp?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        isUninitialized: true;
        isLoading: false;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    } & Omit<{
        requestId: string;
        data?: FileUploadResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp"> & Required<Pick<{
        requestId: string;
        data?: FileUploadResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp">> & {
        error: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
        isUninitialized: false;
        isLoading: false;
        isSuccess: true;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    } & {
        requestId: string;
        data?: FileUploadResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    } & {
        data?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
        isUninitialized: false;
        isLoading: true;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    } & Omit<{
        requestId: string;
        data?: FileUploadResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error"> & Required<Pick<{
        requestId: string;
        data?: FileUploadResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error">> & {
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
        isUninitialized: false;
        isLoading: false;
        isSuccess: false;
        isError: true;
    })) => R) | undefined;
    fixedCacheKey?: string;
} | undefined) => readonly [(arg: {
    userId: string;
    file: File;
}) => import("@reduxjs/toolkit/query").MutationActionCreatorResult<import("@reduxjs/toolkit/query").MutationDefinition<{
    userId: string;
    file: File;
}, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", FileUploadResponse, "api", unknown>>, import("@reduxjs/toolkit/query").TSHelpersNoInfer<R> & {
    originalArgs?: {
        userId: string;
        file: File;
    } | undefined;
    reset: () => void;
}], useUploadFileMutation: <R extends Record<string, any> = ({
    requestId?: undefined;
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    data?: undefined;
    error?: undefined;
    endpointName?: string;
    startedTimeStamp?: undefined;
    fulfilledTimeStamp?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    isUninitialized: true;
    isLoading: false;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
} & Omit<{
    requestId: string;
    data?: FileUploadResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp"> & Required<Pick<{
    requestId: string;
    data?: FileUploadResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp">> & {
    error: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    isUninitialized: false;
    isLoading: false;
    isSuccess: true;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
} & {
    requestId: string;
    data?: FileUploadResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
} & {
    data?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    isUninitialized: false;
    isLoading: true;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
} & Omit<{
    requestId: string;
    data?: FileUploadResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error"> & Required<Pick<{
    requestId: string;
    data?: FileUploadResponse | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error">> & {
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    isUninitialized: false;
    isLoading: false;
    isSuccess: false;
    isError: true;
})>(options?: {
    selectFromResult?: ((state: ({
        requestId?: undefined;
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        data?: undefined;
        error?: undefined;
        endpointName?: string;
        startedTimeStamp?: undefined;
        fulfilledTimeStamp?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        isUninitialized: true;
        isLoading: false;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    } & Omit<{
        requestId: string;
        data?: FileUploadResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp"> & Required<Pick<{
        requestId: string;
        data?: FileUploadResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp">> & {
        error: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
        isUninitialized: false;
        isLoading: false;
        isSuccess: true;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    } & {
        requestId: string;
        data?: FileUploadResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    } & {
        data?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
        isUninitialized: false;
        isLoading: true;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    } & Omit<{
        requestId: string;
        data?: FileUploadResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error"> & Required<Pick<{
        requestId: string;
        data?: FileUploadResponse | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error">> & {
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
        isUninitialized: false;
        isLoading: false;
        isSuccess: false;
        isError: true;
    })) => R) | undefined;
    fixedCacheKey?: string;
} | undefined) => readonly [(arg: FileUploadRequest) => import("@reduxjs/toolkit/query").MutationActionCreatorResult<import("@reduxjs/toolkit/query").MutationDefinition<FileUploadRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", FileUploadResponse, "api", unknown>>, import("@reduxjs/toolkit/query").TSHelpersNoInfer<R> & {
    originalArgs?: FileUploadRequest | undefined;
    reset: () => void;
}], useDeleteFileMutation: <R extends Record<string, any> = ({
    requestId?: undefined;
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    data?: undefined;
    error?: undefined;
    endpointName?: string;
    startedTimeStamp?: undefined;
    fulfilledTimeStamp?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    isUninitialized: true;
    isLoading: false;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
} & Omit<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp"> & Required<Pick<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp">> & {
    error: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    isUninitialized: false;
    isLoading: false;
    isSuccess: true;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
} & {
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
} & {
    data?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    isUninitialized: false;
    isLoading: true;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
} & Omit<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error"> & Required<Pick<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error">> & {
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    isUninitialized: false;
    isLoading: false;
    isSuccess: false;
    isError: true;
})>(options?: {
    selectFromResult?: ((state: ({
        requestId?: undefined;
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        data?: undefined;
        error?: undefined;
        endpointName?: string;
        startedTimeStamp?: undefined;
        fulfilledTimeStamp?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        isUninitialized: true;
        isLoading: false;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    } & Omit<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp"> & Required<Pick<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp">> & {
        error: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
        isUninitialized: false;
        isLoading: false;
        isSuccess: true;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    } & {
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    } & {
        data?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
        isUninitialized: false;
        isLoading: true;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    } & Omit<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error"> & Required<Pick<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error">> & {
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
        isUninitialized: false;
        isLoading: false;
        isSuccess: false;
        isError: true;
    })) => R) | undefined;
    fixedCacheKey?: string;
} | undefined) => readonly [(arg: {
    fileId: string;
}) => import("@reduxjs/toolkit/query").MutationActionCreatorResult<import("@reduxjs/toolkit/query").MutationDefinition<{
    fileId: string;
}, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>>, import("@reduxjs/toolkit/query").TSHelpersNoInfer<R> & {
    originalArgs?: {
        fileId: string;
    } | undefined;
    reset: () => void;
}], useSearchQuery: <R extends Record<string, any> = import("@reduxjs/toolkit/query").TSHelpersId<(Omit<{
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    originalArgs?: undefined | undefined;
    data?: undefined | undefined;
    error?: undefined | undefined;
    requestId?: undefined | undefined;
    endpointName?: string | undefined;
    startedTimeStamp?: undefined | undefined;
    fulfilledTimeStamp?: undefined | undefined;
} & {
    currentData?: SearchResponse | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "isUninitialized"> & {
    isUninitialized: true;
}) | import("@reduxjs/toolkit/query").TSHelpersOverride<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<SearchRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", SearchResponse, "api", unknown>> & {
    currentData?: SearchResponse | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, {
    isLoading: true;
    isFetching: boolean;
    data: undefined;
} | ({
    isSuccess: true;
    isFetching: true;
    error: undefined;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<SearchRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", SearchResponse, "api", unknown>> & {
    currentData?: SearchResponse | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "data" | "fulfilledTimeStamp">>) | ({
    isSuccess: true;
    isFetching: false;
    error: undefined;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<SearchRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", SearchResponse, "api", unknown>> & {
    currentData?: SearchResponse | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "data" | "fulfilledTimeStamp" | "currentData">>) | ({
    isError: true;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<SearchRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", SearchResponse, "api", unknown>> & {
    currentData?: SearchResponse | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "error">>)>> & {
    status: import("@reduxjs/toolkit/query").QueryStatus;
}>(arg: SearchRequest | typeof import("@reduxjs/toolkit/query").skipToken, options?: (import("@reduxjs/toolkit/query").SubscriptionOptions & {
    skip?: boolean;
    refetchOnMountOrArgChange?: boolean | number;
} & {
    skip?: boolean;
    selectFromResult?: ((state: import("@reduxjs/toolkit/query").TSHelpersId<(Omit<{
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        originalArgs?: undefined | undefined;
        data?: undefined | undefined;
        error?: undefined | undefined;
        requestId?: undefined | undefined;
        endpointName?: string | undefined;
        startedTimeStamp?: undefined | undefined;
        fulfilledTimeStamp?: undefined | undefined;
    } & {
        currentData?: SearchResponse | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "isUninitialized"> & {
        isUninitialized: true;
    }) | import("@reduxjs/toolkit/query").TSHelpersOverride<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<SearchRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", SearchResponse, "api", unknown>> & {
        currentData?: SearchResponse | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, {
        isLoading: true;
        isFetching: boolean;
        data: undefined;
    } | ({
        isSuccess: true;
        isFetching: true;
        error: undefined;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<SearchRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", SearchResponse, "api", unknown>> & {
        currentData?: SearchResponse | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "data" | "fulfilledTimeStamp">>) | ({
        isSuccess: true;
        isFetching: false;
        error: undefined;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<SearchRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", SearchResponse, "api", unknown>> & {
        currentData?: SearchResponse | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "data" | "fulfilledTimeStamp" | "currentData">>) | ({
        isError: true;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<SearchRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", SearchResponse, "api", unknown>> & {
        currentData?: SearchResponse | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "error">>)>> & {
        status: import("@reduxjs/toolkit/query").QueryStatus;
    }) => R) | undefined;
}) | undefined) => [R][R extends any ? 0 : never] & {
    refetch: () => import("@reduxjs/toolkit/query").QueryActionCreatorResult<import("@reduxjs/toolkit/query").QueryDefinition<SearchRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", SearchResponse, "api", unknown>>;
}, useGetSearchSuggestionsQuery: <R extends Record<string, any> = import("@reduxjs/toolkit/query").TSHelpersId<(Omit<{
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    originalArgs?: undefined | undefined;
    data?: undefined | undefined;
    error?: undefined | undefined;
    requestId?: undefined | undefined;
    endpointName?: string | undefined;
    startedTimeStamp?: undefined | undefined;
    fulfilledTimeStamp?: undefined | undefined;
} & {
    currentData?: BaseApiResponse<string[]> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "isUninitialized"> & {
    isUninitialized: true;
}) | import("@reduxjs/toolkit/query").TSHelpersOverride<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    query: string;
}, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<string[]>, "api", unknown>> & {
    currentData?: BaseApiResponse<string[]> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, {
    isLoading: true;
    isFetching: boolean;
    data: undefined;
} | ({
    isSuccess: true;
    isFetching: true;
    error: undefined;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    query: string;
}, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<string[]>, "api", unknown>> & {
    currentData?: BaseApiResponse<string[]> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "data" | "fulfilledTimeStamp">>) | ({
    isSuccess: true;
    isFetching: false;
    error: undefined;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    query: string;
}, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<string[]>, "api", unknown>> & {
    currentData?: BaseApiResponse<string[]> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "data" | "fulfilledTimeStamp" | "currentData">>) | ({
    isError: true;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    query: string;
}, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<string[]>, "api", unknown>> & {
    currentData?: BaseApiResponse<string[]> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "error">>)>> & {
    status: import("@reduxjs/toolkit/query").QueryStatus;
}>(arg: {
    query: string;
} | typeof import("@reduxjs/toolkit/query").skipToken, options?: (import("@reduxjs/toolkit/query").SubscriptionOptions & {
    skip?: boolean;
    refetchOnMountOrArgChange?: boolean | number;
} & {
    skip?: boolean;
    selectFromResult?: ((state: import("@reduxjs/toolkit/query").TSHelpersId<(Omit<{
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        originalArgs?: undefined | undefined;
        data?: undefined | undefined;
        error?: undefined | undefined;
        requestId?: undefined | undefined;
        endpointName?: string | undefined;
        startedTimeStamp?: undefined | undefined;
        fulfilledTimeStamp?: undefined | undefined;
    } & {
        currentData?: BaseApiResponse<string[]> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "isUninitialized"> & {
        isUninitialized: true;
    }) | import("@reduxjs/toolkit/query").TSHelpersOverride<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        query: string;
    }, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<string[]>, "api", unknown>> & {
        currentData?: BaseApiResponse<string[]> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, {
        isLoading: true;
        isFetching: boolean;
        data: undefined;
    } | ({
        isSuccess: true;
        isFetching: true;
        error: undefined;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        query: string;
    }, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<string[]>, "api", unknown>> & {
        currentData?: BaseApiResponse<string[]> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "data" | "fulfilledTimeStamp">>) | ({
        isSuccess: true;
        isFetching: false;
        error: undefined;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        query: string;
    }, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<string[]>, "api", unknown>> & {
        currentData?: BaseApiResponse<string[]> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "data" | "fulfilledTimeStamp" | "currentData">>) | ({
        isError: true;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        query: string;
    }, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<string[]>, "api", unknown>> & {
        currentData?: BaseApiResponse<string[]> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "error">>)>> & {
        status: import("@reduxjs/toolkit/query").QueryStatus;
    }) => R) | undefined;
}) | undefined) => [R][R extends any ? 0 : never] & {
    refetch: () => import("@reduxjs/toolkit/query").QueryActionCreatorResult<import("@reduxjs/toolkit/query").QueryDefinition<{
        query: string;
    }, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<string[]>, "api", unknown>>;
}, useGetNotificationsQuery: <R extends Record<string, any> = import("@reduxjs/toolkit/query").TSHelpersId<(Omit<{
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    originalArgs?: undefined | undefined;
    data?: undefined | undefined;
    error?: undefined | undefined;
    requestId?: undefined | undefined;
    endpointName?: string | undefined;
    startedTimeStamp?: undefined | undefined;
    fulfilledTimeStamp?: undefined | undefined;
} & {
    currentData?: BaseApiResponse<any[]> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "isUninitialized"> & {
    isUninitialized: true;
}) | import("@reduxjs/toolkit/query").TSHelpersOverride<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<GetNotificationsRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any[]>, "api", unknown>> & {
    currentData?: BaseApiResponse<any[]> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, {
    isLoading: true;
    isFetching: boolean;
    data: undefined;
} | ({
    isSuccess: true;
    isFetching: true;
    error: undefined;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<GetNotificationsRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any[]>, "api", unknown>> & {
    currentData?: BaseApiResponse<any[]> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "data" | "fulfilledTimeStamp">>) | ({
    isSuccess: true;
    isFetching: false;
    error: undefined;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<GetNotificationsRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any[]>, "api", unknown>> & {
    currentData?: BaseApiResponse<any[]> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "data" | "fulfilledTimeStamp" | "currentData">>) | ({
    isError: true;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<GetNotificationsRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any[]>, "api", unknown>> & {
    currentData?: BaseApiResponse<any[]> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "error">>)>> & {
    status: import("@reduxjs/toolkit/query").QueryStatus;
}>(arg: GetNotificationsRequest | typeof import("@reduxjs/toolkit/query").skipToken, options?: (import("@reduxjs/toolkit/query").SubscriptionOptions & {
    skip?: boolean;
    refetchOnMountOrArgChange?: boolean | number;
} & {
    skip?: boolean;
    selectFromResult?: ((state: import("@reduxjs/toolkit/query").TSHelpersId<(Omit<{
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        originalArgs?: undefined | undefined;
        data?: undefined | undefined;
        error?: undefined | undefined;
        requestId?: undefined | undefined;
        endpointName?: string | undefined;
        startedTimeStamp?: undefined | undefined;
        fulfilledTimeStamp?: undefined | undefined;
    } & {
        currentData?: BaseApiResponse<any[]> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "isUninitialized"> & {
        isUninitialized: true;
    }) | import("@reduxjs/toolkit/query").TSHelpersOverride<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<GetNotificationsRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any[]>, "api", unknown>> & {
        currentData?: BaseApiResponse<any[]> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, {
        isLoading: true;
        isFetching: boolean;
        data: undefined;
    } | ({
        isSuccess: true;
        isFetching: true;
        error: undefined;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<GetNotificationsRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any[]>, "api", unknown>> & {
        currentData?: BaseApiResponse<any[]> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "data" | "fulfilledTimeStamp">>) | ({
        isSuccess: true;
        isFetching: false;
        error: undefined;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<GetNotificationsRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any[]>, "api", unknown>> & {
        currentData?: BaseApiResponse<any[]> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "data" | "fulfilledTimeStamp" | "currentData">>) | ({
        isError: true;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<GetNotificationsRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any[]>, "api", unknown>> & {
        currentData?: BaseApiResponse<any[]> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "error">>)>> & {
        status: import("@reduxjs/toolkit/query").QueryStatus;
    }) => R) | undefined;
}) | undefined) => [R][R extends any ? 0 : never] & {
    refetch: () => import("@reduxjs/toolkit/query").QueryActionCreatorResult<import("@reduxjs/toolkit/query").QueryDefinition<GetNotificationsRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any[]>, "api", unknown>>;
}, useMarkNotificationReadMutation: <R extends Record<string, any> = ({
    requestId?: undefined;
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    data?: undefined;
    error?: undefined;
    endpointName?: string;
    startedTimeStamp?: undefined;
    fulfilledTimeStamp?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    isUninitialized: true;
    isLoading: false;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
} & Omit<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp"> & Required<Pick<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp">> & {
    error: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    isUninitialized: false;
    isLoading: false;
    isSuccess: true;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
} & {
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
} & {
    data?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    isUninitialized: false;
    isLoading: true;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
} & Omit<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error"> & Required<Pick<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error">> & {
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    isUninitialized: false;
    isLoading: false;
    isSuccess: false;
    isError: true;
})>(options?: {
    selectFromResult?: ((state: ({
        requestId?: undefined;
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        data?: undefined;
        error?: undefined;
        endpointName?: string;
        startedTimeStamp?: undefined;
        fulfilledTimeStamp?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        isUninitialized: true;
        isLoading: false;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    } & Omit<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp"> & Required<Pick<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp">> & {
        error: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
        isUninitialized: false;
        isLoading: false;
        isSuccess: true;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    } & {
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    } & {
        data?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
        isUninitialized: false;
        isLoading: true;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    } & Omit<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error"> & Required<Pick<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error">> & {
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
        isUninitialized: false;
        isLoading: false;
        isSuccess: false;
        isError: true;
    })) => R) | undefined;
    fixedCacheKey?: string;
} | undefined) => readonly [(arg: MarkNotificationReadRequest) => import("@reduxjs/toolkit/query").MutationActionCreatorResult<import("@reduxjs/toolkit/query").MutationDefinition<MarkNotificationReadRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>>, import("@reduxjs/toolkit/query").TSHelpersNoInfer<R> & {
    originalArgs?: MarkNotificationReadRequest | undefined;
    reset: () => void;
}], useMarkAllNotificationsReadMutation: <R extends Record<string, any> = ({
    requestId?: undefined;
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    data?: undefined;
    error?: undefined;
    endpointName?: string;
    startedTimeStamp?: undefined;
    fulfilledTimeStamp?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    isUninitialized: true;
    isLoading: false;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
} & Omit<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp"> & Required<Pick<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp">> & {
    error: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    isUninitialized: false;
    isLoading: false;
    isSuccess: true;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
} & {
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
} & {
    data?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    isUninitialized: false;
    isLoading: true;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
} & Omit<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error"> & Required<Pick<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error">> & {
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    isUninitialized: false;
    isLoading: false;
    isSuccess: false;
    isError: true;
})>(options?: {
    selectFromResult?: ((state: ({
        requestId?: undefined;
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        data?: undefined;
        error?: undefined;
        endpointName?: string;
        startedTimeStamp?: undefined;
        fulfilledTimeStamp?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        isUninitialized: true;
        isLoading: false;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    } & Omit<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp"> & Required<Pick<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp">> & {
        error: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
        isUninitialized: false;
        isLoading: false;
        isSuccess: true;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    } & {
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    } & {
        data?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
        isUninitialized: false;
        isLoading: true;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    } & Omit<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error"> & Required<Pick<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error">> & {
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
        isUninitialized: false;
        isLoading: false;
        isSuccess: false;
        isError: true;
    })) => R) | undefined;
    fixedCacheKey?: string;
} | undefined) => readonly [(arg: {
    userId: string;
}) => import("@reduxjs/toolkit/query").MutationActionCreatorResult<import("@reduxjs/toolkit/query").MutationDefinition<{
    userId: string;
}, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>>, import("@reduxjs/toolkit/query").TSHelpersNoInfer<R> & {
    originalArgs?: {
        userId: string;
    } | undefined;
    reset: () => void;
}], useSendNotificationMutation: <R extends Record<string, any> = ({
    requestId?: undefined;
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    data?: undefined;
    error?: undefined;
    endpointName?: string;
    startedTimeStamp?: undefined;
    fulfilledTimeStamp?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    isUninitialized: true;
    isLoading: false;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
} & Omit<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp"> & Required<Pick<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp">> & {
    error: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    isUninitialized: false;
    isLoading: false;
    isSuccess: true;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
} & {
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
} & {
    data?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    isUninitialized: false;
    isLoading: true;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
} & Omit<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error"> & Required<Pick<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error">> & {
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    isUninitialized: false;
    isLoading: false;
    isSuccess: false;
    isError: true;
})>(options?: {
    selectFromResult?: ((state: ({
        requestId?: undefined;
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        data?: undefined;
        error?: undefined;
        endpointName?: string;
        startedTimeStamp?: undefined;
        fulfilledTimeStamp?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        isUninitialized: true;
        isLoading: false;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    } & Omit<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp"> & Required<Pick<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp">> & {
        error: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
        isUninitialized: false;
        isLoading: false;
        isSuccess: true;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    } & {
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    } & {
        data?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
        isUninitialized: false;
        isLoading: true;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    } & Omit<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error"> & Required<Pick<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error">> & {
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
        isUninitialized: false;
        isLoading: false;
        isSuccess: false;
        isError: true;
    })) => R) | undefined;
    fixedCacheKey?: string;
} | undefined) => readonly [(arg: NotificationRequest) => import("@reduxjs/toolkit/query").MutationActionCreatorResult<import("@reduxjs/toolkit/query").MutationDefinition<NotificationRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>>, import("@reduxjs/toolkit/query").TSHelpersNoInfer<R> & {
    originalArgs?: NotificationRequest | undefined;
    reset: () => void;
}], useTrackEventsMutation: <R extends Record<string, any> = ({
    requestId?: undefined;
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    data?: undefined;
    error?: undefined;
    endpointName?: string;
    startedTimeStamp?: undefined;
    fulfilledTimeStamp?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    isUninitialized: true;
    isLoading: false;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
} & Omit<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp"> & Required<Pick<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp">> & {
    error: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    isUninitialized: false;
    isLoading: false;
    isSuccess: true;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
} & {
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
} & {
    data?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    isUninitialized: false;
    isLoading: true;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
} & Omit<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error"> & Required<Pick<{
    requestId: string;
    data?: BaseApiResponse<any> | undefined;
    error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error">> & {
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    isUninitialized: false;
    isLoading: false;
    isSuccess: false;
    isError: true;
})>(options?: {
    selectFromResult?: ((state: ({
        requestId?: undefined;
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        data?: undefined;
        error?: undefined;
        endpointName?: string;
        startedTimeStamp?: undefined;
        fulfilledTimeStamp?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        isUninitialized: true;
        isLoading: false;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    } & Omit<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp"> & Required<Pick<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp">> & {
        error: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
        isUninitialized: false;
        isLoading: false;
        isSuccess: true;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    } & {
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    } & {
        data?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
        isUninitialized: false;
        isLoading: true;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    } & Omit<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error"> & Required<Pick<{
        requestId: string;
        data?: BaseApiResponse<any> | undefined;
        error?: import("@reduxjs/toolkit").SerializedError | FetchBaseQueryError | undefined;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error">> & {
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
        isUninitialized: false;
        isLoading: false;
        isSuccess: false;
        isError: true;
    })) => R) | undefined;
    fixedCacheKey?: string;
} | undefined) => readonly [(arg: AnalyticsTrackRequest) => import("@reduxjs/toolkit/query").MutationActionCreatorResult<import("@reduxjs/toolkit/query").MutationDefinition<AnalyticsTrackRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any>, "api", unknown>>, import("@reduxjs/toolkit/query").TSHelpersNoInfer<R> & {
    originalArgs?: AnalyticsTrackRequest | undefined;
    reset: () => void;
}], useGetAnalyticsEventsQuery: <R extends Record<string, any> = import("@reduxjs/toolkit/query").TSHelpersId<(Omit<{
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    originalArgs?: undefined | undefined;
    data?: undefined | undefined;
    error?: undefined | undefined;
    requestId?: undefined | undefined;
    endpointName?: string | undefined;
    startedTimeStamp?: undefined | undefined;
    fulfilledTimeStamp?: undefined | undefined;
} & {
    currentData?: BaseApiResponse<any[]> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "isUninitialized"> & {
    isUninitialized: true;
}) | import("@reduxjs/toolkit/query").TSHelpersOverride<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    userId?: string;
    startDate?: string;
    endDate?: string;
    eventType?: string;
}, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any[]>, "api", unknown>> & {
    currentData?: BaseApiResponse<any[]> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, {
    isLoading: true;
    isFetching: boolean;
    data: undefined;
} | ({
    isSuccess: true;
    isFetching: true;
    error: undefined;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    userId?: string;
    startDate?: string;
    endDate?: string;
    eventType?: string;
}, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any[]>, "api", unknown>> & {
    currentData?: BaseApiResponse<any[]> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "data" | "fulfilledTimeStamp">>) | ({
    isSuccess: true;
    isFetching: false;
    error: undefined;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    userId?: string;
    startDate?: string;
    endDate?: string;
    eventType?: string;
}, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any[]>, "api", unknown>> & {
    currentData?: BaseApiResponse<any[]> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "data" | "fulfilledTimeStamp" | "currentData">>) | ({
    isError: true;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    userId?: string;
    startDate?: string;
    endDate?: string;
    eventType?: string;
}, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any[]>, "api", unknown>> & {
    currentData?: BaseApiResponse<any[]> | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "error">>)>> & {
    status: import("@reduxjs/toolkit/query").QueryStatus;
}>(arg: {
    userId?: string;
    startDate?: string;
    endDate?: string;
    eventType?: string;
} | typeof import("@reduxjs/toolkit/query").skipToken, options?: (import("@reduxjs/toolkit/query").SubscriptionOptions & {
    skip?: boolean;
    refetchOnMountOrArgChange?: boolean | number;
} & {
    skip?: boolean;
    selectFromResult?: ((state: import("@reduxjs/toolkit/query").TSHelpersId<(Omit<{
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        originalArgs?: undefined | undefined;
        data?: undefined | undefined;
        error?: undefined | undefined;
        requestId?: undefined | undefined;
        endpointName?: string | undefined;
        startedTimeStamp?: undefined | undefined;
        fulfilledTimeStamp?: undefined | undefined;
    } & {
        currentData?: BaseApiResponse<any[]> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "isUninitialized"> & {
        isUninitialized: true;
    }) | import("@reduxjs/toolkit/query").TSHelpersOverride<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        userId?: string;
        startDate?: string;
        endDate?: string;
        eventType?: string;
    }, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any[]>, "api", unknown>> & {
        currentData?: BaseApiResponse<any[]> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, {
        isLoading: true;
        isFetching: boolean;
        data: undefined;
    } | ({
        isSuccess: true;
        isFetching: true;
        error: undefined;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        userId?: string;
        startDate?: string;
        endDate?: string;
        eventType?: string;
    }, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any[]>, "api", unknown>> & {
        currentData?: BaseApiResponse<any[]> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "data" | "fulfilledTimeStamp">>) | ({
        isSuccess: true;
        isFetching: false;
        error: undefined;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        userId?: string;
        startDate?: string;
        endDate?: string;
        eventType?: string;
    }, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any[]>, "api", unknown>> & {
        currentData?: BaseApiResponse<any[]> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "data" | "fulfilledTimeStamp" | "currentData">>) | ({
        isError: true;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        userId?: string;
        startDate?: string;
        endDate?: string;
        eventType?: string;
    }, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any[]>, "api", unknown>> & {
        currentData?: BaseApiResponse<any[]> | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "error">>)>> & {
        status: import("@reduxjs/toolkit/query").QueryStatus;
    }) => R) | undefined;
}) | undefined) => [R][R extends any ? 0 : never] & {
    refetch: () => import("@reduxjs/toolkit/query").QueryActionCreatorResult<import("@reduxjs/toolkit/query").QueryDefinition<{
        userId?: string;
        startDate?: string;
        endDate?: string;
        eventType?: string;
    }, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", BaseApiResponse<any[]>, "api", unknown>>;
};
export default api;
//# sourceMappingURL=index.d.ts.map