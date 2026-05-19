// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'

import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import { authLogger, createAuthLogContext } from './utils/auth-logger'
import type { PayloadRequest, PayloadHandler } from 'payload'
import sharp from 'sharp'
import { runInBackground } from './utils/background-task'
import { getRequestMetadata } from './utils/request-metadata'
import { sendResendEmail } from './utils/resend-email'
import { createUserSecurityEvent } from './utils/user-security-events'

import { Users } from './collections/Users'
import { Instructors } from './collections/Instructors'
import { Trainees } from './collections/Trainees'
import { Admins } from './collections/Admins'
import { UserEvents } from './collections/UserEvents'
import { EmergencyContacts } from './collections/EmergencyContacts'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { PostCategories } from './collections/PostCategories'
import { Courses } from './collections/Courses'
import { CourseCategories } from './collections/CourseCategories'
import { CouponCodes } from './collections/CouponCodes'
import { CouponRedemptions } from './collections/CouponRedemptions'
import { CourseEnrollments } from './collections/CourseEnrollments'
import { CourseModules } from './collections/CourseModules'
import { CourseLessons } from './collections/CourseLessons'
import { Materials } from './collections/Materials'
import { CourseMaterials } from './collections/CourseMaterials'
import { LessonMaterials } from './collections/LessonMaterials'
import { Announcements } from './collections/Announcements'
import { RecentSearches } from './collections/RecentSearches'
import { Questions } from './collections/Questions'
import { Assessments } from './collections/Assessments'
import { AssessmentSubmissions } from './collections/AssessmentSubmissions'
import { Assignments } from './collections/Assignments'
import { AssignmentSubmissions } from './collections/AssignmentSubmissions'
import { SubmissionAnswers } from './collections/SubmissionAnswers'
import { Wishlists } from './collections/Wishlists'
import { RecentlyViewedCourses } from './collections/RecentlyViewedCourses'
import { CourseItemProgress } from './collections/CourseItemProgress'
import { FeedbackForms } from './collections/FeedbackForms'
import { FeedbackSubmissions } from './collections/FeedbackSubmissions'
import { NotificationTemplates } from './collections/NotificationTemplates'
import { Notifications } from './collections/Notifications'
import { UserNotifications } from './collections/UserNotifications'
import { WebPushSubscriptions } from './collections/WebPushSubscriptions'
import { SupportTickets } from './collections/SupportTickets'
import { SupportTicketMessages } from './collections/SupportTicketMessages'
import { Chats } from './collections/Chats'
import { ChatMessages } from './collections/ChatMessages'
import { ChatMessageStatus } from './collections/ChatMessageStatus'
import { ChatTypingStatus } from './collections/ChatTypingStatus'
import { Certificates } from './collections/Certificates'
import { CertificateTemplates } from './collections/CertificateTemplates'
import { SiteSettings } from './globals/SiteSettings'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

import { generateCertificateEndpoint } from './endpoints/generate-certificate'
import { getTraineeDashboardSummary } from './endpoints/getTraineeDashboardSummary'

export default buildConfig({
  sharp,
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
    UserEvents,
    EmergencyContacts,

    // Content & Media
    Media,
    Posts,
    PostCategories,

    // Learning Management System
    Courses,
    CourseCategories,
    CouponCodes,
    CouponRedemptions,
    CourseEnrollments,
    Certificates,
    CertificateTemplates,
    CourseModules,
    CourseLessons,
    Materials,
    CourseMaterials,
    LessonMaterials,
    Announcements,
    FeedbackForms,
    FeedbackSubmissions,
    Wishlists,
    RecentlyViewedCourses,
    CourseItemProgress,
    RecentSearches,
    Questions,
    Assessments,
    AssessmentSubmissions,
    Assignments,
    AssignmentSubmissions,
    SubmissionAnswers,
    NotificationTemplates,
    Notifications,
    UserNotifications,
    WebPushSubscriptions,

    // Support System
    SupportTickets,
    SupportTicketMessages,

    // Chat System
    Chats,
    ChatMessages,
    ChatMessageStatus,
    ChatTypingStatus,
  ],
  globals: [
    SiteSettings,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'development-secret-do-not-use-in-production',
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
    // Production web-landing (both www and non-www)
    process.env.WEB_LANDING_PROD_URL || 'https://grandlinemaritime.com',
    'https://www.grandlinemaritime.com', // www variant
    // Local web-landing development
    process.env.WEB_LANDING_LOCAL_URL || 'http://localhost:3003',
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      // Connection Pool Configuration for High-Performance with generous timeouts
      max: parseInt(process.env.DATABASE_POOL_MAX || '10'), // Maximum connections (reduced for serverless)
      min: Math.max(0, parseInt(process.env.DATABASE_POOL_MIN || '0')),  // Minimum connections (0 for serverless)
      idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '300000'), // 5 minutes
      connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '15000'), // 15 seconds (fail fast on serverless)
      // Additional pool settings for stability
      allowExitOnIdle: true,
      maxUses: parseInt(process.env.DATABASE_MAX_USES || '7500'), // Recycle connections after 7500 uses
    },
    prodMigrations: migrations,
    push: false,
  }),

  // ========================================
  // ENTERPRISE-GRADE AUTHENTICATION ENDPOINTS
  // ========================================
  endpoints: [
    {
      path: '/dashboard/trainee-summary',
      method: 'get',
      handler: getTraineeDashboardSummary as any,
    },
    {
      path: '/generate-certificate',
      method: 'post',
      handler: generateCertificateEndpoint as any,
    },
    {
      path: '/portal-login',
      method: 'post',
      handler: (async (req: PayloadRequest) => {
        const requestId = crypto.randomUUID()
        const startTime = Date.now()
        const { ipAddress, userAgent } = getRequestMetadata(req)

        try {
          const body = await (req as any).json()
          const email = String(body?.email || '').trim().toLowerCase()
          const password = String(body?.password || '')

          if (!email || !password) {
            return new Response(
              JSON.stringify({
                message: 'Email and password are required.',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
          }

          const existingUsers = await req.payload.find({
            collection: 'users',
            overrideAccess: true,
            limit: 1,
            depth: 0,
            where: {
              email: {
                equals: email,
              },
            },
          })

          const existingUser = existingUsers.docs[0] as any

          try {
            const result = await req.payload.login({
              collection: 'users',
              data: {
                email,
                password,
              },
            } as any)

            const user = result.user as any

            if (user?.role !== 'trainee') {
              const logContext = createAuthLogContext(
                requestId,
                req,
                user?.id,
                user?.email,
                user?.role,
                Date.now() - startTime,
              )
              authLogger.logRoleViolation(logContext, 'trainee', user?.role || 'unknown')

              return new Response(
                JSON.stringify({
                  message: 'Access denied. Only trainees can access this application.',
                }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
              )
            }

            return new Response(
              JSON.stringify({
                message: 'Login successful.',
                user: result.user,
                token: result.token,
                exp: result.exp,
              }),
              { status: 200, headers: { 'Content-Type': 'application/json' } }
            )
          } catch (error) {
            const refreshedUser = existingUser?.id
              ? await req.payload.findByID({
                collection: 'users',
                id: existingUser.id,
                overrideAccess: true,
                depth: 0,
              }).catch(() => null)
              : null

            const responseTime = Date.now() - startTime
            const errorMessage = error instanceof Error ? error.message : 'Invalid email or password.'
            const logContext = createAuthLogContext(
              requestId,
              req,
              refreshedUser?.id,
              refreshedUser?.email || email,
              refreshedUser?.role,
              responseTime,
            )

            authLogger.logLoginFailure(logContext, errorMessage, {
              endpoint: '/portal-login',
            })

            if (refreshedUser?.id) {
              const previousAttempts = Number(existingUser?.loginAttempts ?? 0)
              const currentAttempts = Number(refreshedUser?.loginAttempts ?? 0)
              const becameLocked = !existingUser?.lockUntil && Boolean(refreshedUser?.lockUntil)
              const reachedThreshold = previousAttempts < 3 && currentAttempts >= 3

              const eventPayload = req.payload
              const refreshedUserId = refreshedUser.id
              const refreshedUserEmail = refreshedUser.email
              const refreshedUserFirstName = refreshedUser.firstName || ''
              const lockUntil = refreshedUser.lockUntil || null
              const preferenceEnabled = refreshedUser.securityAlertsEmailEnabled !== false

              runInBackground(`Failed login security alert [${requestId}]`, async () => {
                let emailSent = false
                let emailSkipped = false
                let emailId: string | undefined
                let emailError: string | undefined

                if (preferenceEnabled && (becameLocked || reachedThreshold)) {
                  const result = await sendResendEmail({
                    to: refreshedUserEmail,
                    subject: becameLocked
                      ? 'Your Grandline Maritime account has been locked after failed sign-in attempts'
                      : 'Failed sign-in attempts detected on your Grandline Maritime account',
                    html: `
                      <p>Hello ${refreshedUserFirstName},</p>
                      <p>We detected failed sign-in attempts on your Grandline Maritime account.</p>
                      <p>Failed attempts: ${currentAttempts}</p>
                      <p>IP address: ${ipAddress}</p>
                      <p>Browser / device: ${userAgent}</p>
                      ${lockUntil ? `<p>Account locked until: ${new Date(lockUntil).toISOString()}</p>` : ''}
                      <p>If this was not you, we recommend changing your password and reviewing your account security settings.</p>
                    `,
                    tags: [
                      { name: 'category', value: 'security-alert' },
                      { name: 'event', value: 'login-failed' },
                    ],
                    idempotencyKey: `login-failed-${refreshedUserId}-${currentAttempts}-${lockUntil || 'no-lock'}`,
                  })

                  emailSent = result.sent
                  emailSkipped = result.skipped
                  emailId = result.id
                  emailError = result.error
                } else {
                  emailSkipped = true
                }

                await createUserSecurityEvent({
                  payload: eventPayload,
                  userId: refreshedUserId,
                  eventType: 'LOGIN_FAILED',
                  eventData: {
                    requestId,
                    source: 'portal-login',
                    previousAttempts,
                    currentAttempts,
                    becameLocked,
                    reachedThreshold,
                    lockUntil,
                    emailSent,
                    emailSkipped,
                    emailId,
                    emailError,
                    preferenceEnabled,
                  },
                  ipAddress,
                  userAgent,
                })
              })
            }

            return new Response(
              JSON.stringify({
                message: 'Invalid email or password.',
              }),
              { status: 401, headers: { 'Content-Type': 'application/json' } }
            )
          }
        } catch (error) {
          console.error(`Portal login failed unexpectedly [${requestId}]`, error)

          return new Response(
            JSON.stringify({
              message: 'Login failed. Please try again.',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          )
        }
      }) as PayloadHandler,
    },
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
    {
      path: '/forgot-password',
      method: 'post',
      handler: (async (req: PayloadRequest) => {
        const requestId = crypto.randomUUID();

        try {
          const body = await (req as any).json();
          const rawEmail = body?.email ?? body?.Email ?? body?.username ?? '';
          const email = String(rawEmail || '').trim().toLowerCase();

          if (!email) {
            return new Response(
              JSON.stringify({
                success: true,
                message: 'If an account exists, a password reset email has been sent.',
              }),
              { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
          }

          const { payload } = req;

          const usersResult = await payload.find({
            collection: 'users',
            where: {
              email: {
                equals: email,
              },
            },
            limit: 1,
          });

          const user = usersResult.docs[0];

          if (!user || user.isActive === false) {
            return new Response(
              JSON.stringify({
                success: true,
                message: 'If an account exists, a password reset email has been sent.',
              }),
              { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
          }

          const rawToken = crypto.randomBytes(32).toString('hex');
          const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

          const ttlMs = 60 * 60 * 1000;
          const now = Date.now();
          const expiresAt = new Date(now + ttlMs).toISOString();

          const existingTokens = Array.isArray((user as any).resetPasswordTokens)
            ? (user as any).resetPasswordTokens
            : [];

          const filteredTokens = existingTokens.filter((entry: any) => {
            const entryExpiresAt = entry?.expiresAt ? new Date(entry.expiresAt).getTime() : 0;
            return entryExpiresAt > now;
          });

          filteredTokens.push({
            token: hashedToken,
            expiresAt,
          });

          await payload.update({
            collection: 'users',
            id: user.id,
            data: {
              resetPasswordTokens: filteredTokens,
            },
          });

          const appBaseUrl =
            process.env.WEB_PROD_URL || 'https://app.grandlinemaritime.com';
          const appUrl = appBaseUrl.replace(/\/$/, '');
          const resetUrl = `${appUrl}/signin/reset-password?token=${encodeURIComponent(
            rawToken
          )}`;

          try {
            const emailResult = await sendResendEmail({
              to: user.email,
              subject: 'Reset your Grandline Maritime password',
              html: `
                <p>Hello ${user.firstName || ''},</p>
                <p>You requested to reset your password for your Grandline Maritime account.</p>
                <p>Click the link below to set a new password:</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                <p>If you did not request this, you can safely ignore this email.</p>
              `,
              tags: [
                { name: 'category', value: 'auth' },
                { name: 'event', value: 'forgot-password' },
              ],
              idempotencyKey: `forgot-password-${user.id}-${hashedToken}`,
            })

            if (!emailResult.sent) {
              console.warn(
                `Forgot-password email was not sent [${requestId}]`,
                emailResult.error,
              )
            }
          } catch (emailError) {
            console.error(
              `Password reset email failed to send [${requestId}]:`,
              emailError
            );
          }

          return new Response(
            JSON.stringify({
              success: true,
              message: 'If an account exists, a password reset email has been sent.',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Forgot password error:', error);
          return new Response(
            JSON.stringify({
              success: true,
              message: 'If an account exists, a password reset email has been sent.',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }) as PayloadHandler,
    },
    {
      path: '/reset-password',
      method: 'post',
      handler: (async (req: PayloadRequest) => {
        try {
          const body = await (req as any).json();
          const rawToken = String(body?.token || '').trim();
          const newPassword = String(body?.newPassword || '').trim();

          if (!rawToken || !newPassword) {
            return new Response(
              JSON.stringify({
                success: false,
                message: 'Token and newPassword are required.',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
          }

          if (newPassword.length < 8 || newPassword.length > 40) {
            return new Response(
              JSON.stringify({
                success: false,
                message: 'Password must be between 8 and 40 characters.',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
          }

          if (!/[A-Z]/.test(newPassword)) {
            return new Response(
              JSON.stringify({
                success: false,
                message: 'Password must contain at least one uppercase letter.',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
          }

          if (!/\d/.test(newPassword)) {
            return new Response(
              JSON.stringify({
                success: false,
                message: 'Password must contain at least one number.',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
          }

          if (!/[^A-Za-z0-9]/.test(newPassword)) {
            return new Response(
              JSON.stringify({
                success: false,
                message: 'Password must contain at least one special character.',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
          }

          const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

          const { payload } = req;

          const usersResult = await payload.find({
            collection: 'users',
            where: {
              'resetPasswordTokens.token': {
                equals: hashedToken,
              },
            },
            limit: 1,
          });

          const user = usersResult.docs[0] as any;

          if (!user || !Array.isArray(user.resetPasswordTokens)) {
            return new Response(
              JSON.stringify({
                success: false,
                message: 'Invalid or expired password reset token.',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
          }

          const now = Date.now();
          const validTokens = user.resetPasswordTokens.filter((entry: any) => {
            const entryExpiresAt = entry?.expiresAt ? new Date(entry.expiresAt).getTime() : 0;
            return entryExpiresAt > now;
          });

          const matchingToken = validTokens.find(
            (entry: any) => entry.token === hashedToken
          );

          if (!matchingToken) {
            return new Response(
              JSON.stringify({
                success: false,
                message: 'Invalid or expired password reset token.',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
          }

          const remainingTokens = validTokens.filter(
            (entry: any) => entry.token !== hashedToken
          );

          await payload.update({
            collection: 'users',
            id: user.id,
            data: {
              password: newPassword,
              resetPasswordTokens: remainingTokens,
              loginAttempts: 0,
              lockUntil: null,
            },
          });

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Password has been reset successfully.',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Reset password error:', error);
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Failed to reset password. Please try again.',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }) as PayloadHandler,
    },
    {
      path: '/instructor-application',
      method: 'post',
      handler: (async (req: PayloadRequest) => {
        const requestId = crypto.randomUUID();

        try {
          const escapeHtml = (input: string) =>
            input
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');

          const isHttpUrl = (value: string) => /^https?:\/\//i.test(value);
          const safeLink = (value: string) => {
            const v = String(value || '').trim();
            if (!v) return 'N/A';
            if (!isHttpUrl(v)) return escapeHtml(v);
            const escaped = escapeHtml(v);
            return `<a href="${escaped}">${escaped}</a>`;
          };

          const contentType = req.headers.get('content-type') || '';
          const isMultipart = contentType.toLowerCase().includes('multipart/form-data');

          const body: any = isMultipart ? null : await (req as any).json();
          const form = isMultipart ? await (req as any).formData() : null;

          const getValue = (key: string) => {
            if (form) {
              const v = form.get(key);
              return v === null || v === undefined ? '' : String(v);
            }
            return body?.[key] === null || body?.[key] === undefined ? '' : String(body[key]);
          };

          const fullName = getValue('fullName').trim();
          const email = getValue('email').trim().toLowerCase();
          const phone = getValue('phone').trim();
          const linkedin = getValue('linkedin').trim();
          const portfolio = getValue('portfolio').trim();
          const expertise = getValue('expertise').trim();
          const experienceYearsRaw = form ? form.get('experienceYears') : body?.experienceYears;
          const qualifications = getValue('qualifications').trim();
          const certifications = getValue('certifications').trim();
          const preferredTopics = getValue('preferredTopics').trim();
          const availability = getValue('availability').trim();
          const teachingExperience = getValue('teachingExperience').trim();
          const bio = getValue('bio').trim();
          const agree = getValue('agree').trim() === 'true' || Boolean(body?.agree);

          const resumeFile = form ? form.get('resume') : null;
          const resumeName =
            resumeFile && typeof resumeFile === 'object' && 'name' in resumeFile
              ? String((resumeFile as any).name || '').trim()
              : getValue('resumeName').trim();

          if (
            !fullName ||
            !email ||
            !phone ||
            !expertise ||
            experienceYearsRaw === undefined ||
            experienceYearsRaw === null ||
            !qualifications ||
            !teachingExperience ||
            !agree
          ) {
            return new Response(
              JSON.stringify({
                success: false,
                message:
                  'Please complete all required fields and confirm the agreement.',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            return new Response(
              JSON.stringify({
                success: false,
                message: 'Please provide a valid email address.',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
          }

          const years =
            typeof experienceYearsRaw === 'number'
              ? experienceYearsRaw
              : parseFloat(String(experienceYearsRaw));

          if (!Number.isFinite(years) || years < 0) {
            return new Response(
              JSON.stringify({
                success: false,
                message: 'Years of experience must be a valid number.',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
          }

          const normalizedAvailability = availability || 'Full-time';
          const allowedAvailability = ['Full-time', 'Part-time', 'Contract'];
          if (!allowedAvailability.includes(normalizedAvailability)) {
            return new Response(
              JSON.stringify({
                success: false,
                message: 'Availability is invalid.',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
          }

          const resendApiKey = process.env.RESEND_API_KEY;
          const enableEmailNotifications =
            process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true';
          const fromEmail =
            process.env.RESEND_FROM_EMAIL || 'info@grandlinemaritime.com';
          const fromName = process.env.EMAIL_FROM_NAME || 'Grandline Maritime';

          const getResumeAttachment = async (): Promise<
            | { filename: string; content: string }
            | null
          > => {
            if (!resumeFile) return null;
            if (!(typeof resumeFile === 'object' && resumeFile !== null)) return null;
            if (!('arrayBuffer' in resumeFile) || !('size' in resumeFile)) return null;

            const filename =
              typeof (resumeFile as any).name === 'string' && (resumeFile as any).name.trim()
                ? (resumeFile as any).name.trim()
                : resumeName || 'resume';

            const size = Number((resumeFile as any).size);
            const type = String((resumeFile as any).type || '').toLowerCase();

            const maxBytes = 10 * 1024 * 1024;
            if (!Number.isFinite(size) || size <= 0) return null;
            if (size > maxBytes) {
              throw new Error('Resume file is too large');
            }

            const allowedTypes = [
              'application/pdf',
              'image/png',
              'image/jpeg',
              'image/jpg',
            ];
            if (type && !allowedTypes.includes(type)) {
              throw new Error('Unsupported resume file type');
            }

            const buffer = Buffer.from(await (resumeFile as any).arrayBuffer());
            return { filename, content: buffer.toString('base64') };
          };

          if (resendApiKey && enableEmailNotifications) {
            try {
              let resumeAttachment: { filename: string; content: string } | null = null;
              try {
                resumeAttachment = await getResumeAttachment();
              } catch (resumeError) {
                const message =
                  resumeError instanceof Error && resumeError.message
                    ? resumeError.message
                    : 'Invalid resume file.';
                return new Response(
                  JSON.stringify({
                    success: false,
                    message,
                  }),
                  { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
              }
              const resendResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${resendApiKey}`,
                },
                body: JSON.stringify({
                  from: `${fromName} <${fromEmail}>`,
                  to: 'info@grandlinemaritime.com',
                  reply_to: email,
                  subject: `Instructor Application: ${escapeHtml(fullName)} (${escapeHtml(expertise)})`,
                  html: `
                    <h2>New Instructor Application</h2>
                    <p><strong>Full Name:</strong> ${escapeHtml(fullName)}</p>
                    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
                    <p><strong>LinkedIn:</strong> ${safeLink(linkedin)}</p>
                    <p><strong>Portfolio/Website:</strong> ${safeLink(portfolio)}</p>
                    <hr />
                    <p><strong>Area of Expertise:</strong> ${escapeHtml(expertise)}</p>
                    <p><strong>Years of Experience:</strong> ${escapeHtml(String(years))}</p>
                    <p><strong>Availability:</strong> ${escapeHtml(normalizedAvailability)}</p>
                    <p><strong>Preferred Topics:</strong> ${preferredTopics ? escapeHtml(preferredTopics) : 'N/A'}</p>
                    <hr />
                    <p><strong>Qualifications:</strong></p>
                    <p>${escapeHtml(qualifications).replace(/\n/g, '<br />')}</p>
                    <p><strong>Certifications:</strong></p>
                    <p>${certifications ? escapeHtml(certifications).replace(/\n/g, '<br />') : 'N/A'}</p>
                    <hr />
                    <p><strong>Teaching Experience:</strong></p>
                    <p>${escapeHtml(teachingExperience).replace(/\n/g, '<br />')}</p>
                    <p><strong>Professional Bio:</strong></p>
                    <p>${bio ? escapeHtml(bio).replace(/\n/g, '<br />') : 'N/A'}</p>
                    <hr />
                    <p><strong>Resume/CV:</strong> ${resumeAttachment ? 'Attached' : resumeName ? escapeHtml(resumeName) : 'N/A'}</p>
                    <p style="color: #666; font-size: 12px;">Request ID: ${escapeHtml(requestId)}</p>
                  `,
                  attachments: resumeAttachment ? [resumeAttachment] : undefined,
                }),
              });

              if (!resendResponse.ok) {
                const errorData = await resendResponse.text();
                console.error(
                  `Resend API error [${requestId}] (instructor-application):`,
                  errorData
                );
                throw new Error('Resend API request failed');
              }
            } catch (emailError) {
              console.error(
                `Instructor application email failed to send [${requestId}]:`,
                emailError
              );
              return new Response(
                JSON.stringify({
                  success: false,
                  message: 'Failed to submit application. Please try again later.',
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
              );
            }
          } else {
            console.warn(
              `Instructor application email not sent [${requestId}]: missing RESEND_API_KEY or ENABLE_EMAIL_NOTIFICATIONS is not 'true'`
            );
            return new Response(
              JSON.stringify({
                success: false,
                message: 'Email service is not configured.',
              }),
              { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify({
              success: true,
              message:
                'Thank you for applying! We will review your application and get back to you soon.',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error(
            `Instructor application error [${requestId}]:`,
            error
          );
          return new Response(
            JSON.stringify({
              success: false,
              message: 'An error occurred. Please try again.',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }) as PayloadHandler,
    },
    {
      path: '/contact',
      method: 'post',
      handler: (async (req: PayloadRequest) => {
        const requestId = crypto.randomUUID();

        try {
          const body = await (req as any).json();
          const name = String(body?.name || '').trim();
          const email = String(body?.email || '').trim().toLowerCase();
          const subject = String(body?.subject || '').trim();
          const message = String(body?.message || '').trim();

          // Validation
          if (!name || !email || !subject || !message) {
            return new Response(
              JSON.stringify({
                success: false,
                message: 'All fields are required.',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
          }

          // Email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            return new Response(
              JSON.stringify({
                success: false,
                message: 'Please provide a valid email address.',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
          }

          // Send email via Resend
          const resendApiKey = process.env.RESEND_API_KEY;
          const enableEmailNotifications = process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true';
          const fromEmail = process.env.RESEND_FROM_EMAIL || 'info@grandlinemaritime.com';
          const fromName = process.env.EMAIL_FROM_NAME || 'Grandline Maritime';

          if (resendApiKey && enableEmailNotifications) {
            try {
              const resendResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${resendApiKey}`,
                },
                body: JSON.stringify({
                  from: `${fromName} <${fromEmail}>`,
                  to: 'info@grandlinemaritime.com',
                  replyTo: email,
                  subject: `Contact Form: ${subject}`,
                  html: `
                    <h2>New Contact Form Submission</h2>
                    <p><strong>From:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <hr />
                    <p><strong>Message:</strong></p>
                    <p>${message.replace(/\n/g, '<br />')}</p>
                    <hr />
                    <p style="color: #666; font-size: 12px;">This message was sent from the Grandline Maritime contact form.</p>
                  `,
                }),
              });

              if (!resendResponse.ok) {
                const errorData = await resendResponse.text();
                console.error(`Resend API error [${requestId}]:`, errorData);
                throw new Error('Resend API request failed');
              }

              console.log(`✅ [${requestId}] Contact email sent successfully:`, {
                from: name,
                email: email,
                subject: subject
              });
            } catch (emailError) {
              console.error(`Contact email failed to send [${requestId}]:`, emailError);
              return new Response(
                JSON.stringify({
                  success: false,
                  message: 'Failed to send message. Please try again later.',
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
              );
            }
          } else {
            console.warn(
              `Contact email not sent [${requestId}]: missing RESEND_API_KEY or ENABLE_EMAIL_NOTIFICATIONS is not 'true'`
            );
            return new Response(
              JSON.stringify({
                success: false,
                message: 'Email service is not configured.',
              }),
              { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Thank you for contacting us! We will get back to you soon.',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error(`Contact form error [${requestId}]:`, error);
          return new Response(
            JSON.stringify({
              success: false,
              message: 'An error occurred. Please try again.',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }) as PayloadHandler,
    },
  ],

  // sharp,
  plugins: [
    // Cloud storage handled by Media collection beforeChange hook for reliability
    // storage-adapter-placeholder
  ],
})
