import type { CollectionConfig, AccessArgs } from 'payload'

export const Chats: CollectionConfig = {
  slug: 'chats',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['type', 'participants', 'lastMessageAt', 'isArchived'],
    group: 'Chat',
    description: 'Chat conversations between users',
  },
  access: {
    read: (({ req: { user } }: AccessArgs) => {
      if (!user) return false
      // Admin/service/instructor can read all chats
      if (user.role === 'admin' || user.role === 'service' || user.role === 'instructor') return true
      // Users can only read chats where they are participants
      return {
        'participants.id': {
          equals: user.id,
        },
      }
    }) as any,
    create: ({ req: { user } }) => {
      return !!user
    },
    update: (({ req: { user } }: AccessArgs) => {
      if (!user) return false
      // Admin/service can update any chat
      if (user.role === 'admin' || user.role === 'service') return true
      // Users can only update chats where they are participants
      return {
        'participants.id': {
          equals: user.id,
        },
      }
    }) as any,
    delete: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin'
    },
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Direct (1:1)', value: 'direct' },
        { label: 'Group', value: 'group' },
      ],
      defaultValue: 'direct',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Group chat title (optional for direct chats)',
        condition: (data) => data?.type === 'group',
      },
    },
    {
      name: 'participants',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      required: true,
      admin: {
        description: 'Users in this chat (2 for direct, 2+ for group)',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        description: 'User who created the chat',
      },
      hooks: {
        beforeChange: [
          ({ req, value, operation }) => {
            if (operation === 'create' && !value && req.user) {
              return req.user.id
            }
            return value
          },
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
        { label: 'Deleted', value: 'deleted' },
      ],
      defaultValue: 'active',
      admin: {
        description: 'Chat status',
      },
    },
    {
      name: 'lastMessageAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Timestamp of most recent message',
      },
    },
    {
      name: 'lastMessagePreview',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Truncated preview of last message',
      },
    },
    {
      name: 'isArchived',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Soft delete/archived flag',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional context (courseId, contextType, etc.)',
      },
    },
  ],
}
