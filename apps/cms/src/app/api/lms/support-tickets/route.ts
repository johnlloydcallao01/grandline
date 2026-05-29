import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import { requireAuth } from '../../chat/_utils/auth'
import type { SupportTicketMessage } from '@/payload-types'

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

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    const where: Where = {
      user: {
        equals: user.id,
      },
    }

    if (status && status !== 'all') {
      ;(where as any).status = { equals: status }
    }

    const tickets = await payload.find({
      collection: 'support-tickets',
      where,
      sort: '-lastMessageAt',
      limit,
      page,
      overrideAccess: true,
    })

    return NextResponse.json(tickets)
  } catch (error) {
    console.error('Error fetching LMS support tickets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()
    const payloadRequest = request as any
    payloadRequest.user = user

    const { subject, category, priority, message } = body

    if (!subject || !category || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const ticket = await payload.create({
      collection: 'support-tickets',
      req: payloadRequest,
      user,
      data: {
        subject,
        category,
        priority: priority || 'medium',
        status: 'open',
        user: user.id,
      },
      overrideAccess: true,
    })
    const ticketId = (ticket as any)?.id

    if (!ticketId) {
      throw new Error('Ticket creation did not return an ID')
    }

    await payload.create({
      collection: 'support-ticket-messages',
      req: payloadRequest,
      user,
      data: {
        ticket: ticketId,
        sender: user.id,
        message: createLexicalMessage(message),
        isInternal: false,
      },
      overrideAccess: true,
    })

    return NextResponse.json({ doc: ticket }, { status: 201 })
  } catch (error) {
    console.error('Error creating LMS support ticket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
