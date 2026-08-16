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

  const instructorRes = await fetch(
    `${CMS_API}/instructors?where[user][equals]=${encodeURIComponent(userId)}&depth=0&limit=1`,
    { headers: adminHeaders(), cache: 'no-store' },
  )
  if (!instructorRes.ok) throw new Error('Failed to get instructor profile')
  const instructorData = await instructorRes.json()
  const instructorId = instructorData?.docs?.[0]?.id
  if (!instructorId) throw new Error('Instructor profile not found')

  return String(instructorId)
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

export interface GradeBand {
  label: string
  minScore: number
  maxScore: number
  gpaValue: number | null
  description: string | null
}

export interface CourseRef {
  id: number
  title: string
  code: string
}

export interface GradeScaleRef {
  id: number
  title: string
  description: string | null
  grades: GradeBand[]
  usedByCourses: CourseRef[]
}

export interface GradeSetupData {
  scales: GradeScaleRef[]
  summary: {
    totalScales: number
    usedByMyCourses: number
    courseReferences: number
    unusedByMyCourses: number
  }
}

export async function getGradeSetupReference(): Promise<GradeSetupData> {
  const instructorId = await getInstructorId()

  const scaleParams = new URLSearchParams({ depth: '0', limit: '200', sort: 'title' })
  const scaleRes = await fetch(`${CMS_API}/grade-scales?${scaleParams.toString()}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!scaleRes.ok) throw new Error(await extractError(scaleRes, 'Failed to fetch grade scales'))
  const scaleDocs = (await scaleRes.json()).docs || []

  const scaleMap = new Map<number, GradeScaleRef>()
  for (const scale of scaleDocs) {
    scaleMap.set(Number(scale.id), {
      id: Number(scale.id),
      title: scale.title || `Grade Scale #${scale.id}`,
      description: scale.description || null,
      grades: (scale.grades || [])
        .map((grade: any) => ({
          label: grade.label || 'Grade',
          minScore: Number(grade.minScore ?? 0),
          maxScore: Number(grade.maxScore ?? 100),
          gpaValue: grade.gpaValue != null ? Number(grade.gpaValue) : null,
          description: grade.description || null,
        }))
        .sort((a: GradeBand, b: GradeBand) => a.minScore - b.minScore),
      usedByCourses: [],
    })
  }

  const courseParams = new URLSearchParams({ depth: '0', limit: '500', sort: 'title' })
  courseParams.set('where[or][0][instructor][equals]', instructorId)
  courseParams.set('where[or][1][coInstructors][contains]', instructorId)

  const courseRes = await fetch(`${CMS_API}/courses?${courseParams.toString()}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!courseRes.ok) throw new Error(await extractError(courseRes, 'Failed to fetch instructor courses'))
  const courseDocs = (await courseRes.json()).docs || []

  let courseReferences = 0
  for (const course of courseDocs) {
    const scaleId = typeof course.gradeScale === 'number' ? course.gradeScale : course.gradeScale?.id
    if (scaleId == null || !scaleMap.has(Number(scaleId))) continue
    courseReferences += 1
    scaleMap.get(Number(scaleId))!.usedByCourses.push({
      id: Number(course.id),
      title: course.title || course.courseCode || `Course #${course.id}`,
      code: course.courseCode || '',
    })
  }

  const scales = Array.from(scaleMap.values())
  const usedByMyCourses = scales.filter((scale) => scale.usedByCourses.length > 0).length

  return {
    scales,
    summary: {
      totalScales: scales.length,
      usedByMyCourses,
      courseReferences,
      unusedByMyCourses: scales.length - usedByMyCourses,
    },
  }
}