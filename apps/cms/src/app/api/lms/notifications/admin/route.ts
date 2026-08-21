import { NextRequest, NextResponse } from 'next/server'
import { APIError } from 'payload'
import {
  computeNotificationStats,
  getPayloadClient,
  normalizeNotification,
  requireServiceAuth,
} from '../_shared'

const CATEGORIES = ['learning', 'account', 'system-update', 'other']
const STATUSES = ['draft', 'scheduled', 'sent', 'cancelled']
const ORIGINS = ['manual', 'automatic']
const AUDIENCE_TYPES = ['all-users', 'role', 'segment', 'specific-users']
const ROLES = ['trainee', 'instructor', 'admin', 'service']

function getSearchParams(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  return {
    id: searchParams.get('id'),
    userId: searchParams.get('userId'),
    search: searchParams.get('search') || undefined,
    status: searchParams.get('status') || undefined,
    category: searchParams.get('category') || undefined,
    page: Number(searchParams.get('page') || 1),
    limit: Number(searchParams.get('limit') || 15),
    sort: searchParams.get('sort') || '-createdAt',
  }
}

export async function GET(request: NextRequest) {
  const unauthorized = requireServiceAuth(request)
  if (unauthorized) return unauthorized

  try {
    const params = getSearchParams(request)
    const payload = await getPayloadClient()

    if (request.nextUrl.searchParams.get('userOptions') === '1') {
      const search = params.search?.trim()
      const where: any = search
        ? {
            or: [
              { email: { like: search } },
              { firstName: { like: search } },
              { lastName: { like: search } },
            ],
          }
        : {}
      const users = await payload.find({
        collection: 'users',
        where,
        limit: 50,
        sort: 'email',
        depth: 0,
        overrideAccess: true,
      })
      const options = (users.docs || []).map((u: any) => ({
        id: Number(u.id),
        email: u.email || '',
        firstName: u.firstName || '',
        lastName: u.lastName || '',
      }))
      return NextResponse.json({ users: options })
    }

    if (params.id) {
      const doc = await payload.findByID({
        collection: 'notifications',
        id: params.id,
        depth: 1,
        overrideAccess: true,
      })
      return NextResponse.json(normalizeNotification(doc))
    }

    const search = params.search?.trim()
    const where: any = {}
    if (search) where.title = { like: search }
    if (params.status) where.status = { equals: params.status }
    if (params.category) where.category = { equals: params.category }

    const statsResult = await payload.find({
      collection: 'notifications',
      where,
      limit: 0,
      depth: 0,
      overrideAccess: true,
    })

    const list = await payload.find({
      collection: 'notifications',
      where,
      page: params.page,
      limit: params.limit,
      sort: params.sort,
      depth: 1,
      overrideAccess: true,
    })

    return NextResponse.json({
      docs: (list.docs || []).map(normalizeNotification),
      totalDocs: list.totalDocs,
      totalPages: list.totalPages,
      page: list.page,
      limit: list.limit,
      stats: computeNotificationStats(statsResult.docs || []),
    })
  } catch (error: any) {
    if (error instanceof APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireServiceAuth(request)
  if (unauthorized) return unauthorized

  try {
    const params = getSearchParams(request)
    const body = await request.json().catch(() => ({}))
    const payload = await getPayloadClient()

    const title = typeof body.title === 'string' ? body.title.trim() : ''
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (!CATEGORIES.includes(body.category)) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }
    if (!ORIGINS.includes(body.origin)) {
      return NextResponse.json({ error: 'Origin is required' }, { status: 400 })
    }
    if (!AUDIENCE_TYPES.includes(body.audienceType)) {
      return NextResponse.json({ error: 'Audience type is required' }, { status: 400 })
    }
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const data: Record<string, unknown> = {
      title,
      category: body.category,
      origin: body.origin,
      audienceType: body.audienceType,
      status: body.status,
    }

    if (typeof body.body === 'string' && body.body.trim()) data.body = body.body.trim()
    if (body.template) data.template = Number(body.template)
    if (body.audienceRole && ROLES.includes(body.audienceRole)) data.audienceRole = body.audienceRole
    if (Array.isArray(body.audienceUsers) && body.audienceUsers.length > 0) {
      data.audienceUsers = body.audienceUsers.map(Number)
    }
    if (body.segmentDefinition != null) data.segmentDefinition = body.segmentDefinition
    if (typeof body.sourceType === 'string' && body.sourceType.trim()) data.sourceType = body.sourceType.trim()
    if (typeof body.sourceId === 'string' && body.sourceId.trim()) data.sourceId = body.sourceId.trim()
    if (body.metadata != null) data.metadata = body.metadata
    if (body.scheduledAt) data.scheduledAt = body.scheduledAt
    if (body.expiresAt) data.expiresAt = body.expiresAt

    // The local API creates a fresh request context, so the collection hook does
    // not see a req.user. Attribute explicitly when the caller resolved a user id.
    if (params.userId && !Number.isNaN(Number(params.userId))) {
      data.actor = Number(params.userId)
    }

    const doc = await payload.create({
      collection: 'notifications',
      data: data as any,
      overrideAccess: true,
    })

    return NextResponse.json(normalizeNotification(doc), { status: 201 })
  } catch (error: any) {
    if (error instanceof APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const unauthorized = requireServiceAuth(request)
  if (unauthorized) return unauthorized

  try {
    const params = getSearchParams(request)
    const body = await request.json().catch(() => ({}))
    const payload = await getPayloadClient()

    if (!params.id) {
      return NextResponse.json({ error: 'Notification id is required' }, { status: 400 })
    }

    const data: Record<string, unknown> = {}

    if (typeof body.title === 'string') data.title = body.title.trim()
    if (CATEGORIES.includes(body.category)) data.category = body.category
    if (ORIGINS.includes(body.origin)) data.origin = body.origin
    if (AUDIENCE_TYPES.includes(body.audienceType)) data.audienceType = body.audienceType
    if (STATUSES.includes(body.status)) data.status = body.status

    if (body.body !== undefined) {
      data.body = typeof body.body === 'string' && body.body.trim() ? body.body.trim() : null
    }
    if (body.template !== undefined) data.template = body.template ? Number(body.template) : null
    if (body.audienceRole !== undefined) {
      data.audienceRole = body.audienceRole && ROLES.includes(body.audienceRole) ? body.audienceRole : null
    }
    if (body.audienceUsers !== undefined) {
      data.audienceUsers =
        Array.isArray(body.audienceUsers) && body.audienceUsers.length > 0
          ? body.audienceUsers.map(Number)
          : null
    }
    if (body.segmentDefinition !== undefined) data.segmentDefinition = body.segmentDefinition
    if (body.sourceType !== undefined) {
      data.sourceType = typeof body.sourceType === 'string' && body.sourceType.trim() ? body.sourceType.trim() : null
    }
    if (body.sourceId !== undefined) {
      data.sourceId = typeof body.sourceId === 'string' && body.sourceId.trim() ? body.sourceId.trim() : null
    }
    if (body.metadata !== undefined) data.metadata = body.metadata
    if (body.scheduledAt !== undefined) data.scheduledAt = body.scheduledAt
    if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt

    const doc = await payload.update({
      collection: 'notifications',
      id: params.id,
      data,
      overrideAccess: true,
    })

    return NextResponse.json(normalizeNotification(doc))
  } catch (error: any) {
    if (error instanceof APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = requireServiceAuth(request)
  if (unauthorized) return unauthorized

  try {
    const params = getSearchParams(request)
    const payload = await getPayloadClient()

    if (!params.id) {
      return NextResponse.json({ error: 'Notification id is required' }, { status: 400 })
    }

    await payload.delete({
      collection: 'notifications',
      id: params.id,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error instanceof APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 })
  }
}