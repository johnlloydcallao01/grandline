/**
 * User Types and Interfaces
 * 
 * Comprehensive type definitions for regular users in the Encreasl platform.
 * These types follow the same patterns as admin types but are tailored for end users.
 */

import { Timestamp } from 'firebase-admin/firestore';

// ========================================
// CORE USER INTERFACES
// ========================================

export interface User {
  // === IDENTITY ===
  id: string;                    // Document ID (matches Firebase Auth UID)
  email: string;                 // Primary email (indexed)
  displayName: string;           // Full name or chosen display name
  username?: string;             // Optional username (indexed, unique)
  
  // === AUTHENTICATION ===
  authProvider: 'email' | 'google' | 'facebook' | 'apple';
  emailVerified: boolean;
  phoneNumber?: string;
  photoURL?: string;
  
  // === PROFILE ===
  firstName?: string;
  lastName?: string;
  bio?: string;                  // User bio/description
  dateOfBirth?: Timestamp;       // Optional birth date
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  
  // === CONTACT ===
  alternateEmail?: string;       // Secondary email
  phoneVerified: boolean;
  address?: UserAddress;
  
  // === STATUS & PERMISSIONS ===
  isActive: boolean;             // Can login and use the platform
  isVerified: boolean;           // Account verification status
  accountType: UserAccountType;
  subscriptionStatus?: UserSubscriptionStatus;
  
  // === ACTIVITY TRACKING ===
  lastLoginAt?: Timestamp;
  lastActiveAt?: Timestamp;
  loginCount: number;
  failedLoginAttempts: number;
  lastFailedLoginAt?: Timestamp;
  passwordChangedAt?: Timestamp;
  
  // === PREFERENCES (Denormalized for performance) ===
  preferences: UserPreferencesCore;
  
  // === SOCIAL & CONNECTIONS ===
  socialProfiles?: UserSocialProfiles;
  
  // === METADATA ===
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string;            // Admin ID if created by admin
  updatedBy?: string;            // Last updated by (user or admin)
  version: number;               // For optimistic locking
  
  // === SOFT DELETE ===
  isDeleted: boolean;
  deletedAt?: Timestamp;
  deletedBy?: string;            // Admin ID who deleted
  deletionReason?: string;
  
  // === ANALYTICS & TRACKING ===
  analytics: UserAnalytics;
  
  // === COMPLIANCE & LEGAL ===
  compliance: UserCompliance;
}

// ========================================
// SUPPORTING INTERFACES
// ========================================

export interface UserAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface UserPreferencesCore {
  theme: 'light' | 'dark' | 'auto';
  language: string;             // ISO code (en, es, fr, etc.)
  timezone: string;             // IANA timezone
  dateFormat: string;           // MM/DD/YYYY, DD/MM/YYYY, etc.
  timeFormat: '12h' | '24h';
  currency: string;             // ISO currency code
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showEmail: boolean;
    showPhone: boolean;
    allowSearchByEmail: boolean;
  };
}

export interface UserSocialProfiles {
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  website?: string;
}

export interface UserAnalytics {
  signupSource?: string;       // 'web', 'mobile', 'referral', etc.
  referralCode?: string;       // How they found the platform
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  firstVisitAt?: Timestamp;
  totalSessions: number;
  totalTimeSpent: number;      // In minutes
}

export interface UserCompliance {
  termsAcceptedAt?: Timestamp;
  privacyPolicyAcceptedAt?: Timestamp;
  marketingConsentAt?: Timestamp;
  dataProcessingConsentAt?: Timestamp;
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
}

// ========================================
// USER PREFERENCES COLLECTION
// ========================================

export interface UserPreferences {
  userId: string;                // Reference to user document
  
  // === UI PREFERENCES ===
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  
  // === NOTIFICATION PREFERENCES ===
  notifications: UserNotificationPreferences;
  
  // === PRIVACY PREFERENCES ===
  privacy: UserPrivacyPreferences;
  
  // === COMMUNICATION PREFERENCES ===
  communication: UserCommunicationPreferences;
  
  // === METADATA ===
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: number;
}

export interface UserNotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  productUpdates: boolean;
  securityAlerts: boolean;
  weeklyDigest: boolean;
  monthlyReport: boolean;
}

export interface UserPrivacyPreferences {
  profileVisibility: 'public' | 'friends' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  allowSearchByEmail: boolean;
  allowDataCollection: boolean;
  allowPersonalization: boolean;
}

export interface UserCommunicationPreferences {
  preferredContactMethod: 'email' | 'phone' | 'sms';
  quietHours: {
    enabled: boolean;
    start: string;             // HH:mm format
    end: string;               // HH:mm format
    timezone: string;
  };
  frequency: {
    marketing: 'daily' | 'weekly' | 'monthly' | 'never';
    updates: 'immediate' | 'daily' | 'weekly' | 'never';
  };
}

// ========================================
// UTILITY TYPES
// ========================================

export type UserAccountType = 'free' | 'premium' | 'enterprise';

export type UserSubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';

export type UserAuthProvider = 'email' | 'google' | 'facebook' | 'apple';

export type UserGender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

export type UserProfileVisibility = 'public' | 'friends' | 'private';

export type UserContactMethod = 'email' | 'phone' | 'sms';

export type UserNotificationFrequency = 'daily' | 'weekly' | 'monthly' | 'never';

export type UserUpdateFrequency = 'immediate' | 'daily' | 'weekly' | 'never';

// ========================================
// REQUEST/RESPONSE INTERFACES
// ========================================

export interface CreateUserRequest {
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  accountType?: UserAccountType;
  preferences?: Partial<UserPreferencesCore>;
}

export interface CreateUserResponse {
  success: boolean;
  userId?: string;
  error?: string;
}

export interface UpdateUserRequest {
  userId: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  phoneNumber?: string;
  address?: Partial<UserAddress>;
  socialProfiles?: Partial<UserSocialProfiles>;
  preferences?: Partial<UserPreferencesCore>;
}

export interface UpdateUserResponse {
  success: boolean;
  error?: string;
}

export interface GetUserResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// ========================================
// VALIDATION INTERFACES
// ========================================

export interface UserValidation {
  email: (email: string) => boolean;
  username: (username: string) => { valid: boolean; errors: string[] };
  displayName: (name: string) => boolean;
  phoneNumber: (phone: string) => boolean;
  bio: (bio: string) => { valid: boolean; errors: string[] };
}
