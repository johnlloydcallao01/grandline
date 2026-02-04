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
}
