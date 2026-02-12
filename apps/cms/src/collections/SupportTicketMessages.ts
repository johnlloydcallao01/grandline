import type { CollectionConfig, AccessArgs, Validate } from 'payload'

export const SupportTicketMessages: CollectionConfig = {
  slug: 'support-ticket-messages',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['ticket', 'sender', 'createdAt'],
    group: 'Support',
    description: 'Messages exchanged in support tickets',
  },
  access: {
    read: (({ req: { user } }: AccessArgs) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'service' || user.role === 'instructor') return true
      
      return {
        or: [
          {
            sender: {
              equals: user.id,
            },
          },
          {
            'ticket.user': {
              equals: user.id,
            },
          },
        ] as any[],
      }
    }) as any,
    create: ({ req: { user } }) => {
      return !!user
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin' // Only admins can edit messages (moderation)
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin'
    },
  },
  fields: [
    {
      name: 'ticket',
      type: 'relationship',
      relationTo: 'support-tickets',
      required: true,
      index: true,
      validate: (async (value, { req }) => {
        if (!value) return 'Ticket is required'
        
        try {
          const ticketId = typeof value === 'object' ? value.id : value
          // Bypass default access control to check existence first
          const ticket = await req.payload.findByID({
            collection: 'support-tickets',
            id: ticketId,
            overrideAccess: true, // We check permissions manually below
          })

          if (!ticket) {
            return 'Ticket not found'
          }

          // Check permissions: Admin/Service/Instructor OR Ticket Owner
          const user = req.user
          if (!user) return 'You must be logged in'
          
          if (user.role && ['admin', 'service', 'instructor'].includes(user.role)) {
            return true
          }

          // Check ownership
          const ticketOwnerId = typeof ticket.user === 'object' ? ticket.user.id : ticket.user
          // Use loose comparison or string conversion to handle number/string ID mismatch
          if (String(ticketOwnerId) === String(user.id)) {
            return true
          }

          return 'You do not have permission to reply to this ticket'
        } catch (err) {
          console.error('Error validating ticket:', err)
          return 'Error validating ticket'
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
      name: 'message',
      type: 'richText',
      required: true,
    },
    {
      name: 'attachments',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'isInternal',
      type: 'checkbox',
      defaultValue: false,
      label: 'Internal Note (Admin only)',
      access: {
        read: ({ req: { user } }) => {
          if (!user) return false
          return user.role === 'admin' || user.role === 'service' || user.role === 'instructor'
        },
        create: ({ req: { user } }) => {
          if (!user) return false
          return user.role === 'admin' || user.role === 'service' || user.role === 'instructor'
        },
        update: ({ req: { user } }) => {
          if (!user) return false
          return user.role === 'admin' || user.role === 'service' || user.role === 'instructor'
        },
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation === 'create' && doc.ticket) {
          // Update the parent ticket's lastMessageAt
          try {
            await req.payload.update({
              collection: 'support-tickets',
              id: typeof doc.ticket === 'object' ? doc.ticket.id : doc.ticket,
              data: {
                lastMessageAt: new Date().toISOString(),
                // Optionally update status if user replies?
                // status: req.user?.role === 'admin' ? 'waiting_for_user' : 'open'
              },
              req, // Pass the request object to share the transaction and avoid deadlocks
              depth: 0,
            })
          } catch (error) {
            console.error('Error updating ticket timestamp:', error)
          }
        }
      },
    ],
  },
}
