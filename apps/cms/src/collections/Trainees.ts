import type { CollectionConfig } from 'payload'

export const Trainees: CollectionConfig = {
  slug: 'trainees',
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['user', 'enrollmentDate', 'currentLevel', 'isActive'],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      admin: {
        description: 'Link to user account',
      },
    },
    {
      name: 'enrollmentDate',
      type: 'date',
      required: true,
      admin: {
        description: 'Date when trainee enrolled',
      },
    },
    {
      name: 'currentLevel',
      type: 'select',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' },
      ],
      defaultValue: 'beginner',
      admin: {
        description: 'Current skill level',
      },
    },
    {
      name: 'coursesEnrolled',
      type: 'relationship',
      relationTo: 'posts', // Assuming posts are courses
      hasMany: true,
      admin: {
        description: 'Courses currently enrolled in',
      },
    },
    {
      name: 'progressPercentage',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 0,
      admin: {
        description: 'Overall progress percentage',
      },
    },
    {
      name: 'completedCourses',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      admin: {
        description: 'Completed courses',
      },
    },
    {
      name: 'emergencyContact',
      type: 'text',
      admin: {
        description: 'Emergency contact information',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether trainee is currently active',
      },
    },
  ],
}
