import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Assessments: CollectionConfig = {
  slug: 'assessments',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'module', 'assessmentType', 'order', 'passingScore'],
    group: 'Learning Management',
    description: 'Module-level assessments and exams for course curriculum',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'service' || user.role === 'admin' || user.role === 'instructor') {
        return true
      }
      return false
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin' || user.role === 'instructor'
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin' || user.role === 'instructor'
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin' || user.role === 'instructor'
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor(),
      admin: {
        description: 'Detailed assessment description and context',
        components: {
          Field: '/components/fields/CourseDescriptionEditor#CourseDescriptionEditor',
        },
      },
    },
    {
      name: 'assessmentType',
      type: 'select',
      options: [
        { label: 'Quiz', value: 'quiz' },
        { label: 'Exam', value: 'exam' },
        { label: 'Final Exam', value: 'final_exam' },
      ],
      defaultValue: 'quiz',
      required: true,
    },
    {
      name: 'module',
      type: 'relationship',
      relationTo: 'course-modules',
      admin: {
        condition: (_, siblingData) =>
          (siblingData as { assessmentType?: string } | undefined)?.assessmentType !== 'final_exam',
      },
      validate: (
        value: unknown,
        { siblingData }: { siblingData?: { assessmentType?: string } },
      ) => {
        if (!siblingData || siblingData.assessmentType === 'final_exam') {
          return true
        }
        if (!value) {
          return 'Module is required for quiz and exam assessments'
        }
        return true
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      admin: {
        condition: (_, siblingData) =>
          (siblingData as { assessmentType?: string } | undefined)?.assessmentType === 'final_exam',
      },
      validate: (
        value: unknown,
        { siblingData }: { siblingData?: { assessmentType?: string } },
      ) => {
        if (!siblingData || siblingData.assessmentType !== 'final_exam') {
          return true
        }
        if (!value) {
          return 'Course is required for final exams'
        }
        return true
      },
    },
    {
      name: 'passingScore',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 70,
    },
    {
      name: 'maxAttempts',
      type: 'number',
      min: 1,
      defaultValue: 1,
    },
    {
      name: 'timeLimitMinutes',
      type: 'number',
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'question',
          type: 'relationship',
          relationTo: 'questions',
          required: true,
        },
        {
          name: 'order',
          type: 'number',
        },
        {
          name: 'points',
          type: 'number',
          defaultValue: 1,
        },
      ],
    },
  ],
}
