/**
 * Redux Providers
 *
 * React components that provide Redux context to applications.
 * These providers handle store initialization, persistence, and
 * development tools integration.
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store';
import { loadUserFromToken } from '../slices/auth';
// ============================================================================
// Store Initializer Component
// ============================================================================
/**
 * Component that handles initial store setup and user authentication
 */
const StoreInitializer = ({ children, store }) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [initError, setInitError] = useState(null);
    useEffect(() => {
        const initializeStore = async () => {
            try {
                // Check if we have a stored token and try to load user
                const token = localStorage.getItem('encreasl_token');
                if (token) {
                    // Dispatch action to load user from token
                    await store.dispatch(loadUserFromToken());
                }
                // Mark as initialized
                setIsInitialized(true);
            }
            catch (error) {
                console.error('Failed to initialize store:', error);
                setInitError(error instanceof Error ? error.message : 'Unknown error');
                setIsInitialized(true); // Still mark as initialized to prevent infinite loading
            }
        };
        initializeStore();
    }, [store]);
    // Show loading state during initialization
    if (!isInitialized) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen bg-gray-50", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Initializing application..." })] }) }));
    }
    // Show error state if initialization failed
    if (initError) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen bg-gray-50", children: _jsxs("div", { className: "text-center max-w-md mx-auto p-6", children: [_jsx("div", { className: "text-red-500 text-6xl mb-4", children: "\u26A0\uFE0F" }), _jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-2", children: "Initialization Error" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Failed to initialize the application. Please refresh the page or contact support." }), _jsx("p", { className: "text-sm text-gray-500 bg-gray-100 p-2 rounded", children: initError }), _jsx("button", { onClick: () => window.location.reload(), className: "mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors", children: "Refresh Page" })] }) }));
    }
    return _jsx(_Fragment, { children: children });
};
// ============================================================================
// Loading Component
// ============================================================================
const DefaultLoadingComponent = () => (_jsx("div", { className: "flex items-center justify-center min-h-screen bg-gray-50", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading application state..." })] }) }));
// ============================================================================
// Error Component
// ============================================================================
const DefaultErrorComponent = ({ error }) => (_jsx("div", { className: "flex items-center justify-center min-h-screen bg-gray-50", children: _jsxs("div", { className: "text-center max-w-md mx-auto p-6", children: [_jsx("div", { className: "text-red-500 text-6xl mb-4", children: "\u274C" }), _jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-2", children: "Application Error" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Something went wrong while loading the application." }), error && (_jsx("p", { className: "text-sm text-gray-500 bg-gray-100 p-2 rounded mb-4", children: error })), _jsx("button", { onClick: () => window.location.reload(), className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors", children: "Reload Application" })] }) }));
// ============================================================================
// Main Redux Provider
// ============================================================================
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
export const ReduxProvider = ({ children, customStore, enablePersistence = true, loadingComponent, errorComponent, }) => {
    const [hydrationError] = useState(null);
    const storeToUse = customStore || store;
    const LoadingComponent = loadingComponent || _jsx(DefaultLoadingComponent, {});
    const ErrorComponent = errorComponent || _jsx(DefaultErrorComponent, { error: hydrationError || undefined });
    // Handle persistence errors (for future use)
    // const handlePersistError = (error: Error) => {
    //   console.error('Redux Persist Error:', error);
    //   setHydrationError(error.message);
    //
    //   // In development, show the error
    //   if (process.env.NODE_ENV === 'development') {
    //     console.error('Persistence failed, clearing storage and reloading...');
    //     localStorage.clear();
    //     sessionStorage.clear();
    //   }
    // };
    // If persistence is disabled, just use the basic provider
    if (!enablePersistence) {
        return (_jsx(Provider, { store: storeToUse, children: _jsx(StoreInitializer, { store: storeToUse, children: children }) }));
    }
    // Show error component if hydration failed
    if (hydrationError) {
        return ErrorComponent;
    }
    return (_jsx(Provider, { store: storeToUse, children: React.createElement(PersistGate, {
            loading: LoadingComponent,
            persistor: persistor,
            onBeforeLift: () => {
                // Optional: Perform any actions before rehydration
                console.log('🔄 Rehydrating Redux store...');
            },
            children: (_jsx(StoreInitializer, { store: storeToUse, children: children }))
        }) }));
};
// ============================================================================
// Specialized Providers
// ============================================================================
/**
 * Minimal Redux Provider without persistence (useful for testing or SSR)
 */
export const MinimalReduxProvider = ({ children, store: customStore, }) => {
    const storeToUse = customStore || store;
    return (_jsx(Provider, { store: storeToUse, children: children }));
};
/**
 * Development Redux Provider with enhanced debugging
 */
export const DevReduxProvider = ({ children }) => {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Add global store access for debugging
            window.__REDUX_STORE__ = store;
            window.__REDUX_PERSISTOR__ = persistor;
            console.log('🔧 Development Redux Provider loaded');
            console.log('📦 Store:', store.getState());
        }
    }, []);
    return (_jsx(ReduxProvider, { enableDevTools: true, children: children }));
};
/**
 * Production Redux Provider with optimized settings
 */
export const ProductionReduxProvider = ({ children }) => {
    return (_jsx(ReduxProvider, { enableDevTools: false, loadingComponent: _jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx("div", { className: "animate-pulse text-gray-400", children: "Loading..." }) }), children: children }));
};
// ============================================================================
// HOC for Redux Integration
// ============================================================================
/**
 * Higher-Order Component that wraps a component with Redux Provider
 */
export const withRedux = (Component, options) => {
    const WrappedComponent = (props) => (_jsx(ReduxProvider, { ...options, children: React.createElement(Component, props) }));
    WrappedComponent.displayName = `withRedux(${Component.displayName || Component.name})`;
    return WrappedComponent;
};
// ============================================================================
// Utility Functions
// ============================================================================
/**
 * Get the current store instance (useful for testing or advanced use cases)
 */
export const getStore = () => store;
/**
 * Get the current persistor instance
 */
export const getPersistor = () => persistor;
/**
 * Reset the entire Redux store and persistence
 */
export const resetReduxStore = async () => {
    try {
        // Purge persisted state
        await persistor.purge();
        // Clear localStorage
        localStorage.removeItem('encreasl_token');
        localStorage.removeItem('encreasl_refresh_token');
        // Dispatch reset action
        store.dispatch({ type: 'RESET_STORE' });
        console.log('✅ Redux store reset successfully');
    }
    catch (error) {
        console.error('❌ Failed to reset Redux store:', error);
        throw error;
    }
};
// ============================================================================
// Default Export
// ============================================================================
export default ReduxProvider;
