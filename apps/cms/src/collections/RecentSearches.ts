import type { CollectionConfig } from 'payload'

export const RecentSearches: CollectionConfig = {
  slug: 'recent-searches',
  admin: {
    useAsTitle: 'query',
    defaultColumns: ['user', 'query', 'scope', 'frequency', 'updatedAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) {
        if (user.role === 'service' || user.role === 'admin') return true
        // Trainees can read their own records
        return {
          user: { equals: user.id },
        }
      }
      return false
    },
    create: ({ req: { user } }) => {
      return user?.role === 'service' || user?.role === 'admin' || false
    },
    update: ({ req: { user } }) => {
      return user?.role === 'service' || user?.role === 'admin' || false
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'admin' || false
    },
  },
  fields: [
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
            required: true,
        },
        {
            name: 'query',
            type: 'text',
            required: true,
        },
        {
            name: 'normalizedQuery',
            type: 'text',
            required: true,
        },
        {
            name: 'scope',
            type: 'select',
            options: [
                { label: 'courses', value: 'courses' },
            ],
            defaultValue: 'courses',
            required: true,
        },
        {
            name: 'compositeKey',
            type: 'text',
            unique: true,
        },
        {
            name: 'frequency',
            type: 'number',
            required: true,
            defaultValue: 1,
        },
        {
            name: 'source',
            type: 'select',
            options: [
                { label: 'unknown', value: 'unknown' },
            ],
            defaultValue: 'unknown',
        },
    {
      name: 'deviceId',
      type: 'text',
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        const q = String(data.query || '').trim()
        const normalized = q.toLowerCase().replace(/\s+/g, ' ')
        if (!data.normalizedQuery) data.normalizedQuery = normalized
        const scope = String(data.scope || 'courses')
        data.scope = scope
        const userId = typeof data.user === 'object' ? (data.user as any)?.id : data.user
        if (!data.compositeKey && userId && normalized) {
          data.compositeKey = `${userId}:${normalized}:${scope}`
        }
        if (data.frequency == null) data.frequency = 1
        return data
      },
    ],
  },
}

