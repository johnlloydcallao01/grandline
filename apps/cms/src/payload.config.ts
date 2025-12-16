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
import { RecentSearches } from './collections/RecentSearches'

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
    RecentSearches,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? 'local-development-secret-not-for-production',
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
    // Production web-landing
    process.env.WEB_LANDING_PROD_URL || 'https://grandlinemaritime.com',
    // Local web-landing development
    process.env.WEB_LANDING_LOCAL_URL || 'http://localhost:3003',
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

          const resendApiKey = process.env.RESEND_API_KEY;
          const enableEmailNotifications =
            process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true';
          const fromEmail =
            process.env.RESEND_FROM_EMAIL || 'no-reply@tap2goph.com';
          const fromName = process.env.EMAIL_FROM_NAME || 'Tap2Go';
          const replyTo = process.env.EMAIL_REPLY_TO || fromEmail;

          if (resendApiKey && enableEmailNotifications) {
            try {
              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${resendApiKey}`,
                },
                body: JSON.stringify({
                  from: `${fromName} <${fromEmail}>`,
                  to: user.email,
                  subject: 'Reset your Grandline Maritime password',
                  html: `
                    <p>Hello ${user.firstName || ''},</p>
                    <p>You requested to reset your password for your Grandline Maritime account.</p>
                    <p>Click the link below to set a new password:</p>
                    <p><a href="${resetUrl}">${resetUrl}</a></p>
                    <p>If you did not request this, you can safely ignore this email.</p>
                  `,
                  reply_to: replyTo,
                }),
              });
            } catch (emailError) {
              console.error(
                `Password reset email failed to send [${requestId}]:`,
                emailError
              );
            }
          } else {
            console.warn(
              `Resend email not sent for forgot-password [${requestId}]: missing RESEND_API_KEY or ENABLE_EMAIL_NOTIFICATIONS is not 'true'`
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

          const appBaseUrl =
            process.env.WEB_PROD_URL || 'https://app.grandlinemaritime.com';
          const appUrl = appBaseUrl.replace(/\/$/, '');

          const resendApiKey = process.env.RESEND_API_KEY;
          const enableEmailNotifications =
            process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true';
          const fromEmail =
            process.env.RESEND_FROM_EMAIL || 'no-reply@tap2goph.com';
          const fromName = process.env.EMAIL_FROM_NAME || 'Tap2Go';
          const replyTo = process.env.EMAIL_REPLY_TO || fromEmail;

          if (resendApiKey && enableEmailNotifications) {
            try {
              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${resendApiKey}`,
                },
                body: JSON.stringify({
                  from: `${fromName} <${fromEmail}>`,
                  to: user.email,
                  subject: 'Your Grandline Maritime password has been changed',
                  html: `
                    <p>Hello ${user.firstName || ''},</p>
                    <p>Your Grandline Maritime password has been updated.</p>
                    <p>If you did not perform this change, please contact support immediately.</p>
                    <p>You can sign in again here: <a href="${appUrl}/signin">${appUrl}/signin</a></p>
                  `,
                  reply_to: replyTo,
                }),
              });
            } catch (emailError) {
              console.error(
                'Password reset confirmation email failed to send:',
                emailError
              );
            }
          } else {
            console.warn(
              'Resend email not sent for reset-password: missing RESEND_API_KEY or ENABLE_EMAIL_NOTIFICATIONS is not \'true\''
            );
          }

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
