import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import {
  CMS_API,
  apiHeaders,
  getInstructorId,
  getMyCourseIds,
} from '../search/_shared'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('grandline-instructor-token')?.value
    if (!token) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 })
    }

    const body = await req.json()
    const { enrollmentId } = body
    if (!enrollmentId) {
      return new Response(JSON.stringify({ error: 'enrollmentId is required' }), { status: 400 })
    }

    const instructorId = await getInstructorId()
    if (!instructorId) {
      return new Response(JSON.stringify({ error: 'Instructor profile not found' }), { status: 401 })
    }

    const courseIds = await getMyCourseIds(instructorId)
    if (courseIds.length === 0) {
      return new Response(JSON.stringify({ error: 'No courses found for this instructor' }), { status: 403 })
    }

    // Verify the enrollment belongs to one of the instructor's courses before forwarding.
    const enrollmentRes = await fetch(`${CMS_API}/course-enrollments/${enrollmentId}?depth=0`, {
      headers: apiHeaders(),
      cache: 'no-store',
    })
    if (!enrollmentRes.ok) {
      return new Response(JSON.stringify({ error: 'Enrollment not found' }), { status: 404 })
    }
    const enrollment = await enrollmentRes.json()
    const courseId = typeof enrollment.course === 'object' && enrollment.course
      ? String(enrollment.course.id)
      : String(enrollment.course)
    if (!courseIds.includes(courseId)) {
      return new Response(JSON.stringify({ error: 'Enrollment is not in one of your courses' }), { status: 403 })
    }

    const baseUrl = req.headers.get('origin') || req.headers.get('referer') || process.env.NEXT_PUBLIC_APP_URL

    const cmsRes = await fetch(`${CMS_API}/generate-certificate`, {
      method: 'POST',
      headers: {
        Authorization: `JWT ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ enrollmentId, baseUrl }),
    })

    if (!cmsRes.ok || !cmsRes.body) {
      return new Response(
        JSON.stringify({ error: `CMS returned ${cmsRes.status}` }),
        { status: 502 },
      )
    }

    return new Response(cmsRes.body, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Internal error' }), { status: 500 })
  }
}