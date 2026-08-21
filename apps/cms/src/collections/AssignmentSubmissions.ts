import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { recalculateEnrollmentGrade } from '../utils/gradeCalculation'
import { recalculateEnrollmentProgress } from '../utils/progressCalculation'
import { createNotificationFanout } from '../utils/notificationFanout'
import { getCourseInstructorUserIds, getTraineeUserId, getUserDisplayName } from '../utils/notificationTargets'

export const AssignmentSubmissions: CollectionConfig = {
  slug: 'assignment-submissions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['assignment', 'trainee', 'status', 'score', 'submittedAt'],
    group: 'Learning Management',
    description: 'Student submissions and instructor grading for assignments',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      // Admins and Instructors can read all
      if (['admin', 'instructor', 'service'].includes(user.role)) return true
      // Trainees can only read their own
      return {
        'trainee.user': {
          equals: user.id,
        },
      }
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      // Trainees create submissions. Admins/Service can also create.
      return ['admin', 'service', 'trainee'].includes(user.role)
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      // Admins/Instructors can grade. Trainees can update their own drafts.
      if (['admin', 'instructor', 'service'].includes(user.role)) return true
      return {
        'trainee.user': {
          equals: user.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin'
    },
  },
  fields: [
    {
      name: 'assignment',
      type: 'relationship',
      relationTo: 'assignments',
      required: true,
      index: true,
    },
    {
      name: 'trainee',
      type: 'relationship',
      relationTo: 'trainees',
      required: true,
      index: true,
    },
    {
      name: 'enrollment',
      type: 'relationship',
      relationTo: 'course-enrollments',
      required: true,
      index: true,
      admin: {
        description: 'The specific course enrollment context',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Submitted (Pending Grade)', value: 'submitted' },
        { label: 'Graded', value: 'graded' },
        { label: 'Returned for Revision', value: 'returned_for_revision' },
      ],
      index: true,
    },
    {
      name: 'submittedText',
      type: 'richText',
      editor: lexicalEditor(),
      admin: {
        description: 'The written answer provided by the student',
      },
    },
    {
      name: 'uploadedFiles',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Files uploaded by the student',
      },
    },
    {
      name: 'score',
      type: 'number',
      admin: {
        description: 'Grade given by the instructor',
      },
    },
    {
      name: 'feedback',
      type: 'richText',
      editor: lexicalEditor(),
      admin: {
        description: 'Instructor notes or rubric feedback',
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'gradedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'gradedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'The instructor who graded this submission',
      },
    },
    {
      name: 'isFeedbackRead',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        hidden: true,
        description: 'Internal flag tracking if the trainee has seen the instructor feedback',
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        if (doc.enrollment) {
          const enrollmentId = typeof doc.enrollment === 'object' ? doc.enrollment.id : doc.enrollment
          try {
            await recalculateEnrollmentProgress(req.payload, enrollmentId)
          } catch (err) {
            console.error('[AssignmentSubmissions Hook] Progress recalculation error:', err)
          }
        }

        if (doc.status === 'graded' && doc.enrollment) {
          const enrollmentId = typeof doc.enrollment === 'object' ? doc.enrollment.id : doc.enrollment
          try {
            const result = await recalculateEnrollmentGrade(req.payload, enrollmentId)
            if (result.currentGrade != null) {
              await req.payload.update({
                collection: 'course-enrollments',
                id: enrollmentId,
                data: {
                  currentGrade: result.currentGrade,
                  finalGrade: result.finalGrade,
                },
              })
            }
          } catch (err) {
            console.error('[AssignmentSubmissions Hook] Grade recalculation error:', err)
          }
        }
      },
      async ({ doc, previousDoc, req }) => {
        const status = doc.status
        const prevStatus = previousDoc?.status
        if (status !== 'submitted' || prevStatus === 'submitted') return
        if (!doc.enrollment) return

        try {
          const payload = req.payload
          const enrollmentId = typeof doc.enrollment === 'object' ? doc.enrollment.id : doc.enrollment
          const enrollment = await payload.findByID({
            collection: 'course-enrollments',
            id: enrollmentId,
            depth: 1,
            overrideAccess: true,
          })
          const courseId = typeof enrollment?.course === 'object' ? enrollment.course.id : enrollment?.course
          if (!courseId) return

          const instructorUserIds = await getCourseInstructorUserIds(payload, courseId)
          if (instructorUserIds.length === 0) return

          const traineeId = typeof doc.trainee === 'object' ? doc.trainee.id : doc.trainee
          const traineeUser = await getTraineeUserId(payload, traineeId)
          const traineeName = traineeUser ? await getUserDisplayName(payload, traineeUser) : 'A trainee'

          const assignmentId = typeof doc.assignment === 'object' ? doc.assignment.id : doc.assignment
          const assignment = assignmentId
            ? await payload.findByID({
                collection: 'assignments',
                id: assignmentId,
                depth: 0,
                overrideAccess: true,
              })
            : null
          const assignmentTitle = assignment?.title || 'Assignment'

          const title = `📝 New Assignment Submission: ${traineeName}`
          const body = `${traineeName} submitted "${assignmentTitle}".`

          await Promise.all(
            instructorUserIds.map((userId) =>
              createNotificationFanout({
                payload,
                userId,
                templateCode: 'ASSIGNMENT_SUBMISSION_INSTRUCTOR',
                category: 'learning',
                title,
                body,
                link: '/submissions/assignments',
                metadata: {
                  submissionId: doc.id,
                  assignmentId,
                  assignmentTitle,
                  courseId,
                  traineeName,
                },
                sourceType: 'assignment',
                sourceId: String(doc.id),
                push: {
                  title,
                  body,
                  url: '/submissions/assignments',
                  data: {
                    submissionId: doc.id,
                    assignmentId,
                    assignmentTitle,
                    courseId,
                    traineeName,
                  },
                },
              }),
            ),
          )

          console.log(`[AssignmentSubmissions Hook] Instructor fan-out attempted for course ${courseId}, users [${instructorUserIds.join(', ')}]`)
        } catch (err) {
          console.error('[AssignmentSubmissions Hook] Instructor notification error:', err)
        }
      },
    ],
  },
}
