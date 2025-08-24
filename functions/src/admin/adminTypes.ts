/**
 * TypeScript interfaces for Admin System
 * 
 * These types match the schema defined in docs/admin-schema.md
 */

import { Timestamp } from 'firebase-admin/firestore';

// ========================================
// ADMIN USER INTERFACES
// ========================================

export interface AdminUser {
  // === IDENTITY ===
  id: string;
  email: string;
  displayName: string;
  username?: string;
  
  // === AUTHENTICATION ===
  authProvider: 'email' | 'google' | 'microsoft';
  emailVerified: boolean;
  phoneNumber?: string;
  photoURL?: string;
  
  // === AUTHORIZATION ===
  roleRef: string;
  roleName: string;
  permissions: string[];
  isActive: boolean;
  isSuperAdmin: boolean;
  
  // === PROFILE ===
  firstName: string;
  lastName: string;
  title?: string;
  department?: string;
  bio?: string;
  
  // === CONTACT ===
  workEmail?: string;
  workPhone?: string;
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
      maxUploadSize: number;
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
    approvalLevel: number;
  };
  
  // === ACCESS CONTROL ===
  accessRestrictions: {
    allowedIPs?: string[];
    allowedCountries?: string[];
    requireMFA: boolean;
    sessionTimeout: number;
    maxConcurrentSessions: number;
  };
  
  // === ACTIVITY TRACKING ===
  lastLoginAt?: Timestamp;
  lastActiveAt?: Timestamp;
  loginCount: number;
  failedLoginAttempts: number;
  lastFailedLoginAt?: Timestamp;
  passwordChangedAt?: Timestamp;
  
  // === PREFERENCES ===
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    dashboardLayout: 'grid' | 'list';
    notificationsEnabled: boolean;
    emailNotifications: boolean;
  };
  
  // === METADATA ===
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
  version: number;
  
  // === SOFT DELETE ===
  isDeleted: boolean;
  deletedAt?: Timestamp;
  deletedBy?: string;
  deletionReason?: string;
}

// ========================================
// ADMIN ROLE INTERFACES
// ========================================

export interface AdminRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  
  // === PERMISSIONS ===
  permissions: string[];
  permissionRefs: string[];
  
  // === HIERARCHY ===
  level: number;
  parentRoleRef?: string;
  childRoleRefs: string[];
  
  // === RESTRICTIONS ===
  maxUsers?: number;
  isSystemRole: boolean;
  isCustomRole: boolean;
  
  // === METADATA ===
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  isActive: boolean;
  
  // === DENORMALIZED DATA ===
  userCount: number;
  lastUsedAt?: Timestamp;
}

// ========================================
// ADMIN PERMISSION INTERFACES
// ========================================

export interface AdminPermission {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  
  // === PERMISSION DETAILS ===
  resource: string;
  action: string;
  conditions?: {
    timeRestriction?: {
      startTime: string;
      endTime: string;
      timezone: string;
    };
    ipRestriction?: string[];
    locationRestriction?: string[];
  };
  
  // === METADATA ===
  isSystemPermission: boolean;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // === DENORMALIZED DATA ===
  roleCount: number;
  userCount: number;
}

// ========================================
// ADMIN SESSION INTERFACES
// ========================================

export interface AdminSession {
  id: string;
  adminRef: string;
  adminEmail: string;
  
  // === SESSION DATA ===
  token: string;
  refreshToken?: string;
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

// ========================================
// ADMIN AUDIT LOG INTERFACES
// ========================================

export interface AdminAuditLog {
  id: string;
  
  // === WHO ===
  adminRef: string;
  adminEmail: string;
  adminName: string;
  
  // === WHAT ===
  action: string;
  resource: string;
  resourceId?: string;
  
  // === DETAILS ===
  description: string;
  changes?: {
    before?: any;
    after?: any;
    fields: string[];
  };
  
  // === CONTEXT ===
  sessionRef?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Timestamp;
  
  // === METADATA ===
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  success: boolean;
  errorMessage?: string;
  
  // === SEARCH OPTIMIZATION ===
  searchKeywords: string[];
  dateString: string;
}

// ========================================
// ADMIN PREFERENCES INTERFACES
// ========================================

export interface AdminPreferences {
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  dashboardLayout: 'grid' | 'list';
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ========================================
// UTILITY TYPES
// ========================================

export type AdminPermissionAction = 
  | 'view' | 'create' | 'edit' | 'delete' | 'publish' | 'schedule'
  | 'upload' | 'organize' | 'change-roles' | 'export' 
  | 'configure-dashboards' | 'manage-integrations' | 'manage-backups';

export type AdminPermissionCategory = 
  | 'content' | 'media' | 'users' | 'settings' | 'analytics';

export type AdminRoleLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type AdminAuditSeverity = 'low' | 'medium' | 'high' | 'critical';

export type AdminAuditCategory = 
  | 'authentication' | 'content' | 'users' | 'settings' | 'system';

// ========================================
// REQUEST/RESPONSE INTERFACES
// ========================================

export interface CreateAdminUserRequest {
  email: string;
  displayName: string;
  roleRef: string;
  firstName: string;
  lastName: string;
  title?: string;
  department?: string;
}

export interface CreateAdminUserResponse {
  success: boolean;
  userId?: string;
  error?: string;
}

export interface UpdateAdminUserRequest {
  userId: string;
  updates: Partial<AdminUser>;
  updatedBy: string;
}

export interface UpdateAdminUserResponse {
  success: boolean;
  error?: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
  userAgent: string;
  ipAddress: string;
}

export interface AdminLoginResponse {
  success: boolean;
  sessionToken?: string;
  adminUser?: AdminUser;
  error?: string;
}
