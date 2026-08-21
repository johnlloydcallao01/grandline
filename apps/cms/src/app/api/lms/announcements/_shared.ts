import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Payload, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../_utils/service-api-key'

export const DEFAULT_SORT = '-pinned,-visibleFrom,-createdAt'

export function getPayloadClient(): Promise<Payload> {
  return getPayload({ config: configPromise })
}

// Shared auth boundary for the admin and instructor announcement endpoints.
export function requireServiceAuth(request: NextRequest): NextResponse | null {
  if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

// Shared normalization previously duplicated in the frontend actions. Keeps the
// response shape identical for the admin and instructor scopes.
export function normalizeAnnouncement(doc: any) {
  const course = doc?.course
  const creator = doc?.createdBy
  return {
    id: Number(doc.id),
    title: doc.title || '',
    course:
      course && typeof course === 'object'
        ? {
            id: Number(course.id),
            title: course.title,
            courseCode: course.courseCode,
          }
        : { id: Number(course) },
    bodyBlocks: doc.bodyBlocks ?? null,
    pinned: doc.pinned ?? false,
    visibleFrom: doc.visibleFrom ?? null,
    visibleUntil: doc.visibleUntil ?? null,
    createdBy:
      creator && typeof creator === 'object'
        ? {
            id: Number(creator.id),
            firstName: creator.firstName,
            lastName: creator.lastName,
            email: creator.email,
          }
        : creator
          ? Number(creator)
          : null,
    createdAt: doc.createdAt || '',
    updatedAt: doc.updatedAt || '',
  }
}

// Convert plain-text content (as submitted by the pages) into the lexical
// bodyBlocks structure the collection stores. Multi-line content becomes one
// paragraph per line.
export function contentToLexical(content: string): unknown {
  const children = content
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((text) => ({
      type: 'paragraph',
      version: 1,
      children: [
        { mode: 'normal', text, type: 'text', style: '', detail: 0, format: 0, version: 1 },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      textStyle: '',
      textFormat: 0,
    }))

  if (children.length === 0) return undefined

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children,
      direction: 'ltr',
    },
  }
}

// Mirrors the "active"/"expired" logic the pages previously applied to the
// current page: from defaults to epoch, until defaults to "no end".
function isActive(doc: any, now = Date.now()): boolean {
  const from = doc.visibleFrom ? new Date(doc.visibleFrom).getTime() : 0
  const until = doc.visibleUntil ? new Date(doc.visibleUntil).getTime() : Infinity
  return !Number.isNaN(from) && !Number.isNaN(until) && now >= from && now <= until
}

function isExpired(doc: any, now = Date.now()): boolean {
  return Boolean(doc.visibleUntil && new Date(doc.visibleUntil).getTime() < now)
}

// Server-owned aggregate counts computed over the full matching set (respecting
// search and any course filter), not just the current page.
export function computeAnnouncementStats(docs: any[]) {
  const now = Date.now()
  return {
    total: docs.length,
    pinned: docs.filter((d: any) => d.pinned).length,
    active: docs.filter((d: any) => isActive(d, now)).length,
    expired: docs.filter((d: any) => isExpired(d, now)).length,
  }
}

// Resolve the instructors collection row for a user. Returns null when the user
// has no instructor profile.
export async function resolveInstructorId(payload: Payload, userId: string): Promise<string | null> {
  const result = await payload.find({
    collection: 'instructors',
    where: { user: { equals: userId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const doc = result.docs?.[0]
  return doc ? String(doc.id) : null
}

// Courses owned by the instructor, either as the primary instructor or as a
// co-instructor. Announcements in these courses are the ones in scope.
export async function resolveInstructorCourseIds(
  payload: Payload,
  instructorId: string,
): Promise<string[]> {
  const courses = await payload.find({
    collection: 'courses',
    where: {
      or: [
        { instructor: { equals: instructorId } },
        { coInstructors: { contains: instructorId } },
      ],
    },
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })
  return (courses.docs || []).map((c) => String(c.id))
}

export function buildScopedWhere(courseIds: string[], search: string, courseId?: string): Where {
  const where: Where = {
    course: { in: courseIds },
  }

  if (courseId) {
    ;(where as any).course = { equals: courseId }
  }

  if (search) {
    ;(where as any).title = { like: search }
  }

  return where
}