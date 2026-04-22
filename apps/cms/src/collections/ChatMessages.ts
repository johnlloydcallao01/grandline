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
      // Trainees can read all messages — the custom /api/chat/[id]/messages route handler
      // already enforces participant-based access control before hitting this collection.
      // Restricting to sender === user.id here would prevent trainees from seeing instructor
      // replies in conversations they are part of.
      return true
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
          const chatId = typeof value === 'object' ? value.id || value.value : value
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
          if (user.role === 'admin' || user.role === 'service' || user.role === 'instructor' || chat.type === 'group') {
            return true
          }
          const participants = Array.isArray(chat.participants) ? chat.participants : []
          const isParticipant = participants.some((p: any) => {
            const pid = typeof p === 'object' ? (p.value?.id || p.value || p.id) : p
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
            let extractedText = '';
            if (typeof doc.content === 'string') {
              extractedText = doc.content;
            } else if (typeof doc.content === 'object' && doc.content !== null) {
              const extractTextNode = (node: any): string => {
                if (!node) return '';
                if (typeof node === 'string') return node;
                if (typeof node.text === 'string') return node.text;
                if (Array.isArray(node.children)) {
                  return node.children.map(extractTextNode).filter(Boolean).join(' ');
                }
                if (node.root) {
                  return extractTextNode(node.root);
                }
                return '';
              };
              try {
                extractedText = extractTextNode(doc.content);
                // Collapse multiple spaces from joining empty nodes
                extractedText = extractedText.replace(/\s+/g, ' ');
              } catch (_e) {
                // ignore
              }
            }

            extractedText = extractedText.trim();
            let contentPreview = extractedText;
            if (contentPreview.length > 80) {
              contentPreview = contentPreview.substring(0, 80).trim() + '...';
            } else if (!contentPreview) {
              contentPreview = doc.contentType === 'image' ? '[Image]' : doc.contentType === 'file' ? '[File]' : '[Message]';
            }

            // Prepare update data
            const updateData: any = {
              lastMessageAt: new Date().toISOString(),
              lastMessagePreview: contentPreview,
            }

            // Check if it's an Ask Instructor chat to auto-update status
            const chatId = typeof doc.chat === 'object' ? doc.chat.id : doc.chat
            const parentChat = await req.payload.findByID({
              collection: 'chats',
              id: chatId,
              depth: 0,
              overrideAccess: true,
            })

            if (parentChat && parentChat.metadata && (parentChat.metadata as any).isAskInstructor) {
              if (req.user?.role === 'trainee') {
                updateData.metadata = {
                  ...(parentChat.metadata as object),
                  status: 'pending'
                }
              } else if (req.user?.role === 'instructor') {
                updateData.metadata = {
                  ...(parentChat.metadata as object),
                  status: 'answered'
                }
              }
            }

            await req.payload.update({
              collection: 'chats',
              id: chatId,
              data: updateData,
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
