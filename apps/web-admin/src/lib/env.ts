/**
 * Environment Configuration for Admin App
 * Uses direct process.env access like the working web app
 */

// Simple, direct environment access - no complex validation that breaks
export const env = {
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Encreasl Admin Dashboard',
  NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  NEXT_PUBLIC_FIREBASE_VAPID_KEY: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  NEXT_PUBLIC_ENABLE_USER_MANAGEMENT: process.env.NEXT_PUBLIC_ENABLE_USER_MANAGEMENT === 'true',
  NEXT_PUBLIC_ENABLE_ANALYTICS_DASHBOARD: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS_DASHBOARD === 'true',
  NEXT_PUBLIC_ENABLE_CONTENT_MANAGEMENT: process.env.NEXT_PUBLIC_ENABLE_CONTENT_MANAGEMENT === 'true',
  NEXT_PUBLIC_ENABLE_CAMPAIGN_MANAGEMENT: process.env.NEXT_PUBLIC_ENABLE_CAMPAIGN_MANAGEMENT === 'true',
  NEXT_PUBLIC_REQUIRE_2FA: process.env.NEXT_PUBLIC_REQUIRE_2FA === 'true',
  NEXT_PUBLIC_SESSION_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '3600', 10),
  NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS: parseInt(process.env.NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS || '5', 10),
  NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
  NEXT_PUBLIC_SHOW_DEV_TOOLS: process.env.NEXT_PUBLIC_SHOW_DEV_TOOLS === 'true',

  // CMS Configuration
  NEXT_PUBLIC_CMS_API_URL: process.env.NEXT_PUBLIC_CMS_API_URL || 'http://localhost:3001/api',
  NEXT_PUBLIC_CMS_SERVER_URL: process.env.NEXT_PUBLIC_CMS_SERVER_URL || 'http://localhost:3001',
};

// Export commonly used environment variables for easy access
export const {
  NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_VERSION,
  NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_REQUIRE_2FA,
  NEXT_PUBLIC_SESSION_TIMEOUT,
  NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS,
  NEXT_PUBLIC_DEBUG_MODE,
  NEXT_PUBLIC_SHOW_DEV_TOOLS,
} = env;

// Helper functions for common environment checks
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test';



// App configuration
export const appConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  version: env.NEXT_PUBLIC_APP_VERSION,
  url: env.NEXT_PUBLIC_APP_URL,
};

// Admin-specific feature flags
export const adminFeatures = {
  userManagement: env.NEXT_PUBLIC_ENABLE_USER_MANAGEMENT,
  analyticsDashboard: env.NEXT_PUBLIC_ENABLE_ANALYTICS_DASHBOARD,
  contentManagement: env.NEXT_PUBLIC_ENABLE_CONTENT_MANAGEMENT,
  campaignManagement: env.NEXT_PUBLIC_ENABLE_CAMPAIGN_MANAGEMENT,
  debug: env.NEXT_PUBLIC_DEBUG_MODE,
  devTools: env.NEXT_PUBLIC_SHOW_DEV_TOOLS,
};

// Security configuration (client-side only)
export const securityConfig = {
  requireTwoFA: env.NEXT_PUBLIC_REQUIRE_2FA,
  sessionTimeout: env.NEXT_PUBLIC_SESSION_TIMEOUT,
  maxLoginAttempts: env.NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS,
};


