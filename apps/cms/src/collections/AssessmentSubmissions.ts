import type { CollectionConfig } from 'payload'
import { submitAssessmentHandler } from '../endpoints/submit-assessment'
import { recalculateEnrollmentGrade } from '../utils/gradeCalculation'
import { recalculateEnrollmentProgress } from '../utils/progressCalculation'
import { createNotificationFanout } from '../utils/notificationFanout'
import { getCourseInstructorUserIds, getTraineeUserId, getUserDisplayName } from '../utils/notificationTargets'

export const AssessmentSubmissions: CollectionConfig = {
  slug: 'assessment-submissions',
  endpoints: [
    {
      path: '/submit-assessment',
      method: 'post',
      handler: submitAssessmentHandler,
    },
  ],
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['trainee', 'assessment', 'status', 'score', 'attemptNumber', 'completedAt'],
    group: 'Learning Management',
    description: 'Detailed records of student assessment attempts',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'service' || user.role === 'admin' || user.role === 'instructor') {
        return true
      }
      if (user.role === 'trainee') {
        return {
          trainee: {
            equals: user.id,
          },
        }
      }
      return false
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin' || user.role === 'service'
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin' || user.role === 'service'
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin'
    },
  },
  fields: [
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
    },
    {
      name: 'assessment',
      type: 'relationship',
      relationTo: 'assessments',
      required: true,
      index: true,
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Submitted', value: 'submitted' },
        { label: 'Graded', value: 'graded' },
      ],
      defaultValue: 'in_progress',
      required: true,
    },
    {
      name: 'attemptNumber',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'score',
      type: 'number',
      min: 0,
      max: 100,
    },
    {
      name: 'pointsTotal',
      type: 'number',
      admin: {
        description: 'Total points earned by the trainee',
      },
    },
    {
      name: 'pointsPossible',
      type: 'number',
      admin: {
        description: 'Maximum points possible for this assessment at the time of taking',
      },
    },
    {
      name: 'passingScoreSnapshot',
      type: 'number',
      admin: {
        description: 'Snapshot of the passing score required at the time of taking',
      },
    },
    {
      name: 'startedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
    },
    {
      name: 'completedAt',
      type: 'date',
    },
    {
      name: 'isLatest',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Indicates if this is the most recent attempt for this assessment',
      },
    },
    {
      name: 'isFeedbackRead',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        hidden: true,
        description: 'Internal flag tracking if the trainee has seen the automated score feedback',
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
            console.error('[AssessmentSubmissions Hook] Progress recalculation error:', err)
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
            console.error('[AssessmentSubmissions Hook] Grade recalculation error:', err)
          }
        }
      },
      async ({ doc, previousDoc, req }) => {
        const status = doc.status
        const prevStatus = previousDoc?.status
        if (status !== 'submitted' || prevStatus === 'submitted') return

        try {
          const payload = req.payload
          const courseId = typeof doc.course === 'object' ? doc.course.id : doc.course
          if (!courseId) return

          const instructorUserIds = await getCourseInstructorUserIds(payload, courseId)
          if (instructorUserIds.length === 0) return

          const traineeId = typeof doc.trainee === 'object' ? doc.trainee.id : doc.trainee
          const traineeUser = await getTraineeUserId(payload, traineeId)
          const traineeName = traineeUser ? await getUserDisplayName(payload, traineeUser) : 'A trainee'

          const assessmentId = typeof doc.assessment === 'object' ? doc.assessment.id : doc.assessment
          const assessment = assessmentId
            ? await payload.findByID({
                collection: 'assessments',
                id: assessmentId,
                depth: 0,
                overrideAccess: true,
              })
            : null
          const assessmentTitle = assessment?.title || 'Assessment'

          const title = `📝 New Assessment Submission: ${traineeName}`
          const body = `${traineeName} submitted "${assessmentTitle}".`

          await Promise.all(
            instructorUserIds.map((userId) =>
              createNotificationFanout({
                payload,
                userId,
                templateCode: 'ASSESSMENT_SUBMISSION_INSTRUCTOR',
                category: 'learning',
                title,
                body,
                link: '/submissions/assessments',
                metadata: {
                  submissionId: doc.id,
                  assessmentId,
                  assessmentTitle,
                  courseId,
                  traineeName,
                },
                sourceType: 'assessment',
                sourceId: String(doc.id),
                push: {
                  title,
                  body,
                  url: '/submissions/assessments',
                  data: {
                    submissionId: doc.id,
                    assessmentId,
                    assessmentTitle,
                    courseId,
                    traineeName,
                  },
                },
              }),
            ),
          )

          console.log(`[AssessmentSubmissions Hook] Instructor fan-out attempted for course ${courseId}, users [${instructorUserIds.join(', ')}]`)
        } catch (err) {
          console.error('[AssessmentSubmissions Hook] Instructor notification error:', err)
        }
      },
    ],
  },
}
