import type { CollectionConfig } from 'payload'

export const PostComments: CollectionConfig = {
  slug: 'post-comments',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['content', 'post', 'authorName', 'status', 'createdAt'],
    group: 'Content',
    description: 'Comments on blog posts',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) {
        if (user.role === 'service' || user.role === 'admin') {
          return true
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
      return user?.role === 'service' || user?.role === 'admin' || false
    },
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      index: true,
      admin: {
        description: 'The blog post this comment belongs to',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'post-comments' as any,
      hasMany: false,
      admin: {
        description: 'Parent comment for threaded replies',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Comment content',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Registered user who wrote the comment',
      },
    },
    {
      name: 'authorName',
      type: 'text',
      admin: {
        description: 'Display name for guest commenters',
      },
    },
    {
      name: 'authorEmail',
      type: 'text',
      admin: {
        description: 'Email for guest commenters',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Approved', value: 'approved' },
        { label: 'Pending', value: 'pending' },
        { label: 'Spam', value: 'spam' },
      ],
      defaultValue: 'pending',
      required: true,
      admin: {
        description: 'Moderation status of the comment',
      },
    },
  ],
}
