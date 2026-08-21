import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Payload, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../../_utils/service-api-key'
import { normalizeScaleGrades, scaleTitle } from '../../_utils/grade-scale'

async function resolveInstructorId(payload: Payload, userId: string): Promise<string | null> {
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

// GET /api/lms/gradebook/instructor/grade-setup?userId=
// Returns the institution-wide grade scales plus which of the instructor's
// owned/co-taught courses reference each scale. Read-only for instructors.
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const userId = (searchParams.get('userId') || '').trim()
    if (!userId) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 })
    }

    const instructorId = await resolveInstructorId(payload, userId)
    if (!instructorId) {
      return NextResponse.json({ error: 'Instructor profile not found' }, { status: 404 })
    }

    const scaleRes = await payload.find({
      collection: 'grade-scales',
      where: {},
      limit: 200,
      sort: 'title',
      depth: 0,
      overrideAccess: true,
    })

    const scaleMap = new Map<number, any>()
    for (const scale of (scaleRes.docs || []) as any[]) {
      scaleMap.set(Number(scale.id), {
        id: Number(scale.id),
        title: scaleTitle(scale),
        description: scale.description || null,
        grades: normalizeScaleGrades(scale.grades),
        usedByCourses: [],
      })
    }

    const courseWhere: Where = {
      or: [
        { instructor: { equals: instructorId } },
        { coInstructors: { contains: instructorId } },
      ],
    }
    const courseRes = await payload.find({
      collection: 'courses',
      where: courseWhere,
      sort: 'title',
      limit: 500,
      depth: 0,
      overrideAccess: true,
    })

    let courseReferences = 0
    for (const course of (courseRes.docs || []) as any[]) {
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

    return NextResponse.json({
      scales,
      summary: {
        totalScales: scales.length,
        usedByMyCourses,
        courseReferences,
        unusedByMyCourses: scales.length - usedByMyCourses,
      },
    })
  } catch (error) {
    console.error('[Gradebook] Error fetching instructor grade setup:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
