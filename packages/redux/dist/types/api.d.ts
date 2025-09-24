/**
 * API-related types for RTK Query and API interactions
 */
export interface BaseApiResponse<T = any> {
    data: T;
    message?: string;
    success: boolean;
    timestamp: string;
    requestId?: string;
}
export interface ApiErrorResponse {
    message: string;
    code?: string;
    status: number;
    details?: Record<string, any>;
    timestamp: string;
    requestId?: string;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    filters?: Record<string, any>;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface PaginatedApiResponse<T> extends BaseApiResponse<T[]> {
    pagination: PaginationMeta;
}
export interface BaseQueryArgs {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
    params?: Record<string, any>;
    headers?: Record<string, string>;
}
export interface BaseQueryResult<T = any> {
    data?: T;
    error?: ApiErrorResponse;
    meta?: {
        request: Request;
        response: Response;
    };
}
export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export interface LoginResponse {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        avatar?: string;
    };
    token: string;
    refreshToken: string;
    expiresIn: number;
}
export interface RefreshTokenRequest {
    refreshToken: string;
}
export interface RefreshTokenResponse {
    token: string;
    refreshToken: string;
    expiresIn: number;
}
export interface LogoutRequest {
    refreshToken?: string;
}
export interface GetUserRequest {
    userId: string;
}
export interface UpdateUserRequest {
    userId: string;
    data: Partial<{
        firstName: string;
        lastName: string;
        middleName: string;
        avatar: string;
        bio: string;
        website: string;
        location: string;
        phoneNumber: string;
    }>;
}
export interface UpdateUserPreferencesRequest {
    userId: string;
    preferences: {
        theme?: 'light' | 'dark' | 'system';
        language?: string;
        timezone?: string;
        notifications?: {
            email?: boolean;
            push?: boolean;
            sms?: boolean;
            inApp?: boolean;
            marketing?: boolean;
        };
        accessibility?: {
            reducedMotion?: boolean;
            highContrast?: boolean;
            fontSize?: 'small' | 'medium' | 'large' | 'extra-large';
            screenReader?: boolean;
        };
    };
}
export interface FileUploadRequest {
    file: File;
    folder?: string;
    public?: boolean;
}
export interface FileUploadResponse {
    id: string;
    url: string;
    publicUrl?: string;
    filename: string;
    size: number;
    mimeType: string;
    folder?: string;
}
export interface SearchRequest {
    query: string;
    type?: 'users' | 'courses' | 'content' | 'all';
    filters?: {
        category?: string;
        tags?: string[];
        dateRange?: {
            start: string;
            end: string;
        };
        [key: string]: any;
    };
    pagination?: PaginationParams;
}
export interface SearchResult {
    id: string;
    type: 'user' | 'course' | 'content';
    title: string;
    description?: string;
    url: string;
    thumbnail?: string;
    relevanceScore: number;
    highlights?: string[];
}
export interface SearchResponse extends PaginatedApiResponse<SearchResult> {
    query: string;
    totalResults: number;
    searchTime: number;
    suggestions?: string[];
}
export interface AnalyticsEvent {
    event: string;
    properties?: Record<string, any>;
    userId?: string;
    sessionId?: string;
    timestamp?: string;
}
export interface AnalyticsTrackRequest {
    events: AnalyticsEvent[];
}
export interface NotificationRequest {
    userId: string;
    type: 'email' | 'push' | 'sms' | 'in_app';
    title: string;
    message: string;
    data?: Record<string, any>;
    scheduledAt?: string;
}
export interface GetNotificationsRequest extends PaginationParams {
    userId: string;
    unreadOnly?: boolean;
    type?: 'email' | 'push' | 'sms' | 'in_app';
}
export interface MarkNotificationReadRequest {
    notificationId: string;
    userId: string;
}
export declare const API_TAGS: {
    readonly User: "User";
    readonly Auth: "Auth";
    readonly Notification: "Notification";
    readonly File: "File";
    readonly Search: "Search";
    readonly Analytics: "Analytics";
    readonly Post: "Post";
    readonly Media: "Media";
    readonly Trainee: "Trainee";
};
export type ApiTag = typeof API_TAGS[keyof typeof API_TAGS];
export interface EndpointConfig {
    baseUrl: string;
    timeout: number;
    retries: number;
    retryDelay: number;
    headers: Record<string, string>;
}
export interface ApiEndpoints {
    auth: {
        login: string;
        logout: string;
        refresh: string;
        register: string;
        forgotPassword: string;
        resetPassword: string;
    };
    users: {
        profile: string;
        update: string;
        preferences: string;
        avatar: string;
    };
    files: {
        upload: string;
        delete: string;
    };
    notifications: {
        list: string;
        markRead: string;
        markAllRead: string;
        send: string;
    };
    search: {
        query: string;
        suggestions: string;
    };
    analytics: {
        track: string;
        events: string;
    };
}
//# sourceMappingURL=api.d.ts.map