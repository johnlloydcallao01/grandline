import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

// GET /api/lms/courses/[id] - Get course with full details including media
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const params = await context.params

    // Get course with all relationships
    const course = await payload.findByID({
      collection: 'courses',
      id: params.id,
      depth: 2, // Include nested relationships
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // For now, return course without advanced statistics
    // Advanced statistics can be added later with proper database integration
    const courseWithStats = {
      ...course,
      statistics: {
        total_enrollments: 0,
        active_enrollments: 0,
        completed_enrollments: 0,
        avg_progress: 0
      }
    }

    return NextResponse.json(courseWithStats)
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/lms/courses/[id] - Update course
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const params = await context.params
    const body = await request.json()

    const updatedCourse = await payload.update({
      collection: 'courses',
      id: params.id,
      data: body,
    })

    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
