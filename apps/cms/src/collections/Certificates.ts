import type { CollectionConfig } from 'payload'
import { adminOnly } from '../access'

export const Certificates: CollectionConfig = {
  slug: 'certificates',
  admin: {
    useAsTitle: 'certificateCode',
    defaultColumns: ['certificateCode', 'trainee', 'course', 'issueDate', 'status'],
    group: 'Learning Management',
    description: 'System-generated course completion certificates',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'service' || user?.role === 'instructor') {
        return true
      }

      // Authenticated trainees can see their own certificates
      if (user) {
        return {
          'trainee.user': {
            equals: user.id,
          },
        }
      }

      // Public verification: Allow reading by certificateCode
      // Public verification should be handled via a custom endpoint or a server-side client with privileges.
      return false
    },
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'certificateCode',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Unique alphanumeric code (e.g., CERT-2026-ABCD-1234)',
      },
    },
    {
      name: 'verificationUrl',
      type: 'text',
      admin: {
        description: 'Public URL for certificate verification',
      },
    },
    {
      name: 'trainee',
      type: 'relationship',
      relationTo: 'trainees',
      required: true,
      hasMany: false,
      index: true,
      admin: {
        description: 'The student who earned the certificate',
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      hasMany: false,
      index: true,
      admin: {
        description: 'The course completed',
      },
    },
    {
      name: 'enrollment',
      type: 'relationship',
      relationTo: 'course-enrollments',
      required: true,
      hasMany: false,
      index: true,
      admin: {
        description: 'The enrollment record triggering this certificate',
      },
    },
    {
      name: 'issueDate',
      type: 'date',
      defaultValue: () => new Date(),
      required: true,
      admin: {
        description: 'Official date of issuance',
      },
    },
    {
      name: 'expiryDate',
      type: 'date',
      admin: {
        description: 'Optional expiration date',
      },
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Generated certificate PDF',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Snapshot of course data at time of issue',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Revoked', value: 'revoked' },
        { label: 'Expired', value: 'expired' },
      ],
      defaultValue: 'active',
      required: true,
    },
  ],
}
