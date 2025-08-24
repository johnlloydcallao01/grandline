import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true, // Public can read media files
    create: ({ req: { user } }) => {
      // Only admins and instructors can upload media
      return user?.role === 'admin' || user?.role === 'instructor'
    },
    update: ({ req: { user } }) => {
      // Only admins and instructors can update media
      return user?.role === 'admin' || user?.role === 'instructor'
    },
    delete: ({ req: { user } }) => {
      // Only admins can delete media
      return user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'video/*'],
  },
}
