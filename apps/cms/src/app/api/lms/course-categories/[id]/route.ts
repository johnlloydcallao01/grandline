import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

// GET /api/lms/course-categories/[id] - Get course category by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const params = await context.params
    
    // Get category with all relationships
    const category = await payload.findByID({
      collection: 'course-categories',
      id: params.id,
      depth: 2,
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Course category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching course category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/lms/course-categories/[id] - Update course category
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const params = await context.params
    const body = await request.json()

    const updatedCategory = await payload.update({
      collection: 'course-categories',
      id: params.id,
      data: body,
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Error updating course category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/lms/course-categories/[id] - Delete course category
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const params = await context.params

    await payload.delete({
      collection: 'course-categories',
      id: params.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting course category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
