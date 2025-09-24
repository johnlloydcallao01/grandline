/**
 * Redux Selectors
 *
 * Centralized selectors for accessing Redux state with memoization
 * and computed values for optimal performance.
 */
import { createSelector } from '@reduxjs/toolkit';
// ============================================================================
// Auth Selectors
// ============================================================================
// Base auth selectors
export const selectAuth = (state) => state.auth;
export const selectAuthUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.token;
export const selectAuthIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
// Computed auth selectors
export const selectUserFullName = createSelector([selectAuthUser], (user) => {
    if (!user)
        return null;
    const { firstName, middleName, lastName, nameExtension } = user;
    const parts = [firstName, middleName, lastName, nameExtension].filter(Boolean);
    return parts.join(' ');
});
export const selectUserInitials = createSelector([selectAuthUser], (user) => {
    if (!user)
        return '';
    const { firstName, lastName } = user;
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
});
export const selectUserPermissions = createSelector([selectAuthUser], (user) => user?.permissions || []);
export const selectUserRole = createSelector([selectAuthUser], (user) => user?.role || 'guest');
export const selectIsAdmin = createSelector([selectUserRole], (role) => role === 'admin');
export const selectIsInstructor = createSelector([selectUserRole], (role) => role === 'instructor');
export const selectIsStudent = createSelector([selectUserRole], (role) => role === 'student');
export const selectUserPreferences = createSelector([selectAuthUser], (user) => user?.preferences || {
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    notifications: {
        email: true,
        push: true,
        sms: false,
        inApp: true,
        marketing: false,
    },
    accessibility: {
        reducedMotion: false,
        highContrast: false,
        fontSize: 'medium',
        screenReader: false,
    },
});
export const selectSessionExpiry = createSelector([selectAuth], (auth) => auth.sessionExpiry);
export const selectIsSessionExpired = createSelector([selectSessionExpiry], (expiry) => {
    if (!expiry)
        return false;
    return Date.now() > expiry;
});
export const selectTimeUntilExpiry = createSelector([selectSessionExpiry], (expiry) => {
    if (!expiry)
        return null;
    const timeLeft = expiry - Date.now();
    return timeLeft > 0 ? timeLeft : 0;
});
// ============================================================================
// UI Selectors
// ============================================================================
// Base UI selectors
export const selectUI = (state) => state.ui;
export const selectUITheme = (state) => state.ui.theme;
export const selectUISidebarOpen = (state) => state.ui.sidebarOpen;
export const selectUIMobileMenuOpen = (state) => state.ui.mobileMenuOpen;
export const selectUINotifications = (state) => state.ui.notifications;
export const selectUIModals = (state) => state.ui.modals;
export const selectUILoading = (state) => state.ui.loading;
export const selectUIErrors = (state) => state.ui.errors;
// Computed UI selectors
export const selectUnreadNotifications = createSelector([selectUINotifications], (notifications) => notifications.filter((n) => !n.persistent));
export const selectUnreadNotificationCount = createSelector([selectUnreadNotifications], (notifications) => notifications.length);
export const selectNotificationsByType = createSelector([selectUINotifications], (notifications) => {
    return notifications.reduce((acc, notification) => {
        const type = notification.type;
        if (!acc[type])
            acc[type] = [];
        acc[type].push(notification);
        return acc;
    }, {});
});
export const selectActiveModals = createSelector([selectUIModals], (modals) => Object.keys(modals).filter(key => modals[key].isOpen));
export const selectIsAnyModalOpen = createSelector([selectActiveModals], (activeModals) => activeModals.length > 0);
export const selectModalState = (modalId) => createSelector([selectUIModals], (modals) => modals[modalId] || { isOpen: false, data: null, options: {} });
export const selectGlobalLoading = createSelector([selectUILoading], (loading) => loading.global);
export const selectLoadingState = (key) => createSelector([selectUILoading], (loading) => loading[key] || false);
export const selectGlobalError = createSelector([selectUIErrors], (errors) => errors.global);
export const selectErrorState = (key) => createSelector([selectUIErrors], (errors) => errors[key] || null);
export const selectIsLoading = createSelector([selectUILoading], (loading) => Object.values(loading).some(Boolean));
export const selectHasErrors = createSelector([selectUIErrors], (errors) => Object.values(errors).some(Boolean));
// ============================================================================
// Combined Selectors
// ============================================================================
export const selectUserTheme = createSelector([selectUserPreferences, selectUITheme], (preferences, uiTheme) => {
    // User preference takes precedence over UI state
    return preferences.theme !== 'system' ? preferences.theme : uiTheme;
});
export const selectEffectiveTheme = createSelector([selectUserTheme], (theme) => {
    if (theme === 'system') {
        // Detect system theme preference
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light'; // Default fallback
    }
    return theme;
});
export const selectUserNotificationPreferences = createSelector([selectUserPreferences], (preferences) => preferences.notifications);
export const selectUserAccessibilityPreferences = createSelector([selectUserPreferences], (preferences) => preferences.accessibility);
export const selectShouldShowNotification = (type) => createSelector([selectUserNotificationPreferences], (preferences) => preferences[type]);
// ============================================================================
// API Selectors (RTK Query)
// ============================================================================
// These will be automatically generated by RTK Query
// but we can create custom selectors for complex queries
export const selectApiState = (state) => state.api;
export const selectApiQueries = createSelector([selectApiState], (api) => api.queries);
export const selectApiMutations = createSelector([selectApiState], (api) => api.mutations);
export const selectApiSubscriptions = createSelector([selectApiState], (api) => api.subscriptions);
// ============================================================================
// Performance Selectors
// ============================================================================
// Selectors for monitoring app performance
export const selectPendingQueries = createSelector([selectApiQueries], (queries) => Object.values(queries).filter((query) => query?.status === 'pending').length);
export const selectFailedQueries = createSelector([selectApiQueries], (queries) => Object.values(queries).filter((query) => query?.status === 'rejected').length);
export const selectCachedQueries = createSelector([selectApiQueries], (queries) => Object.values(queries).filter((query) => query?.status === 'fulfilled').length);
// ============================================================================
// Utility Selectors
// ============================================================================
// Create a selector factory for dynamic selectors
export const createDynamicSelector = (selector) => {
    const memoizedSelectors = new Map();
    return (props) => {
        const key = JSON.stringify(props);
        if (!memoizedSelectors.has(key)) {
            memoizedSelectors.set(key, createSelector([(state) => selector(state, props)], (result) => result));
        }
        return memoizedSelectors.get(key);
    };
};
// Example usage of dynamic selector
export const selectUserById = createDynamicSelector((state, userId) => {
    // This would typically come from a users slice or API cache
    return state.auth.user?.id === userId ? state.auth.user : null;
});
