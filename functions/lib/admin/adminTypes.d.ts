/**
 * TypeScript interfaces for Admin System
 *
 * These types match the schema defined in docs/admin-schema.md
 */
import { Timestamp } from 'firebase-admin/firestore';
export interface AdminUser {
    id: string;
    email: string;
    displayName: string;
    username?: string;
    authProvider: 'email' | 'google' | 'microsoft';
    emailVerified: boolean;
    phoneNumber?: string;
    photoURL?: string;
    roleRef: string;
    roleName: string;
    permissions: string[];
    isActive: boolean;
    isSuperAdmin: boolean;
    firstName: string;
    lastName: string;
    title?: string;
    department?: string;
    bio?: string;
    workEmail?: string;
    workPhone?: string;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    };
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
    workflowPermissions: {
        canApproveContent: boolean;
        canRejectContent: boolean;
        canAssignTasks: boolean;
        canCreateWorkflows: boolean;
        approvalLevel: number;
    };
    accessRestrictions: {
        allowedIPs?: string[];
        allowedCountries?: string[];
        requireMFA: boolean;
        sessionTimeout: number;
        maxConcurrentSessions: number;
    };
    lastLoginAt?: Timestamp;
    lastActiveAt?: Timestamp;
    loginCount: number;
    failedLoginAttempts: number;
    lastFailedLoginAt?: Timestamp;
    passwordChangedAt?: Timestamp;
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
    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy: string;
    updatedBy: string;
    version: number;
    isDeleted: boolean;
    deletedAt?: Timestamp;
    deletedBy?: string;
    deletionReason?: string;
}
export interface AdminRole {
    id: string;
    name: string;
    displayName: string;
    description: string;
    permissions: string[];
    permissionRefs: string[];
    level: number;
    parentRoleRef?: string;
    childRoleRefs: string[];
    maxUsers?: number;
    isSystemRole: boolean;
    isCustomRole: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy: string;
    isActive: boolean;
    userCount: number;
    lastUsedAt?: Timestamp;
}
export interface AdminPermission {
    id: string;
    name: string;
    displayName: string;
    description: string;
    category: string;
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
    isSystemPermission: boolean;
    isActive: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    roleCount: number;
    userCount: number;
}
export interface AdminSession {
    id: string;
    adminRef: string;
    adminEmail: string;
    token: string;
    refreshToken?: string;
    expiresAt: Timestamp;
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
    isActive: boolean;
    lastActivityAt: Timestamp;
    createdAt: Timestamp;
    endedAt?: Timestamp;
    endReason?: 'logout' | 'timeout' | 'revoked' | 'expired';
}
export interface AdminAuditLog {
    id: string;
    adminRef: string;
    adminEmail: string;
    adminName: string;
    action: string;
    resource: string;
    resourceId?: string;
    description: string;
    changes?: {
        before?: any;
        after?: any;
        fields: string[];
    };
    sessionRef?: string;
    ipAddress: string;
    userAgent: string;
    timestamp: Timestamp;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    success: boolean;
    errorMessage?: string;
    searchKeywords: string[];
    dateString: string;
}
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
export type AdminPermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'publish' | 'schedule' | 'upload' | 'organize' | 'change-roles' | 'export' | 'configure-dashboards' | 'manage-integrations' | 'manage-backups';
export type AdminPermissionCategory = 'content' | 'media' | 'users' | 'settings' | 'analytics';
export type AdminRoleLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type AdminAuditSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AdminAuditCategory = 'authentication' | 'content' | 'users' | 'settings' | 'system';
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
//# sourceMappingURL=adminTypes.d.ts.map