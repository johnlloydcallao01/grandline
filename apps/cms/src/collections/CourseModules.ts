import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const CourseModules: CollectionConfig = {
  slug: 'course-modules',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'course', 'order', 'releaseAt'],
    group: 'Learning Management',
    description: 'Define course modules and high-level curriculum structure',
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
        description: 'Detailed module description and context',
        components: {
          Field: '/components/fields/CourseDescriptionEditor#CourseDescriptionEditor',
        },
      },
    },
    {
      name: 'items',
      type: 'relationship',
      relationTo: ['course-lessons', 'assessments'],
      hasMany: true,
      admin: {
        description: 'Manage the order of lessons and assessments in this module.',
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 1,
    },
    {
      name: 'releaseAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        const payload = req.payload
        if (!payload) return data
        if (req.context && (req.context as any).skipModuleReorder) {
          return data
        }

        const courseValue = data.course ?? originalDoc?.course
        if (!courseValue) {
          return data
        }

        const courseId =
          typeof courseValue === 'object' && courseValue !== null && 'id' in courseValue
            ? (courseValue as any).id
            : courseValue

        if (!courseId) {
          return data
        }

        if (operation === 'update' && data.course && originalDoc) {
          const originalCourse =
            typeof originalDoc.course === 'object' &&
            originalDoc.course !== null &&
            'id' in originalDoc.course
              ? (originalDoc.course as any).id
              : originalDoc.course

          if (originalCourse && originalCourse !== courseId) {
            throw new Error('Updating module course is not supported')
          }
        }

        const findResult = await payload.find({
          collection: 'course-modules',
          where: {
            course: {
              equals: courseId,
            },
          },
          limit: 1000,
          depth: 0,
          overrideAccess: true,
        })

        const modules = findResult.docs as any[]

        const normalizeOrder = (value: unknown): number => {
          const n = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10)
          if (Number.isNaN(n) || n < 1) return 1
          return n
        }

        if (operation === 'create') {
          if (data.order == null) {
            const maxOrder = modules.reduce((max, m) => {
              const current = normalizeOrder((m as any).order)
              return current > max ? current : max
            }, 0)
            data.order = maxOrder + 1
            return data
          }

          const requestedOrder = normalizeOrder(data.order)
          data.order = requestedOrder

          const updates = modules
            .filter((m) => normalizeOrder((m as any).order) >= requestedOrder)
            .map((m) =>
              payload.update({
                collection: 'course-modules',
                id: (m as any).id,
                data: {
                  order: normalizeOrder((m as any).order) + 1,
                },
                overrideAccess: true,
                depth: 0,
                context: {
                  ...(req.context || {}),
                  skipModuleReorder: true,
                },
              })
            )

          if (updates.length > 0) {
            await Promise.all(updates)
          }

          return data
        }

        if (operation === 'update' && originalDoc) {
          if (data.order == null || data.order === originalDoc.order) {
            return data
          }

          const oldOrder = normalizeOrder(originalDoc.order)
          const newOrder = normalizeOrder(data.order)
          data.order = newOrder

          const updates: Promise<unknown>[] = []

          if (newOrder > oldOrder) {
            modules
              .filter((m) => (m as any).id !== (originalDoc as any).id)
              .forEach((m) => {
                const current = normalizeOrder((m as any).order)
                if (current > oldOrder && current <= newOrder) {
                  updates.push(
                    payload.update({
                      collection: 'course-modules',
                      id: (m as any).id,
                      data: {
                        order: current - 1,
                      },
                      overrideAccess: true,
                      depth: 0,
                      context: {
                        ...(req.context || {}),
                        skipModuleReorder: true,
                      },
                    })
                  )
                }
              })
          } else if (newOrder < oldOrder) {
            modules
              .filter((m) => (m as any).id !== (originalDoc as any).id)
              .forEach((m) => {
                const current = normalizeOrder((m as any).order)
                if (current >= newOrder && current < oldOrder) {
                  updates.push(
                    payload.update({
                      collection: 'course-modules',
                      id: (m as any).id,
                      data: {
                        order: current + 1,
                      },
                      overrideAccess: true,
                      depth: 0,
                      context: {
                        ...(req.context || {}),
                        skipModuleReorder: true,
                      },
                    })
                  )
                }
              })
          }

          if (updates.length > 0) {
            await Promise.all(updates)
          }

          return data
        }

        return data
      },
    ],
  },
}
