import type { CollectionConfig } from 'payload'

export const CourseCategories: CollectionConfig = {
  slug: 'course-categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'categoryType', 'isActive'],
    group: 'Learning Management',
    description: 'Organize courses into categories and hierarchies',
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
      // Allow both service accounts and admins to create course categories
      return user?.role === 'service' || user?.role === 'admin' || false
    },
    update: ({ req: { user } }) => {
      // Allow both service accounts and admins to update course categories
      return user?.role === 'service' || user?.role === 'admin' || false
    },
    delete: ({ req: { user } }) => {
      // Allow both service accounts and admins to delete course categories
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
        description: 'Category name (e.g., "Web Development", "Data Science")',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly version (e.g., "web-development")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Brief description of this category',
      },
    },

    // === HIERARCHY ===
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'course-categories',
      admin: {
        description: 'Parent category (for hierarchical organization)',
      },
    },
    {
      name: 'categoryType',
      type: 'select',
      options: [
        { label: 'Course Category', value: 'course' },
        { label: 'Skill Area', value: 'skill' },
        { label: 'Topic', value: 'topic' },
        { label: 'Industry', value: 'industry' },
      ],
      defaultValue: 'course',
      required: true,
      admin: {
        description: 'Type of category for different organizational purposes',
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
