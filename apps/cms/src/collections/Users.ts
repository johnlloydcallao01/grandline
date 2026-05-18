import crypto from 'crypto'
import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { adminOnly } from '../access'
import { authLogger, createAuthLogContext } from '../utils/auth-logger'
import { runInBackground } from '../utils/background-task'
import { getRequestMetadata, inferPasswordChangeSource } from '../utils/request-metadata'
import { sendResendEmail } from '../utils/resend-email'
import { createUserSecurityEvent } from '../utils/user-security-events'

const PASSWORD_CHANGE_CONTEXT_KEY = 'userPasswordChangeSecurityAlert'

interface PasswordChangeSecurityContext {
  requestId: string
  source: string
  ipAddress: string
  userAgent: string
  targetUserId: string
}

function setPasswordChangeSecurityContext(
  req: { context?: Record<string, unknown> | null },
  value: PasswordChangeSecurityContext,
): void {
  const context = (req.context || {}) as Record<string, unknown>
  context[PASSWORD_CHANGE_CONTEXT_KEY] = value
  req.context = context
}

function consumePasswordChangeSecurityContext(
  req: { context?: Record<string, unknown> | null },
  targetUserId: string | number,
): PasswordChangeSecurityContext | null {
  const context = req.context as Record<string, unknown> | null | undefined
  const stored = context?.[PASSWORD_CHANGE_CONTEXT_KEY]

  if (!stored || typeof stored !== 'object') {
    return null
  }

  const passwordChangeContext = stored as PasswordChangeSecurityContext
  delete context?.[PASSWORD_CHANGE_CONTEXT_KEY]

  if (passwordChangeContext.targetUserId !== String(targetUserId)) {
    return null
  }

  return passwordChangeContext
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'role'],
  },
  auth: {
    tokenExpiration: 30 * 24 * 60 * 60, // 30 days in seconds (2,592,000 seconds)
    maxLoginAttempts: 5,
    lockTime: 600 * 1000, // 10 minutes in milliseconds
    useAPIKey: true, // Enable API key generation for service accounts
    depth: 2,
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      domain: process.env.NODE_ENV === 'production'
        ? (process.env.COOKIE_DOMAIN || '.grandlinemaritime.com')
        : undefined,
    },
  },
  access: {
    read: () => true, // Allow reading user data
    create: adminOnly, // Only admins can create users
    update: ({ req: { user } }) => {
      // Users can update their own data, admins can update any
      if (user?.role === 'admin') return true;
      return { id: { equals: user?.id } };
    },
    delete: ({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'service') return true;
      return false;
    },
  },
  hooks: {
    beforeDelete: [
      async ({ id }) => {
        console.log(`🗑️ Attempting to delete user ${id}`);
      },
    ],
    beforeChange: [
      async ({ req, data, operation, originalDoc }) => {
        if (operation !== 'update' || !data || typeof data.password !== 'string' || !data.password) {
          return data
        }

        const targetUserId = data.id || originalDoc?.id

        if (!targetUserId) {
          return data
        }

        const requestId = crypto.randomUUID()
        const { ipAddress, userAgent } = getRequestMetadata(req)

        setPasswordChangeSecurityContext(req, {
          requestId,
          source: inferPasswordChangeSource(req, targetUserId),
          ipAddress,
          userAgent,
          targetUserId: String(targetUserId),
        })

        return data
      },
    ],
    afterLogin: [
      async ({ req, user, token }) => {
        const requestId = crypto.randomUUID()
        const { ipAddress, userAgent } = getRequestMetadata(req)
        const logContext = createAuthLogContext(requestId, req, user.id, user.email, user.role)

        authLogger.logLoginSuccess(logContext, {
          endpoint: '/users/login',
          tokenIssued: Boolean(token),
        })

        try {
          await req.payload.update({
            collection: 'users',
            id: user.id,
            data: {
              lastLogin: new Date().toISOString(),
            },
            overrideAccess: true,
          })
        } catch (error) {
          console.warn(`Failed to update lastLogin after login [${requestId}]`, error)
        }

        try {
          await createUserSecurityEvent({
            payload: req.payload,
            userId: user.id,
            eventType: 'LOGIN_SUCCESS',
            eventData: {
              requestId,
              source: 'users.afterLogin',
              role: user.role,
            },
            triggeredBy: user.id,
            ipAddress,
            userAgent,
          })
        } catch (error) {
          console.warn(`Failed to record login success event [${requestId}]`, error)
        }

        return user
      },
    ],
    afterChange: [
      async ({ req, doc, operation }) => {
        if (operation !== 'update') {
          return doc
        }

        const passwordChangeContext = consumePasswordChangeSecurityContext(req, doc.id)

        if (!passwordChangeContext) {
          return doc
        }

        const { requestId, source, ipAddress, userAgent } = passwordChangeContext
        const appBaseUrl = process.env.WEB_PROD_URL || 'https://app.grandlinemaritime.com'
        const appUrl = appBaseUrl.replace(/\/$/, '')

        const eventPayload = req.payload
        const triggeredBy = req.user?.id
        const preferenceEnabled = doc.securityAlertsEmailEnabled !== false
        const docId = doc.id
        const docEmail = doc.email
        const docFirstName = doc.firstName || ''

        runInBackground(`Password change security alert [${requestId}]`, async () => {
          let emailSent = false
          let emailSkipped = false
          let emailId: string | undefined
          let emailError: string | undefined

          if (preferenceEnabled && docEmail) {
            const result = await sendResendEmail({
              to: docEmail,
              subject: 'Your Grandline Maritime password has been changed',
              html: `
                <p>Hello ${docFirstName},</p>
                <p>Your Grandline Maritime password has been updated.</p>
                <p>Source: ${source}</p>
                <p>IP address: ${ipAddress}</p>
                <p>Browser / device: ${userAgent}</p>
                <p>If you did not perform this change, please contact support immediately.</p>
                <p>You can review your account here: <a href="${appUrl}/portal/account?tab=Preferences">${appUrl}/portal/account?tab=Preferences</a></p>
              `,
              tags: [
                { name: 'category', value: 'security-alert' },
                { name: 'event', value: 'password-changed' },
              ],
              idempotencyKey: `password-changed-${docId}-${requestId}`,
            })

            emailSent = result.sent
            emailSkipped = result.skipped
            emailId = result.id
            emailError = result.error

            if (!result.sent && !result.skipped) {
              console.error(`Password change security email failed [${requestId}]`, result.error)
            }
          } else {
            emailSkipped = true
          }

          try {
            await createUserSecurityEvent({
              payload: eventPayload,
              userId: docId,
              eventType: 'PASSWORD_CHANGED',
              eventData: {
                requestId,
                source,
                emailSent,
                emailSkipped,
                emailId,
                emailError,
                preferenceEnabled,
              },
              triggeredBy,
              ipAddress,
              userAgent,
            })
          } catch (error) {
            console.warn(`Failed to record password change event [${requestId}]`, error)
          }
        })

        return doc
      },
    ],
  },

  fields: [
    // Email and password are added automatically by auth: true
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'middleName',
      type: 'text',
      admin: {
        description: 'Middle name (optional)',
      },
    },
    {
      name: 'nameExtension',
      type: 'text',
      admin: {
        description: 'Name extension (e.g., Jr., Sr., III)',
      },
    },
    {
      name: 'username',
      type: 'text',
      unique: true,
      admin: {
        description: 'Unique username for login',
      },
    },
    {
      name: 'gender',
      type: 'select',
      options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' },
        { label: 'Prefer not to say', value: 'prefer_not_to_say' },
      ],
      admin: {
        description: 'Gender identity',
      },
    },
    {
      name: 'civilStatus',
      type: 'select',
      options: [
        { label: 'Single', value: 'single' },
        { label: 'Married', value: 'married' },
        { label: 'Divorced', value: 'divorced' },
        { label: 'Widowed', value: 'widowed' },
        { label: 'Separated', value: 'separated' },
      ],
      admin: {
        description: 'Civil status',
      },
    },
    {
      name: 'nationality',
      type: 'text',
      admin: {
        description: 'Nationality',
      },
    },
    {
      name: 'birthDate',
      type: 'date',
      admin: {
        description: 'Date of birth',
      },
    },
    {
      name: 'placeOfBirth',
      type: 'text',
      admin: {
        description: 'Place of birth',
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description: 'Contact phone number',
      },
    },
    {
      name: 'completeAddress',
      type: 'textarea',
      admin: {
        description: 'Complete address',
      },
    },

    {
      name: 'biography',
      label: 'Biography',
      type: 'richText',
      editor: lexicalEditor(),
      admin: {
        description: 'Public biography or professional background',
        components: {
          Field: '/components/fields/CourseDescriptionEditor#CourseDescriptionEditor',
        },
      },
    },
    {
      name: 'role',
      type: 'select',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Instructor',
          value: 'instructor',
        },
        {
          label: 'Trainee',
          value: 'trainee',
        },
        {
          label: 'Service Account', // Step 2: Add dedicated role for API key users
          value: 'service',
        },
      ],
      defaultValue: 'trainee',
      required: true,
      admin: {
        description: 'User role determines access permissions. Service accounts are for API key authentication.',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Inactive users cannot log in',
      },
    },
    {
      name: 'pushNotificationsEnabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Allows this user to receive browser web push notifications when they have an active subscription',
      },
    },
    {
      name: 'securityAlertsEmailEnabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Allows this user to receive email alerts for password changes and meaningful failed login attempts',
      },
    },

    {
      name: 'lastLogin',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Last login timestamp',
      },
    },
    {
      name: 'profilePicture',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'User profile picture',
      },
    },
    {
      name: 'resetPasswordTokens',
      type: 'array',
      fields: [
        {
          name: 'token',
          type: 'text',
          required: true,
        },
        {
          name: 'expiresAt',
          type: 'date',
          required: true,
        },
      ],
    },
  ],
}
