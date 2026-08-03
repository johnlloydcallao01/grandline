'use server'

import { cookies } from 'next/headers'
import type { CourseLesson } from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

function adminHeaders(): Record<string, string> {
  return {
    Authorization: `users API-Key ${API_KEY}`,
    'Content-Type': 'application/json',
  }
}

async function getInstructorId(): Promise<string> {
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

  const instRes = await fetch(`${CMS_API}/instructors?where[user][equals]=${userId}&depth=0&limit=1`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!instRes.ok) throw new Error('Failed to get instructor profile')
  const instData = await instRes.json()
  const instructorId = instData?.docs?.[0]?.id
  if (!instructorId) throw new Error('Instructor profile not found')

  return String(instructorId)
}

export interface ModuleOption {
  id: string
  title: string
}

export interface LessonDoc {
  id: string
  title: string
  module: { id: string; title: string } | string
  order: number
  bodyBlocks?: any
  estimatedDuration?: number
  updatedAt: string
  createdAt: string
}

export interface LessonListResult {
  docs: LessonDoc[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
  moduleOptions: ModuleOption[]
}

export async function getLessons(params?: {
  search?: string
  moduleId?: string
  page?: number
  limit?: number
}): Promise<LessonListResult> {
  const instructorId = await getInstructorId()

  // Get instructor's courses with depth=2 to include modules
  const coursesRes = await fetch(
    `${CMS_API}/courses?where[instructor][equals]=${instructorId}&depth=2&limit=100`,
    { headers: adminHeaders(), cache: 'no-store' },
  )
  if (!coursesRes.ok) throw new Error('Failed to fetch instructor courses')
  const coursesData = await coursesRes.json()
  const courses = coursesData.docs || []

  // Extract module IDs from instructor's courses
  const moduleIds: string[] = []
  for (const course of courses) {
    if (Array.isArray(course.modules)) {
      for (const m of course.modules) {
        if (m && typeof m === 'object' && m.id) {
          moduleIds.push(String(m.id))
        } else if (typeof m === 'number' || typeof m === 'string') {
          moduleIds.push(String(m))
        }
      }
    }
  }

  if (moduleIds.length === 0) {
    return {
      docs: [],
      totalDocs: 0,
      page: params?.page || 1,
      limit: params?.limit || 12,
      totalPages: 0,
      moduleOptions: [],
    }
  }

  const queryParts: string[] = [
    'depth=2',
    `where[module][in]=${encodeURIComponent(moduleIds.join(','))}`,
  ]

  if (params?.search) {
    queryParts.push(`where[title][like]=${encodeURIComponent(params.search)}`)
  }
  if (params?.moduleId) {
    queryParts.push(`where[module][equals]=${encodeURIComponent(params.moduleId)}`)
  }
  if (params?.page) queryParts.push(`page=${params.page}`)
  if (params?.limit) queryParts.push(`limit=${params.limit}`)
  queryParts.push('sort=-createdAt')

  const res = await fetch(`${CMS_API}/lms/course-lessons?${queryParts.join('&')}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch lessons: ${res.statusText}`)
  }

  const data = await res.json()

  // Get module options scoped to instructor's courses
  const moduleQueryParts: string[] = [
    'depth=0',
    'limit=200',
    'sort=title',
  ]
  if (moduleIds.length > 0) {
    moduleQueryParts.push(`where[id][in]=${encodeURIComponent(moduleIds.join(','))}`)
  }

  const modulesRes = await fetch(`${CMS_API}/course-modules?${moduleQueryParts.join('&')}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })

  let moduleOptions: ModuleOption[] = []
  if (modulesRes.ok) {
    const modulesData = await modulesRes.json()
    moduleOptions = (modulesData.docs || []).map((m: any) => ({
      id: String(m.id),
      title: m.title || `Module #${m.id}`,
    }))
  }

  return {
    docs: data.docs || [],
    totalDocs: data.totalDocs || 0,
    page: data.page || 1,
    limit: data.limit || 12,
    totalPages: data.totalPages || 0,
    moduleOptions,
  }
}

export async function getLessonById(id: string): Promise<CourseLesson> {
  const instructorId = await getInstructorId()
  const res = await fetch(`${CMS_API}/lms/course-lessons/${id}?depth=2`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch lesson: ${res.statusText}`)
  }

  const lesson = (await res.json()) as CourseLesson

  // Authorization: verify lesson's module belongs to instructor's course
  if (lesson.module && typeof lesson.module === 'object') {
    const moduleId = String(lesson.module.id)

    // Get instructor's courses with depth=2 to include modules
    const coursesRes = await fetch(
      `${CMS_API}/courses?where[instructor][equals]=${instructorId}&depth=2&limit=100`,
      { headers: adminHeaders(), cache: 'no-store' },
    )
    if (!coursesRes.ok) throw new Error('Failed to fetch instructor courses')
    const coursesData = await coursesRes.json()
    const instructorModuleIds: string[] = []
    for (const course of coursesData.docs || []) {
      if (Array.isArray(course.modules)) {
        for (const m of course.modules) {
          if (m && typeof m === 'object' && m.id) {
            instructorModuleIds.push(String(m.id))
          } else if (typeof m === 'number' || typeof m === 'string') {
            instructorModuleIds.push(String(m))
          }
        }
      }
    }

    if (!instructorModuleIds.includes(moduleId)) {
      throw new Error('Unauthorized: lesson does not belong to your courses')
    }
  }

  return lesson
}

export async function createLesson(data: {
  title: string
  module: string
  description?: any
  estimatedDuration?: number
}): Promise<CourseLesson> {
  const instructorId = await getInstructorId()

  // Get instructor's courses with depth=2 to include modules for ownership check
  const coursesRes = await fetch(
    `${CMS_API}/courses?where[instructor][equals]=${instructorId}&depth=2&limit=100`,
    { headers: adminHeaders(), cache: 'no-store' },
  )
  if (!coursesRes.ok) throw new Error('Failed to fetch instructor courses')
  const coursesData = await coursesRes.json()

  const instructorModuleIds: string[] = []
  for (const course of coursesData.docs || []) {
    if (Array.isArray(course.modules)) {
      for (const m of course.modules) {
        if (m && typeof m === 'object' && m.id) {
          instructorModuleIds.push(String(m.id))
        } else if (typeof m === 'number' || typeof m === 'string') {
          instructorModuleIds.push(String(m))
        }
      }
    }
  }

  // Authorization: verify module belongs to instructor's course
  if (!instructorModuleIds.includes(String(data.module))) {
    throw new Error('Unauthorized: cannot add lessons to another instructor course')
  }

  const payload: Record<string, unknown> = {
    title: data.title,
    module: Number(data.module),
    estimatedDuration: data.estimatedDuration || undefined,
  }

  if (data.description) {
    const desc = data.description
    if (typeof desc === 'string') {
      try {
        payload.description = JSON.parse(desc)
      } catch {
        payload.description = desc
      }
    } else {
      payload.description = desc
    }
  }

  const res = await fetch(`${CMS_API}/course-lessons`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to create lesson: ${res.statusText}`)
  }

  return res.json()
}

export async function updateLesson(
  id: string,
  data: Partial<CourseLesson>,
): Promise<CourseLesson> {
  const instructorId = await getInstructorId()

  const safeData: Record<string, any> = { ...data }

  if (safeData.module != null && typeof safeData.module !== 'object') {
    // Get instructor's modules for ownership check
    const coursesRes = await fetch(
      `${CMS_API}/courses?where[instructor][equals]=${instructorId}&depth=2&limit=100`,
      { headers: adminHeaders(), cache: 'no-store' },
    )
    if (!coursesRes.ok) throw new Error('Failed to fetch instructor courses')
    const coursesData = await coursesRes.json()

    const instructorModuleIds: string[] = []
    for (const course of coursesData.docs || []) {
      if (Array.isArray(course.modules)) {
        for (const m of course.modules) {
          if (m && typeof m === 'object' && m.id) {
            instructorModuleIds.push(String(m.id))
          } else if (typeof m === 'number' || typeof m === 'string') {
            instructorModuleIds.push(String(m))
          }
        }
      }
    }

    if (!instructorModuleIds.includes(String(safeData.module))) {
      throw new Error('Unauthorized: cannot move lesson to another instructor course')
    }
    safeData.module = Number(safeData.module)
  }

  const res = await fetch(`${CMS_API}/course-lessons/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(safeData),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = (err as any).errors?.[0]?.message || (err as any).error || `Failed to update lesson: ${res.statusText}`
    throw new Error(msg)
  }

  return res.json()
}

export async function deleteLesson(id: string): Promise<void> {
  await getLessonById(id)

  const res = await fetch(`${CMS_API}/course-lessons/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to delete lesson: ${res.statusText}`)
  }
}

export async function getModuleOptions(): Promise<ModuleOption[]> {
  const instructorId = await getInstructorId()

  // Get instructor's courses with depth=2 to include modules
  const coursesRes = await fetch(
    `${CMS_API}/courses?where[instructor][equals]=${instructorId}&depth=2&limit=100`,
    { headers: adminHeaders(), cache: 'no-store' },
  )
  if (!coursesRes.ok) return []

  const coursesData = await coursesRes.json()
  const moduleIds: string[] = []
  for (const course of coursesData.docs || []) {
    if (Array.isArray(course.modules)) {
      for (const m of course.modules) {
        if (m && typeof m === 'object' && m.id) {
          moduleIds.push(String(m.id))
        } else if (typeof m === 'number' || typeof m === 'string') {
          moduleIds.push(String(m))
        }
      }
    }
  }

  if (moduleIds.length === 0) return []

  // Get only the modules that belong to instructor's courses
  const moduleFilter = `where[id][in]=${encodeURIComponent(moduleIds.join(','))}`
  const res = await fetch(
    `${CMS_API}/course-modules?depth=0&limit=100&sort=title&${moduleFilter}`,
    { headers: adminHeaders(), cache: 'no-store' },
  )
  if (!res.ok) return []

  const data = await res.json()
  return (data.docs || []).map((d: any) => ({
    id: String(d.id),
    title: d.title || String(d.id),
  }))
}