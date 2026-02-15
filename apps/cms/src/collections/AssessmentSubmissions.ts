import type { CollectionConfig } from 'payload'
import { submitAssessmentHandler } from '../endpoints/submit-assessment'

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
  ],
}
