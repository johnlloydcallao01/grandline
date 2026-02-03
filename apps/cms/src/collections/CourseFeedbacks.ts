import type { CollectionConfig } from 'payload'

export const CourseFeedbacks: CollectionConfig = {
  slug: 'course-feedbacks',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'course', 'rating', 'createdAt'],
    group: 'Learning Management',
    description: 'Course feedback submitted by trainees',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'service' || user.role === 'admin' || user.role === 'instructor') {
        return true
      }
      return {
        user: { equals: user.id },
      }
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      return true
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'service' || user.role === 'admin' || user.role === 'instructor') {
        return true
      }
      return {
        user: { equals: user.id },
      }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'service' || user.role === 'admin' || user.role === 'instructor') {
        return true
      }
      return {
        user: { equals: user.id },
      }
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      filterOptions: {
        role: { equals: 'trainee' },
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      required: false,
    },
    {
      name: 'comment',
      type: 'textarea',
      required: true,
    },
  ],
}
