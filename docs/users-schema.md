# Users Collection Schema

## 🎯 Overview

The `users` collection stores regular user profiles and data, following the same enterprise patterns established for admin users but tailored for end-user functionality.

## 📋 Collection Structure

```
/users/{userId}                     # Main user document
/user_preferences/{userId}          # User UI preferences
/user_sessions/{sessionId}          # Active user sessions (optional)
/user_activity_logs/{logId}         # User activity tracking (optional)
```

## 🔧 Schema Definition

### 1. Users Collection (`/users/{userId}`)

```typescript
interface User {
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
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  // === STATUS & PERMISSIONS ===
  isActive: boolean;             // Can login and use the platform
  isVerified: boolean;           // Account verification status
  accountType: 'free' | 'premium' | 'enterprise';
  subscriptionStatus?: 'active' | 'cancelled' | 'expired' | 'trial';
  
  // === ACTIVITY TRACKING ===
  lastLoginAt?: Timestamp;
  lastActiveAt?: Timestamp;
  loginCount: number;
  failedLoginAttempts: number;
  lastFailedLoginAt?: Timestamp;
  passwordChangedAt?: Timestamp;
  
  // === PREFERENCES (Denormalized for performance) ===
  preferences: {
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
  };
  
  // === SOCIAL & CONNECTIONS ===
  socialProfiles?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    website?: string;
  };
  
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
  analytics: {
    signupSource?: string;       // 'web', 'mobile', 'referral', etc.
    referralCode?: string;       // How they found the platform
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    firstVisitAt?: Timestamp;
    totalSessions: number;
    totalTimeSpent: number;      // In minutes
  };
  
  // === COMPLIANCE & LEGAL ===
  compliance: {
    termsAcceptedAt?: Timestamp;
    privacyPolicyAcceptedAt?: Timestamp;
    marketingConsentAt?: Timestamp;
    dataProcessingConsentAt?: Timestamp;
    gdprCompliant: boolean;
    ccpaCompliant: boolean;
  };
}
```

### 2. User Preferences Collection (`/user_preferences/{userId}`)

```typescript
interface UserPreferences {
  userId: string;                // Reference to user document
  
  // === UI PREFERENCES ===
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  
  // === NOTIFICATION PREFERENCES ===
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
    productUpdates: boolean;
    securityAlerts: boolean;
    weeklyDigest: boolean;
    monthlyReport: boolean;
  };
  
  // === PRIVACY PREFERENCES ===
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showEmail: boolean;
    showPhone: boolean;
    allowSearchByEmail: boolean;
    allowDataCollection: boolean;
    allowPersonalization: boolean;
  };
  
  // === COMMUNICATION PREFERENCES ===
  communication: {
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
  };
  
  // === METADATA ===
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: number;
}
```

## 🚀 Key Design Principles Applied

### 1. Reference-Based Architecture
- User ID matches Firebase Auth UID for consistency
- Separate preferences collection to avoid document size limits
- Clean separation of concerns

### 2. Strategic Denormalization
- Core preferences denormalized in main user document for quick access
- Detailed preferences in separate collection for comprehensive settings
- Activity tracking denormalized for performance

### 3. Compliance & Privacy First
- GDPR and CCPA compliance fields built-in
- Granular privacy controls
- Audit trail for legal requirements

### 4. Analytics Ready
- Built-in analytics tracking
- UTM parameter support
- User journey tracking capabilities

### 5. Scalable & Extensible
- Version field for schema evolution
- Soft delete for data retention
- Flexible social profiles structure

## 🔍 Indexing Strategy

```javascript
// Recommended Firestore indexes
{
  "users": [
    { "email": "asc" },
    { "username": "asc" },
    { "isActive": "asc", "createdAt": "desc" },
    { "accountType": "asc", "isActive": "asc" },
    { "lastActiveAt": "desc" },
    { "analytics.signupSource": "asc", "createdAt": "desc" }
  ]
}
```

## 🔒 Security Rules

```javascript
// Firestore Security Rules for Users Collection
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users - Users can read/write their own data, admins can manage all
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                           request.auth.uid == userId;
      allow read, write: if isAuthenticatedAdmin() && 
                           hasPermission('users.manage');
    }
    
    // User Preferences - Same access pattern as users
    match /user_preferences/{userId} {
      allow read, write: if request.auth != null && 
                           request.auth.uid == userId;
      allow read, write: if isAuthenticatedAdmin() && 
                           hasPermission('users.manage');
    }
    
    // Helper functions
    function isAuthenticatedAdmin() {
      return request.auth != null &&
             request.auth.token.admin == true;
    }
    
    function hasPermission(permission) {
      return request.auth.token.permissions != null &&
             permission in request.auth.token.permissions;
    }
  }
}
```
