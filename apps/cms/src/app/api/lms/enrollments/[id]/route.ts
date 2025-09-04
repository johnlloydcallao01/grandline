import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

// GET /api/lms/enrollments/[id] - Get enrollment by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const params = await context.params
    
    // Get enrollment with all relationships
    const enrollment = await payload.findByID({
      collection: 'course-enrollments',
      id: params.id,
      depth: 2,
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error('Error fetching enrollment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/lms/enrollments/[id] - Update enrollment
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const params = await context.params
    const body = await request.json()

    const updatedEnrollment = await payload.update({
      collection: 'course-enrollments',
      id: params.id,
      data: body,
    })

    return NextResponse.json(updatedEnrollment)
  } catch (error) {
    console.error('Error updating enrollment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/lms/enrollments/[id] - Delete enrollment
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const params = await context.params

    await payload.delete({
      collection: 'course-enrollments',
      id: params.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting enrollment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
