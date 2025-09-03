import type { CollectionConfig } from 'payload'
import { authenticatedUsers, adminOnly } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true, // Public read access for media files
    create: authenticatedUsers, // Only authenticated users can upload media
    update: authenticatedUsers, // Only authenticated users can update media
    delete: adminOnly, // Only admins can delete media
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'video/*'],
  },
}
