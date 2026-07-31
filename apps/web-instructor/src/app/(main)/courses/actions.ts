'use server'

import { cookies } from 'next/headers'
import type { Course, CourseListResult } from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

export interface SimpleDocRef {
  id: string
  title: string
  name?: string
}

export interface CategoryOption {
  id: string
  name: string
}

export type CourseDoc = Course

export interface CourseEditData {
  course: CourseDoc
  categories: CategoryOption[]
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
    headers: { Authorization: `users API-Key ${API_KEY}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  })
  if (!instRes.ok) throw new Error('Failed to get instructor profile')
  const instData = await instRes.json()
  const instructorId = instData?.docs?.[0]?.id
  if (!instructorId) throw new Error('Instructor profile not found')

  return String(instructorId)
}

export async function getCourses(params: {
  search?: string
  status?: string
  page?: number
  limit?: number
  sort?: string
}): Promise<CourseListResult> {
  const instructorId = await getInstructorId()
  const queryParts: string[] = ['depth=2', `where[instructor][equals]=${instructorId}`]

  if (params.search) {
    queryParts.push(`where[or][0][title][like]=${encodeURIComponent(params.search)}`)
    queryParts.push(`where[or][1][courseCode][like]=${encodeURIComponent(params.search)}`)
  }

  if (params.status && params.status !== 'all') {
    queryParts.push(`where[status][equals]=${encodeURIComponent(params.status)}`)
  }

  if (params.page) queryParts.push(`page=${params.page}`)
  if (params.limit) queryParts.push(`limit=${params.limit}`)
  queryParts.push(`sort=${params.sort || '-updatedAt'}`)

  const res = await fetch(`${CMS_API}/courses?${queryParts.join('&')}`, {
    headers: { Authorization: `users API-Key ${API_KEY}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch courses: ${res.statusText}`)
  }

  return res.json()
}

export async function getCourseById(id: string): Promise<CourseDoc> {
  const res = await fetch(`${CMS_API}/courses/${id}?depth=2`, {
    headers: { Authorization: `users API-Key ${API_KEY}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch course: ${res.statusText}`)
  }

  return res.json()
}

export async function getCourseEditData(id: string): Promise<CourseEditData> {
  const course = await getCourseById(id)
  const categories = await getCategories()
  return { course, categories }
}

export async function getCategories(): Promise<CategoryOption[]> {
  const res = await fetch(`${CMS_API}/course-categories?depth=0&limit=100&sort=name`, {
    headers: { Authorization: `users API-Key ${API_KEY}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.statusText}`)
  }

  const data = await res.json()
  return (data.docs || []).map((c: any) => ({
    id: String(c.id),
    name: c.name || c.title || '',
  }))
}

function toLexical(text: string): unknown {
  if (!text) return undefined
  return {
    root: {
      children: [
        {
          type: 'paragraph',
          children: [{ text }],
        },
      ],
    },
  }
}

export async function createCourse(data: {
  title: string
  courseCode: string
  status?: string
  excerpt?: string
  description?: string
  thumbnailUrl?: string
  bannerImageUrl?: string
  maxStudents?: number
  enrollmentStartDate?: string
  enrollmentEndDate?: string
  courseStartDate?: string
  courseEndDate?: string
  estimatedDuration?: number
  estimatedDurationUnit?: string
  difficultyLevel?: string
  language?: string
  passingGrade?: number
  evaluationMode?: string
  modules?: string[]
  learningObjectives?: { objective: string }[]
  prerequisites?: { prerequisite: string }[]
}): Promise<CourseDoc> {
  const instructorId = await getInstructorId()

  const payload: Record<string, unknown> = {
    title: data.title,
    courseCode: data.courseCode,
    instructor: Number(instructorId),
    status: data.status || 'draft',
    difficultyLevel: data.difficultyLevel || 'standard',
    language: data.language || 'en',
    passingGrade: data.passingGrade || 70,
    evaluationMode: data.evaluationMode || 'lessons_exam',
  }

  if (data.excerpt) payload.excerpt = data.excerpt
  if (data.description) payload.description = toLexical(data.description)
  if (data.thumbnailUrl) payload.thumbnailUrl = data.thumbnailUrl
  if (data.bannerImageUrl) payload.bannerImageUrl = data.bannerImageUrl
  if (data.maxStudents && data.maxStudents > 0) payload.maxStudents = data.maxStudents
  if (data.enrollmentStartDate) payload.enrollmentStartDate = data.enrollmentStartDate
  if (data.enrollmentEndDate) payload.enrollmentEndDate = data.enrollmentEndDate
  if (data.courseStartDate) payload.courseStartDate = data.courseStartDate
  if (data.courseEndDate) payload.courseEndDate = data.courseEndDate
  if (data.estimatedDuration && data.estimatedDuration > 0) payload.estimatedDuration = data.estimatedDuration
  if (data.estimatedDurationUnit) payload.estimatedDurationUnit = data.estimatedDurationUnit
  if (data.modules && data.modules.length > 0) payload.modules = data.modules
  if (data.learningObjectives?.length) payload.learningObjectives = data.learningObjectives
  if (data.prerequisites?.length) payload.prerequisites = data.prerequisites

  const res = await fetch(`${CMS_API}/courses`, {
    method: 'POST',
    headers: { Authorization: `users API-Key ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to create course: ${res.statusText}`)
  }

  return res.json()
}

export async function updateCourse(id: string, data: Record<string, unknown>): Promise<CourseDoc> {
  const safeData: Record<string, unknown> = { ...data }

  for (const key of ['modules']) {
    if (Array.isArray(safeData[key])) {
      safeData[key] = (safeData[key] as any[]).map((v: any) => (typeof v === 'object' ? v : Number(v)))
    }
  }

  if (safeData.description && typeof safeData.description === 'string') {
    safeData.description = toLexical(safeData.description as string)
  }

  const res = await fetch(`${CMS_API}/courses/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `users API-Key ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(safeData),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = (err as any).errors?.[0]?.message || (err as any).error || `Failed to update course: ${res.statusText}`
    throw new Error(msg)
  }

  return res.json()
}

export async function searchCollection(collection: string, search: string, labelField = 'title'): Promise<SimpleDocRef[]> {
  if (!search || search.length < 1) return []
  const limit = search.length <= 2 ? '8' : '20'
  const params = new URLSearchParams({ depth: '0', limit, [`where[or][0][${labelField}][like]`]: search })
  const res = await fetch(`${CMS_API}/${collection}?${params.toString()}`, {
    headers: { Authorization: `users API-Key ${API_KEY}`, 'Content-Type': 'application/json' }, cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.docs || []).map((d: any) => ({ id: String(d.id), title: d.title || d.name || String(d.id), name: d.name || undefined }))
}
