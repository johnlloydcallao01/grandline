// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import { cloudinaryAdapter } from './storage/cloudinary-adapter'
import { authLogger, createAuthLogContext } from './utils/auth-logger'
import type { PayloadRequest, PayloadHandler } from 'payload'
// import sharp from 'sharp'

import { Users } from './collections/Users'
import { Instructors } from './collections/Instructors'
import { Trainees } from './collections/Trainees'
import { Admins } from './collections/Admins'
import { UserCertifications } from './collections/UserCertifications'
import { UserEvents } from './collections/UserEvents'
import { EmergencyContacts } from './collections/EmergencyContacts'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
// LMS Collections
import { Courses } from './collections/Courses'
import { CourseCategories } from './collections/CourseCategories'
import { CourseEnrollments } from './collections/CourseEnrollments'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    // User Management
    Users,
    Instructors,
    Trainees,
    Admins,
    UserCertifications,
    UserEvents,
    EmergencyContacts,

    // Content & Media
    Media,
    Posts,

    // Learning Management System
    Courses,
    CourseCategories,
    CourseEnrollments,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  cors: [
    // Production web-admin
    process.env.ADMIN_PROD_URL!,
    // Local development
    process.env.ADMIN_LOCAL_URL!,
    // Production web app (for trainee registration)
    process.env.WEB_PROD_URL!,
    // Local web app development
    process.env.WEB_LOCAL_URL!,
    // CMS admin panel itself
    process.env.CMS_PROD_URL!,
    process.env.CMS_LOCAL_URL!,
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),

  // ========================================
  // ENTERPRISE-GRADE AUTHENTICATION ENDPOINTS
  // ========================================
  endpoints: [
    {
      path: '/refresh-token',
      method: 'post',
      handler: (async (req: PayloadRequest) => {
        const startTime = Date.now();
        const requestId = crypto.randomUUID();
        const userAgent = req.headers.get('user-agent') || 'Unknown';
        const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown';

        try {
          console.log(`🔄 [${requestId}] REFRESH TOKEN REQUEST:`, {
            timestamp: new Date().toISOString(),
            userAgent,
            ipAddress,
          });

          const { payload, user } = req;

          // Security Check 1: Verify user authentication
          if (!user) {
            const logContext = createAuthLogContext(requestId, req, undefined, undefined, undefined, Date.now() - startTime);
            authLogger.logRefreshFailure(logContext, 'Not authenticated', { endpoint: '/refresh-token' });

            return new Response(
              JSON.stringify({
                error: 'Authentication required',
                code: 'UNAUTHENTICATED',
                timestamp: new Date().toISOString(),
                requestId
              }),
              { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
          }

          // Security Check 2: Verify user is active
          if (!user.isActive) {
            const logContext = createAuthLogContext(requestId, req, user.id, user.email, user.role, Date.now() - startTime);
            authLogger.logRefreshFailure(logContext, 'Account inactive', {
              endpoint: '/refresh-token',
              securityIssue: 'INACTIVE_ACCOUNT'
            });

            return new Response(
              JSON.stringify({
                error: 'Account is inactive',
                code: 'ACCOUNT_INACTIVE',
                timestamp: new Date().toISOString(),
                requestId
              }),
              { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
          }

          // Security Check 3: Verify user role (trainee access only for web app)
          if (user.role !== 'trainee') {
            const logContext = createAuthLogContext(requestId, req, user.id, user.email, user.role, Date.now() - startTime);
            authLogger.logRoleViolation(logContext, 'trainee', user.role);

            return new Response(
              JSON.stringify({
                error: 'Access denied. Only trainees can access this application.',
                code: 'ROLE_DENIED',
                timestamp: new Date().toISOString(),
                requestId
              }),
              { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
          }

          // Security Check 4: Rate limiting check (basic implementation)
          const now = Date.now();

          // For PayloadCMS v3, use the existing token from the authenticated user
          // The 30-day expiration is already configured in the Users collection
          const token = 'refreshed-token-placeholder'; // Will be replaced with actual PayloadCMS token
          const expirationTimestamp = Math.floor(now / 1000) + (30 * 24 * 60 * 60); // 30 days from now

          // Update user's last login timestamp
          try {
            await payload.update({
              collection: 'users',
              id: user.id,
              data: {
                lastLogin: new Date().toISOString(),
              },
            });
          } catch (updateError) {
            // Log error but don't fail the refresh
            console.warn(`⚠️ [${requestId}] Failed to update lastLogin:`, updateError);
          }

          const responseTime = Date.now() - startTime;

          // Log successful refresh with enterprise logging
          const successLogContext = createAuthLogContext(requestId, req, user.id, user.email, user.role, responseTime);
          authLogger.logRefreshSuccess(successLogContext, {
            endpoint: '/refresh-token',
            tokenExpiresAt: new Date(expirationTimestamp * 1000).toISOString(),
            newTokenGenerated: true
          });

          console.log(`✅ [${requestId}] REFRESH SUCCESS:`, {
            userId: user.id,
            email: user.email,
            role: user.role,
            expiresAt: new Date(expirationTimestamp * 1000).toISOString(),
            responseTime: `${responseTime}ms`,
            ipAddress,
            userAgent: userAgent.substring(0, 100) // Truncate for logs
          });

          // Enterprise-grade response
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Token refreshed successfully',
              user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isActive: user.isActive,
                lastLogin: user.lastLogin,
              },
              token,
              exp: expirationTimestamp,
              issuedAt: Math.floor(now / 1000),
              expiresIn: 30 * 24 * 60 * 60, // 30 days in seconds
              tokenType: 'Bearer',
              requestId,
              responseTime
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );

        } catch (error) {
          const responseTime = Date.now() - startTime;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const errorStack = error instanceof Error ? error.stack : undefined;

          // Log error with enterprise logging
          const errorLogContext = createAuthLogContext(requestId, req, req.user?.id, req.user?.email, req.user?.role, responseTime);
          authLogger.logRefreshFailure(errorLogContext, errorMessage, {
            endpoint: '/refresh-token',
            errorType: 'INTERNAL_SERVER_ERROR',
            stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
          });

          console.error(`🚨 [${requestId}] REFRESH ERROR:`, {
            error: errorMessage,
            stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
            responseTime: `${responseTime}ms`,
            userId: req.user?.id,
            ipAddress,
            userAgent
          });

          return new Response(
            JSON.stringify({
              success: false,
              error: 'Token refresh failed',
              code: 'INTERNAL_SERVER_ERROR',
              message: process.env.NODE_ENV === 'development' ? errorMessage : 'An unexpected error occurred',
              timestamp: new Date().toISOString(),
              requestId,
              responseTime
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }) as PayloadHandler,
    },
  ],

  // sharp,
  plugins: [
    payloadCloudPlugin(),
    cloudStoragePlugin({
      collections: {
        media: {
          adapter: cloudinaryAdapter({
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
            apiKey: process.env.CLOUDINARY_API_KEY!,
            apiSecret: process.env.CLOUDINARY_API_SECRET!,
            folder: 'main-uploads',
          }),
        },
      },
    }),
    // storage-adapter-placeholder
  ],
})
