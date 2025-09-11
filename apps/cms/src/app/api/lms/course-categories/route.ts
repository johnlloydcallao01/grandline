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

// GET /api/lms/course-categories - Get all course categories with filtering
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
    const parent = searchParams.get('parent')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    // Build where clause
    const where: Where = {}
    
    if (parent) {
      where.parent = { equals: parent }
    }
    
    if (type) {
      where.categoryType = { equals: type }
    }
    
    if (search) {
      where.or = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }

    // Get categories with relationships
    const categories = await payload.find({
      collection: 'course-categories',
      where,
      page,
      limit,
      depth: 2,
      sort: 'name',
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching course categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/lms/course-categories - Create new course category
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

    // Create category using PayloadCMS
    const newCategory = await payload.create({
      collection: 'course-categories',
      data: body,
    })

    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    console.error('Error creating course category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
