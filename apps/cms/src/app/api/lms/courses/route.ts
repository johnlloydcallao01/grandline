import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'

// GET /api/lms/courses - Get all courses with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const instructor = searchParams.get('instructor')
    const search = searchParams.get('search')

    // Build where clause
    const where: Where = {}
    
    if (status) {
      where.status = { equals: status }
    }
    
    if (category) {
      where.category = { equals: category }
    }
    
    if (instructor) {
      where.instructor = { equals: instructor }
    }
    
    if (search) {
      where.or = [
        { title: { contains: search } },
        { courseCode: { contains: search } },
        { description: { contains: search } },
      ]
    }

    // Get courses with relationships
    const courses = await payload.find({
      collection: 'courses',
      where,
      page,
      limit,
      depth: 2,
      sort: '-createdAt',
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/lms/courses - Create new course
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    // Create course using PayloadCMS
    const newCourse = await payload.create({
      collection: 'courses',
      data: body,
    })

    // Note: Database integration can be added later
    // For now, we're using PayloadCMS as the primary data store

    return NextResponse.json(newCourse, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
