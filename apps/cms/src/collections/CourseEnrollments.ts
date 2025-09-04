import type { CollectionConfig } from 'payload'
import { lmsAccess } from '../access'

export const CourseEnrollments: CollectionConfig = {
  slug: 'course-enrollments',
  admin: {
    useAsTitle: 'displayTitle',
    defaultColumns: ['student', 'course', 'enrollmentType', 'status', 'enrolledAt'],
    group: 'Learning Management',
    description: 'Manage student course enrollments and access',
  },
  access: {
    read: lmsAccess.userEnrollment, // Instructors, admins, and students can read
    create: lmsAccess.userEnrollment, // Instructors and admins can create
    update: lmsAccess.userEnrollment, // Instructors and admins can update
    delete: lmsAccess.courseManagement, // Only instructors and admins can delete
  },
  fields: [
    // === CORE ENROLLMENT DATA ===
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'trainees',
      required: true,
      admin: {
        description: 'Student enrolled in the course',
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      admin: {
        description: 'Course the student is enrolled in',
      },
    },

    // === ENROLLMENT DETAILS ===
    {
      name: 'enrolledAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the student enrolled',
      },
    },
    {
      name: 'enrollmentType',
      type: 'select',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Paid', value: 'paid' },
        { label: 'Scholarship', value: 'scholarship' },
        { label: 'Trial', value: 'trial' },
        { label: 'Corporate', value: 'corporate' },
      ],
      defaultValue: 'free',
      required: true,
      admin: {
        description: 'Type of enrollment',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Completed', value: 'completed' },
        { label: 'Dropped', value: 'dropped' },
        { label: 'Expired', value: 'expired' },
        { label: 'Pending', value: 'pending' },
      ],
      defaultValue: 'active',
      required: true,
      admin: {
        description: 'Current enrollment status',
      },
    },

    // === PAYMENT & ACCESS ===
    {
      name: 'paymentStatus',
      type: 'select',
      options: [
        { label: 'Completed', value: 'completed' },
        { label: 'Pending', value: 'pending' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Not Required', value: 'not_required' },
      ],
      defaultValue: 'completed',
      admin: {
        description: 'Payment status for paid courses',
      },
    },
    {
      name: 'accessExpiresAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When access to the course expires (optional)',
      },
    },
    {
      name: 'amountPaid',
      type: 'number',
      min: 0,
      admin: {
        description: 'Amount paid for the course (if applicable)',
      },
    },

    // === PROGRESS TRACKING ===
    {
      name: 'progressPercentage',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 0,
      admin: {
        description: 'Overall course completion percentage',
      },
    },
    {
      name: 'lastAccessedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the student last accessed the course',
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the student completed the course',
      },
    },

    // === GRADING ===
    {
      name: 'currentGrade',
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        description: 'Current overall grade percentage',
      },
    },
    {
      name: 'finalGrade',
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        description: 'Final course grade percentage',
      },
    },
    {
      name: 'certificateIssued',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether a certificate has been issued',
      },
    },

    // === ADMINISTRATIVE ===
    {
      name: 'enrolledBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Who enrolled the student (admin/instructor)',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Administrative notes about this enrollment',
      },
    },

    // === COMPUTED DISPLAY TITLE ===
    {
      name: 'displayTitle',
      type: 'text',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [
          async ({ data, req: _req }) => {
            if (data && data.student && data.course) {
              try {
                // Create simple display title without complex queries
                data.displayTitle = `Student ${data.student} - Course ${data.course}`
              } catch (_error) {
                data.displayTitle = 'Enrollment'
              }
            }
            return data?.displayTitle || 'Enrollment'
          },
        ],
      },
    },

    // === FLEXIBLE METADATA ===
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional enrollment data and settings',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-set completion date when status changes to completed
        if (data && data.status === 'completed' && !data.completedAt) {
          data.completedAt = new Date().toISOString()
        }

        // Auto-set progress to 100% when completed
        if (data && data.status === 'completed' && data.progressPercentage !== 100) {
          data.progressPercentage = 100
        }

        return data
      },
    ],
  },
}
