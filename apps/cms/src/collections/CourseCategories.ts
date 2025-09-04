import type { CollectionConfig } from 'payload'
import { lmsAccess } from '../access'

export const CourseCategories: CollectionConfig = {
  slug: 'course-categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'categoryType', 'isActive'],
    group: 'Learning Management',
    description: 'Organize courses into categories and hierarchies',
  },
  access: {
    read: () => true, // Public can read categories
    create: lmsAccess.courseManagement, // Instructors and admins can create
    update: lmsAccess.courseManagement, // Instructors and admins can update
    delete: lmsAccess.courseManagement, // Instructors and admins can delete
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
