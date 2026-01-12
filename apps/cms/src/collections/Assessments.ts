import type { CollectionConfig } from 'payload'

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
      name: 'order',
      type: 'number',
      defaultValue: 1,
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
  hooks: {
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        const payload = req.payload
        if (!payload) return data
        if (req.context && (req.context as any).skipAssessmentReorder) {
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
            throw new Error('Updating assessment module is not supported')
          }
        }

        const findResult = await payload.find({
          collection: 'assessments',
          where: {
            module: {
              equals: moduleId,
            },
          },
          limit: 1000,
          depth: 0,
          overrideAccess: true,
        })

        const assessments = findResult.docs as any[]

        const normalizeOrder = (value: unknown): number => {
          const n = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10)
          if (Number.isNaN(n) || n < 1) return 1
          return n
        }

        if (operation === 'create') {
          if (data.order == null) {
            const maxOrder = assessments.reduce((max, a) => {
              const current = normalizeOrder((a as any).order)
              return current > max ? current : max
            }, 0)
            data.order = maxOrder + 1
            return data
          }

          const requestedOrder = normalizeOrder(data.order)
          data.order = requestedOrder

          const updates = assessments
            .filter((a) => normalizeOrder((a as any).order) >= requestedOrder)
            .map((a) =>
              payload.update({
                collection: 'assessments',
                id: (a as any).id,
                data: {
                  order: normalizeOrder((a as any).order) + 1,
                },
                overrideAccess: true,
                depth: 0,
                context: {
                  ...(req.context || {}),
                  skipAssessmentReorder: true,
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
            assessments
              .filter((a) => (a as any).id !== (originalDoc as any).id)
              .forEach((a) => {
                const current = normalizeOrder((a as any).order)
                if (current > oldOrder && current <= newOrder) {
                  updates.push(
                    payload.update({
                      collection: 'assessments',
                      id: (a as any).id,
                      data: {
                        order: current - 1,
                      },
                      overrideAccess: true,
                      depth: 0,
                      context: {
                        ...(req.context || {}),
                        skipAssessmentReorder: true,
                      },
                    })
                  )
                }
              })
          } else if (newOrder < oldOrder) {
            assessments
              .filter((a) => (a as any).id !== (originalDoc as any).id)
              .forEach((a) => {
                const current = normalizeOrder((a as any).order)
                if (current >= newOrder && current < oldOrder) {
                  updates.push(
                    payload.update({
                      collection: 'assessments',
                      id: (a as any).id,
                      data: {
                        order: current + 1,
                      },
                      overrideAccess: true,
                      depth: 0,
                      context: {
                        ...(req.context || {}),
                        skipAssessmentReorder: true,
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
        if (req.context && (req.context as any).skipAssessmentReorder) {
          return
        }

        const moduleValue = (doc as any).module
        if (!moduleValue) {
          return
        }

        const moduleId =
          typeof moduleValue === 'object' && moduleValue !== null && 'id' in moduleValue
            ? (moduleValue as any).id
            : moduleValue

        if (!moduleId) {
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
          collection: 'assessments',
          where: {
            module: {
              equals: moduleId,
            },
          },
          limit: 1000,
          depth: 0,
          overrideAccess: true,
        })

        const assessments = findResult.docs as any[]
        const updates = assessments
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
              collection: 'assessments',
              id: (a as any).id,
              data: {
                order: current - 1,
              },
              overrideAccess: true,
              depth: 0,
              context: {
                ...(req.context || {}),
                skipAssessmentReorder: true,
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
