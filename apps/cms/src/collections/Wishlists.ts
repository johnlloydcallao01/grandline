import type { CollectionConfig } from 'payload'

export const Wishlists: CollectionConfig = {
  slug: 'wishlists',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'course', 'createdAt'],
    group: 'Learning Management',
    description: 'Manage user course wishlists',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'service' || user.role === 'admin') return true
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
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
    },
    {
      name: 'compositeKey',
      type: 'text',
      unique: true,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data) return data
        const userId = typeof data.user === 'object' ? (data.user as any)?.id : data.user
        const courseId =
          typeof data.course === 'object' ? (data.course as any)?.id : data.course
        if (!data.compositeKey && userId && courseId) {
          data.compositeKey = `${userId}:${courseId}`
        }
        return data
      },
    ],
  },
}

