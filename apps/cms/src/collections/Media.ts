import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true, // Public can read media files
    create: ({ req: { user } }) => {
      // All authenticated users can upload media
      return user?.role === 'super-admin' || user?.role === 'admin' || user?.role === 'editor'
    },
    update: ({ req: { user } }) => {
      // Only admins and editors can update media
      return user?.role === 'super-admin' || user?.role === 'admin' || user?.role === 'editor'
    },
    delete: ({ req: { user } }) => {
      // Only admins can delete media
      return user?.role === 'super-admin' || user?.role === 'admin'
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
