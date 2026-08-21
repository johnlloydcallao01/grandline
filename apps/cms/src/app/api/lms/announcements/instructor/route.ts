import { NextRequest, NextResponse } from 'next/server'
import { APIError } from 'payload'
import {
  DEFAULT_SORT,
  computeAnnouncementStats,
  contentToLexical,
  getPayloadClient,
  normalizeAnnouncement,
  requireServiceAuth,
  resolveInstructorCourseIds,
  resolveInstructorId,
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

export async function GET(request: NextRequest) {
  const unauthorized = requireServiceAuth(request)
  if (unauthorized) return unauthorized

  try {
    const params = getSearchParams(request)
    const payload = await getPayloadClient()

    if (!params.userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const instructorId = await resolveInstructorId(payload, params.userId)
    if (!instructorId) {
      return NextResponse.json({ error: 'Instructor profile not found' }, { status: 404 })
    }

    const courseIds = await resolveInstructorCourseIds(payload, instructorId)
    if (courseIds.length === 0) {
      return NextResponse.json({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        page: params.page,
        limit: params.limit,
        stats: { total: 0, pinned: 0, active: 0, expired: 0 },
      })
    }

    if (request.nextUrl.searchParams.get('courseOptions') === '1') {
      const courses = await payload.find({
        collection: 'courses',
        where: { id: { in: courseIds } },
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

    const search = params.search?.trim()
    const courseId = params.courseId && params.courseId !== 'all' ? params.courseId : undefined

    // The requested course must belong to the instructor. Enforce the boundary
    // explicitly rather than silently ignoring an out-of-scope filter.
    if (courseId && !courseIds.includes(courseId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (params.id) {
      const doc = await payload.findByID({
        collection: 'announcements',
        id: params.id,
        depth: 1,
        overrideAccess: true,
      })
      const docCourseId = String(
        doc.course && typeof doc.course === 'object' ? doc.course.id : doc.course,
      )
      if (!courseIds.includes(docCourseId)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.json(normalizeAnnouncement(doc))
    }

    const where: any = { course: { in: courseIds } }
    if (courseId) where.course = { equals: courseId }
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

    if (!params.userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const instructorId = await resolveInstructorId(payload, params.userId)
    if (!instructorId) {
      return NextResponse.json({ error: 'Instructor profile not found' }, { status: 404 })
    }
    const courseIds = await resolveInstructorCourseIds(payload, instructorId)

    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const course = Number(body.course)

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (Number.isNaN(course) || !courseIds.includes(String(course))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data: Record<string, unknown> = {
      title,
      course,
      pinned: Boolean(body.pinned),
      createdBy: Number(params.userId),
    }

    if (typeof body.content === 'string' && body.content.trim()) {
      const bodyBlocks = contentToLexical(body.content)
      if (bodyBlocks) data.bodyBlocks = bodyBlocks
    }

    if (body.visibleFrom) data.visibleFrom = body.visibleFrom
    if (body.visibleUntil) data.visibleUntil = body.visibleUntil

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
    if (!params.userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const instructorId = await resolveInstructorId(payload, params.userId)
    if (!instructorId) {
      return NextResponse.json({ error: 'Instructor profile not found' }, { status: 404 })
    }
    const courseIds = await resolveInstructorCourseIds(payload, instructorId)

    const existing = await payload.findByID({
      collection: 'announcements',
      id: params.id,
      depth: 0,
      overrideAccess: true,
    })
    const existingCourseId = String(
      existing.course && typeof existing.course === 'object' ? existing.course.id : existing.course,
    )
    if (!courseIds.includes(existingCourseId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data: Record<string, unknown> = {}

    if (typeof body.title === 'string') data.title = body.title.trim()

    if (body.course !== undefined) {
      const course = Number(body.course)
      if (Number.isNaN(course) || !courseIds.includes(String(course))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      data.course = course
    }

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
    if (!params.userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const instructorId = await resolveInstructorId(payload, params.userId)
    if (!instructorId) {
      return NextResponse.json({ error: 'Instructor profile not found' }, { status: 404 })
    }
    const courseIds = await resolveInstructorCourseIds(payload, instructorId)

    const existing = await payload.findByID({
      collection: 'announcements',
      id: params.id,
      depth: 0,
      overrideAccess: true,
    })
    const existingCourseId = String(
      existing.course && typeof existing.course === 'object' ? existing.course.id : existing.course,
    )
    if (!courseIds.includes(existingCourseId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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