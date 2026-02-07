import type { CollectionConfig } from 'payload'

export const CourseItemProgress: CollectionConfig = {
  slug: 'course-item-progress',
  admin: {
    useAsTitle: 'id',
    group: 'Learning Management',
    description: 'Tracks granular progress for lessons and assessments',
    defaultColumns: ['trainee', 'course', 'item', 'status', 'isCompleted', 'lastAccessedAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      // Admin and Instructors can read all
      if (['admin', 'instructor', 'service'].includes(user.role)) return true
      // Trainees can read their own progress
      return {
        'trainee.user': {
          equals: user.id,
        },
      }
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      // Only Service (API) and Admins can create progress records directly
      // This ensures business logic (like unlocking next lesson) is handled by the API layer
      return ['admin', 'service'].includes(user.role)
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      // Service (API) and Admins can update
      return ['admin', 'service'].includes(user.role)
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      // Only Admins can delete progress records
      return user.role === 'admin'
    },
  },
  fields: [
    // 1. Core Relationships
    {
      name: 'trainee',
      type: 'relationship',
      relationTo: 'trainees',
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
      name: 'item',
      type: 'relationship',
      relationTo: ['course-lessons', 'assessments'],
      required: true,
      index: true,
      hasMany: false,
    },
    {
      name: 'enrollment',
      type: 'relationship',
      relationTo: 'course-enrollments',
      required: true,
      index: true,
    },

    // 2. Progress State
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Not Started', value: 'not_started' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Passed', value: 'passed' },
        { label: 'Failed', value: 'failed' },
      ],
      defaultValue: 'not_started',
      required: true,
      index: true,
    },
    {
      name: 'isCompleted',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        description: 'Explicit completion flag for quick filtering',
      },
    },
    {
      name: 'progressPercentage',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 0,
      admin: {
        description: 'Percentage of content consumed (e.g., video progress)',
      },
    },

    // 3. Timestamps (Auditing)
    {
      name: 'startedAt',
      type: 'date',
    },
    {
      name: 'completedAt',
      type: 'date',
    },
    {
      name: 'lastAccessedAt',
      type: 'date',
      index: true,
    },
    {
      name: 'durationSeconds',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Total time spent on this item (accumulated)',
      },
    },

    // 4. Performance Data (Quizzes/Exams)
    {
      name: 'score',
      type: 'number',
      admin: {
        description: 'Raw score achieved',
      },
    },
    {
      name: 'grade',
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        description: 'Normalized grade (0-100)',
      },
    },
    {
      name: 'attempts',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'quizData',
      type: 'json',
      admin: {
        description: 'Detailed question-level responses or state',
      },
    },
  ],
  indexes: [
    {
      fields: ['trainee', 'course'],
      // Removed 'item' from compound index because it is a polymorphic relationship
      // Polymorphic relationships are stored as 'item_id' and 'item_type' in the database
      // Payload/Drizzle has a known issue indexing polymorphic fields directly in compound indexes
      unique: false, 
    },
    {
      fields: ['enrollment', 'isCompleted'],
    },
  ],
}
