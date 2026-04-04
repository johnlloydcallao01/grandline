import type { CollectionConfig, AccessArgs } from 'payload'

export const ChatMessageStatus: CollectionConfig = {
  slug: 'chat-message-status',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['message', 'user', 'status', 'readAt'],
    group: 'Chat',
    description: 'Read/delivered status for chat messages',
  },
  access: {
    read: (({ req: { user } }: AccessArgs) => {
      if (!user) return false
      // Admin/service can read all status records
      if (user.role === 'admin' || user.role === 'service') return true
      // Users can only read their own status records
      return {
        user: {
          equals: user.id,
        },
      }
    }) as any,
    create: (({ req: { user } }: AccessArgs) => {
      if (!user) return false
      // Admin/service can create any status
      if (user.role === 'admin' || user.role === 'service') return true
      // Users can only create status for themselves
      return {
        user: {
          equals: user.id,
        },
      }
    }) as any,
    update: (({ req: { user } }: AccessArgs) => {
      if (!user) return false
      // Admin/service can update any status
      if (user.role === 'admin' || user.role === 'service') return true
      // Users can only update their own status
      return {
        user: {
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
      name: 'message',
      type: 'relationship',
      relationTo: 'chat-messages',
      required: true,
      index: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
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
        { label: 'Delivered', value: 'delivered' },
        { label: 'Read', value: 'read' },
      ],
      defaultValue: 'delivered',
      required: true,
    },
    {
      name: 'deliveredAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'readAt',
      type: 'date',
      admin: {
        description: 'When the message was read by user',
      },
    },
  ],
}
