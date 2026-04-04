import type { CollectionConfig, AccessArgs } from 'payload'

export const ChatTypingStatus: CollectionConfig = {
  slug: 'chat-typing-status',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['chat', 'user', 'isTyping', 'updatedAt'],
    group: 'Chat',
    description: 'Real-time typing indicators for chats',
  },
  access: {
    read: (({ req: { user } }: AccessArgs) => {
      if (!user) return false
      // Admin/service can read all typing status
      if (user.role === 'admin' || user.role === 'service') return true
      // Users can only read typing status for chats they participate in
      // Note: Chat participant check handled by hook
      return {
        user: {
          equals: user.id,
        },
      }
    }) as any,
    create: ({ req: { user } }) => {
      // Any authenticated user can create typing status
      return !!user
    },
    update: (({ req: { user } }: AccessArgs) => {
      if (!user) return false
      // Admin/service can update any typing status
      if (user.role === 'admin' || user.role === 'service') return true
      // Users can only update their own typing status
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
      name: 'chat',
      type: 'relationship',
      relationTo: 'chats',
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
      name: 'isTyping',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether the user is currently typing',
      },
    },
    {
      name: 'updatedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: {
        readOnly: true,
      },
    },
  ],
}
