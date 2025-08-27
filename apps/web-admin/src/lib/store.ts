/**
 * Web Admin Redux Store Configuration
 * 
 * Specialized store configuration for the web-admin app that includes
 * both the shared Redux package and admin-specific API endpoints.
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import shared Redux components
import { authSlice, uiSlice } from '@encreasl/redux';
import { createAsyncThunk } from '@reduxjs/toolkit';

// Import admin-specific API
import { adminApi } from './admin-api';

// ============================================================================
// PayloadCMS Authentication Integration
// ============================================================================

interface PayloadLoginCredentials {
  email: string;
  password: string;
}

interface PayloadUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'instructor' | 'trainee';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Professional PayloadCMS Login Thunk
 * Integrates PayloadCMS authentication with Redux state management
 */
export const loginWithPayloadCMS = createAsyncThunk<
  { user: PayloadUser; token: string; expiresIn: number },
  PayloadLoginCredentials,
  { rejectValue: { message: string; status: number } }
>(
  'auth/loginWithPayloadCMS',
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      console.log('🔐 Professional PayloadCMS login initiated...');

      // Use the adminApi login mutation
      const result = await dispatch(adminApi.endpoints.login.initiate(credentials));

      if ('error' in result) {
        console.error('❌ PayloadCMS login failed:', result.error);
        return rejectWithValue({
          message: (result.error as any)?.data?.message || 'Authentication failed',
          status: (result.error as any)?.status || 401,
        });
      }

      const { user, token, exp } = result.data;

      console.log('✅ PayloadCMS login successful:', {
        email: user.email,
        role: user.role,
        isActive: user.isActive
      });

      // Store token in localStorage for persistence
      // Note: PayloadCMS only provides a single JWT token, no refresh token
      if (typeof window !== 'undefined') {
        localStorage.setItem('encreasl_token', token);
        localStorage.setItem('admin_user', JSON.stringify(user));
      }

      // Calculate expiration time (default to 24 hours if not provided)
      const expiresIn = exp ? (exp * 1000 - Date.now()) / 1000 : 24 * 60 * 60;

      return {
        user: {
          id: user.id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        } as any, // Cast to match shared Redux User type
        token,
        expiresIn,
      };
    } catch (error) {
      console.error('🚨 PayloadCMS login error:', error);
      return rejectWithValue({
        message: error instanceof Error ? error.message : 'Authentication failed',
        status: 500,
      });
    }
  }
);

// ============================================================================
// Persistence Configuration
// ============================================================================

// Auth-specific persistence config
const authPersistConfig = {
  key: 'admin-auth',
  storage,
  // Only persist essential auth data
  whitelist: ['user', 'token', 'refreshToken', 'isAuthenticated'],
  // Don't persist temporary states
  blacklist: ['isLoading', 'error', 'loginAttempts'],
};

// UI-specific persistence config  
const uiPersistConfig = {
  key: 'admin-ui',
  storage,
  // Only persist user preferences
  whitelist: ['theme', 'sidebarOpen'],
  // Don't persist temporary UI states
  blacklist: ['notifications', 'modals', 'loading', 'errors', 'mobileMenuOpen'],
};

// Create persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authSlice.reducer);
const persistedUiReducer = persistReducer(uiPersistConfig, uiSlice.reducer);

const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  ui: persistedUiReducer,
  adminApi: adminApi.reducer,
});

// ============================================================================
// Store Configuration
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const store: any = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignore non-serializable values in specific paths
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates'],
      },
      // Enable immutability and serializability checks in development
      immutableCheck: process.env.NODE_ENV === 'development',
    })
      // Add RTK Query middleware for admin API
      .concat(adminApi.middleware),
  
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV === 'development' && {
    name: 'Web Admin Redux Store',
    trace: true,
    traceLimit: 25,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actionSanitizer: (action: any) => ({
      ...action,
      // Sanitize sensitive data in dev tools
      payload: action.type.includes('auth') && action.payload?.password
        ? { ...action.payload, password: '[REDACTED]' }
        : action.payload,
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stateSanitizer: (state: any) => ({
      ...state,
      // Sanitize sensitive data in dev tools
      auth: {
        ...state.auth,
        token: state.auth.token ? '[REDACTED]' : null,
        refreshToken: state.auth.refreshToken ? '[REDACTED]' : null,
      },
    }),
  },
});

// Setup RTK Query listeners for automatic refetching
setupListeners(store.dispatch);

// Create persistor
export const persistor = persistStore(store);

// ============================================================================
// Types
// ============================================================================

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

// ============================================================================
// Exports
// ============================================================================

export default store;
