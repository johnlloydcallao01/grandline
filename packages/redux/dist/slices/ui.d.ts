/**
 * UI Slice
 *
 * Manages global UI state including theme, notifications, modals,
 * loading states, and error handling for the Encreasl platform.
 */
import { PayloadAction } from '@reduxjs/toolkit';
import type { UIState, Notification, ModalOptions, NotificationAction } from '../types';
declare const uiSlice: import("@reduxjs/toolkit").Slice<UIState, {
    setTheme: (state: import("immer").WritableDraft<UIState>, action: PayloadAction<"light" | "dark" | "system">) => void;
    toggleTheme: (state: import("immer").WritableDraft<UIState>) => void;
    setSidebarOpen: (state: import("immer").WritableDraft<UIState>, action: PayloadAction<boolean>) => void;
    toggleSidebar: (state: import("immer").WritableDraft<UIState>) => void;
    setMobileMenuOpen: (state: import("immer").WritableDraft<UIState>, action: PayloadAction<boolean>) => void;
    toggleMobileMenu: (state: import("immer").WritableDraft<UIState>) => void;
    addNotification: (state: import("immer").WritableDraft<UIState>, action: PayloadAction<Omit<Notification, "id" | "createdAt">>) => void;
    removeNotification: (state: import("immer").WritableDraft<UIState>, action: PayloadAction<string>) => void;
    clearNotifications: (state: import("immer").WritableDraft<UIState>) => void;
    clearNotificationsByType: (state: import("immer").WritableDraft<UIState>, action: PayloadAction<Notification["type"]>) => void;
    updateNotification: (state: import("immer").WritableDraft<UIState>, action: PayloadAction<{
        id: string;
        updates: Partial<Notification>;
    }>) => void;
    openModal: (state: import("immer").WritableDraft<UIState>, action: PayloadAction<{
        id: string;
        data?: any;
        options?: ModalOptions;
    }>) => void;
    closeModal: (state: import("immer").WritableDraft<UIState>, action: PayloadAction<string>) => void;
    closeAllModals: (state: import("immer").WritableDraft<UIState>) => void;
    updateModalData: (state: import("immer").WritableDraft<UIState>, action: PayloadAction<{
        id: string;
        data: any;
    }>) => void;
    updateModalOptions: (state: import("immer").WritableDraft<UIState>, action: PayloadAction<{
        id: string;
        options: Partial<ModalOptions>;
    }>) => void;
    setGlobalLoading: (state: import("immer").WritableDraft<UIState>, action: PayloadAction<boolean>) => void;
    setLoading: (state: import("immer").WritableDraft<UIState>, action: PayloadAction<{
        key: string;
        loading: boolean;
    }>) => void;
    clearLoading: (state: import("immer").WritableDraft<UIState>, action: PayloadAction<string>) => void;
    clearAllLoading: (state: import("immer").WritableDraft<UIState>) => void;
    setGlobalError: (state: import("immer").WritableDraft<UIState>, action: PayloadAction<string | null>) => void;
    setError: (state: import("immer").WritableDraft<UIState>, action: PayloadAction<{
        key: string;
        error: string | null;
    }>) => void;
    clearError: (state: import("immer").WritableDraft<UIState>, action: PayloadAction<string>) => void;
    clearAllErrors: (state: import("immer").WritableDraft<UIState>) => void;
    resetUI: (state: import("immer").WritableDraft<UIState>) => void;
    batchUIUpdates: (state: import("immer").WritableDraft<UIState>, action: PayloadAction<{
        theme?: UIState["theme"];
        sidebarOpen?: boolean;
        mobileMenuOpen?: boolean;
        loading?: Record<string, boolean>;
        errors?: Record<string, string | null>;
    }>) => void;
}, "ui", "ui", import("@reduxjs/toolkit").SliceSelectors<UIState>>;
export declare const showSuccessNotification: (message: string, title?: string) => {
    payload: Omit<Notification, "id" | "createdAt">;
    type: "ui/addNotification";
};
export declare const showErrorNotification: (message: string, title?: string) => {
    payload: Omit<Notification, "id" | "createdAt">;
    type: "ui/addNotification";
};
export declare const showWarningNotification: (message: string, title?: string) => {
    payload: Omit<Notification, "id" | "createdAt">;
    type: "ui/addNotification";
};
export declare const showInfoNotification: (message: string, title?: string) => {
    payload: Omit<Notification, "id" | "createdAt">;
    type: "ui/addNotification";
};
export declare const showActionNotification: (message: string, actions: NotificationAction[], title?: string, type?: Notification["type"]) => {
    payload: Omit<Notification, "id" | "createdAt">;
    type: "ui/addNotification";
};
export declare const showLoadingWithTimeout: (key: string, timeout?: number) => (dispatch: any) => void;
export declare const setTheme: import("@reduxjs/toolkit").ActionCreatorWithPayload<"light" | "dark" | "system", "ui/setTheme">, toggleTheme: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/toggleTheme">, setSidebarOpen: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "ui/setSidebarOpen">, toggleSidebar: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/toggleSidebar">, setMobileMenuOpen: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "ui/setMobileMenuOpen">, toggleMobileMenu: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/toggleMobileMenu">, addNotification: import("@reduxjs/toolkit").ActionCreatorWithPayload<Omit<Notification, "id" | "createdAt">, "ui/addNotification">, removeNotification: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "ui/removeNotification">, clearNotifications: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/clearNotifications">, clearNotificationsByType: import("@reduxjs/toolkit").ActionCreatorWithPayload<"success" | "error" | "warning" | "info", "ui/clearNotificationsByType">, updateNotification: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    id: string;
    updates: Partial<Notification>;
}, "ui/updateNotification">, openModal: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    id: string;
    data?: any;
    options?: ModalOptions;
}, "ui/openModal">, closeModal: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "ui/closeModal">, closeAllModals: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/closeAllModals">, updateModalData: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    id: string;
    data: any;
}, "ui/updateModalData">, updateModalOptions: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    id: string;
    options: Partial<ModalOptions>;
}, "ui/updateModalOptions">, setGlobalLoading: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "ui/setGlobalLoading">, setLoading: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    key: string;
    loading: boolean;
}, "ui/setLoading">, clearLoading: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "ui/clearLoading">, clearAllLoading: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/clearAllLoading">, setGlobalError: import("@reduxjs/toolkit").ActionCreatorWithPayload<string | null, "ui/setGlobalError">, setError: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    key: string;
    error: string | null;
}, "ui/setError">, clearError: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "ui/clearError">, clearAllErrors: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/clearAllErrors">, resetUI: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/resetUI">, batchUIUpdates: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    theme?: UIState["theme"];
    sidebarOpen?: boolean;
    mobileMenuOpen?: boolean;
    loading?: Record<string, boolean>;
    errors?: Record<string, string | null>;
}, "ui/batchUIUpdates">;
export default uiSlice;
//# sourceMappingURL=ui.d.ts.map