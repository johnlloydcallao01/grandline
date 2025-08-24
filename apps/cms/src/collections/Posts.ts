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
  fields: blogContentFields,
  versions: {
    drafts: true,
  },
}
