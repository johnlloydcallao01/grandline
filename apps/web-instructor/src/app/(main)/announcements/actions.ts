'use server'

import { cookies } from 'next/headers'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

function adminHeaders(): Record<string, string> {
  return {
    Authorization: `users API-Key ${API_KEY}`,
    'Content-Type': 'application/json',
  }
}

async function getInstructorContext(): Promise<{ instructorId: string; userId: string }> {
  const cookieStore = await cookies()
  const token = cookieStore.get('grandline-instructor-token')?.value
  if (!token) throw new Error('Not authenticated')

  const meRes = await fetch(`${CMS_API}/users/me`, {
    headers: { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  })
  if (!meRes.ok) throw new Error('Failed to get current user')
  const meData = await meRes.json()
  const userId = meData?.user?.id || meData?.id
  if (!userId) throw new Error('Could not determine user ID')

  const instructorRes = await fetch(
    `${CMS_API}/instructors?where[user][equals]=${encodeURIComponent(userId)}&depth=0&limit=1`,
    { headers: adminHeaders(), cache: 'no-store' },
  )
  if (!instructorRes.ok) throw new Error('Failed to get instructor profile')
  const instructorData = await instructorRes.json()
  const instructorId = instructorData?.docs?.[0]?.id
  if (!instructorId) throw new Error('Instructor profile not found')

  return { instructorId: String(instructorId), userId: String(userId) }
}

async function getInstructorCourseIds(instructorId: string): Promise<string[]> {
  const params = new URLSearchParams({ depth: '0', limit: '500' })
  params.set('where[or][0][instructor][equals]', instructorId)
  params.set('where[or][1][coInstructors][contains]', instructorId)

  const res = await fetch(`${CMS_API}/courses?${params.toString()}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to fetch instructor courses')
  const data = await res.json()
  return (data.docs || []).map((course: any) => String(course.id))
}

async function assertCourseAccess(courseId: number, courseIds: string[]): Promise<void> {
  if (!courseIds.includes(String(courseId))) {
    throw new Error('Unauthorized: course does not belong to your account')
  }
}

async function getAnnouncementInScope(id: number, courseIds: string[]): Promise<any> {
  const params = new URLSearchParams({ depth: '2', limit: '1' })
  params.set('where[id][equals]', String(id))
  params.set('where[course][in]', courseIds.join(','))

  const res = await fetch(`${CMS_API}/announcements?${params.toString()}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to verify announcement access')
  const data = await res.json()
  const announcement = data.docs?.[0]
  if (!announcement) throw new Error('Unauthorized: announcement is outside your courses')
  return announcement
}

async function extractError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json()
    if (data?.errors?.[0]?.message) return data.errors[0].message
    if (data?.error) return data.error
    if (data?.message) return data.message
  } catch {
    // Fall back to the HTTP status when the response is not JSON.
  }
  return fallback
}

function toLexical(content: string): unknown {
  const children = content
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((text) => ({
      type: 'paragraph',
      version: 1,
      children: [{ mode: 'normal', text, type: 'text', style: '', detail: 0, format: 0, version: 1 }],
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

export interface CourseRef {
  id: number
  title?: string
  courseCode?: string
}

export interface AnnouncementDoc {
  id: number
  title: string
  course: CourseRef | number
  bodyBlocks?: any
  pinned?: boolean | null
  visibleFrom?: string | null
  visibleUntil?: string | null
  createdBy?: { id: number; firstName?: string; lastName?: string; email?: string } | number | null
  createdAt: string
  updatedAt: string
}

export interface AnnouncementListResult {
  docs: AnnouncementDoc[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
}

function normalizeAnnouncement(doc: any): AnnouncementDoc {
  return {
    id: Number(doc.id),
    title: doc.title || '',
    course: doc.course,
    bodyBlocks: doc.bodyBlocks,
    pinned: doc.pinned ?? false,
    visibleFrom: doc.visibleFrom ?? null,
    visibleUntil: doc.visibleUntil ?? null,
    createdBy: doc.createdBy ?? null,
    createdAt: doc.createdAt || '',
    updatedAt: doc.updatedAt || '',
  }
}

export async function getAnnouncements(params: {
  search?: string
  courseId?: string
  page?: number
  limit?: number
}): Promise<AnnouncementListResult> {
  const { instructorId } = await getInstructorContext()
  const courseIds = await getInstructorCourseIds(instructorId)
  const limit = params.limit || 15

  if (courseIds.length === 0) {
    return { docs: [], totalDocs: 0, page: 1, limit, totalPages: 0 }
  }

  const queryParts = [
    'depth=2',
    `where[course][in]=${encodeURIComponent(courseIds.join(','))}`,
  ]

  const search = (params.search || '').trim()
  if (search) queryParts.push(`where[title][like]=${encodeURIComponent(search)}`)

  if (params.courseId && courseIds.includes(String(params.courseId))) {
    queryParts.push(`where[course][equals]=${encodeURIComponent(params.courseId)}`)
  }

  if (params.page) queryParts.push(`page=${params.page}`)
  queryParts.push(`limit=${limit}`)
  queryParts.push('sort=-pinned,-visibleFrom,-createdAt')

  const res = await fetch(`${CMS_API}/announcements?${queryParts.join('&')}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(await extractError(res, 'Failed to fetch announcements'))
  const data = await res.json()

  return {
    docs: (data.docs || []).map(normalizeAnnouncement),
    totalDocs: data.totalDocs || 0,
    page: data.page || 1,
    limit: data.limit || limit,
    totalPages: data.totalPages || 0,
  }
}

export async function getAnnouncement(id: number): Promise<AnnouncementDoc> {
  const { instructorId } = await getInstructorContext()
  const courseIds = await getInstructorCourseIds(instructorId)
  return normalizeAnnouncement(await getAnnouncementInScope(id, courseIds))
}

export interface CreateAnnouncementData {
  title: string
  course: number
  content?: string
  pinned?: boolean
  visibleFrom?: string
  visibleUntil?: string
}

export async function createAnnouncement(data: CreateAnnouncementData): Promise<AnnouncementDoc> {
  const { instructorId } = await getInstructorContext()
  const courseIds = await getInstructorCourseIds(instructorId)
  await assertCourseAccess(data.course, courseIds)

  const title = data.title.trim()
  if (!title) throw new Error('Title is required')

  const body: Record<string, unknown> = {
    title,
    course: data.course,
    pinned: data.pinned ?? false,
  }
  if (data.content?.trim()) body.bodyBlocks = toLexical(data.content)
  if (data.visibleFrom) body.visibleFrom = data.visibleFrom
  if (data.visibleUntil) body.visibleUntil = data.visibleUntil

  const res = await fetch(`${CMS_API}/announcements`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await extractError(res, 'Failed to create announcement'))
  return normalizeAnnouncement(await res.json())
}

export interface UpdateAnnouncementData {
  title?: string
  course?: number
  content?: string | null
  pinned?: boolean
  visibleFrom?: string | null
  visibleUntil?: string | null
}

export async function updateAnnouncement(id: number, data: UpdateAnnouncementData): Promise<AnnouncementDoc> {
  const { instructorId } = await getInstructorContext()
  const courseIds = await getInstructorCourseIds(instructorId)
  await getAnnouncementInScope(id, courseIds)

  if (data.course !== undefined) await assertCourseAccess(data.course, courseIds)
  if (data.title !== undefined && !data.title.trim()) throw new Error('Title is required')

  const body: Record<string, unknown> = {}
  if (data.title !== undefined) body.title = data.title.trim()
  if (data.course !== undefined) body.course = data.course
  if (data.pinned !== undefined) body.pinned = data.pinned
  if (data.visibleFrom !== undefined) body.visibleFrom = data.visibleFrom
  if (data.visibleUntil !== undefined) body.visibleUntil = data.visibleUntil
  if (data.content !== undefined) body.bodyBlocks = data.content?.trim() ? toLexical(data.content) : null

  const res = await fetch(`${CMS_API}/announcements/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await extractError(res, 'Failed to update announcement'))
  return normalizeAnnouncement(await res.json())
}

export async function deleteAnnouncement(id: number): Promise<void> {
  const { instructorId } = await getInstructorContext()
  const courseIds = await getInstructorCourseIds(instructorId)
  await getAnnouncementInScope(id, courseIds)

  const res = await fetch(`${CMS_API}/announcements/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  })
  if (!res.ok) throw new Error(await extractError(res, 'Failed to delete announcement'))
}

export interface CourseOption {
  id: number
  title: string
  code: string
}

export async function getCourseOptions(): Promise<CourseOption[]> {
  const { instructorId } = await getInstructorContext()
  const params = new URLSearchParams({ depth: '0', limit: '500', sort: 'title' })
  params.set('where[or][0][instructor][equals]', instructorId)
  params.set('where[or][1][coInstructors][contains]', instructorId)

  const res = await fetch(`${CMS_API}/courses?${params.toString()}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to fetch course options')
  const data = await res.json()
  return (data.docs || []).map((course: any) => ({
    id: Number(course.id),
    title: course.title || course.courseCode || `Course #${course.id}`,
    code: course.courseCode || '',
  }))
}
