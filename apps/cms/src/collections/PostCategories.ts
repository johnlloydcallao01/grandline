import type { CollectionConfig } from 'payload'

export const PostCategories: CollectionConfig = {
    slug: 'post-categories',
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'slug', 'isActive'],
        group: 'Content',
        description: 'Organize blog posts into categories',
    },
    access: {
        // PayloadCMS automatically authenticates API keys and populates req.user
        read: ({ req: { user } }) => {
            // If user exists, they've been authenticated (either via API key or login)
            if (user) {
                // Allow service accounts (for website display) and admins
                if (user.role === 'service' || user.role === 'admin') {
                    return true
                }
            }

            // Block all unauthenticated requests and other roles
            return false
        },
        create: ({ req: { user } }) => {
            // Allow both service accounts and admins to create post categories
            return user?.role === 'service' || user?.role === 'admin' || false
        },
        update: ({ req: { user } }) => {
            // Allow both service accounts and admins to update post categories
            return user?.role === 'service' || user?.role === 'admin' || false
        },
        delete: ({ req: { user } }) => {
            // Allow both service accounts and admins to delete post categories
            return user?.role === 'service' || user?.role === 'admin' || false
        },
    },
    fields: [
        // === BASIC CATEGORY INFO ===
        {
            name: 'name',
            type: 'text',
            required: true,
            admin: {
                description: 'Category name (e.g., "Technology", "Maritime News")',
            },
        },
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
            admin: {
                description: 'URL-friendly version (e.g., "technology")',
            },
        },
        {
            name: 'description',
            type: 'textarea',
            admin: {
                description: 'Brief description of this category',
            },
        },

        // === VISUAL & ORGANIZATION ===
        {
            name: 'icon',
            type: 'relationship',
            relationTo: 'media',
            admin: {
                description: 'Category icon/image',
            },
        },
        {
            name: 'colorCode',
            type: 'text',
            admin: {
                description: 'Hex color code for category theming (e.g., #3B82F6)',
            },
        },
        {
            name: 'displayOrder',
            type: 'number',
            defaultValue: 0,
            admin: {
                description: 'Order for displaying categories (lower numbers first)',
            },
        },

        // === STATUS ===
        {
            name: 'isActive',
            type: 'checkbox',
            defaultValue: true,
            admin: {
                description: 'Whether this category is active and visible',
            },
        },

        // === FLEXIBLE METADATA ===
        {
            name: 'metadata',
            type: 'json',
            admin: {
                description: 'Additional category metadata and settings',
            },
        },
    ],
    hooks: {
        beforeValidate: [
            ({ data }) => {
                // Auto-generate slug from name if not provided
                if (data && data.name && !data.slug) {
                    data.slug = data.name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '')
                }
                return data
            },
        ],
    },
}
