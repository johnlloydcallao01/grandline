'use client';

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/lib/store';

// ============================================================================
// Types
// ============================================================================

export interface AdminReduxProviderProps {
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}

// ============================================================================
// Loading Components
// ============================================================================

const DefaultLoadingComponent: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">Loading Admin Dashboard...</p>
      <p className="text-gray-400 text-sm mt-2">Initializing authentication and data...</p>
    </div>
  </div>
);

const DefaultErrorComponent: React.FC<{ error?: string }> = ({ error }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard Error</h1>
      <p className="text-gray-600 mb-4">
        {error || 'Failed to initialize the admin dashboard. Please refresh the page.'}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Refresh Page
      </button>
    </div>
  </div>
);

// ============================================================================
// Store Initializer
// ============================================================================

interface StoreInitializerProps {
  children: React.ReactNode;
}

const StoreInitializer: React.FC<StoreInitializerProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize store and load any persisted authentication
    const initializeStore = async () => {
      try {
        // Any additional initialization logic can go here
        setIsInitialized(true);
      } catch (error) {
        console.error('Store initialization error:', error);
        setIsInitialized(true); // Still allow the app to load
      }
    };

    initializeStore();
  }, []);

  if (!isInitialized) {
    return <DefaultLoadingComponent />;
  }

  return <>{children}</>;
};

// ============================================================================
// Main Provider Component
// ============================================================================

/**
 * Admin Redux Provider component that wraps the web-admin app with Redux context
 * 
 * Features:
 * - Admin-specific Redux store with adminApi
 * - Redux Persist integration for auth and UI state
 * - Automatic store initialization
 * - Loading and error states
 * - Development tools integration
 */
export const AdminReduxProvider: React.FC<AdminReduxProviderProps> = ({
  children,
  loadingComponent,
  errorComponent,
}) => {
  const [hydrationError] = useState<string | null>(null);
  
  const LoadingComponent = loadingComponent || <DefaultLoadingComponent />;
  const ErrorComponent = errorComponent || <DefaultErrorComponent error={hydrationError || undefined} />;

  // Handle persistence errors (for future use)
  // const handlePersistError = (error: Error) => {
  //   console.error('Redux Persist Error:', error);
  //   setHydrationError(error.message);

  //   // In development, show the error
  //   if (process.env.NODE_ENV === 'development') {
  //     console.error('Persistence failed, clearing storage and reloading...');
  //     localStorage.clear();
  //     sessionStorage.clear();
  //   }
  // };

  // Show error component if hydration failed
  if (hydrationError) {
    return ErrorComponent;
  }

  return (
    <Provider store={store}>
      <PersistGate
        loading={LoadingComponent}
        persistor={persistor}
        onBeforeLift={() => {
          // Any pre-hydration logic
          console.log('🔄 Admin store hydrating...');
        }}
      >
        <StoreInitializer>
          {children}
        </StoreInitializer>
      </PersistGate>
    </Provider>
  );
};

// ============================================================================
// Development Provider
// ============================================================================

/**
 * Development Admin Redux Provider with enhanced debugging
 */
export const DevAdminReduxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Add global store access for debugging
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__ADMIN_REDUX_STORE__ = store;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__ADMIN_REDUX_PERSISTOR__ = persistor;
      
      console.log('🔧 Development Admin Redux Provider loaded');
      console.log('📦 Admin Store:', store.getState());
    }
  }, []);

  return (
    <AdminReduxProvider>
      {children}
    </AdminReduxProvider>
  );
};

export default AdminReduxProvider;
