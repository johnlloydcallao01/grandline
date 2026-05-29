import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { requireAuth } from '../../../../chat/_utils/auth'
import type { SupportTicketMessage } from '@/payload-types'

type RouteContext = {
  params: Promise<{ id: string }>
}

function createLexicalMessage(message: string): SupportTicketMessage['message'] {
  return {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: message,
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
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

    const filteredDocs = isStaff ? messages.docs : messages.docs.filter((message: any) => !message.isInternal)

    return NextResponse.json({
      ...messages,
      docs: filteredDocs,
    })
  } catch (error) {
    console.error('Error fetching LMS support ticket messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const payload = await getPayload({ config: configPromise })
    const { id } = await context.params
    const body = await request.json()
    const { message } = body
    const payloadRequest = request as any
    payloadRequest.user = user

    if (!id || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

    const newMessage = await payload.create({
      collection: 'support-ticket-messages',
      req: payloadRequest,
      user,
      data: {
        ticket: ticket.id,
        sender: user.id,
        message: createLexicalMessage(message),
        isInternal: false,
      },
      overrideAccess: true,
    })

    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    console.error('Error creating LMS support ticket message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
