import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const CourseModules: CollectionConfig = {
  slug: 'course-modules',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'releaseAt'],
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
      name: 'releaseAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
}
