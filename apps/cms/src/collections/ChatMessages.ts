import type { CollectionConfig, AccessArgs, Validate } from 'payload'

export const ChatMessages: CollectionConfig = {
  slug: 'chat-messages',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['chat', 'sender', 'contentType', 'createdAt'],
    group: 'Chat',
    description: 'Messages exchanged in chats',
  },
  access: {
    read: (({ req: { user } }: AccessArgs) => {
      if (!user) return false
      // Admin/service/instructor can read all messages
      if (user.role === 'admin' || user.role === 'service' || user.role === 'instructor') return true
      // Users can only read messages from chats where they are participants
      // Note: This is a simplified check; the chat validation handles participant access
      return {
        sender: {
          equals: user.id,
        },
      }
    }) as any,
    create: ({ req: { user } }) => {
      return !!user
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      // Only admins can edit messages (moderation)
      return user.role === 'admin'
    },
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
      validate: (async (value, { req }) => {
        if (!value) return 'Chat is required'
        try {
          const chatId = typeof value === 'object' ? value.id : value
          const chat = await req.payload.findByID({
            collection: 'chats',
            id: chatId,
            overrideAccess: true,
          })
          if (!chat) {
            return 'Chat not found'
          }
          // Check if user is a participant
          const user = req.user
          if (!user) return 'You must be logged in'
          if (user.role === 'admin' || user.role === 'service' || user.role === 'instructor') {
            return true
          }
          const participants = Array.isArray(chat.participants) ? chat.participants : []
          const isParticipant = participants.some((p: any) => {
            const pid = typeof p === 'object' ? p.id : p
            return String(pid) === String(user.id)
          })
          if (!isParticipant) {
            return 'You are not a participant in this chat'
          }
          return true
        } catch (err) {
          console.error('Error validating chat:', err)
          return 'Error validating chat'
        }
      }) as Validate,
    },
    {
      name: 'sender',
      type: 'relationship',
      relationTo: 'users',
      required: true,
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
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'contentType',
      type: 'select',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Image', value: 'image' },
        { label: 'File', value: 'file' },
        { label: 'System', value: 'system' },
      ],
      defaultValue: 'text',
    },
    {
      name: 'attachments',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'replyTo',
      type: 'relationship',
      relationTo: 'chat-messages',
      admin: {
        description: 'Message this is replying to',
      },
    },
    {
      name: 'editedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'isDeleted',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Soft delete for message removal',
      },
    },
    {
      name: 'reactions',
      type: 'array',
      admin: {
        description: 'Emoji reactions to this message',
      },
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'emoji',
          type: 'text',
          required: true,
        },
        {
          name: 'createdAt',
          type: 'date',
          defaultValue: () => new Date().toISOString(),
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation === 'create' && doc.chat) {
          // Update the parent chat's lastMessageAt and preview
          try {
            const contentPreview = typeof doc.content === 'string'
              ? doc.content.substring(0, 100)
              : '[Rich content]'
            await req.payload.update({
              collection: 'chats',
              id: typeof doc.chat === 'object' ? doc.chat.id : doc.chat,
              data: {
                lastMessageAt: new Date().toISOString(),
                lastMessagePreview: contentPreview,
              },
              req,
              depth: 0,
            })
          } catch (error) {
            console.error('Error updating chat timestamp:', error)
          }
        }
      },
    ],
  },
}
