import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const CourseLessons: CollectionConfig = {
  slug: 'course-lessons',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'module', 'order', 'estimatedDuration'],
    group: 'Learning Management',
    description: 'Manage course lessons and detailed curriculum content',
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
      name: 'module',
      type: 'relationship',
      relationTo: 'course-modules',
      required: true,
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 1,
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor(),
      admin: {
        description: 'Lesson content with rich formatting',
        components: {
          Field: '/components/fields/LessonDescriptionEditor#LessonDescriptionEditor',
        },
      },
    },
    {
      name: 'estimatedDuration',
      type: 'number',
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        const payload = req.payload
        if (!payload) return data
        if (req.context && (req.context as any).skipLessonReorder) {
          return data
        }

        const moduleValue = data.module ?? originalDoc?.module
        if (!moduleValue) {
          return data
        }

        const moduleId =
          typeof moduleValue === 'object' && moduleValue !== null && 'id' in moduleValue
            ? (moduleValue as any).id
            : moduleValue

        if (!moduleId) {
          return data
        }

        if (operation === 'update' && data.module && originalDoc) {
          const originalModule =
            typeof originalDoc.module === 'object' &&
              originalDoc.module !== null &&
              'id' in originalDoc.module
              ? (originalDoc.module as any).id
              : originalDoc.module

          if (originalModule && originalModule !== moduleId) {
            throw new Error('Updating lesson module is not supported')
          }
        }

        const findResult = await payload.find({
          collection: 'course-lessons',
          where: {
            module: {
              equals: moduleId,
            },
          },
          limit: 1000,
          depth: 0,
          overrideAccess: true,
        })

        const lessons = findResult.docs as any[]

        const normalizeOrder = (value: unknown): number => {
          const n = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10)
          if (Number.isNaN(n) || n < 1) return 1
          return n
        }

        if (operation === 'create') {
          if (data.order == null) {
            const maxOrder = lessons.reduce((max, l) => {
              const current = normalizeOrder((l as any).order)
              return current > max ? current : max
            }, 0)
            data.order = maxOrder + 1
            return data
          }

          const requestedOrder = normalizeOrder(data.order)
          data.order = requestedOrder

          const updates = lessons
            .filter((l) => normalizeOrder((l as any).order) >= requestedOrder)
            .map((l) =>
              payload.update({
                collection: 'course-lessons',
                id: (l as any).id,
                data: {
                  order: normalizeOrder((l as any).order) + 1,
                },
                overrideAccess: true,
                depth: 0,
                context: {
                  ...(req.context || {}),
                  skipLessonReorder: true,
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
            lessons
              .filter((l) => (l as any).id !== (originalDoc as any).id)
              .forEach((l) => {
                const current = normalizeOrder((l as any).order)
                if (current > oldOrder && current <= newOrder) {
                  updates.push(
                    payload.update({
                      collection: 'course-lessons',
                      id: (l as any).id,
                      data: {
                        order: current - 1,
                      },
                      overrideAccess: true,
                      depth: 0,
                      context: {
                        ...(req.context || {}),
                        skipLessonReorder: true,
                      },
                    })
                  )
                }
              })
          } else if (newOrder < oldOrder) {
            lessons
              .filter((l) => (l as any).id !== (originalDoc as any).id)
              .forEach((l) => {
                const current = normalizeOrder((l as any).order)
                if (current >= newOrder && current < oldOrder) {
                  updates.push(
                    payload.update({
                      collection: 'course-lessons',
                      id: (l as any).id,
                      data: {
                        order: current + 1,
                      },
                      overrideAccess: true,
                      depth: 0,
                      context: {
                        ...(req.context || {}),
                        skipLessonReorder: true,
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
