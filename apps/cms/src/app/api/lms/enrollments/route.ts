import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'

// Validate API key from Authorization header
async function validateApiKey(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('users API-Key ')) {
    return null
  }
  
  const apiKey = authHeader.replace('users API-Key ', '')
  
  try {
    const payload = await getPayload({ config: configPromise })
    
    const users = await payload.find({
      collection: 'users',
      where: {
        and: [
          { apiKey: { equals: apiKey } },
          { apiKeyEnabled: { equals: true } },
          {
            or: [
              { role: { equals: 'service' } },
              { role: { equals: 'admin' } }
            ]
          }
        ]
      },
      limit: 1
    })
    
    return users.docs.length > 0 ? users.docs[0] : null
  } catch (error) {
    console.error('API key validation error:', error)
    return null
  }
}

// GET /api/lms/enrollments - Get enrollments with filtering
export async function GET(request: NextRequest) {
  try {
    // Validate API key
    const user = await validateApiKey(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Valid API key required' },
        { status: 401 }
      )
    }
    
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const student = searchParams.get('student')
    const course = searchParams.get('course')
    const status = searchParams.get('status')

    // Build where clause
    const where: Where = {}
    
    if (student) {
      where.student = { equals: student }
    }
    
    if (course) {
      where.course = { equals: course }
    }
    
    if (status) {
      where.status = { equals: status }
    }

    // Get enrollments with relationships
    const enrollments = await payload.find({
      collection: 'course-enrollments',
      where,
      page,
      limit,
      depth: 2,
      sort: '-enrolledAt',
    })

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/lms/enrollments - Create new enrollment
export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const user = await validateApiKey(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Valid API key required' },
        { status: 401 }
      )
    }
    
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    // Check if enrollment already exists
    const existingEnrollment = await payload.find({
      collection: 'course-enrollments',
      where: {
        and: [
          { student: { equals: body.student } },
          { course: { equals: body.course } }
        ]
      } as Where
    })

    if (existingEnrollment.docs.length > 0) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this course' },
        { status: 400 }
      )
    }

    // Create enrollment
    const newEnrollment = await payload.create({
      collection: 'course-enrollments',
      data: {
        ...body,
        enrolledAt: new Date().toISOString(),
        status: body.status || 'active',
        progressPercentage: 0,
      },
    })

    // Note: Database integration can be added later

    return NextResponse.json(newEnrollment, { status: 201 })
  } catch (error) {
    console.error('Error creating enrollment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
