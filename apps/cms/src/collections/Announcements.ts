import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
export const Announcements: CollectionConfig = {
  slug: 'announcements',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'course', 'pinned', 'visibleFrom', 'createdAt'],
    group: 'Learning Management',
    description: 'Manage course announcements, pinned updates, and scheduled notices',
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
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
    },
    {
      name: 'bodyBlocks',
      type: 'richText',
      label: 'Content',
      editor: lexicalEditor(),
      admin: {
        description: 'Announcement content with rich formatting',
        components: {
          Field: '/components/fields/CourseDescriptionEditor#CourseDescriptionEditor',
        },
      },
    },
    {
      name: 'pinned',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'visibleFrom',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'visibleUntil',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        const now = new Date().toISOString()

        if (operation === 'create') {
          if (!data.createdBy && req.user && req.user.id) {
            data.createdBy = req.user.id
          }

          if (!data.visibleFrom) {
            data.visibleFrom = now
          }
        }

        if (data.visibleUntil && !data.visibleFrom) {
          data.visibleFrom = now
        }

        if (data.visibleFrom && data.visibleUntil) {
          const fromTime = new Date(data.visibleFrom).getTime()
          const untilTime = new Date(data.visibleUntil).getTime()

          if (!Number.isNaN(fromTime) && !Number.isNaN(untilTime) && untilTime < fromTime) {
            throw new Error('visibleUntil must be after visibleFrom')
          }
        }

        return data
      },
    ],
  },
}
