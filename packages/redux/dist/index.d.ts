/**
 * @encreasl/redux - Enterprise Redux Toolkit Package
 *
 * Centralized state management solution for the Encreasl monorepo.
 * Provides type-safe Redux Toolkit integration with RTK Query,
 * persistence, and optimized developer experience.
 *
 * @version 0.1.0
 * @author Encreasl Team
 */
export { store, persistor, createStore, } from './store';
export type { RootState, AppDispatch, AppStore, } from './store';
export { selectAuth, selectAuthUser, selectAuthToken, selectAuthIsAuthenticated, selectAuthIsLoading, selectAuthError, selectUserFullName, selectUserInitials, selectUserPermissions, selectUserRole, selectIsAdmin, selectIsInstructor, selectIsStudent, selectUserPreferences, selectSessionExpiry, selectIsSessionExpired, selectTimeUntilExpiry, selectUI, selectUITheme, selectUISidebarOpen, selectUIMobileMenuOpen, selectUINotifications, selectUIModals, selectUILoading, selectUIErrors, selectUnreadNotifications, selectUnreadNotificationCount, selectNotificationsByType, selectActiveModals, selectIsAnyModalOpen, selectModalState, selectGlobalLoading, selectLoadingState, selectGlobalError, selectErrorState, selectIsLoading, selectHasErrors, selectUserTheme, selectEffectiveTheme, selectUserNotificationPreferences, selectUserAccessibilityPreferences, selectShouldShowNotification, selectApiState, selectApiQueries, selectApiMutations, selectApiSubscriptions, selectPendingQueries, selectFailedQueries, selectCachedQueries, createDynamicSelector, selectUserById, } from './store/selectors';
export { useAppDispatch, useAppSelector, useAppStore, useAuth, useCurrentUser, useUserPreferences, usePermissions, useUI, useTheme, useNotifications, useModal, useLoading, useError, useSession, useResponsive, } from './hooks';
export { authSlice, uiSlice, authActions, uiActions, actions, reducers, loginUser, registerUser, logoutUser, refreshToken, loadUserFromToken, updateUserProfile, clearAuthError, updateLastActivity, setSessionExpiry, incrementLoginAttempts, resetLoginAttempts, updateUserPreferences, forceLogout, setTheme, toggleTheme, setSidebarOpen, toggleSidebar, setMobileMenuOpen, toggleMobileMenu, addNotification, removeNotification, clearNotifications, clearNotificationsByType, updateNotification, openModal, closeModal, closeAllModals, updateModalData, updateModalOptions, setGlobalLoading, setLoading, clearLoading, clearAllLoading, setGlobalError, setError, clearUIError, clearAllErrors, resetUI, batchUIUpdates, showSuccessNotification, showErrorNotification, showWarningNotification, showInfoNotification, showActionNotification, showLoadingWithTimeout, } from './slices';
export { api, useLoginMutation, useRegisterMutation, useLogoutMutation, useRefreshTokenMutation, useForgotPasswordMutation, useResetPasswordMutation, useGetCurrentUserQuery, useGetUserByIdQuery, useUpdateUserMutation, useUpdateUserPreferencesMutation, useUploadAvatarMutation, useUploadFileMutation, useDeleteFileMutation, useSearchQuery, useGetSearchSuggestionsQuery, useGetNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation, useSendNotificationMutation, useTrackEventsMutation, useGetAnalyticsEventsQuery, } from './api';
export { ReduxProvider, MinimalReduxProvider, DevReduxProvider, ProductionReduxProvider, withRedux, getStore, getPersistor, resetReduxStore, } from './providers';
export type { User, UserRole, Permission, UserPreferences, NotificationPreferences, AccessibilityPreferences, UserProfile, SocialLinks, EmergencyContact, AuthState, UIState, Notification, NotificationAction, ModalState, ModalOptions, LoadingState, ErrorState, ApiResponse, ApiError, PaginatedResponse, AsyncThunkConfig, LoginCredentials, RegisterData, BaseApiResponse, ApiErrorResponse, PaginationParams, PaginationMeta, PaginatedApiResponse, LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse, GetUserRequest, UpdateUserRequest, UpdateUserPreferencesRequest, FileUploadRequest, FileUploadResponse, SearchRequest, SearchResult, SearchResponse, AnalyticsEvent, AnalyticsTrackRequest, NotificationRequest, GetNotificationsRequest, MarkNotificationReadRequest, ApiTag, EndpointConfig, ApiEndpoints, } from './types';
export { API_TAGS, } from './types/api';
export declare const REDUX_PACKAGE_VERSION = "0.1.0";
export declare const REDUX_PACKAGE_NAME = "@encreasl/redux";
export declare const DEFAULT_CONFIG: {
    readonly PERSISTENCE_KEY: "encreasl-root";
    readonly TOKEN_STORAGE_KEY: "encreasl_token";
    readonly REFRESH_TOKEN_STORAGE_KEY: "encreasl_refresh_token";
    readonly SESSION_TIMEOUT: number;
    readonly TOKEN_REFRESH_THRESHOLD: number;
    readonly API_TIMEOUT: 30000;
    readonly NOTIFICATION_DEFAULT_DURATION: 4000;
    readonly CACHE_DURATION: 60;
};
declare const _default: {
    store: import("@reduxjs/toolkit").EnhancedStore<{
        auth: import("./types").AuthState & import("redux-persist/es/persistReducer").PersistPartial;
        ui: import("./types").UIState & import("redux-persist/es/persistReducer").PersistPartial;
        api: import("@reduxjs/toolkit/query").CombinedState<{
            login: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").LoginRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").LoginResponse, "api", unknown>;
            register: import("@reduxjs/toolkit/query").MutationDefinition<any, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").LoginResponse, "api", unknown>;
            logout: import("@reduxjs/toolkit/query").MutationDefinition<{
                refreshToken?: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", void, "api", unknown>;
            refreshToken: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").RefreshTokenRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").RefreshTokenResponse, "api", unknown>;
            forgotPassword: import("@reduxjs/toolkit/query").MutationDefinition<{
                email: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            resetPassword: import("@reduxjs/toolkit/query").MutationDefinition<{
                token: string;
                password: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            getCurrentUser: import("@reduxjs/toolkit/query").QueryDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            getUserById: import("@reduxjs/toolkit/query").QueryDefinition<import("./types").GetUserRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            updateUser: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").UpdateUserRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            updateUserPreferences: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").UpdateUserPreferencesRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            uploadAvatar: import("@reduxjs/toolkit/query").MutationDefinition<{
                userId: string;
                file: File;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").FileUploadResponse, "api", unknown>;
            uploadFile: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").FileUploadRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").FileUploadResponse, "api", unknown>;
            deleteFile: import("@reduxjs/toolkit/query").MutationDefinition<{
                fileId: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            search: import("@reduxjs/toolkit/query").QueryDefinition<import("./types").SearchRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").SearchResponse, "api", unknown>;
            getSearchSuggestions: import("@reduxjs/toolkit/query").QueryDefinition<{
                query: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<string[]>, "api", unknown>;
            getNotifications: import("@reduxjs/toolkit/query").QueryDefinition<import("./types").GetNotificationsRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any[]>, "api", unknown>;
            markNotificationRead: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").MarkNotificationReadRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            markAllNotificationsRead: import("@reduxjs/toolkit/query").MutationDefinition<{
                userId: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            sendNotification: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").NotificationRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            trackEvents: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").AnalyticsTrackRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            getAnalyticsEvents: import("@reduxjs/toolkit/query").QueryDefinition<{
                userId?: string;
                startDate?: string;
                endDate?: string;
                eventType?: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any[]>, "api", unknown>;
        }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">;
    }, import("@reduxjs/toolkit").UnknownAction, import("@reduxjs/toolkit").Tuple<[import("@reduxjs/toolkit").StoreEnhancer<{
        dispatch: import("@reduxjs/toolkit").ThunkDispatch<{
            auth: import("./types").AuthState & import("redux-persist/es/persistReducer").PersistPartial;
            ui: import("./types").UIState & import("redux-persist/es/persistReducer").PersistPartial;
            api: import("@reduxjs/toolkit/query").CombinedState<{
                login: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").LoginRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").LoginResponse, "api", unknown>;
                register: import("@reduxjs/toolkit/query").MutationDefinition<any, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").LoginResponse, "api", unknown>;
                logout: import("@reduxjs/toolkit/query").MutationDefinition<{
                    refreshToken?: string;
                }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", void, "api", unknown>;
                refreshToken: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").RefreshTokenRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").RefreshTokenResponse, "api", unknown>;
                forgotPassword: import("@reduxjs/toolkit/query").MutationDefinition<{
                    email: string;
                }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
                resetPassword: import("@reduxjs/toolkit/query").MutationDefinition<{
                    token: string;
                    password: string;
                }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
                getCurrentUser: import("@reduxjs/toolkit/query").QueryDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
                getUserById: import("@reduxjs/toolkit/query").QueryDefinition<import("./types").GetUserRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
                updateUser: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").UpdateUserRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
                updateUserPreferences: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").UpdateUserPreferencesRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
                uploadAvatar: import("@reduxjs/toolkit/query").MutationDefinition<{
                    userId: string;
                    file: File;
                }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").FileUploadResponse, "api", unknown>;
                uploadFile: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").FileUploadRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").FileUploadResponse, "api", unknown>;
                deleteFile: import("@reduxjs/toolkit/query").MutationDefinition<{
                    fileId: string;
                }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
                search: import("@reduxjs/toolkit/query").QueryDefinition<import("./types").SearchRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").SearchResponse, "api", unknown>;
                getSearchSuggestions: import("@reduxjs/toolkit/query").QueryDefinition<{
                    query: string;
                }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<string[]>, "api", unknown>;
                getNotifications: import("@reduxjs/toolkit/query").QueryDefinition<import("./types").GetNotificationsRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any[]>, "api", unknown>;
                markNotificationRead: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").MarkNotificationReadRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
                markAllNotificationsRead: import("@reduxjs/toolkit/query").MutationDefinition<{
                    userId: string;
                }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
                sendNotification: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").NotificationRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
                trackEvents: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").AnalyticsTrackRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
                getAnalyticsEvents: import("@reduxjs/toolkit/query").QueryDefinition<{
                    userId?: string;
                    startDate?: string;
                    endDate?: string;
                    eventType?: string;
                }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any[]>, "api", unknown>;
            }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">;
        }, undefined, import("@reduxjs/toolkit").UnknownAction>;
    }>]>>;
    persistor: import("redux-persist/es/types").Persistor;
    ReduxProvider: ({ children, customStore, enablePersistence, loadingComponent, errorComponent, }: import("./providers").ReduxProviderProps) => React.JSX.Element;
    useAppDispatch: import("react-redux").UseDispatch<import("@reduxjs/toolkit").ThunkDispatch<{
        auth: import("./types").AuthState & import("redux-persist/es/persistReducer").PersistPartial;
        ui: import("./types").UIState & import("redux-persist/es/persistReducer").PersistPartial;
        api: import("@reduxjs/toolkit/query").CombinedState<{
            login: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").LoginRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").LoginResponse, "api", unknown>;
            register: import("@reduxjs/toolkit/query").MutationDefinition<any, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").LoginResponse, "api", unknown>;
            logout: import("@reduxjs/toolkit/query").MutationDefinition<{
                refreshToken?: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", void, "api", unknown>;
            refreshToken: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").RefreshTokenRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").RefreshTokenResponse, "api", unknown>;
            forgotPassword: import("@reduxjs/toolkit/query").MutationDefinition<{
                email: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            resetPassword: import("@reduxjs/toolkit/query").MutationDefinition<{
                token: string;
                password: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            getCurrentUser: import("@reduxjs/toolkit/query").QueryDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            getUserById: import("@reduxjs/toolkit/query").QueryDefinition<import("./types").GetUserRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            updateUser: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").UpdateUserRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            updateUserPreferences: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").UpdateUserPreferencesRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            uploadAvatar: import("@reduxjs/toolkit/query").MutationDefinition<{
                userId: string;
                file: File;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").FileUploadResponse, "api", unknown>;
            uploadFile: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").FileUploadRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").FileUploadResponse, "api", unknown>;
            deleteFile: import("@reduxjs/toolkit/query").MutationDefinition<{
                fileId: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            search: import("@reduxjs/toolkit/query").QueryDefinition<import("./types").SearchRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").SearchResponse, "api", unknown>;
            getSearchSuggestions: import("@reduxjs/toolkit/query").QueryDefinition<{
                query: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<string[]>, "api", unknown>;
            getNotifications: import("@reduxjs/toolkit/query").QueryDefinition<import("./types").GetNotificationsRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any[]>, "api", unknown>;
            markNotificationRead: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").MarkNotificationReadRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            markAllNotificationsRead: import("@reduxjs/toolkit/query").MutationDefinition<{
                userId: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            sendNotification: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").NotificationRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            trackEvents: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").AnalyticsTrackRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            getAnalyticsEvents: import("@reduxjs/toolkit/query").QueryDefinition<{
                userId?: string;
                startDate?: string;
                endDate?: string;
                eventType?: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any[]>, "api", unknown>;
        }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">;
    }, undefined, import("@reduxjs/toolkit").UnknownAction> & import("@reduxjs/toolkit").Dispatch<import("@reduxjs/toolkit").UnknownAction>>;
    useAppSelector: import("react-redux").UseSelector<{
        auth: import("./types").AuthState & import("redux-persist/es/persistReducer").PersistPartial;
        ui: import("./types").UIState & import("redux-persist/es/persistReducer").PersistPartial;
        api: import("@reduxjs/toolkit/query").CombinedState<{
            login: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").LoginRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").LoginResponse, "api", unknown>;
            register: import("@reduxjs/toolkit/query").MutationDefinition<any, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").LoginResponse, "api", unknown>;
            logout: import("@reduxjs/toolkit/query").MutationDefinition<{
                refreshToken?: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", void, "api", unknown>;
            refreshToken: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").RefreshTokenRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").RefreshTokenResponse, "api", unknown>;
            forgotPassword: import("@reduxjs/toolkit/query").MutationDefinition<{
                email: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            resetPassword: import("@reduxjs/toolkit/query").MutationDefinition<{
                token: string;
                password: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            getCurrentUser: import("@reduxjs/toolkit/query").QueryDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            getUserById: import("@reduxjs/toolkit/query").QueryDefinition<import("./types").GetUserRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            updateUser: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").UpdateUserRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            updateUserPreferences: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").UpdateUserPreferencesRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            uploadAvatar: import("@reduxjs/toolkit/query").MutationDefinition<{
                userId: string;
                file: File;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").FileUploadResponse, "api", unknown>;
            uploadFile: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").FileUploadRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").FileUploadResponse, "api", unknown>;
            deleteFile: import("@reduxjs/toolkit/query").MutationDefinition<{
                fileId: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            search: import("@reduxjs/toolkit/query").QueryDefinition<import("./types").SearchRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").SearchResponse, "api", unknown>;
            getSearchSuggestions: import("@reduxjs/toolkit/query").QueryDefinition<{
                query: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<string[]>, "api", unknown>;
            getNotifications: import("@reduxjs/toolkit/query").QueryDefinition<import("./types").GetNotificationsRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any[]>, "api", unknown>;
            markNotificationRead: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").MarkNotificationReadRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            markAllNotificationsRead: import("@reduxjs/toolkit/query").MutationDefinition<{
                userId: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            sendNotification: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").NotificationRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            trackEvents: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").AnalyticsTrackRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
            getAnalyticsEvents: import("@reduxjs/toolkit/query").QueryDefinition<{
                userId?: string;
                startDate?: string;
                endDate?: string;
                eventType?: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any[]>, "api", unknown>;
        }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">;
    }>;
    useAuth: () => {
        user: import("./types").User | null;
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
            auth: import("./types").AuthState & import("redux-persist/es/persistReducer").PersistPartial;
            ui: import("./types").UIState & import("redux-persist/es/persistReducer").PersistPartial;
            api: import("@reduxjs/toolkit/query").CombinedState<{
                login: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").LoginRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").LoginResponse, "api", unknown>;
                register: import("@reduxjs/toolkit/query").MutationDefinition<any, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").LoginResponse, "api", unknown>;
                logout: import("@reduxjs/toolkit/query").MutationDefinition<{
                    refreshToken?: string;
                }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", void, "api", unknown>;
                refreshToken: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").RefreshTokenRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").RefreshTokenResponse, "api", unknown>;
                forgotPassword: import("@reduxjs/toolkit/query").MutationDefinition<{
                    email: string;
                }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
                resetPassword: import("@reduxjs/toolkit/query").MutationDefinition<{
                    token: string;
                    password: string;
                }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
                getCurrentUser: import("@reduxjs/toolkit/query").QueryDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
                getUserById: import("@reduxjs/toolkit/query").QueryDefinition<import("./types").GetUserRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
                updateUser: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").UpdateUserRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
                updateUserPreferences: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").UpdateUserPreferencesRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
                uploadAvatar: import("@reduxjs/toolkit/query").MutationDefinition<{
                    userId: string;
                    file: File;
                }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").FileUploadResponse, "api", unknown>;
                uploadFile: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").FileUploadRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").FileUploadResponse, "api", unknown>;
                deleteFile: import("@reduxjs/toolkit/query").MutationDefinition<{
                    fileId: string;
                }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
                search: import("@reduxjs/toolkit/query").QueryDefinition<import("./types").SearchRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").SearchResponse, "api", unknown>;
                getSearchSuggestions: import("@reduxjs/toolkit/query").QueryDefinition<{
                    query: string;
                }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<string[]>, "api", unknown>;
                getNotifications: import("@reduxjs/toolkit/query").QueryDefinition<import("./types").GetNotificationsRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any[]>, "api", unknown>;
                markNotificationRead: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").MarkNotificationReadRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
                markAllNotificationsRead: import("@reduxjs/toolkit/query").MutationDefinition<{
                    userId: string;
                }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
                sendNotification: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").NotificationRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
                trackEvents: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").AnalyticsTrackRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
                getAnalyticsEvents: import("@reduxjs/toolkit/query").QueryDefinition<{
                    userId?: string;
                    startDate?: string;
                    endDate?: string;
                    eventType?: string;
                }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any[]>, "api", unknown>;
            }, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", "api">;
        }, undefined, import("@reduxjs/toolkit").UnknownAction> & import("@reduxjs/toolkit").Dispatch<import("@reduxjs/toolkit").UnknownAction>;
    };
    useCurrentUser: () => {
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
        role: import("./types").UserRole;
        permissions: import("./types").Permission[];
        preferences: import("./types").UserPreferences;
        profile: import("./types").UserProfile;
        createdAt: string;
        updatedAt: string;
        lastLoginAt?: string;
    } | null;
    useTheme: () => {
        theme: "light" | "dark" | "system";
        effectiveTheme: string;
        isDark: boolean;
        isLight: boolean;
        isSystem: boolean;
        setTheme: (newTheme: "light" | "dark" | "system") => void;
        toggleTheme: () => void;
    };
    useNotifications: () => {
        notifications: import("./types").Notification[];
        unreadCount: number;
        addNotification: (notification: Omit<import("./types").Notification, "id" | "createdAt">) => void;
        removeNotification: (id: string) => void;
        clearNotifications: () => void;
        showSuccess: (message: string, title?: string) => void;
        showError: (message: string, title?: string) => void;
        showWarning: (message: string, title?: string) => void;
        showInfo: (message: string, title?: string) => void;
    };
    authActions: {
        loginUser: import("@reduxjs/toolkit").AsyncThunk<{
            user: import("./types").User;
            token: string;
            refreshToken: string;
            expiresIn: number;
        }, import("./types").LoginCredentials, {
            state: import("./types").RootState;
            dispatch: import("./types").AppDispatch;
            rejectValue: import("./types").ApiError;
            extra?: unknown;
            serializedErrorType?: unknown;
            pendingMeta?: unknown;
            fulfilledMeta?: unknown;
            rejectedMeta?: unknown;
        }>;
        registerUser: import("@reduxjs/toolkit").AsyncThunk<{
            user: import("./types").User;
            token: string;
            refreshToken: string;
            expiresIn: number;
        }, import("./types").RegisterData, {
            state: import("./types").RootState;
            dispatch: import("./types").AppDispatch;
            rejectValue: import("./types").ApiError;
            extra?: unknown;
            serializedErrorType?: unknown;
            pendingMeta?: unknown;
            fulfilledMeta?: unknown;
            rejectedMeta?: unknown;
        }>;
        logoutUser: import("@reduxjs/toolkit").AsyncThunk<void, void, {
            state: import("./types").RootState;
            dispatch: import("./types").AppDispatch;
            rejectValue: import("./types").ApiError;
            extra?: unknown;
            serializedErrorType?: unknown;
            pendingMeta?: unknown;
            fulfilledMeta?: unknown;
            rejectedMeta?: unknown;
        }>;
        refreshToken: import("@reduxjs/toolkit").AsyncThunk<{
            token: string;
            refreshToken: string;
            expiresIn: number;
        }, void, {
            state: import("./types").RootState;
            dispatch: import("./types").AppDispatch;
            rejectValue: import("./types").ApiError;
            extra?: unknown;
            serializedErrorType?: unknown;
            pendingMeta?: unknown;
            fulfilledMeta?: unknown;
            rejectedMeta?: unknown;
        }>;
        loadUserFromToken: import("@reduxjs/toolkit").AsyncThunk<import("./types").User, void, {
            state: import("./types").RootState;
            dispatch: import("./types").AppDispatch;
            rejectValue: import("./types").ApiError;
            extra?: unknown;
            serializedErrorType?: unknown;
            pendingMeta?: unknown;
            fulfilledMeta?: unknown;
            rejectedMeta?: unknown;
        }>;
        updateUserProfile: import("@reduxjs/toolkit").AsyncThunk<import("./types").User, Partial<import("./types").User>, {
            state: import("./types").RootState;
            dispatch: import("./types").AppDispatch;
            rejectValue: import("./types").ApiError;
            extra?: unknown;
            serializedErrorType?: unknown;
            pendingMeta?: unknown;
            fulfilledMeta?: unknown;
            rejectedMeta?: unknown;
        }>;
        clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"auth/clearError">;
        updateLastActivity: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"auth/updateLastActivity">;
        setSessionExpiry: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "auth/setSessionExpiry">;
        incrementLoginAttempts: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"auth/incrementLoginAttempts">;
        resetLoginAttempts: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"auth/resetLoginAttempts">;
        updateUserPreferences: import("@reduxjs/toolkit").ActionCreatorWithPayload<Partial<import("./types").UserPreferences>, "auth/updateUserPreferences">;
        forceLogout: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"auth/forceLogout">;
    };
    uiActions: {
        setTheme: import("@reduxjs/toolkit").ActionCreatorWithPayload<"light" | "dark" | "system", "ui/setTheme">;
        toggleTheme: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/toggleTheme">;
        setSidebarOpen: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "ui/setSidebarOpen">;
        toggleSidebar: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/toggleSidebar">;
        setMobileMenuOpen: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "ui/setMobileMenuOpen">;
        toggleMobileMenu: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/toggleMobileMenu">;
        addNotification: import("@reduxjs/toolkit").ActionCreatorWithPayload<Omit<import("./types").Notification, "id" | "createdAt">, "ui/addNotification">;
        removeNotification: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "ui/removeNotification">;
        clearNotifications: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/clearNotifications">;
        clearNotificationsByType: import("@reduxjs/toolkit").ActionCreatorWithPayload<"success" | "error" | "warning" | "info", "ui/clearNotificationsByType">;
        updateNotification: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
            id: string;
            updates: Partial<import("./types").Notification>;
        }, "ui/updateNotification">;
        openModal: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
            id: string;
            data?: any;
            options?: import("./types").ModalOptions;
        }, "ui/openModal">;
        closeModal: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "ui/closeModal">;
        closeAllModals: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/closeAllModals">;
        updateModalData: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
            id: string;
            data: any;
        }, "ui/updateModalData">;
        updateModalOptions: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
            id: string;
            options: Partial<import("./types").ModalOptions>;
        }, "ui/updateModalOptions">;
        setGlobalLoading: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "ui/setGlobalLoading">;
        setLoading: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
            key: string;
            loading: boolean;
        }, "ui/setLoading">;
        clearLoading: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "ui/clearLoading">;
        clearAllLoading: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/clearAllLoading">;
        setGlobalError: import("@reduxjs/toolkit").ActionCreatorWithPayload<string | null, "ui/setGlobalError">;
        setError: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
            key: string;
            error: string | null;
        }, "ui/setError">;
        clearError: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "ui/clearError">;
        clearAllErrors: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/clearAllErrors">;
        resetUI: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/resetUI">;
        batchUIUpdates: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
            theme?: import("./types").UIState["theme"];
            sidebarOpen?: boolean;
            mobileMenuOpen?: boolean;
            loading?: Record<string, boolean>;
            errors?: Record<string, string | null>;
        }, "ui/batchUIUpdates">;
        showSuccessNotification: (message: string, title?: string) => {
            payload: Omit<import("./types").Notification, "id" | "createdAt">;
            type: "ui/addNotification";
        };
        showErrorNotification: (message: string, title?: string) => {
            payload: Omit<import("./types").Notification, "id" | "createdAt">;
            type: "ui/addNotification";
        };
        showWarningNotification: (message: string, title?: string) => {
            payload: Omit<import("./types").Notification, "id" | "createdAt">;
            type: "ui/addNotification";
        };
        showInfoNotification: (message: string, title?: string) => {
            payload: Omit<import("./types").Notification, "id" | "createdAt">;
            type: "ui/addNotification";
        };
        showActionNotification: (message: string, actions: import("./types").NotificationAction[], title?: string, type?: import("./types").Notification["type"]) => {
            payload: Omit<import("./types").Notification, "id" | "createdAt">;
            type: "ui/addNotification";
        };
        showLoadingWithTimeout: (key: string, timeout?: number) => (dispatch: any) => void;
    };
    api: import("@reduxjs/toolkit/query").Api<import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, {
        login: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").LoginRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").LoginResponse, "api", unknown>;
        register: import("@reduxjs/toolkit/query").MutationDefinition<any, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").LoginResponse, "api", unknown>;
        logout: import("@reduxjs/toolkit/query").MutationDefinition<{
            refreshToken?: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", void, "api", unknown>;
        refreshToken: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").RefreshTokenRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").RefreshTokenResponse, "api", unknown>;
        forgotPassword: import("@reduxjs/toolkit/query").MutationDefinition<{
            email: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
        resetPassword: import("@reduxjs/toolkit/query").MutationDefinition<{
            token: string;
            password: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
        getCurrentUser: import("@reduxjs/toolkit/query").QueryDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
        getUserById: import("@reduxjs/toolkit/query").QueryDefinition<import("./types").GetUserRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
        updateUser: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").UpdateUserRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
        updateUserPreferences: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").UpdateUserPreferencesRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
        uploadAvatar: import("@reduxjs/toolkit/query").MutationDefinition<{
            userId: string;
            file: File;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").FileUploadResponse, "api", unknown>;
        uploadFile: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").FileUploadRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").FileUploadResponse, "api", unknown>;
        deleteFile: import("@reduxjs/toolkit/query").MutationDefinition<{
            fileId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
        search: import("@reduxjs/toolkit/query").QueryDefinition<import("./types").SearchRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").SearchResponse, "api", unknown>;
        getSearchSuggestions: import("@reduxjs/toolkit/query").QueryDefinition<{
            query: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<string[]>, "api", unknown>;
        getNotifications: import("@reduxjs/toolkit/query").QueryDefinition<import("./types").GetNotificationsRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any[]>, "api", unknown>;
        markNotificationRead: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").MarkNotificationReadRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
        markAllNotificationsRead: import("@reduxjs/toolkit/query").MutationDefinition<{
            userId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
        sendNotification: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").NotificationRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
        trackEvents: import("@reduxjs/toolkit/query").MutationDefinition<import("./types").AnalyticsTrackRequest, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any>, "api", unknown>;
        getAnalyticsEvents: import("@reduxjs/toolkit/query").QueryDefinition<{
            userId?: string;
            startDate?: string;
            endDate?: string;
            eventType?: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", import("./types").BaseApiResponse<any[]>, "api", unknown>;
    }, "api", "User" | "Auth" | "Notification" | "File" | "Search" | "Analytics" | "Post" | "Media" | "Trainee", typeof import("@reduxjs/toolkit/query").coreModuleName | typeof import("@reduxjs/toolkit/query/react").reactHooksModuleName>;
    version: string;
    config: {
        readonly PERSISTENCE_KEY: "encreasl-root";
        readonly TOKEN_STORAGE_KEY: "encreasl_token";
        readonly REFRESH_TOKEN_STORAGE_KEY: "encreasl_refresh_token";
        readonly SESSION_TIMEOUT: number;
        readonly TOKEN_REFRESH_THRESHOLD: number;
        readonly API_TIMEOUT: 30000;
        readonly NOTIFICATION_DEFAULT_DURATION: 4000;
        readonly CACHE_DURATION: 60;
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map