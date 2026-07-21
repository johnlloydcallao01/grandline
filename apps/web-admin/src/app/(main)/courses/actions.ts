'use server'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

function headers(): Record<string, string> {
  return {
    Authorization: `users API-Key ${API_KEY}`,
    'Content-Type': 'application/json',
  }
}

function apiUrl(path: string): string {
  if (!CMS_API) throw new Error('Missing NEXT_PUBLIC_API_URL')
  return `${CMS_API}${path}`
}

export interface InstructorRef {
  id: string
  user?: { id: string; firstName: string; lastName: string; email: string }
}

export interface CategoryRef {
  id: string
  name?: string
  title?: string
}

export interface MediaRef {
  id: string
  url?: string
  cloudinaryURL?: string
  filename?: string
  alt?: string
}

export interface CourseDoc {
  id: string
  title: string
  courseCode: string
  excerpt?: string
  description?: any
  instructor: InstructorRef | string
  coInstructors?: (InstructorRef | string)[]
  category?: (CategoryRef | string)[]
  modules?: (SimpleDocRef | string)[]
  thumbnail?: MediaRef | string
  bannerImage?: MediaRef | string
  price: number
  discountedPrice?: number
  status: 'draft' | 'published' | 'archived'
  difficultyLevel: string
  isFeatured: boolean
  language: string
  estimatedDuration?: number
  estimatedDurationUnit?: string
  maxStudents?: number
  enrollmentStartDate?: string
  enrollmentEndDate?: string
  courseStartDate?: string
  courseEndDate?: string
  evaluationMode: string
  passingGrade: number
  certificateTemplate?: SimpleDocRef | string
  feedbackForm?: SimpleDocRef | string
  isFeedbackRequired?: boolean
  updatedAt: string
  createdAt: string
  publishedAt?: string
}

export interface CourseListResult {
  docs: CourseDoc[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
}

export interface CategoryOption {
  id: string
  name: string
}

export async function getCourses(params: {
  search?: string
  status?: string
  page?: number
  limit?: number
  sort?: string
}): Promise<CourseListResult> {
  const queryParts: string[] = ['depth=2']

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

  const res = await fetch(apiUrl(`/courses?${queryParts.join('&')}`), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch courses: ${res.statusText}`)
  }

  return res.json()
}

export async function getCourseById(id: string): Promise<CourseDoc> {
  const res = await fetch(apiUrl(`/courses/${id}?depth=2`), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch course: ${res.statusText}`)
  }

  return res.json()
}

export async function createCourse(data: {
  title: string
  courseCode: string
  instructor: string
  category?: string[]
  status?: string
  price?: number
  excerpt?: string
  description?: any
  difficultyLevel?: string
  language?: string
  passingGrade?: number
  evaluationMode?: string
  isFeatured?: boolean
  discountedPrice?: number
  estimatedDuration?: number
  estimatedDurationUnit?: string
  maxStudents?: number
  coInstructors?: string[]
  modules?: string[]
  thumbnailUrl?: string
  bannerImageUrl?: string
  learningObjectives?: { objective: string }[]
  prerequisites?: { prerequisite: string }[]
}): Promise<CourseDoc> {
  const res = await fetch(apiUrl('/courses'), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to create course: ${res.statusText}`)
  }

  return res.json()
}

export async function updateCourse(id: string, data: Partial<CourseDoc>): Promise<CourseDoc> {
  const safeData: Record<string, any> = { ...data }
  for (const key of ['instructor', 'certificateTemplate', 'feedbackForm']) {
    if (safeData[key] != null && typeof safeData[key] !== 'object') safeData[key] = Number(safeData[key])
  }
  for (const key of ['category', 'coInstructors', 'modules']) {
    if (Array.isArray(safeData[key])) safeData[key] = safeData[key].map((v: any) => typeof v === 'object' ? v : Number(v))
  }
  const res = await fetch(apiUrl(`/courses/${id}`), {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(safeData),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = (err as any).errors?.[0]?.message || (err as any).error || `Failed to update course: ${res.statusText}`
    throw new Error(msg)
  }

  return res.json()
}

export async function deleteCourse(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/courses/${id}`), {
    method: 'DELETE',
    headers: headers(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to delete course: ${res.statusText}`)
  }
}

export async function getCategories(): Promise<CategoryOption[]> {
  const res = await fetch(apiUrl('/course-categories?depth=0&limit=100&sort=name'), {
    headers: headers(),
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

export async function searchInstructors(search: string): Promise<InstructorRef[]> {
  if (!search || search.length < 1) return []

  const limit = search.length <= 2 ? '8' : '20'

  const params = new URLSearchParams({
    depth: '1',
    limit,
    'where[or][0][user][title][like]': search,
  })

  const res = await fetch(apiUrl(`/instructors?${params.toString()}`), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Failed to search instructors: ${res.statusText}`)
  }

  const data = await res.json()
  return (data.docs || []).map((inst: any) => ({
    id: String(inst.id),
    user: inst.user && typeof inst.user === 'object'
      ? {
          id: String(inst.user.id),
          firstName: inst.user.firstName || '',
          lastName: inst.user.lastName || '',
          email: inst.user.email || '',
        }
      : undefined,
  }))
}

export interface SimpleDocRef {
  id: string
  title: string
  name?: string
}

export async function searchCollection(collection: string, search: string, labelField = 'title'): Promise<SimpleDocRef[]> {
  if (!search || search.length < 1) return []
  const limit = search.length <= 2 ? '8' : '20'
  const params = new URLSearchParams({ depth: '0', limit, [`where[or][0][${labelField}][like]`]: search })
  const res = await fetch(apiUrl(`/${collection}?${params.toString()}`), {
    headers: headers(), cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.docs || []).map((d: any) => ({ id: String(d.id), title: d.title || d.name || String(d.id), name: d.name || undefined }))
}

export async function listCollection(collection: string, _labelField = 'title'): Promise<SimpleDocRef[]> {
  const params = new URLSearchParams({ depth: '0', limit: '10', sort: '-createdAt' })
  const res = await fetch(apiUrl(`/${collection}?${params.toString()}`), {
    headers: headers(), cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.docs || []).map((d: any) => ({ id: String(d.id), title: d.title || d.name || String(d.id), name: d.name || undefined }))
}

export interface CourseEditData {
  course: CourseDoc
  categories: CategoryOption[]
  modules: SimpleDocRef[]
}

export async function getCourseEditData(id: string): Promise<CourseEditData> {
  const res = await fetch(apiUrl(`/lms/course-edit/${id}`), {
    headers: headers(),
    cache: 'no-store',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to load course data: ${res.statusText}`)
  }
  return res.json()
}
