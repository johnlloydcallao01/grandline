import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where, type BasePayload } from 'payload'
import configPromise from '@payload-config'

// Helper function to validate API key
async function validateApiKey(request: NextRequest, payload: BasePayload): Promise<boolean> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
  
  // Check for API key format: "users API-Key <key>"
  const apiKeyMatch = authHeader.match(/^users API-Key (.+)$/)
  if (!apiKeyMatch) return false
  
  const providedKey = apiKeyMatch[1]
  
  try {
    // Find user with matching API key
    const users = await payload.find({
      collection: 'users',
      where: {
        apiKey: {
          equals: providedKey
        },
        // Ensure user is active and has service role
        role: {
          in: ['service', 'admin']
        }
      },
      limit: 1,
      depth: 0
    })
    
    // API key is valid if we found exactly one matching user
    return users.docs.length === 1
  } catch (error) {
    console.error('Error validating API key:', error)
    return false
  }
}

// GET /api/lms/courses - Get courses with API key authentication
export async function GET(request: NextRequest) {
  try {
    // Initialize payload and validate API key
    const payload = await getPayload({ config: configPromise })
    const isAuthenticated = await validateApiKey(request, payload)
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized - Valid API key required' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Build where clause
    const where: Where = {}
    
    if (status) {
      where.status = { equals: status }
    }
    
    if (search) {
      where.or = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
      ]
    }

    // Now using proper authentication - no overrideAccess
    const courses = await payload.find({
      collection: 'courses',
      where,
      page,
      limit,
      depth: 2,
      sort: '-createdAt',
      // Removed overrideAccess: true - now respects collection access control
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

// POST /api/lms/courses - Create new course with API key authentication
export async function POST(request: NextRequest) {
  try {
    // Initialize payload and validate API key
    const payload = await getPayload({ config: configPromise })
    const isAuthenticated = await validateApiKey(request, payload)
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized - Valid API key required' },
        { status: 401 }
      )
    }
    const body = await request.json()

    // Now using proper authentication - no overrideAccess
    const newCourse = await payload.create({
      collection: 'courses',
      data: body,
      // Removed overrideAccess: true - now respects collection access control
    })

    return NextResponse.json(newCourse, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}