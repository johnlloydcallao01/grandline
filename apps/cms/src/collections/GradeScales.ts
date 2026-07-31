import type { CollectionConfig } from 'payload'

export const GRADE_SCALES_SLUG = 'grade-scales' as const

export const GradeScales: CollectionConfig = {
  slug: GRADE_SCALES_SLUG,
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
    group: 'Learning Management',
    description: 'Define grade scales for mapping percentage scores to letter grades',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => {
      return user?.role === 'admin' || user?.role === 'service' || false
    },
    update: ({ req: { user } }) => {
      return user?.role === 'admin' || user?.role === 'service' || false
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'admin' || false
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Name for this grade scale (e.g., Standard A-F, Pass/Fail)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional description of this grading scheme',
      },
    },
    {
      name: 'grades',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            description: 'Letter grade label (e.g., A, B+, Pass)',
          },
        },
        {
          name: 'minScore',
          type: 'number',
          required: true,
          min: 0,
          max: 100,
          admin: {
            description: 'Minimum percentage score for this grade',
          },
        },
        {
          name: 'maxScore',
          type: 'number',
          required: true,
          min: 0,
          max: 100,
          admin: {
            description: 'Maximum percentage score for this grade',
          },
        },
        {
          name: 'gpaValue',
          type: 'number',
          min: 0,
          max: 4,
          admin: {
            description: 'GPA value for this grade (e.g., 4.0 for A, 0.0 for F)',
          },
        },
        {
          name: 'description',
          type: 'text',
          admin: {
            description: 'Optional description of this grade level',
          },
        },
      ],
    },
  ],
}
