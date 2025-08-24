import type { CollectionConfig } from 'payload'
import { blogContentFields } from '../fields'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt', 'updatedAt'],
  },
  access: {
    read: () => true, // Public can read published posts
    create: ({ req: { user } }) => {
      // Only admins and editors can create posts
      return user?.role === 'super-admin' || user?.role === 'admin' || user?.role === 'editor'
    },
    update: ({ req: { user } }) => {
      // Only admins and editors can update posts
      return user?.role === 'super-admin' || user?.role === 'admin' || user?.role === 'editor'
    },
    delete: ({ req: { user } }) => {
      // Only super-admin and admin can delete posts
      return user?.role === 'super-admin' || user?.role === 'admin'
    },
  },
  fields: blogContentFields,
  versions: {
    drafts: true,
  },
}
