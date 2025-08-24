/**
 * User Types and Interfaces
 *
 * Comprehensive type definitions for regular users in the Encreasl platform.
 * These types follow the same patterns as admin types but are tailored for end users.
 */
import { Timestamp } from 'firebase-admin/firestore';
export interface User {
    id: string;
    email: string;
    displayName: string;
    username?: string;
    authProvider: 'email' | 'google' | 'facebook' | 'apple';
    emailVerified: boolean;
    phoneNumber?: string;
    photoURL?: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    dateOfBirth?: Timestamp;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    alternateEmail?: string;
    phoneVerified: boolean;
    address?: UserAddress;
    isActive: boolean;
    isVerified: boolean;
    accountType: UserAccountType;
    subscriptionStatus?: UserSubscriptionStatus;
    lastLoginAt?: Timestamp;
    lastActiveAt?: Timestamp;
    loginCount: number;
    failedLoginAttempts: number;
    lastFailedLoginAt?: Timestamp;
    passwordChangedAt?: Timestamp;
    preferences: UserPreferencesCore;
    socialProfiles?: UserSocialProfiles;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy?: string;
    updatedBy?: string;
    version: number;
    isDeleted: boolean;
    deletedAt?: Timestamp;
    deletedBy?: string;
    deletionReason?: string;
    analytics: UserAnalytics;
    compliance: UserCompliance;
}
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
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    currency: string;
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
    signupSource?: string;
    referralCode?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    firstVisitAt?: Timestamp;
    totalSessions: number;
    totalTimeSpent: number;
}
export interface UserCompliance {
    termsAcceptedAt?: Timestamp;
    privacyPolicyAcceptedAt?: Timestamp;
    marketingConsentAt?: Timestamp;
    dataProcessingConsentAt?: Timestamp;
    gdprCompliant: boolean;
    ccpaCompliant: boolean;
}
export interface UserPreferences {
    userId: string;
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    currency: string;
    notifications: UserNotificationPreferences;
    privacy: UserPrivacyPreferences;
    communication: UserCommunicationPreferences;
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
        start: string;
        end: string;
        timezone: string;
    };
    frequency: {
        marketing: 'daily' | 'weekly' | 'monthly' | 'never';
        updates: 'immediate' | 'daily' | 'weekly' | 'never';
    };
}
export type UserAccountType = 'free' | 'premium' | 'enterprise';
export type UserSubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';
export type UserAuthProvider = 'email' | 'google' | 'facebook' | 'apple';
export type UserGender = 'male' | 'female' | 'other' | 'prefer-not-to-say';
export type UserProfileVisibility = 'public' | 'friends' | 'private';
export type UserContactMethod = 'email' | 'phone' | 'sms';
export type UserNotificationFrequency = 'daily' | 'weekly' | 'monthly' | 'never';
export type UserUpdateFrequency = 'immediate' | 'daily' | 'weekly' | 'never';
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
export interface UserValidation {
    email: (email: string) => boolean;
    username: (username: string) => {
        valid: boolean;
        errors: string[];
    };
    displayName: (name: string) => boolean;
    phoneNumber: (phone: string) => boolean;
    bio: (bio: string) => {
        valid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=users.d.ts.map