/**
 * Redux Slices Index
 *
 * Central export point for all Redux slices and their actions.
 * This provides a clean API for consuming applications.
 */
import authSlice, { loginUser, registerUser, logoutUser, refreshToken, loadUserFromToken, updateUserProfile, clearError as clearAuthError, updateLastActivity, setSessionExpiry, incrementLoginAttempts, resetLoginAttempts, updateUserPreferences, forceLogout } from './auth';
import uiSlice, { setTheme, toggleTheme, setSidebarOpen, toggleSidebar, setMobileMenuOpen, toggleMobileMenu, addNotification, removeNotification, clearNotifications, clearNotificationsByType, updateNotification, openModal, closeModal, closeAllModals, updateModalData, updateModalOptions, setGlobalLoading, setLoading, clearLoading, clearAllLoading, setGlobalError, setError, clearError as clearUIError, clearAllErrors, resetUI, batchUIUpdates, showSuccessNotification, showErrorNotification, showWarningNotification, showInfoNotification, showActionNotification, showLoadingWithTimeout } from './ui';
export { authSlice, uiSlice };
export declare const authActions: {
    loginUser: import("@reduxjs/toolkit").AsyncThunk<{
        user: import("..").User;
        token: string;
        refreshToken: string;
        expiresIn: number;
    }, import("..").LoginCredentials, {
        state: import("../types").RootState;
        dispatch: import("../types").AppDispatch;
        rejectValue: import("..").ApiError;
        extra?: unknown;
        serializedErrorType?: unknown;
        pendingMeta?: unknown;
        fulfilledMeta?: unknown;
        rejectedMeta?: unknown;
    }>;
    registerUser: import("@reduxjs/toolkit").AsyncThunk<{
        user: import("..").User;
        token: string;
        refreshToken: string;
        expiresIn: number;
    }, import("..").RegisterData, {
        state: import("../types").RootState;
        dispatch: import("../types").AppDispatch;
        rejectValue: import("..").ApiError;
        extra?: unknown;
        serializedErrorType?: unknown;
        pendingMeta?: unknown;
        fulfilledMeta?: unknown;
        rejectedMeta?: unknown;
    }>;
    logoutUser: import("@reduxjs/toolkit").AsyncThunk<void, void, {
        state: import("../types").RootState;
        dispatch: import("../types").AppDispatch;
        rejectValue: import("..").ApiError;
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
        state: import("../types").RootState;
        dispatch: import("../types").AppDispatch;
        rejectValue: import("..").ApiError;
        extra?: unknown;
        serializedErrorType?: unknown;
        pendingMeta?: unknown;
        fulfilledMeta?: unknown;
        rejectedMeta?: unknown;
    }>;
    loadUserFromToken: import("@reduxjs/toolkit").AsyncThunk<import("..").User, void, {
        state: import("../types").RootState;
        dispatch: import("../types").AppDispatch;
        rejectValue: import("..").ApiError;
        extra?: unknown;
        serializedErrorType?: unknown;
        pendingMeta?: unknown;
        fulfilledMeta?: unknown;
        rejectedMeta?: unknown;
    }>;
    updateUserProfile: import("@reduxjs/toolkit").AsyncThunk<import("..").User, Partial<import("..").User>, {
        state: import("../types").RootState;
        dispatch: import("../types").AppDispatch;
        rejectValue: import("..").ApiError;
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
    updateUserPreferences: import("@reduxjs/toolkit").ActionCreatorWithPayload<Partial<import("..").UserPreferences>, "auth/updateUserPreferences">;
    forceLogout: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"auth/forceLogout">;
};
export declare const uiActions: {
    setTheme: import("@reduxjs/toolkit").ActionCreatorWithPayload<"light" | "dark" | "system", "ui/setTheme">;
    toggleTheme: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/toggleTheme">;
    setSidebarOpen: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "ui/setSidebarOpen">;
    toggleSidebar: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/toggleSidebar">;
    setMobileMenuOpen: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "ui/setMobileMenuOpen">;
    toggleMobileMenu: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/toggleMobileMenu">;
    addNotification: import("@reduxjs/toolkit").ActionCreatorWithPayload<Omit<import("..").Notification, "id" | "createdAt">, "ui/addNotification">;
    removeNotification: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "ui/removeNotification">;
    clearNotifications: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/clearNotifications">;
    clearNotificationsByType: import("@reduxjs/toolkit").ActionCreatorWithPayload<"success" | "error" | "warning" | "info", "ui/clearNotificationsByType">;
    updateNotification: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
        id: string;
        updates: Partial<import("..").Notification>;
    }, "ui/updateNotification">;
    openModal: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
        id: string;
        data?: any;
        options?: import("..").ModalOptions;
    }, "ui/openModal">;
    closeModal: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "ui/closeModal">;
    closeAllModals: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/closeAllModals">;
    updateModalData: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
        id: string;
        data: any;
    }, "ui/updateModalData">;
    updateModalOptions: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
        id: string;
        options: Partial<import("..").ModalOptions>;
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
        theme?: import("..").UIState["theme"];
        sidebarOpen?: boolean;
        mobileMenuOpen?: boolean;
        loading?: Record<string, boolean>;
        errors?: Record<string, string | null>;
    }, "ui/batchUIUpdates">;
    showSuccessNotification: (message: string, title?: string) => {
        payload: Omit<import("..").Notification, "id" | "createdAt">;
        type: "ui/addNotification";
    };
    showErrorNotification: (message: string, title?: string) => {
        payload: Omit<import("..").Notification, "id" | "createdAt">;
        type: "ui/addNotification";
    };
    showWarningNotification: (message: string, title?: string) => {
        payload: Omit<import("..").Notification, "id" | "createdAt">;
        type: "ui/addNotification";
    };
    showInfoNotification: (message: string, title?: string) => {
        payload: Omit<import("..").Notification, "id" | "createdAt">;
        type: "ui/addNotification";
    };
    showActionNotification: (message: string, actions: import("..").NotificationAction[], title?: string, type?: import("..").Notification["type"]) => {
        payload: Omit<import("..").Notification, "id" | "createdAt">;
        type: "ui/addNotification";
    };
    showLoadingWithTimeout: (key: string, timeout?: number) => (dispatch: any) => void;
};
export declare const actions: {
    auth: {
        loginUser: import("@reduxjs/toolkit").AsyncThunk<{
            user: import("..").User;
            token: string;
            refreshToken: string;
            expiresIn: number;
        }, import("..").LoginCredentials, {
            state: import("../types").RootState;
            dispatch: import("../types").AppDispatch;
            rejectValue: import("..").ApiError;
            extra?: unknown;
            serializedErrorType?: unknown;
            pendingMeta?: unknown;
            fulfilledMeta?: unknown;
            rejectedMeta?: unknown;
        }>;
        registerUser: import("@reduxjs/toolkit").AsyncThunk<{
            user: import("..").User;
            token: string;
            refreshToken: string;
            expiresIn: number;
        }, import("..").RegisterData, {
            state: import("../types").RootState;
            dispatch: import("../types").AppDispatch;
            rejectValue: import("..").ApiError;
            extra?: unknown;
            serializedErrorType?: unknown;
            pendingMeta?: unknown;
            fulfilledMeta?: unknown;
            rejectedMeta?: unknown;
        }>;
        logoutUser: import("@reduxjs/toolkit").AsyncThunk<void, void, {
            state: import("../types").RootState;
            dispatch: import("../types").AppDispatch;
            rejectValue: import("..").ApiError;
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
            state: import("../types").RootState;
            dispatch: import("../types").AppDispatch;
            rejectValue: import("..").ApiError;
            extra?: unknown;
            serializedErrorType?: unknown;
            pendingMeta?: unknown;
            fulfilledMeta?: unknown;
            rejectedMeta?: unknown;
        }>;
        loadUserFromToken: import("@reduxjs/toolkit").AsyncThunk<import("..").User, void, {
            state: import("../types").RootState;
            dispatch: import("../types").AppDispatch;
            rejectValue: import("..").ApiError;
            extra?: unknown;
            serializedErrorType?: unknown;
            pendingMeta?: unknown;
            fulfilledMeta?: unknown;
            rejectedMeta?: unknown;
        }>;
        updateUserProfile: import("@reduxjs/toolkit").AsyncThunk<import("..").User, Partial<import("..").User>, {
            state: import("../types").RootState;
            dispatch: import("../types").AppDispatch;
            rejectValue: import("..").ApiError;
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
        updateUserPreferences: import("@reduxjs/toolkit").ActionCreatorWithPayload<Partial<import("..").UserPreferences>, "auth/updateUserPreferences">;
        forceLogout: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"auth/forceLogout">;
    };
    ui: {
        setTheme: import("@reduxjs/toolkit").ActionCreatorWithPayload<"light" | "dark" | "system", "ui/setTheme">;
        toggleTheme: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/toggleTheme">;
        setSidebarOpen: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "ui/setSidebarOpen">;
        toggleSidebar: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/toggleSidebar">;
        setMobileMenuOpen: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "ui/setMobileMenuOpen">;
        toggleMobileMenu: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/toggleMobileMenu">;
        addNotification: import("@reduxjs/toolkit").ActionCreatorWithPayload<Omit<import("..").Notification, "id" | "createdAt">, "ui/addNotification">;
        removeNotification: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "ui/removeNotification">;
        clearNotifications: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/clearNotifications">;
        clearNotificationsByType: import("@reduxjs/toolkit").ActionCreatorWithPayload<"success" | "error" | "warning" | "info", "ui/clearNotificationsByType">;
        updateNotification: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
            id: string;
            updates: Partial<import("..").Notification>;
        }, "ui/updateNotification">;
        openModal: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
            id: string;
            data?: any;
            options?: import("..").ModalOptions;
        }, "ui/openModal">;
        closeModal: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "ui/closeModal">;
        closeAllModals: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/closeAllModals">;
        updateModalData: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
            id: string;
            data: any;
        }, "ui/updateModalData">;
        updateModalOptions: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
            id: string;
            options: Partial<import("..").ModalOptions>;
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
            theme?: import("..").UIState["theme"];
            sidebarOpen?: boolean;
            mobileMenuOpen?: boolean;
            loading?: Record<string, boolean>;
            errors?: Record<string, string | null>;
        }, "ui/batchUIUpdates">;
        showSuccessNotification: (message: string, title?: string) => {
            payload: Omit<import("..").Notification, "id" | "createdAt">;
            type: "ui/addNotification";
        };
        showErrorNotification: (message: string, title?: string) => {
            payload: Omit<import("..").Notification, "id" | "createdAt">;
            type: "ui/addNotification";
        };
        showWarningNotification: (message: string, title?: string) => {
            payload: Omit<import("..").Notification, "id" | "createdAt">;
            type: "ui/addNotification";
        };
        showInfoNotification: (message: string, title?: string) => {
            payload: Omit<import("..").Notification, "id" | "createdAt">;
            type: "ui/addNotification";
        };
        showActionNotification: (message: string, actions: import("..").NotificationAction[], title?: string, type?: import("..").Notification["type"]) => {
            payload: Omit<import("..").Notification, "id" | "createdAt">;
            type: "ui/addNotification";
        };
        showLoadingWithTimeout: (key: string, timeout?: number) => (dispatch: any) => void;
    };
};
export { loginUser, registerUser, logoutUser, refreshToken, loadUserFromToken, updateUserProfile, clearAuthError, updateLastActivity, setSessionExpiry, incrementLoginAttempts, resetLoginAttempts, updateUserPreferences, forceLogout, };
export { setTheme, toggleTheme, setSidebarOpen, toggleSidebar, setMobileMenuOpen, toggleMobileMenu, addNotification, removeNotification, clearNotifications, clearNotificationsByType, updateNotification, openModal, closeModal, closeAllModals, updateModalData, updateModalOptions, setGlobalLoading, setLoading, clearLoading, clearAllLoading, setGlobalError, setError, clearUIError, clearAllErrors, resetUI, batchUIUpdates, showSuccessNotification, showErrorNotification, showWarningNotification, showInfoNotification, showActionNotification, showLoadingWithTimeout, };
export declare const reducers: {
    auth: import("@reduxjs/toolkit").Reducer<import("..").AuthState>;
    ui: import("@reduxjs/toolkit").Reducer<import("..").UIState>;
};
declare const _default: {
    slices: {
        auth: import("@reduxjs/toolkit").Slice<import("..").AuthState, {
            clearError: (state: import("immer").WritableDraft<import("..").AuthState>) => void;
            updateLastActivity: (state: import("immer").WritableDraft<import("..").AuthState>) => void;
            setSessionExpiry: (state: import("immer").WritableDraft<import("..").AuthState>, action: import("@reduxjs/toolkit").PayloadAction<number>) => void;
            incrementLoginAttempts: (state: import("immer").WritableDraft<import("..").AuthState>) => void;
            resetLoginAttempts: (state: import("immer").WritableDraft<import("..").AuthState>) => void;
            updateUserPreferences: (state: import("immer").WritableDraft<import("..").AuthState>, action: import("@reduxjs/toolkit").PayloadAction<Partial<import("..").User["preferences"]>>) => void;
            forceLogout: (state: import("immer").WritableDraft<import("..").AuthState>) => void;
        }, "auth", "auth", import("@reduxjs/toolkit").SliceSelectors<import("..").AuthState>>;
        ui: import("@reduxjs/toolkit").Slice<import("..").UIState, {
            setTheme: (state: import("immer").WritableDraft<import("..").UIState>, action: import("@reduxjs/toolkit").PayloadAction<"light" | "dark" | "system">) => void;
            toggleTheme: (state: import("immer").WritableDraft<import("..").UIState>) => void;
            setSidebarOpen: (state: import("immer").WritableDraft<import("..").UIState>, action: import("@reduxjs/toolkit").PayloadAction<boolean>) => void;
            toggleSidebar: (state: import("immer").WritableDraft<import("..").UIState>) => void;
            setMobileMenuOpen: (state: import("immer").WritableDraft<import("..").UIState>, action: import("@reduxjs/toolkit").PayloadAction<boolean>) => void;
            toggleMobileMenu: (state: import("immer").WritableDraft<import("..").UIState>) => void;
            addNotification: (state: import("immer").WritableDraft<import("..").UIState>, action: import("@reduxjs/toolkit").PayloadAction<Omit<import("..").Notification, "id" | "createdAt">>) => void;
            removeNotification: (state: import("immer").WritableDraft<import("..").UIState>, action: import("@reduxjs/toolkit").PayloadAction<string>) => void;
            clearNotifications: (state: import("immer").WritableDraft<import("..").UIState>) => void;
            clearNotificationsByType: (state: import("immer").WritableDraft<import("..").UIState>, action: import("@reduxjs/toolkit").PayloadAction<import("..").Notification["type"]>) => void;
            updateNotification: (state: import("immer").WritableDraft<import("..").UIState>, action: import("@reduxjs/toolkit").PayloadAction<{
                id: string;
                updates: Partial<import("..").Notification>;
            }>) => void;
            openModal: (state: import("immer").WritableDraft<import("..").UIState>, action: import("@reduxjs/toolkit").PayloadAction<{
                id: string;
                data?: any;
                options?: import("..").ModalOptions;
            }>) => void;
            closeModal: (state: import("immer").WritableDraft<import("..").UIState>, action: import("@reduxjs/toolkit").PayloadAction<string>) => void;
            closeAllModals: (state: import("immer").WritableDraft<import("..").UIState>) => void;
            updateModalData: (state: import("immer").WritableDraft<import("..").UIState>, action: import("@reduxjs/toolkit").PayloadAction<{
                id: string;
                data: any;
            }>) => void;
            updateModalOptions: (state: import("immer").WritableDraft<import("..").UIState>, action: import("@reduxjs/toolkit").PayloadAction<{
                id: string;
                options: Partial<import("..").ModalOptions>;
            }>) => void;
            setGlobalLoading: (state: import("immer").WritableDraft<import("..").UIState>, action: import("@reduxjs/toolkit").PayloadAction<boolean>) => void;
            setLoading: (state: import("immer").WritableDraft<import("..").UIState>, action: import("@reduxjs/toolkit").PayloadAction<{
                key: string;
                loading: boolean;
            }>) => void;
            clearLoading: (state: import("immer").WritableDraft<import("..").UIState>, action: import("@reduxjs/toolkit").PayloadAction<string>) => void;
            clearAllLoading: (state: import("immer").WritableDraft<import("..").UIState>) => void;
            setGlobalError: (state: import("immer").WritableDraft<import("..").UIState>, action: import("@reduxjs/toolkit").PayloadAction<string | null>) => void;
            setError: (state: import("immer").WritableDraft<import("..").UIState>, action: import("@reduxjs/toolkit").PayloadAction<{
                key: string;
                error: string | null;
            }>) => void;
            clearError: (state: import("immer").WritableDraft<import("..").UIState>, action: import("@reduxjs/toolkit").PayloadAction<string>) => void;
            clearAllErrors: (state: import("immer").WritableDraft<import("..").UIState>) => void;
            resetUI: (state: import("immer").WritableDraft<import("..").UIState>) => void;
            batchUIUpdates: (state: import("immer").WritableDraft<import("..").UIState>, action: import("@reduxjs/toolkit").PayloadAction<{
                theme?: import("..").UIState["theme"];
                sidebarOpen?: boolean;
                mobileMenuOpen?: boolean;
                loading?: Record<string, boolean>;
                errors?: Record<string, string | null>;
            }>) => void;
        }, "ui", "ui", import("@reduxjs/toolkit").SliceSelectors<import("..").UIState>>;
    };
    actions: {
        auth: {
            loginUser: import("@reduxjs/toolkit").AsyncThunk<{
                user: import("..").User;
                token: string;
                refreshToken: string;
                expiresIn: number;
            }, import("..").LoginCredentials, {
                state: import("../types").RootState;
                dispatch: import("../types").AppDispatch;
                rejectValue: import("..").ApiError;
                extra?: unknown;
                serializedErrorType?: unknown;
                pendingMeta?: unknown;
                fulfilledMeta?: unknown;
                rejectedMeta?: unknown;
            }>;
            registerUser: import("@reduxjs/toolkit").AsyncThunk<{
                user: import("..").User;
                token: string;
                refreshToken: string;
                expiresIn: number;
            }, import("..").RegisterData, {
                state: import("../types").RootState;
                dispatch: import("../types").AppDispatch;
                rejectValue: import("..").ApiError;
                extra?: unknown;
                serializedErrorType?: unknown;
                pendingMeta?: unknown;
                fulfilledMeta?: unknown;
                rejectedMeta?: unknown;
            }>;
            logoutUser: import("@reduxjs/toolkit").AsyncThunk<void, void, {
                state: import("../types").RootState;
                dispatch: import("../types").AppDispatch;
                rejectValue: import("..").ApiError;
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
                state: import("../types").RootState;
                dispatch: import("../types").AppDispatch;
                rejectValue: import("..").ApiError;
                extra?: unknown;
                serializedErrorType?: unknown;
                pendingMeta?: unknown;
                fulfilledMeta?: unknown;
                rejectedMeta?: unknown;
            }>;
            loadUserFromToken: import("@reduxjs/toolkit").AsyncThunk<import("..").User, void, {
                state: import("../types").RootState;
                dispatch: import("../types").AppDispatch;
                rejectValue: import("..").ApiError;
                extra?: unknown;
                serializedErrorType?: unknown;
                pendingMeta?: unknown;
                fulfilledMeta?: unknown;
                rejectedMeta?: unknown;
            }>;
            updateUserProfile: import("@reduxjs/toolkit").AsyncThunk<import("..").User, Partial<import("..").User>, {
                state: import("../types").RootState;
                dispatch: import("../types").AppDispatch;
                rejectValue: import("..").ApiError;
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
            updateUserPreferences: import("@reduxjs/toolkit").ActionCreatorWithPayload<Partial<import("..").UserPreferences>, "auth/updateUserPreferences">;
            forceLogout: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"auth/forceLogout">;
        };
        ui: {
            setTheme: import("@reduxjs/toolkit").ActionCreatorWithPayload<"light" | "dark" | "system", "ui/setTheme">;
            toggleTheme: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/toggleTheme">;
            setSidebarOpen: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "ui/setSidebarOpen">;
            toggleSidebar: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/toggleSidebar">;
            setMobileMenuOpen: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "ui/setMobileMenuOpen">;
            toggleMobileMenu: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/toggleMobileMenu">;
            addNotification: import("@reduxjs/toolkit").ActionCreatorWithPayload<Omit<import("..").Notification, "id" | "createdAt">, "ui/addNotification">;
            removeNotification: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "ui/removeNotification">;
            clearNotifications: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/clearNotifications">;
            clearNotificationsByType: import("@reduxjs/toolkit").ActionCreatorWithPayload<"success" | "error" | "warning" | "info", "ui/clearNotificationsByType">;
            updateNotification: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
                id: string;
                updates: Partial<import("..").Notification>;
            }, "ui/updateNotification">;
            openModal: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
                id: string;
                data?: any;
                options?: import("..").ModalOptions;
            }, "ui/openModal">;
            closeModal: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "ui/closeModal">;
            closeAllModals: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/closeAllModals">;
            updateModalData: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
                id: string;
                data: any;
            }, "ui/updateModalData">;
            updateModalOptions: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
                id: string;
                options: Partial<import("..").ModalOptions>;
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
                theme?: import("..").UIState["theme"];
                sidebarOpen?: boolean;
                mobileMenuOpen?: boolean;
                loading?: Record<string, boolean>;
                errors?: Record<string, string | null>;
            }, "ui/batchUIUpdates">;
            showSuccessNotification: (message: string, title?: string) => {
                payload: Omit<import("..").Notification, "id" | "createdAt">;
                type: "ui/addNotification";
            };
            showErrorNotification: (message: string, title?: string) => {
                payload: Omit<import("..").Notification, "id" | "createdAt">;
                type: "ui/addNotification";
            };
            showWarningNotification: (message: string, title?: string) => {
                payload: Omit<import("..").Notification, "id" | "createdAt">;
                type: "ui/addNotification";
            };
            showInfoNotification: (message: string, title?: string) => {
                payload: Omit<import("..").Notification, "id" | "createdAt">;
                type: "ui/addNotification";
            };
            showActionNotification: (message: string, actions: import("..").NotificationAction[], title?: string, type?: import("..").Notification["type"]) => {
                payload: Omit<import("..").Notification, "id" | "createdAt">;
                type: "ui/addNotification";
            };
            showLoadingWithTimeout: (key: string, timeout?: number) => (dispatch: any) => void;
        };
    };
    reducers: {
        auth: import("@reduxjs/toolkit").Reducer<import("..").AuthState>;
        ui: import("@reduxjs/toolkit").Reducer<import("..").UIState>;
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map