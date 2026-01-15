import type { CollectionConfig } from 'payload'

export const Materials: CollectionConfig = {
  slug: 'materials',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'materialSource', 'createdAt'],
    group: 'Learning Management',
    description: 'Reusable learning materials and assets for courses and lessons',
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
      type: 'textarea',
    },
    {
      name: 'materialSource',
      type: 'select',
      options: [
        { label: 'Uploaded Media', value: 'media' },
        { label: 'External URL', value: 'external' },
      ],
      defaultValue: 'media',
      required: true,
    },
    {
      name: 'media',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData.materialSource === 'media',
      },
    },
    {
      name: 'externalUrl',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData.materialSource === 'external',
      },
    },
    {
      name: 'metadata',
      type: 'json',
    },
  ],
}
