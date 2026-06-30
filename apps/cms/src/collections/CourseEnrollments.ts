import { APIError, type CollectionConfig } from 'payload'
import { lmsAccess } from '../access'
import { createNotificationFanout } from '../utils/notificationFanout'
import { AccountingLmsBridgeSyncService } from '../accounting/services/enrollment-billing/AccountingLmsBridgeSyncService'

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
    {
      name: 'coupon',
      type: 'relationship',
      relationTo: 'coupon-codes',
      index: true,
      admin: {
        description: 'Coupon applied to this enrollment, if any.',
      },
    },
    {
      name: 'couponCode',
      type: 'text',
      index: true,
      admin: {
        description: 'Coupon code snapshot stored at enrollment time.',
      },
    },
    {
      name: 'couponDiscountAmount',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Discount amount applied by the coupon for this enrollment.',
      },
    },
    {
      name: 'listPriceSnapshot',
      type: 'number',
      min: 0,
      admin: {
        description: 'Original course price at the time of enrollment.',
      },
    },
    {
      name: 'finalPriceSnapshot',
      type: 'number',
      min: 0,
      admin: {
        description: 'Final calculated price after course sale and coupon logic.',
      },
    },
    {
      name: 'pricingBreakdown',
      type: 'json',
      admin: {
        description: 'Detailed pricing breakdown snapshot for auditing.',
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
      name: 'finalEvaluation',
      type: 'select',
      options: [
        { label: 'Passed', value: 'passed' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: {
        description: 'Final evaluation outcome (Passed/Failed)',
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

    // === ARCHIVAL ===
    {
      name: 'isArchived',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'When true, this enrollment is hidden from the active management view (soft-delete)',
        position: 'sidebar',
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
      async ({ data, req, operation, originalDoc }) => {
        // 1. Prevent duplicate active enrollments
        // We must ensure that for a given student and course, there is only ONE active enrollment.
        // If the status is becoming 'active' (or is remaining 'active'), we check for duplicates.

        const effectiveStatus = data?.status || (operation === 'create' ? 'active' : originalDoc?.status)

        if (effectiveStatus === 'active') {
          const getRelId = (val: any) => (val && typeof val === 'object' && 'id' in val) ? val.id : val
          const studentId = getRelId(data?.student) || (originalDoc ? getRelId(originalDoc.student) : null)
          const courseId = getRelId(data?.course) || (originalDoc ? getRelId(originalDoc.course) : null)

          if (studentId && courseId) {
            const existingEnrollments = await req.payload.find({
              collection: 'course-enrollments',
              where: {
                and: [
                  {
                    student: {
                      equals: studentId,
                    },
                  },
                  {
                    course: {
                      equals: courseId,
                    },
                  },
                  {
                    status: {
                      equals: 'active',
                    },
                  },
                  ...(operation === 'update' && originalDoc?.id
                    ? [
                      {
                        id: {
                          not_equals: originalDoc.id,
                        },
                      },
                    ]
                    : []),
                ],
              },
              limit: 1,
              depth: 0,
            })

            if (existingEnrollments.totalDocs > 0) {
              throw new APIError(
                'An active enrollment already exists for this student in this course.',
                400,
                undefined,
                true,
              )
            }
          }
        }

        // 2. Auto-set completion date when status changes to completed
        if (data && data.status === 'completed' && !data.completedAt) {
          data.completedAt = new Date().toISOString()
        }

        // 3. Auto-set progress to 100% when completed
        if (data && data.status === 'completed' && data.progressPercentage !== 100) {
          data.progressPercentage = 100
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req, previousDoc }) => {
        const currentStatus = typeof doc.status === 'string' ? doc.status : ''
        const previousStatus = typeof previousDoc?.status === 'string' ? previousDoc.status : ''
        const payload = req.payload
        const isAdminSource = (req as any)?.context?.source === 'admin'

        if (isAdminSource) return
        if (currentStatus === 'dropped' || currentStatus === 'expired' || currentStatus === 'suspended') {
          return
        }

        try {
          const recognitionTrigger =
            currentStatus === 'completed'
              ? 'completion'
              : currentStatus === 'active'
                ? 'activation'
                : 'schedule_only'

          await AccountingLmsBridgeSyncService.syncEnrollmentArtifacts({
            payload,
            enrollmentId: doc.id,
            userId: req.user?.id,
            createZeroValueInvoice: false,
            autoPost: false,
            recognitionTrigger,
          })
        } catch (accountingError) {
          console.error('[CourseEnrollments Hook] Failed to sync LMS accounting bridge:', accountingError)
        }

        const shouldNotifyActive =
          currentStatus === 'active' &&
          (operation === 'create' || previousStatus !== 'active')

        const shouldNotifyPending =
          currentStatus === 'pending' &&
          (operation === 'create' || previousStatus !== 'pending')

        if (!shouldNotifyActive && !shouldNotifyPending) return

        try {
          // 1. Get trainee's user ID
          const studentId = typeof doc.student === 'object' ? doc.student.id : doc.student
          const trainee = await payload.findByID({
            collection: 'trainees',
            id: studentId,
            depth: 0,
          })

          const userId = typeof trainee.user === 'object' ? trainee.user.id : trainee.user

          // 2. Get course details
          const courseId = typeof doc.course === 'object' ? doc.course.id : doc.course
          const course = await payload.findByID({
            collection: 'courses',
            id: courseId,
            depth: 0,
            overrideAccess: true,
          })

          const isPendingNotification = currentStatus === 'pending'
          const title = isPendingNotification
            ? `📝 Enrollment Request Received: ${course.title}`
            : `🎓 Welcome to ${course.title}!`
          const body = isPendingNotification
            ? `Your enrollment request for ${course.title} has been received and is now pending review. We will notify you once it is approved.`
            : `You have been successfully enrolled in ${course.title}. Start learning now!`
          const link = `/portal/account/enrollments/${doc.id}`
          const metadata = {
            enrollmentId: doc.id,
            courseId: course.id,
            courseName: course.title,
            enrollmentType: doc.enrollmentType,
            enrollmentStatus: currentStatus,
          }

          await createNotificationFanout({
            payload,
            userId,
            templateCode: isPendingNotification ? 'COURSE_ENROLLMENT_PENDING' : 'COURSE_ENROLLED',
            category: 'learning',
            title,
            body,
            link,
            metadata,
            sourceType: 'enrollment',
            sourceId: String(doc.id),
            push: {
              title,
              body,
              url: link,
              data: metadata,
            },
          })

          console.log(`[CourseEnrollments Hook] Notification created, broadcast, and push fan-out attempted for user ${userId}, course ${course.title}`)
        } catch (notifyError) {
          // Log error but don't fail the enrollment
          console.error('[CourseEnrollments Hook] Failed to create notification:', notifyError)
        }
      },
    ],
  },
}
