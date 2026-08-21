import { NextRequest, NextResponse } from 'next/server'
import { APIError } from 'payload'
import {
  DEFAULT_SORT,
  computeAnnouncementStats,
  contentToLexical,
  getPayloadClient,
  normalizeAnnouncement,
  requireServiceAuth,
} from '../_shared'

function getSearchParams(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  return {
    id: searchParams.get('id'),
    userId: searchParams.get('userId'),
    search: searchParams.get('search') || undefined,
    courseId: searchParams.get('courseId') || undefined,
    page: Number(searchParams.get('page') || 1),
    limit: Number(searchParams.get('limit') || 15),
    sort: searchParams.get('sort') || DEFAULT_SORT,
  }
}

function getCourseId(value: string | undefined): number | null {
  if (!value || value === 'all') return null
  const id = Number(value)
  return Number.isNaN(id) ? null : id
}

export async function GET(request: NextRequest) {
  const unauthorized = requireServiceAuth(request)
  if (unauthorized) return unauthorized

  try {
    const params = getSearchParams(request)
    const payload = await getPayloadClient()

    if (request.nextUrl.searchParams.get('courseOptions') === '1') {
      const courses = await payload.find({
        collection: 'courses',
        limit: 500,
        sort: 'title',
        depth: 0,
        overrideAccess: true,
      })
      const options = (courses.docs || []).map((c: any) => ({
        id: Number(c.id),
        title: c.title || `Course #${c.id}`,
        code: c.courseCode || '',
      }))
      return NextResponse.json({ courses: options })
    }

    if (params.id) {
      const doc = await payload.findByID({
        collection: 'announcements',
        id: params.id,
        depth: 1,
        overrideAccess: true,
      })
      return NextResponse.json(normalizeAnnouncement(doc))
    }

    const search = params.search?.trim()
    const where: any = {}
    if (search) where.title = { like: search }

    const statsResult = await payload.find({
      collection: 'announcements',
      where,
      limit: 0,
      depth: 0,
      overrideAccess: true,
    })

    const list = await payload.find({
      collection: 'announcements',
      where,
      page: params.page,
      limit: params.limit,
      sort: params.sort,
      depth: 1,
      overrideAccess: true,
    })

    return NextResponse.json({
      docs: (list.docs || []).map(normalizeAnnouncement),
      totalDocs: list.totalDocs,
      totalPages: list.totalPages,
      page: list.page,
      limit: list.limit,
      stats: computeAnnouncementStats(statsResult.docs || []),
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
    const course = getCourseId(body.course)

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (!course) {
      return NextResponse.json({ error: 'Course is required' }, { status: 400 })
    }

    const data: Record<string, unknown> = {
      title,
      course,
      pinned: Boolean(body.pinned),
    }

    if (typeof body.content === 'string' && body.content.trim()) {
      const bodyBlocks = contentToLexical(body.content)
      if (bodyBlocks) data.bodyBlocks = bodyBlocks
    }

    if (body.visibleFrom) data.visibleFrom = body.visibleFrom
    if (body.visibleUntil) data.visibleUntil = body.visibleUntil

    // The local API creates a fresh request context, so the collection hook does
    // not see a req.user. Attribute explicitly when the caller resolved a user id.
    if (params.userId && !Number.isNaN(Number(params.userId))) {
      data.createdBy = Number(params.userId)
    }

    const doc = await payload.create({
      collection: 'announcements',
      data: data as any,
      overrideAccess: true,
    })

    return NextResponse.json(normalizeAnnouncement(doc), { status: 201 })
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
      return NextResponse.json({ error: 'Announcement id is required' }, { status: 400 })
    }

    const data: Record<string, unknown> = {}

    if (typeof body.title === 'string') data.title = body.title.trim()
    const course = getCourseId(body.course)
    if (course) data.course = course
    if (typeof body.pinned === 'boolean') data.pinned = body.pinned

    if (body.content !== undefined) {
      if (typeof body.content === 'string' && body.content.trim()) {
        const bodyBlocks = contentToLexical(body.content)
        if (bodyBlocks) data.bodyBlocks = bodyBlocks
      } else {
        data.bodyBlocks = null
      }
    }

    if (body.visibleFrom !== undefined) data.visibleFrom = body.visibleFrom
    if (body.visibleUntil !== undefined) data.visibleUntil = body.visibleUntil

    const doc = await payload.update({
      collection: 'announcements',
      id: params.id,
      data,
      overrideAccess: true,
    })

    return NextResponse.json(normalizeAnnouncement(doc))
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
      return NextResponse.json({ error: 'Announcement id is required' }, { status: 400 })
    }

    await payload.delete({
      collection: 'announcements',
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