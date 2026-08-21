import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../../_utils/service-api-key'

// GET /api/lms/gradebook/admin/courses?withStats=1
// ?withStats=1 returns courses with enrollment/grading stats derived by the
// backend. Otherwise returns a plain course option list for pickers.
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    const withStats = searchParams.get('withStats') === '1'

    const courseWhere: Where = {}
    const courses = await payload.find({
      collection: 'courses',
      where: courseWhere,
      limit: 200,
      sort: 'title',
      depth: 1,
      overrideAccess: true,
    })

    const courseDocs = courses.docs || []

    if (!withStats) {
      return NextResponse.json({
        docs: courseDocs.map((c: any) => ({ id: Number(c.id), title: c.title || `Course #${c.id}` })),
        totalDocs: courses.totalDocs,
      })
    }

    if (courseDocs.length === 0) {
      return NextResponse.json({ courses: [] })
    }

    const courseIds = courseDocs.map((c: any) => String(c.id))

    const enrollments = await payload.find({
      collection: 'course-enrollments',
      where: { course: { in: courseIds } } as Where,
      limit: 500,
      depth: 0,
      sort: '-updatedAt',
      overrideAccess: true,
    })

    const grouped = new Map<number, { enrollmentCount: number; gradedCount: number; gradeSum: number; passedCount: number }>()
    for (const c of courseDocs) {
      grouped.set(Number(c.id), { enrollmentCount: 0, gradedCount: 0, gradeSum: 0, passedCount: 0 })
    }
    for (const e of (enrollments.docs || []) as any[]) {
      const courseId = typeof e.course === 'number' ? e.course : e.course?.id
      if (!courseId || !grouped.has(Number(courseId))) continue
      const g = grouped.get(Number(courseId))!
      g.enrollmentCount++
      if (e.finalGrade != null) {
        g.gradedCount++
        g.gradeSum += Number(e.finalGrade)
      }
      if (e.finalEvaluation === 'passed') g.passedCount++
    }

    const result = courseDocs.map((c: any) => {
      const g = grouped.get(Number(c.id))!
      return {
        id: Number(c.id),
        title: c.title || `Course #${c.id}`,
        enrollmentCount: g.enrollmentCount,
        gradedCount: g.gradedCount,
        avgGrade: g.gradedCount > 0 ? Math.round(g.gradeSum / g.gradedCount) : null,
        passedCount: g.passedCount,
      }
    })

    return NextResponse.json({ courses: result })
  } catch (error) {
    console.error('[Gradebook] Error fetching admin courses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
