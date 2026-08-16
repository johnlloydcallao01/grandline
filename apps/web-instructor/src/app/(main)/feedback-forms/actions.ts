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

  const instRes = await fetch(`${CMS_API}/instructors?where[user][equals]=${userId}&depth=0&limit=1`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!instRes.ok) throw new Error('Failed to get instructor profile')
  const instData = await instRes.json()
  const instructorId = instData?.docs?.[0]?.id
  if (!instructorId) throw new Error('Instructor profile not found')

  return { instructorId: String(instructorId), userId: String(userId) }
}

async function extractError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json()
    if (data?.errors?.[0]?.message) return data.errors[0].message
    if (data?.error) return data.error
    if (data?.message) return data.message
  } catch {
    // ignore parse failures and fall back to the status text
  }
  return fallback
}

export interface TextInputBlock {
  id?: string
  blockType: 'textInput'
  name: string
  label: string
  placeholder?: string
  format: 'text' | 'email' | 'phone' | 'number' | 'textarea'
  isRequired?: boolean
}

export interface ChoiceOption {
  id?: string
  label: string
  value: string
}

export interface ChoiceInputBlock {
  id?: string
  blockType: 'choiceInput'
  name: string
  label: string
  uiType: 'radio' | 'dropdown' | 'checkbox_group'
  options: ChoiceOption[]
  isRequired?: boolean
}

export interface MatrixColumn {
  id?: string
  label: string
  value: string
}

export interface MatrixRow {
  id?: string
  statement: string
  value: string
}

export interface SurveyMatrixBlock {
  id?: string
  blockType: 'surveyMatrix'
  name: string
  question: string
  columns: MatrixColumn[]
  rows: MatrixRow[]
  isRequired?: boolean
}

export type FormFieldBlock = TextInputBlock | ChoiceInputBlock | SurveyMatrixBlock

export interface CourseRef {
  id: number
  title?: string
}

export interface FeedbackFormDoc {
  id: number
  title: string
  description?: string | null
  fields: FormFieldBlock[]
  createdAt: string
  updatedAt: string
  courses: CourseRef[]
}

export interface FeedbackFormsStats {
  totalForms: number
  totalFields: number
  avgFieldsPerForm: number
}

export interface FeedbackFormsResult {
  docs: FeedbackFormDoc[]
  totalDocs: number
  totalPages: number
  page: number
  limit: number
  stats: FeedbackFormsStats
}

function normalizeFields(fields: any[] | undefined): FormFieldBlock[] {
  if (!Array.isArray(fields)) return []
  return fields.filter((f) => f && typeof f === 'object' && f.blockType)
}

export async function getFeedbackForms(params: {
  search?: string
  page?: number
  limit?: number
}): Promise<FeedbackFormsResult> {
  const { instructorId } = await getInstructorContext()

  // Scoping boundary: feedback forms attached to the instructor's courses only.
  // Resolve instructor -> owned/co-taught courses -> their feedbackForm relations.
  const courseParams = new URLSearchParams({ depth: '2', limit: '500', sort: 'title' })
  courseParams.set('where[or][0][instructor][equals]', instructorId)
  courseParams.set('where[or][1][coInstructors][contains]', instructorId)

  const courseRes = await fetch(`${CMS_API}/courses?${courseParams.toString()}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!courseRes.ok) {
    throw new Error(await extractError(courseRes, `Failed to fetch courses: ${courseRes.statusText}`))
  }
  const courseData = await courseRes.json()

  const formMap = new Map<number, FeedbackFormDoc>()
  for (const course of courseData.docs || []) {
    const form = course.feedbackForm
    if (!form || typeof form !== 'object') continue
    const id = Number(form.id)
    let entry = formMap.get(id)
    if (!entry) {
      entry = {
        id,
        title: form.title || `Form #${id}`,
        description: form.description ?? null,
        fields: normalizeFields(form.fields),
        createdAt: form.createdAt || '',
        updatedAt: form.updatedAt || '',
        courses: [],
      }
      formMap.set(id, entry)
    }
    entry.courses.push({ id: Number(course.id), title: course.title || `Course #${course.id}` })
  }

  let allForms = Array.from(formMap.values())

  const stats: FeedbackFormsStats = {
    totalForms: allForms.length,
    totalFields: allForms.reduce((acc, f) => acc + f.fields.length, 0),
    avgFieldsPerForm: allForms.length > 0
      ? Math.round((allForms.reduce((acc, f) => acc + f.fields.length, 0) / allForms.length) * 10) / 10
      : 0,
  }

  const search = (params?.search || '').trim().toLowerCase()
  if (search) {
    allForms = allForms.filter(
      (f) =>
        f.title.toLowerCase().includes(search) ||
        (f.description || '').toLowerCase().includes(search)
    )
  }

  allForms.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))

  const limit = params?.limit || 20
  const page = params?.page || 1
  const totalDocs = allForms.length
  const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
  const start = (page - 1) * limit
  const docs = allForms.slice(start, start + limit)

  return { docs, totalDocs, totalPages, page, limit, stats }
}