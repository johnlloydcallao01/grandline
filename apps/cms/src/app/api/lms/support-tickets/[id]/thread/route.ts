import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { requireAuth } from '../../../../chat/_utils/auth'

type RouteContext = {
  params: Promise<{ id: string }>
}

function extractTextFromLexical(node: any): string {
  if (!node) return ''
  if (typeof node === 'string') return node

  if (node.root) {
    return extractTextFromLexical(node.root)
  }

  let text = ''

  if (typeof node.text === 'string') {
    text += node.text
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      text += extractTextFromLexical(child)
      if (['paragraph', 'heading', 'list-item'].includes(child?.type)) {
        text += '\n'
      }
    }
  }

  return text.trim()
}

function getSenderName(sender: any) {
  if (!sender || typeof sender !== 'object') {
    return 'Support Agent'
  }

  const fullName = [sender.firstName, sender.lastName].filter(Boolean).join(' ').trim()
  return fullName || sender.email || 'Support Agent'
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const payload = await getPayload({ config: configPromise })
    const { id } = await context.params

    if (!id) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 })
    }

    const ticket = await payload.findByID({
      collection: 'support-tickets',
      id,
      depth: 0,
      overrideAccess: true,
    })

    const ticketOwnerId = typeof ticket.user === 'object' ? ticket.user?.id : ticket.user
    const isStaff = ['admin', 'service', 'instructor'].includes(user.role)

    if (!isStaff && String(ticketOwnerId) !== String(user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const messages = await payload.find({
      collection: 'support-ticket-messages',
      where: {
        ticket: {
          equals: id,
        },
      },
      sort: 'createdAt',
      limit: 100,
      depth: 1,
      overrideAccess: true,
    })

    const visibleMessages = isStaff ? messages.docs : messages.docs.filter((message: any) => !message.isInternal)

    const shapedMessages = visibleMessages.map((message: any) => {
      const sender = message.sender
      const senderId = typeof sender === 'object' ? sender?.id : sender
      return {
        id: String(message.id),
        plainText: extractTextFromLexical(message.message),
        senderName: String(senderId) === String(user.id) ? 'You' : getSenderName(sender),
        senderRole: typeof sender === 'object' ? sender?.role : undefined,
        senderId: senderId ? String(senderId) : undefined,
        isMine: String(senderId) === String(user.id),
        createdAt: message.createdAt,
      }
    })

    return NextResponse.json({
      ticket,
      messages: shapedMessages,
    })
  } catch (error) {
    console.error('Error fetching LMS support thread:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
