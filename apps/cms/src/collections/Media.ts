import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => {
      console.log('Media read access check')
      return true
    },
    create: ({ req }) => {
      console.log('=== MEDIA CREATE ACCESS CHECK ===')
      console.log('Request method:', req.method)
      console.log('Request URL:', req.url)
      console.log('User:', req.user ? {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      } : 'No user')
      console.log('Headers:', {
        authorization: req.headers.get('authorization') ? 'Present' : 'Missing',
        'content-type': req.headers.get('content-type'),
      })
      console.log('=== END ACCESS CHECK ===')
      return true // Allow all for testing
    },
    update: () => true,
    delete: () => true,
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
