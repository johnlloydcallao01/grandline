import type { CollectionConfig } from 'payload'

export const RecentlyViewedCourses: CollectionConfig = {
  slug: 'recently-viewed-courses',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'course', 'viewedAt', 'viewCount'],
    group: 'Learning Management',
    description: 'Track recently viewed courses by users',
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
      name: 'viewedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the course was viewed',
      },
    },
    {
      name: 'viewCount',
      type: 'number',
      defaultValue: 1,
      admin: {
        description: 'Number of times the user viewed the course',
      },
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
    afterChange: [
      async ({ req, doc }) => {
        const payload = req.payload
        if (!payload) return

        const userValue = (doc as any).user
        if (!userValue) return

        const userId =
          typeof userValue === 'object' && userValue !== null && 'id' in userValue
            ? (userValue as any).id
            : userValue

        if (!userId) return

        const result = await payload.find({
          collection: 'recently-viewed-courses',
          where: {
            user: {
              equals: userId,
            },
          },
          sort: '-viewedAt',
          limit: 1000,
          depth: 0,
          overrideAccess: true,
        })

        const docs = result.docs as any[]
        if (!Array.isArray(docs) || docs.length <= 10) {
          return
        }

        const toDelete = docs.slice(10)
        const ids = toDelete
          .map((d) => (d as any)?.id)
          .filter((id) => id !== null && id !== undefined)

        if (!ids.length) return

        await payload.delete({
          collection: 'recently-viewed-courses',
          where: {
            id: {
              in: ids,
            },
          },
          overrideAccess: true,
        })
      },
    ],
  },
}
