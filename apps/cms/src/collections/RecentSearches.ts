import type { CollectionConfig } from 'payload'

export const RecentSearches: CollectionConfig = {
    slug: 'recent-searches',
    admin: {
        useAsTitle: 'query',
        defaultColumns: ['user', 'query', 'scope', 'frequency', 'updatedAt'],
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
                { label: 'restaurants', value: 'restaurants' },
            ],
            defaultValue: 'restaurants',
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
}

