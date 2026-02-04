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
    mimeTypes: [
      'image/*',
      'video/*',
      'application/pdf',
      'application/zip',
      'audio/*',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/x-cfb', // Old Office format (doc, xls, ppt)
      'application/vnd.ms-powerpoint.presentation.macroEnabled.12', // .pptm
      'application/vnd.ms-powerpoint.slideshow.macroEnabled.12', // .ppsm
      'application/vnd.openxmlformats-officedocument.presentationml.slideshow', // .ppsx
    ],
  },
}
