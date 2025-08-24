/**
 * Create John Admin User Cloud Function
 * 
 * A callable function to create the specific admin user requested:
 * Email: john@encreasl.com
 * Password: @Iamachessgrandmaster23
 * Role: Admin
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

const db = admin.firestore();
const auth = admin.auth();

// Admin user details
const ADMIN_EMAIL = 'john@encreasl.com';
const ADMIN_PASSWORD = '@Iamachessgrandmaster23';
const ADMIN_NAME = 'John Admin';
const ADMIN_ROLE = 'admin'; // Using 'admin' role instead of 'super-admin'

export const createJohnAdmin = onCall(
  {
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 120,
  },
  async (request) => {
    try {
      logger.info('Starting John admin user creation...');

      // Step 1: Create user in Firebase Auth
      logger.info('Creating admin user in Firebase Auth...');
      
      let userRecord;
      try {
        // Try to create the user
        userRecord = await auth.createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          displayName: ADMIN_NAME,
          emailVerified: true,
        });
        
        logger.info(`Created Firebase Auth user: ${ADMIN_EMAIL}`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
          // User already exists, get their record
          userRecord = await auth.getUserByEmail(ADMIN_EMAIL);
          logger.info(`Firebase Auth user already exists: ${ADMIN_EMAIL}`);
          
          // Update password if needed
          await auth.updateUser(userRecord.uid, {
            password: ADMIN_PASSWORD,
            displayName: ADMIN_NAME,
            emailVerified: true,
          });
          logger.info('Updated existing user password and details');
        } else {
          throw error;
        }
      }

      // Step 2: Check if admin role exists
      logger.info('Checking admin role...');
      const adminRoleDoc = await db.collection('admin_roles').doc(ADMIN_ROLE).get();
      
      if (!adminRoleDoc.exists) {
        throw new HttpsError('failed-precondition', 'Admin role not found. Please run the admin system initialization first.');
      }

      const roleData = adminRoleDoc.data();
      logger.info(`Found admin role: ${roleData?.displayName}`);

      // Step 3: Create admin user document in Firestore
      logger.info('Creating admin user document in Firestore...');
      
      const adminUserDoc = {
        id: userRecord.uid,
        email: ADMIN_EMAIL,
        displayName: ADMIN_NAME,
        authProvider: 'email',
        emailVerified: true,
        
        // Role information (denormalized for performance)
        roleRef: `admin_roles/${ADMIN_ROLE}`,
        roleName: roleData?.displayName,
        permissions: roleData?.permissions || [],
        isActive: true,
        isSuperAdmin: false, // This is an admin, not super admin
        
        // Profile information
        firstName: ADMIN_NAME.split(' ')[0],
        lastName: ADMIN_NAME.split(' ').slice(1).join(' '),
        title: 'Administrator',
        department: 'Administration',
        
        // CMS capabilities based on admin role
        cmsPermissions: {
          content: {
            canCreate: true,
            canEdit: true,
            canDelete: false, // Admins can't delete content
            canPublish: true,
            canSchedule: true,
          },
          media: {
            canUpload: true,
            canDelete: true,
            canOrganize: true,
            maxUploadSize: 50, // 50MB for admins
          },
          users: {
            canView: true,
            canCreate: true,
            canEdit: true,
            canDelete: false, // Admins can't delete users
            canChangeRoles: false, // Only super admins can change roles
          },
          analytics: {
            canView: true,
            canExport: false, // Only super admins can export
            canConfigureDashboards: false,
          },
          settings: {
            canViewSystem: true,
            canEditSystem: false, // Only super admins can edit system settings
            canManageIntegrations: false,
            canManageBackups: false,
          },
        },
        
        // Workflow permissions
        workflowPermissions: {
          canApproveContent: true,
          canRejectContent: true,
          canAssignTasks: true,
          canCreateWorkflows: false, // Only super admins
          approvalLevel: 3, // Admin level
        },
        
        // Default access restrictions
        accessRestrictions: {
          requireMFA: false,
          sessionTimeout: 60, // 1 hour
          maxConcurrentSessions: 3,
        },
        
        // Activity tracking
        loginCount: 0,
        failedLoginAttempts: 0,
        
        // Default preferences
        preferences: {
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          dashboardLayout: 'grid',
          notificationsEnabled: true,
          emailNotifications: true,
        },
        
        // Timestamps
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: request.auth?.uid || 'system',
        updatedBy: request.auth?.uid || 'system',
        version: 1,
        
        // Soft delete
        isDeleted: false,
      };

      // Check if admin user document already exists
      const existingAdminDoc = await db.collection('admin_users').doc(userRecord.uid).get();
      
      if (existingAdminDoc.exists) {
        logger.info('Admin user document already exists, updating...');
        await db.collection('admin_users').doc(userRecord.uid).update({
          ...adminUserDoc,
          updatedAt: Timestamp.now(),
        });
      } else {
        await db.collection('admin_users').doc(userRecord.uid).set(adminUserDoc);
        logger.info('Created admin user document');
      }

      // Step 4: Set custom claims for Firebase Auth
      logger.info('Setting custom claims...');
      await auth.setCustomUserClaims(userRecord.uid, {
        admin: true,
        superAdmin: false,
        role: ADMIN_ROLE,
        permissions: roleData?.permissions || [],
      });
      logger.info('Set custom claims');

      // Step 5: Update role user count
      logger.info('Updating role user count...');
      await db.collection('admin_roles').doc(ADMIN_ROLE).update({
        userCount: FieldValue.increment(1),
        lastUsedAt: Timestamp.now(),
      });

      // Step 6: Create admin preferences document
      logger.info('Creating admin preferences...');
      const preferencesDoc = await db.collection('admin_preferences').doc(userRecord.uid).get();
      
      if (!preferencesDoc.exists) {
        await db.collection('admin_preferences').doc(userRecord.uid).set({
          userId: userRecord.uid,
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          dashboardLayout: 'grid',
          notificationsEnabled: true,
          emailNotifications: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        logger.info('Created admin preferences');
      } else {
        logger.info('Admin preferences already exist');
      }

      logger.info('John admin user created successfully!');

      return {
        success: true,
        message: 'John admin user created successfully',
        user: {
          uid: userRecord.uid,
          email: ADMIN_EMAIL,
          displayName: ADMIN_NAME,
          role: roleData?.displayName,
        }
      };

    } catch (error) {
      logger.error('Error creating John admin user:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Failed to create John admin user');
    }
  }
);
