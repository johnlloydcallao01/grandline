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

export interface AssessmentDoc {
  id: string
  title: string
  description?: any
  assessmentType: 'quiz' | 'exam' | 'final_exam'
  module?: { id: string; title: string } | string
  course?: { id: string; title: string } | string
  passingScore?: number
  maxAttempts?: number
  timeLimitMinutes?: number
  showCorrectAnswer?: boolean
  items?: {
    question: any
    order?: number
    points?: number
    id?: string
  }[]
  updatedAt: string
  createdAt: string
}

export interface AssessmentListResult {
  docs: AssessmentDoc[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
  moduleOptions: ModuleOption[]
  courseOptions: CourseOption[]
}

export interface ModuleOption {
  id: string
  title: string
}

export interface CourseOption {
  id: string
  title: string
}

export interface QuestionOption {
  id: string
  prompt: string
  type: string
  difficulty: string
}

export interface AssessmentEditData {
  assessment: AssessmentDoc
  moduleOptions: ModuleOption[]
  courseOptions: CourseOption[]
  questions: QuestionOption[]
}

export async function getAssessments(params?: {
  search?: string
  assessmentType?: string
  moduleId?: string
  page?: number
  limit?: number
}): Promise<AssessmentListResult> {
  const instructorId = await getInstructorId()

  // Get instructor's courses with depth=2 to include modules
  const coursesRes = await fetch(
    `${CMS_API}/courses?where[instructor][equals]=${instructorId}&depth=2&limit=100`,
    { headers: adminHeaders(), cache: 'no-store' },
  )
  if (!coursesRes.ok) throw new Error('Failed to fetch instructor courses')
  const myCoursesData = await coursesRes.json()
  const courses = myCoursesData.docs || []
  const courseIds = courses.map((c: any) => String(c.id))

  if (courseIds.length === 0) {
    return {
      docs: [],
      totalDocs: 0,
      page: params?.page || 1,
      limit: params?.limit || 12,
      totalPages: 0,
      moduleOptions: [],
      courseOptions: [],
    }
  }

  // Extract module IDs from the instructor's courses
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

  // Build query: assessments where module is in instructor's modules, OR course is in instructor's courses
  const queryParts: string[] = ['depth=2']

  // OR condition: module in instructor's modules, or course in instructor's courses
  let orIndex = 0
  if (moduleIds.length > 0) {
    const moduleIdsParam = moduleIds.join(',')
    queryParts.push(`where[or][${orIndex}][module][in]=${encodeURIComponent(moduleIdsParam)}`)
    orIndex++
  }
  if (courseIds.length > 0) {
    const courseIdsParam = courseIds.join(',')
    queryParts.push(`where[or][${orIndex}][course][in]=${encodeURIComponent(courseIdsParam)}`)
    orIndex++
  }

  if (params?.search) {
    queryParts.push(`where[or][${orIndex}][title][like]=${encodeURIComponent(params.search)}`)
  }
  if (params?.assessmentType) {
    queryParts.push(`where[assessmentType][equals]=${encodeURIComponent(params.assessmentType)}`)
  }
  if (params?.moduleId) {
    queryParts.push(`where[module][equals]=${encodeURIComponent(params.moduleId)}`)
  }
  if (params?.page) queryParts.push(`page=${params.page}`)
  if (params?.limit) queryParts.push(`limit=${params.limit}`)
  queryParts.push('sort=-createdAt')

  const moduleQueryParts: string[] = [
    'depth=0',
    'limit=200',
    'sort=title',
  ]
  if (moduleIds.length > 0) {
    moduleQueryParts.push(`where[id][in]=${encodeURIComponent(moduleIds.join(','))}`)
  }

  const [assessmentsRes, modulesRes, coursesForOptionsRes] = await Promise.all([
    fetch(`${CMS_API}/assessments?${queryParts.join('&')}`, {
      headers: adminHeaders(),
      cache: 'no-store',
    }),
    fetch(`${CMS_API}/course-modules?${moduleQueryParts.join('&')}`, {
      headers: adminHeaders(),
      cache: 'no-store',
    }),
    fetch(`${CMS_API}/courses?where[instructor][equals]=${instructorId}&depth=0&limit=100&sort=title`, {
      headers: adminHeaders(),
      cache: 'no-store',
    }),
  ])

  if (!assessmentsRes.ok) {
    const err = await assessmentsRes.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch assessments: ${assessmentsRes.statusText}`)
  }

  const assessmentsData = await assessmentsRes.json()
  const modulesData = await modulesRes.json()
  const coursesData = await coursesForOptionsRes.json()

  const moduleOptions = (modulesData.docs || []).map((m: any) => ({
    id: String(m.id),
    title: m.title || `Module #${m.id}`,
  }))

  const courseOptions = (coursesData.docs || []).map((c: any) => ({
    id: String(c.id),
    title: c.title || `Course #${c.id}`,
  }))

  return {
    docs: assessmentsData.docs || [],
    totalDocs: assessmentsData.totalDocs || 0,
    page: assessmentsData.page || 1,
    limit: assessmentsData.limit || 12,
    totalPages: assessmentsData.totalPages || 0,
    moduleOptions,
    courseOptions,
  }
}

export async function getAssessmentById(id: string): Promise<AssessmentEditData> {
  const instructorId = await getInstructorId()

  const res = await fetch(`${CMS_API}/assessments/${id}?depth=2`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch assessment: ${res.statusText}`)
  }

  const assessment = (await res.json()) as AssessmentDoc

  let moduleId = ''
  let courseId = ''

  if (assessment.assessmentType === 'final_exam') {
    const c = assessment.course
    if (c && typeof c === 'object') {
      courseId = String(c.id)
    }
  } else {
    const mod = assessment.module
    if (mod && typeof mod === 'object') {
      moduleId = String(mod.id)
    }
  }

  // Get instructor's courses with depth=2 (includes modules) to check ownership
  const coursesRes = await fetch(
    `${CMS_API}/courses?where[instructor][equals]=${instructorId}&depth=2&limit=100`,
    { headers: adminHeaders(), cache: 'no-store' },
  )
  if (!coursesRes.ok) throw new Error('Failed to fetch instructor courses')
  const coursesData = await coursesRes.json()
  const instructorCourses = coursesData.docs || []

  const instructorCourseIds = instructorCourses.map((c: any) => String(c.id))
  const instructorModuleIds: string[] = []
  for (const course of instructorCourses) {
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

  // Authorization: verify the assessment belongs to instructor's courses
  if (moduleId) {
    if (!instructorModuleIds.includes(moduleId)) {
      throw new Error('Unauthorized: assessment does not belong to your courses')
    }
  }

  if (courseId) {
    if (!instructorCourseIds.includes(courseId)) {
      throw new Error('Unauthorized: assessment does not belong to your courses')
    }
  }

  // Build module and course options from instructor's courses
  const moduleOptions = instructorModuleIds.length > 0
    ? await (async () => {
        const moduleFilter = instructorModuleIds
          .map((id, i) => `where[or][${i}][id][equals]=${encodeURIComponent(id)}`)
          .join('&')
        const modulesRes = await fetch(
          `${CMS_API}/course-modules?depth=0&limit=200&sort=title&${moduleFilter}`,
          { headers: adminHeaders(), cache: 'no-store' },
        )
        if (!modulesRes.ok) return []
        const modulesData = await modulesRes.json()
        return (modulesData.docs || []).map((m: any) => ({
          id: String(m.id),
          title: m.title || `Module #${m.id}`,
        }))
      })()
    : []

  const courseOptions = instructorCourseIds.length > 0
    ? instructorCourseIds.map((id: string, idx: number) => ({
        id,
        title: instructorCourses[idx].title || `Course #${id}`,
      }))
    : []

  const questions = await getQuestions({ limit: 200 })

  return {
    assessment,
    moduleOptions,
    courseOptions,
    questions,
  }
}

export async function getQuestions(params?: {
  search?: string
  limit?: number
}): Promise<QuestionOption[]> {
  const queryParts: string[] = ['depth=0']
  if (params?.search) queryParts.push(`where[prompt][like]=${encodeURIComponent(params.search)}`)
  if (params?.limit) queryParts.push(`limit=${params.limit}`)

  const res = await fetch(`${CMS_API}/questions?${queryParts.join('&')}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Failed to fetch questions: ${res.statusText}`)
  const data = await res.json()
  return (data.docs || []).map((q: any) => ({
    id: String(q.id),
    prompt: q.prompt,
    type: q.type,
    difficulty: q.difficulty,
  }))
}

export async function createAssessment(data: {
  title: string
  assessmentType: string
  module?: string
  course?: string
  passingScore?: number
  maxAttempts?: number
  timeLimitMinutes?: number
  showCorrectAnswer?: boolean
  items?: { question: string; order?: number; points?: number }[]
}): Promise<AssessmentDoc> {
  const instructorId = await getInstructorId()

  const body: Record<string, any> = {
    title: data.title,
    assessmentType: data.assessmentType,
    passingScore: data.passingScore ?? 70,
    maxAttempts: data.maxAttempts ?? 1,
    showCorrectAnswer: data.showCorrectAnswer ?? false,
    items: data.items && data.items.length > 0 ? data.items : [],
  }

  // Get instructor's courses with depth=2 to include modules for ownership check
  const coursesRes = await fetch(
    `${CMS_API}/courses?where[instructor][equals]=${instructorId}&depth=2&limit=100`,
    { headers: adminHeaders(), cache: 'no-store' },
  )
  if (!coursesRes.ok) throw new Error('Failed to fetch instructor courses')
  const coursesData = await coursesRes.json()
  const instructorCourses = coursesData.docs || []

  const instructorModuleIds: string[] = []
  for (const course of instructorCourses) {
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

  if (data.assessmentType === 'final_exam') {
    if (data.course) {
      // Verify course belongs to instructor
      const courseRes = await fetch(`${CMS_API}/courses/${data.course}?depth=0`, {
        headers: adminHeaders(), cache: 'no-store',
      })
      if (!courseRes.ok) throw new Error('Course not found')
      const course = await courseRes.json()
      const instructor = course.instructor
      const instructorIdValue =
        typeof instructor === 'object' ? instructor.id : String(instructor)
      if (instructorIdValue !== instructorId) {
        throw new Error('Unauthorized: cannot create assessments for another instructor course')
      }
      body.course = data.course
    } else {
      throw new Error('Course is required for final exams')
    }
  } else {
    if (data.module) {
      // Verify module belongs to instructor (check against module IDs extracted from courses)
      if (!instructorModuleIds.includes(String(data.module))) {
        throw new Error('Unauthorized: cannot create assessments for a module not in your courses')
      }
      body.module = data.module
    } else {
      throw new Error('Module is required for quiz and exam assessments')
    }
  }

  if (data.timeLimitMinutes) body.timeLimitMinutes = data.timeLimitMinutes

  const res = await fetch(`${CMS_API}/assessments`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to create assessment: ${res.statusText}`)
  }

  return res.json()
}

export async function updateAssessment(
  id: string,
  data: Partial<AssessmentDoc>,
): Promise<AssessmentDoc> {
  const instructorId = await getInstructorId()

  const safeData: Record<string, any> = { ...data }

  // Get instructor's course/module IDs for ownership verification
  const coursesRes = await fetch(
    `${CMS_API}/courses?where[instructor][equals]=${instructorId}&depth=2&limit=100`,
    { headers: adminHeaders(), cache: 'no-store' },
  )
  if (!coursesRes.ok) throw new Error('Failed to fetch instructor courses')
  const coursesData = await coursesRes.json()
  const instructorCourses = coursesData.docs || []

  const instructorModuleIds: string[] = []
  for (const course of instructorCourses) {
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

  if (safeData.module != null && typeof safeData.module !== 'object') {
    if (!instructorModuleIds.includes(String(safeData.module))) {
      throw new Error('Unauthorized: cannot move assessment to another instructor course')
    }
    safeData.module = Number(safeData.module)
  }

  if (safeData.course != null && typeof safeData.course !== 'object') {
    const courseRes = await fetch(`${CMS_API}/courses/${safeData.course}?depth=0`, {
      headers: adminHeaders(), cache: 'no-store',
    })
    if (courseRes.ok) {
      const course = await courseRes.json()
      const instructor = course.instructor
      const instructorIdValue =
        typeof instructor === 'object' ? instructor.id : String(instructor)
      if (instructorIdValue !== instructorId) {
        throw new Error('Unauthorized: cannot move assessment to another instructor course')
      }
    }
    safeData.course = Number(safeData.course)
  }

  const res = await fetch(`${CMS_API}/assessments/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(safeData),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = (err as any).errors?.[0]?.message || (err as any).error || `Failed to update assessment: ${res.statusText}`
    throw new Error(msg)
  }

  return res.json()
}

export async function deleteAssessment(id: string): Promise<void> {
  await getAssessmentById(id)

  const res = await fetch(`${CMS_API}/assessments/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to delete assessment: ${res.statusText}`)
  }
}
