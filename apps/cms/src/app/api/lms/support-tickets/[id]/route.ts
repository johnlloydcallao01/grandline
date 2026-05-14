import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { requireAuth } from '../../../chat/_utils/auth'

type RouteContext = {
  params: Promise<{ id: string }>
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
      depth: 1,
      overrideAccess: true,
    })

    const ticketOwnerId = typeof ticket.user === 'object' ? ticket.user?.id : ticket.user
    const isStaff = ['admin', 'service', 'instructor'].includes(user.role)

    if (!isStaff && String(ticketOwnerId) !== String(user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error fetching LMS support ticket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
