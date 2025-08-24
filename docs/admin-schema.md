# 👑 Admin User Schema for CMS System

## 🎯 Design Principles

Following our Firebase enterprise patterns:
- **Reference-based architecture**: Use document references instead of data duplication
- **Strategic denormalization**: Denormalize frequently queried fields for performance
- **Parallel data fetching**: Design for efficient parallel queries
- **Event-driven consistency**: Use Cloud Functions for data consistency

## 📊 Collection Structure

```
/admin_users/{adminId}              # Main admin user document
/admin_roles/{roleId}               # Role definitions
/admin_permissions/{permissionId}   # Permission definitions
/admin_sessions/{sessionId}         # Active admin sessions
/admin_audit_logs/{logId}          # Admin activity logs
/admin_teams/{teamId}              # Admin teams/departments
/admin_preferences/{adminId}        # Admin UI preferences
```

## 🔧 Schema Definitions

### 1. Admin Users Collection (`/admin_users/{adminId}`)

```typescript
interface AdminUser {
  // === IDENTITY ===
  id: string;                    // Document ID (matches Firebase Auth UID)
  email: string;                 // Primary email (indexed)
  displayName: string;           // Full name
  username?: string;             // Optional username (indexed, unique)
  
  // === AUTHENTICATION ===
  authProvider: 'email' | 'google' | 'microsoft';
  emailVerified: boolean;
  phoneNumber?: string;
  photoURL?: string;
  
  // === AUTHORIZATION (Denormalized for performance) ===
  roleRef: string;               // Reference: "admin_roles/{roleId}"
  roleName: string;              // Denormalized for quick access
  permissions: string[];         // Denormalized permission names
  isActive: boolean;             // Can login and perform actions
  isSuperAdmin: boolean;         // Has all permissions
  
  // === PROFILE ===
  firstName: string;
  lastName: string;
  title?: string;                // Job title
  department?: string;           // Department/team
  bio?: string;                  // Short bio
  
  // === CONTACT ===
  workEmail?: string;            // Work email if different
  workPhone?: string;            // Work phone
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  
  // === CMS CAPABILITIES ===
  cmsPermissions: {
    content: {
      canCreate: boolean;
      canEdit: boolean;
      canDelete: boolean;
      canPublish: boolean;
      canSchedule: boolean;
    };
    media: {
      canUpload: boolean;
      canDelete: boolean;
      canOrganize: boolean;
      maxUploadSize: number;      // in MB
    };
    users: {
      canView: boolean;
      canCreate: boolean;
      canEdit: boolean;
      canDelete: boolean;
      canChangeRoles: boolean;
    };
    analytics: {
      canView: boolean;
      canExport: boolean;
      canConfigureDashboards: boolean;
    };
    settings: {
      canViewSystem: boolean;
      canEditSystem: boolean;
      canManageIntegrations: boolean;
      canManageBackups: boolean;
    };
  };
  
  // === WORKFLOW ===
  workflowPermissions: {
    canApproveContent: boolean;
    canRejectContent: boolean;
    canAssignTasks: boolean;
    canCreateWorkflows: boolean;
    approvalLevel: number;        // 1-5, higher can approve lower
  };
  
  // === ACCESS CONTROL ===
  accessRestrictions: {
    allowedIPs?: string[];        // IP whitelist
    allowedCountries?: string[];  // Country restrictions
    requireMFA: boolean;          // Require 2FA
    sessionTimeout: number;       // Minutes
    maxConcurrentSessions: number;
  };
  
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
    language: string;             // ISO code
    timezone: string;             // IANA timezone
    dateFormat: string;
    timeFormat: '12h' | '24h';
    dashboardLayout: 'grid' | 'list';
    notificationsEnabled: boolean;
    emailNotifications: boolean;
  };
  
  // === METADATA ===
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;             // Admin ID who created this user
  updatedBy: string;             // Admin ID who last updated
  version: number;               // For optimistic locking
  
  // === SOFT DELETE ===
  isDeleted: boolean;
  deletedAt?: Timestamp;
  deletedBy?: string;
  deletionReason?: string;
}
```

### 2. Admin Roles Collection (`/admin_roles/{roleId}`)

```typescript
interface AdminRole {
  id: string;
  name: string;                  // "Super Admin", "Content Manager", "Editor"
  displayName: string;           // Human-readable name
  description: string;           // Role description
  
  // === PERMISSIONS ===
  permissions: string[];         // Array of permission names
  permissionRefs: string[];      // References to permission documents
  
  // === HIERARCHY ===
  level: number;                 // 1-10, higher levels have more access
  parentRoleRef?: string;        // Inherits permissions from parent
  childRoleRefs: string[];       // Child roles
  
  // === RESTRICTIONS ===
  maxUsers?: number;             // Max users with this role
  isSystemRole: boolean;         // Cannot be deleted
  isCustomRole: boolean;         // Created by admin
  
  // === METADATA ===
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  isActive: boolean;
  
  // === DENORMALIZED DATA ===
  userCount: number;             // Number of users with this role
  lastUsedAt?: Timestamp;        // When role was last assigned
}
```

### 3. Admin Permissions Collection (`/admin_permissions/{permissionId}`)

```typescript
interface AdminPermission {
  id: string;
  name: string;                  // "content.create", "users.delete"
  displayName: string;           // "Create Content"
  description: string;
  category: string;              // "content", "users", "system"
  
  // === PERMISSION DETAILS ===
  resource: string;              // What resource this affects
  action: string;                // What action is allowed
  conditions?: {                 // Optional conditions
    timeRestriction?: {
      startTime: string;         // HH:mm
      endTime: string;           // HH:mm
      timezone: string;
    };
    ipRestriction?: string[];    // Allowed IP ranges
    locationRestriction?: string[]; // Allowed countries
  };
  
  // === METADATA ===
  isSystemPermission: boolean;   // Cannot be deleted
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // === DENORMALIZED DATA ===
  roleCount: number;             // Number of roles with this permission
  userCount: number;             // Number of users with this permission
}
```

### 4. Admin Sessions Collection (`/admin_sessions/{sessionId}`)

```typescript
interface AdminSession {
  id: string;
  adminRef: string;              // Reference to admin user
  adminEmail: string;            // Denormalized for quick lookup
  
  // === SESSION DATA ===
  token: string;                 // Session token (hashed)
  refreshToken?: string;         // Refresh token (hashed)
  expiresAt: Timestamp;
  
  // === DEVICE INFO ===
  userAgent: string;
  ipAddress: string;
  location?: {
    country: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
  
  // === STATUS ===
  isActive: boolean;
  lastActivityAt: Timestamp;
  createdAt: Timestamp;
  endedAt?: Timestamp;
  endReason?: 'logout' | 'timeout' | 'revoked' | 'expired';
}
```

### 5. Admin Audit Logs Collection (`/admin_audit_logs/{logId}`)

```typescript
interface AdminAuditLog {
  id: string;
  
  // === WHO ===
  adminRef: string;              // Who performed the action
  adminEmail: string;            // Denormalized
  adminName: string;             // Denormalized
  
  // === WHAT ===
  action: string;                // "user.create", "content.publish"
  resource: string;              // What was affected
  resourceId?: string;           // ID of affected resource
  
  // === DETAILS ===
  description: string;           // Human-readable description
  changes?: {                    // What changed
    before?: any;
    after?: any;
    fields: string[];            // Which fields changed
  };
  
  // === CONTEXT ===
  sessionRef?: string;           // Reference to session
  ipAddress: string;
  userAgent: string;
  timestamp: Timestamp;
  
  // === METADATA ===
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;              // "authentication", "content", "system"
  success: boolean;              // Whether action succeeded
  errorMessage?: string;         // If action failed
  
  // === SEARCH OPTIMIZATION ===
  searchKeywords: string[];      // For text search
  dateString: string;            // YYYY-MM-DD for date queries
}
```

## 🚀 Implementation Strategy

### Query Optimization Patterns

Following your Firebase principles, here are the optimized query patterns:

```typescript
// ✅ Efficient admin lookup by email (indexed)
const adminByEmail = await getDocs(
  query(collection(db, 'admin_users'),
        where('email', '==', email),
        where('isActive', '==', true),
        limit(1))
);

// ✅ Parallel data fetching for admin dashboard
const [adminData, roleData, permissions, recentLogs] = await Promise.all([
  getDoc(doc(db, 'admin_users', adminId)),
  getDoc(doc(db, 'admin_roles', roleRef)),
  getDocs(query(collection(db, 'admin_permissions'),
                where('isActive', '==', true))),
  getDocs(query(collection(db, 'admin_audit_logs'),
                where('adminRef', '==', `admin_users/${adminId}`),
                orderBy('timestamp', 'desc'),
                limit(10)))
]);

// ✅ Strategic denormalization for role-based queries
const contentManagers = await getDocs(
  query(collection(db, 'admin_users'),
        where('roleName', '==', 'Content Manager'),  // Denormalized
        where('isActive', '==', true))
);

// ✅ Collection group queries for audit logs across all admins
const systemLogs = await getDocs(
  query(collectionGroup(db, 'admin_audit_logs'),
        where('category', '==', 'system'),
        where('severity', 'in', ['high', 'critical']),
        orderBy('timestamp', 'desc'))
);
```

## 🔐 Security Rules

```javascript
// Firestore Security Rules for Admin Collections
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Admin Users - Only authenticated admins can read/write
    match /admin_users/{adminId} {
      allow read, write: if isAuthenticatedAdmin() &&
                           hasPermission('users.manage');
      allow read: if isAuthenticatedAdmin() &&
                     resource.id == request.auth.uid;
    }

    // Admin Roles - Read by all admins, write by super admins
    match /admin_roles/{roleId} {
      allow read: if isAuthenticatedAdmin();
      allow write: if isAuthenticatedAdmin() &&
                      hasPermission('roles.manage');
    }

    // Admin Sessions - Only owner can read
    match /admin_sessions/{sessionId} {
      allow read, write: if isAuthenticatedAdmin() &&
                           resource.data.adminRef == 'admin_users/' + request.auth.uid;
    }

    // Audit Logs - Read only, written by Cloud Functions
    match /admin_audit_logs/{logId} {
      allow read: if isAuthenticatedAdmin() &&
                     hasPermission('logs.view');
      allow write: if false; // Only Cloud Functions can write
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
```
