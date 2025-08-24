# 👑 Admin System Setup Guide

## 🎯 Overview

This guide explains how to set up and use the comprehensive admin system for your CMS. The system follows Firebase enterprise patterns and provides:

- **Role-based access control (RBAC)**
- **Hierarchical permission inheritance**
- **Secure session management**
- **Comprehensive audit logging**
- **Strategic denormalization for performance**

## 🏗️ Architecture

The admin system is built following your Firebase principles:

### **Collections Structure**
```
/admin_users/{adminId}              # Main admin user documents
/admin_roles/{roleId}               # Role definitions with hierarchy
/admin_permissions/{permissionId}   # Granular permissions
/admin_sessions/{sessionId}         # Active admin sessions
/admin_audit_logs/{logId}          # Complete audit trail
/admin_preferences/{adminId}        # UI preferences
/system_config/admin_system         # System configuration
```

### **Key Features**
- ✅ **Reference-based architecture** (no data duplication)
- ✅ **Strategic denormalization** (permissions cached for performance)
- ✅ **Parallel data fetching** (efficient queries)
- ✅ **Event-driven consistency** (Cloud Functions maintain data integrity)

## 🚀 Initial Setup

### **Step 1: Deploy Cloud Functions**

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Deploy admin functions
firebase deploy --only functions:initializeAdminSystem,functions:checkAdminSystemStatus
```

### **Step 2: Initialize Admin System**

Call the initialization function with your super admin details:

```typescript
// Using Firebase Functions SDK
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const initializeAdmin = httpsCallable(functions, 'initializeAdminSystem');

const result = await initializeAdmin({
  superAdminEmail: 'admin@yourcompany.com',
  superAdminPassword: 'SecurePassword123!',
  superAdminName: 'Super Administrator'
});

console.log(result.data);
// {
//   success: true,
//   message: 'Admin system initialized successfully',
//   superAdminId: 'abc123...',
//   features: ['Role-based access control', ...]
// }
```

### **Step 3: Verify Setup**

Check if the system is properly initialized:

```typescript
const checkStatus = httpsCallable(functions, 'checkAdminSystemStatus');
const status = await checkStatus();

console.log(status.data);
// {
//   initialized: true,
//   version: '1.0.0',
//   statistics: {
//     totalRoles: 4,
//     totalPermissions: 25,
//     totalAdminUsers: 1
//   }
// }
```

## 🔐 Default Roles & Permissions

### **Roles Hierarchy**
```
Super Admin (Level 10)
├── Administrator (Level 8)
│   ├── Content Manager (Level 6)
│   │   └── Editor (Level 4)
```

### **Default Permissions**
```typescript
// Content permissions
'content.view', 'content.create', 'content.edit', 'content.delete', 'content.publish', 'content.schedule'

// Media permissions
'media.view', 'media.upload', 'media.edit', 'media.delete', 'media.organize'

// User permissions
'users.view', 'users.create', 'users.edit', 'users.delete', 'users.change-roles'

// Settings permissions
'settings.view', 'settings.edit', 'settings.manage-integrations', 'settings.manage-backups'

// Analytics permissions
'analytics.view', 'analytics.export', 'analytics.configure-dashboards'
```

## 👥 User Management

### **Creating Admin Users**

```typescript
const createAdmin = httpsCallable(functions, 'createAdminUser');

const newAdmin = await createAdmin({
  email: 'editor@yourcompany.com',
  displayName: 'John Editor',
  roleRef: 'admin_roles/editor',
  firstName: 'John',
  lastName: 'Editor',
  title: 'Content Editor',
  department: 'Marketing'
});
```

### **Updating Admin Users**

```typescript
const updateAdmin = httpsCallable(functions, 'updateAdminUser');

await updateAdmin({
  userId: 'user123',
  updates: {
    roleRef: 'admin_roles/content-manager',
    title: 'Senior Content Manager'
  },
  updatedBy: 'currentAdminId'
});
```

## 🔑 Authentication Flow

### **Admin Login**

```typescript
const adminLogin = httpsCallable(functions, 'adminLogin');

const loginResult = await adminLogin({
  email: 'admin@yourcompany.com',
  password: 'password123',
  userAgent: navigator.userAgent,
  ipAddress: '192.168.1.1'
});

// Store session token
const sessionToken = loginResult.data.sessionToken;
localStorage.setItem('adminSession', sessionToken);
```

### **Session Validation**

```typescript
const validateSession = httpsCallable(functions, 'validateAdminSession');

const validation = await validateSession({
  sessionToken: localStorage.getItem('adminSession'),
  ipAddress: getCurrentIP()
});

if (validation.data.valid) {
  // User is authenticated
  const adminUser = validation.data.adminUser;
} else {
  // Redirect to login
}
```

### **Permission Checking**

```typescript
const checkPermission = httpsCallable(functions, 'checkUserPermission');

const hasPermission = await checkPermission({
  userId: 'currentAdminId',
  permission: 'content.publish'
});

if (hasPermission.data.hasPermission) {
  // Show publish button
}
```

## 🛡️ Security Features

### **Session Management**
- Secure token generation with crypto.randomBytes
- Token hashing for storage
- Automatic session expiration
- IP address tracking
- Device fingerprinting

### **Access Control**
- Role-based permissions
- Permission inheritance
- Failed login attempt tracking
- Account lockout after 5 failed attempts
- Session timeout (configurable)

### **Audit Logging**
- Complete audit trail of all admin actions
- IP address and user agent logging
- Before/after change tracking
- Searchable audit logs
- Severity classification

## 📊 Querying Patterns

Following your Firebase principles, here are optimized query patterns:

### **Efficient Admin Lookup**
```typescript
// ✅ Using indexed email field
const adminByEmail = await getDocs(
  query(collection(db, 'admin_users'),
        where('email', '==', email),
        where('isActive', '==', true),
        limit(1))
);
```

### **Parallel Data Fetching**
```typescript
// ✅ Fetch related data in parallel
const [adminData, roleData, permissions] = await Promise.all([
  getDoc(doc(db, 'admin_users', adminId)),
  getDoc(doc(db, 'admin_roles', roleRef)),
  getDocs(query(collection(db, 'admin_permissions'), 
                where('isActive', '==', true)))
]);
```

### **Role-based Queries**
```typescript
// ✅ Using denormalized roleName for performance
const contentManagers = await getDocs(
  query(collection(db, 'admin_users'),
        where('roleName', '==', 'Content Manager'),
        where('isActive', '==', true))
);
```

## 🔧 Role Management

### **Creating Custom Roles**

```typescript
const createRole = httpsCallable(functions, 'createAdminRole');

await createRole({
  name: 'marketing-manager',
  displayName: 'Marketing Manager',
  description: 'Can manage marketing content and campaigns',
  permissions: ['content.view', 'content.create', 'content.edit', 'analytics.view'],
  level: 5,
  parentRoleRef: 'admin_roles/content-manager'
});
```

### **Permission Management**

```typescript
const createPermission = httpsCallable(functions, 'createAdminPermission');

await createPermission({
  name: 'campaigns.manage',
  displayName: 'Manage Campaigns',
  description: 'Can create and manage marketing campaigns',
  category: 'marketing',
  resource: 'campaigns',
  action: 'manage'
});
```

## 📈 Monitoring & Analytics

### **System Health Check**
```typescript
const systemStatus = await checkAdminSystemStatus();
console.log('Admin users:', systemStatus.data.statistics.totalAdminUsers);
console.log('Active roles:', systemStatus.data.statistics.totalRoles);
```

### **Audit Log Queries**
```typescript
// Get recent admin activities
const recentLogs = await getDocs(
  query(collection(db, 'admin_audit_logs'),
        where('severity', 'in', ['high', 'critical']),
        orderBy('timestamp', 'desc'),
        limit(50))
);
```

## 🚨 Emergency Procedures

### **Reset Admin System** (Use with extreme caution)
```typescript
const resetSystem = httpsCallable(functions, 'resetAdminSystem');

await resetSystem({
  confirmationCode: 'RESET_ADMIN_SYSTEM_CONFIRM'
});
```

### **Revoke All Sessions**
```typescript
const revokeSessions = httpsCallable(functions, 'revokeAdminSessions');

await revokeSessions({
  adminId: 'compromisedAdminId'
});
```

## 🔄 Maintenance

### **Regular Tasks**
1. **Monitor audit logs** for suspicious activity
2. **Review user permissions** quarterly
3. **Clean up inactive sessions** (automated)
4. **Update role permissions** as needed
5. **Backup admin data** regularly

### **Performance Optimization**
- Permissions are denormalized for fast access
- Role counts are maintained automatically
- Session cleanup runs automatically
- Audit logs are indexed for search

## 🎯 Best Practices

1. **Use least privilege principle** - Give users minimum required permissions
2. **Regular permission audits** - Review and update permissions quarterly
3. **Monitor audit logs** - Set up alerts for critical actions
4. **Secure session management** - Use HTTPS and secure tokens
5. **Role hierarchy** - Use inheritance to simplify permission management

This admin system provides enterprise-grade security and management capabilities while following your Firebase principles for optimal performance and scalability.
