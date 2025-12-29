import type { CollectionConfig } from 'payload'
import { blogContentFields } from '../fields'
import { instructorOrAbove, adminOnly } from '../access'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: () => true, // Public can read published posts
    create: instructorOrAbove, // Instructors and admins can create posts
    update: instructorOrAbove, // Instructors and admins can update posts
    delete: adminOnly, // Only admins can delete posts
  },
  fields: [
    ...blogContentFields,
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Mark this post as featured',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'post-categories',
      hasMany: true,
      admin: {
        description: 'Post category for organization',
      },
    },
  ],
  versions: {
    drafts: true,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Auto-generate slug from title if not provided
        if (data && data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
        return data
      },
    ],
  },
}

