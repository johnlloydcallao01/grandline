import type { CollectionConfig } from 'payload'

export const LessonMaterials: CollectionConfig = {
  slug: 'lesson-materials',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['lesson', 'material', 'order'],
    group: 'Learning Management',
    description: 'Attach materials to individual lessons',
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
      name: 'lesson',
      type: 'relationship',
      relationTo: 'course-lessons',
      required: true,
    },
    {
      name: 'material',
      type: 'relationship',
      relationTo: 'materials',
      required: true,
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 1,
    },
    {
      name: 'isRequired',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        const payload = req.payload
        if (!payload) return data
        if (req.context && (req.context as any).skipLessonMaterialReorder) {
          return data
        }

        const lessonValue = data.lesson ?? originalDoc?.lesson
        const materialValue = data.material ?? originalDoc?.material

        if (!lessonValue || !materialValue) {
          return data
        }

        const lessonId =
          typeof lessonValue === 'object' && lessonValue !== null && 'id' in lessonValue
            ? (lessonValue as any).id
            : lessonValue
        const materialId =
          typeof materialValue === 'object' && materialValue !== null && 'id' in materialValue
            ? (materialValue as any).id
            : materialValue

        if (!lessonId || !materialId) {
          return data
        }

        if (operation === 'update' && originalDoc) {
          const originalLesson =
            typeof originalDoc.lesson === 'object' &&
            originalDoc.lesson !== null &&
            'id' in originalDoc.lesson
              ? (originalDoc.lesson as any).id
              : originalDoc.lesson
          const originalMaterial =
            typeof originalDoc.material === 'object' &&
            originalDoc.material !== null &&
            'id' in originalDoc.material
              ? (originalDoc.material as any).id
              : originalDoc.material

          if (
            (originalLesson && originalLesson !== lessonId) ||
            (originalMaterial && originalMaterial !== materialId)
          ) {
            throw new Error('Updating lesson or material is not supported for lesson materials')
          }
        }

        const findResult = await payload.find({
          collection: 'lesson-materials',
          where: {
            lesson: {
              equals: lessonId,
            },
          },
          limit: 1000,
          depth: 0,
          overrideAccess: true,
        })

        const attachments = findResult.docs as any[]

        const duplicate = attachments.find((a) => {
          const existingMaterial =
            typeof (a as any).material === 'object' &&
            (a as any).material !== null &&
            'id' in (a as any).material
              ? (a as any).material.id
              : (a as any).material
          if (!existingMaterial) return false
          if (operation === 'update' && originalDoc && (a as any).id === (originalDoc as any).id) {
            return false
          }
          return String(existingMaterial) === String(materialId)
        })

        if (duplicate && operation === 'create') {
          throw new Error('Material is already attached to this lesson')
        }

        const normalizeOrder = (value: unknown): number => {
          const n = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10)
          if (Number.isNaN(n) || n < 1) return 1
          return n
        }

        if (operation === 'create') {
          if (data.order == null) {
            const maxOrder = attachments.reduce((max, a) => {
              const current = normalizeOrder((a as any).order)
              return current > max ? current : max
            }, 0)
            data.order = maxOrder + 1
            return data
          }

          const requestedOrder = normalizeOrder(data.order)
          data.order = requestedOrder

          const updates = attachments
            .filter((a) => normalizeOrder((a as any).order) >= requestedOrder)
            .map((a) =>
              payload.update({
                collection: 'lesson-materials',
                id: (a as any).id,
                data: {
                  order: normalizeOrder((a as any).order) + 1,
                },
                overrideAccess: true,
                depth: 0,
                context: {
                  ...(req.context || {}),
                  skipLessonMaterialReorder: true,
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
            attachments
              .filter((a) => (a as any).id !== (originalDoc as any).id)
              .forEach((a) => {
                const current = normalizeOrder((a as any).order)
                if (current > oldOrder && current <= newOrder) {
                  updates.push(
                    payload.update({
                      collection: 'lesson-materials',
                      id: (a as any).id,
                      data: {
                        order: current - 1,
                      },
                      overrideAccess: true,
                      depth: 0,
                      context: {
                        ...(req.context || {}),
                        skipLessonMaterialReorder: true,
                      },
                    })
                  )
                }
              })
          } else if (newOrder < oldOrder) {
            attachments
              .filter((a) => (a as any).id !== (originalDoc as any).id)
              .forEach((a) => {
                const current = normalizeOrder((a as any).order)
                if (current >= newOrder && current < oldOrder) {
                  updates.push(
                    payload.update({
                      collection: 'lesson-materials',
                      id: (a as any).id,
                      data: {
                        order: current + 1,
                      },
                      overrideAccess: true,
                      depth: 0,
                      context: {
                        ...(req.context || {}),
                        skipLessonMaterialReorder: true,
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
    afterDelete: [
      async ({ req, doc }) => {
        const payload = req.payload
        if (!payload) return
        if (req.context && (req.context as any).skipLessonMaterialReorder) {
          return
        }

        const lessonValue = (doc as any).lesson
        if (!lessonValue) {
          return
        }

        const lessonId =
          typeof lessonValue === 'object' && lessonValue !== null && 'id' in lessonValue
            ? (lessonValue as any).id
            : lessonValue

        if (!lessonId) {
          return
        }

        const deletedOrderValue = (doc as any).order
        const deletedOrder =
          typeof deletedOrderValue === 'number'
            ? deletedOrderValue
            : parseInt(String(deletedOrderValue ?? ''), 10)

        if (!deletedOrder || Number.isNaN(deletedOrder)) {
          return
        }

        const findResult = await payload.find({
          collection: 'lesson-materials',
          where: {
            lesson: {
              equals: lessonId,
            },
          },
          limit: 1000,
          depth: 0,
          overrideAccess: true,
        })

        const attachments = findResult.docs as any[]
        const updates = attachments
          .filter((a) => {
            const current =
              typeof (a as any).order === 'number'
                ? (a as any).order
                : parseInt(String((a as any).order ?? ''), 10)
            return current > deletedOrder
          })
          .map((a) => {
            const current =
              typeof (a as any).order === 'number'
                ? (a as any).order
                : parseInt(String((a as any).order ?? ''), 10)
            return payload.update({
              collection: 'lesson-materials',
              id: (a as any).id,
              data: {
                order: current - 1,
              },
              overrideAccess: true,
              depth: 0,
              context: {
                ...(req.context || {}),
                skipLessonMaterialReorder: true,
              },
            })
          })

        if (updates.length > 0) {
          await Promise.all(updates)
        }
      },
    ],
  },
}
