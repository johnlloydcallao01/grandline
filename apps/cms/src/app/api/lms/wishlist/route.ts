import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'

function mapWishlistCourse(course: any) {
  if (!course || typeof course !== 'object') {
    return null
  }

  const id = course.id
  const title = typeof course.title === 'string' ? course.title : ''

  if (id === null || id === undefined || !title) {
    return null
  }

  return {
    id: String(id),
    title,
    excerpt: typeof course.excerpt === 'string' ? course.excerpt : '',
    status: course.status === 'draft' ? 'draft' : 'published',
    thumbnail: course.thumbnail ?? null,
    bannerImage: course.bannerImage ?? null,
    estimatedDuration:
      typeof course.estimatedDuration === 'number' ? course.estimatedDuration : null,
    estimatedDurationUnit:
      typeof course.estimatedDurationUnit === 'string'
        ? course.estimatedDurationUnit
        : null,
    updatedAt: course.updatedAt ?? null,
    courseMaterials: Array.isArray(course.courseMaterials) ? course.courseMaterials : null,
    description: course.description,
    descriptionBlocks: course.descriptionBlocks ?? null,
    isFeatured: Boolean(course.isFeatured),
  }
}

// GET /api/lms/wishlist - Get wishlist state for a user
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const userId = searchParams.get('userId')
    const courseId = searchParams.get('courseId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200)

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 },
      )
    }

    const where: Where = {
      user: { equals: userId },
    }

    if (courseId) {
      ;(where as any).course = { equals: courseId }
    }

    const result = await payload.find({
      collection: 'wishlists',
      where,
      sort: '-createdAt',
      limit,
      depth: 2,
      overrideAccess: true,
    })

    const items = (Array.isArray(result.docs) ? result.docs : [])
      .map((doc: any) => mapWishlistCourse(doc?.course))
      .filter(Boolean)

    const courseIds = Array.from(
      new Set(
        items.map((course: any) => String(course.id)).filter(Boolean),
      ),
    )

    return NextResponse.json({
      items,
      courseIds,
      totalDocs: items.length,
    })
  } catch (error) {
    console.error('Error fetching LMS wishlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/lms/wishlist - Toggle a wishlist entry for a user and course
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const userId = body?.userId
    const courseId = body?.courseId

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'Missing userId or courseId' },
        { status: 400 },
      )
    }

    const existing = await payload.find({
      collection: 'wishlists',
      where: {
        and: [
          {
            user: { equals: String(userId) },
          },
          {
            course: { equals: String(courseId) },
          },
        ],
      } as Where,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const first = Array.isArray(existing.docs) ? existing.docs[0] : null
    if (first && (first as any).id != null) {
      await payload.delete({
        collection: 'wishlists',
        id: (first as any).id,
        overrideAccess: true,
      })

      return NextResponse.json({
        success: true,
        wishlisted: false,
        courseId: String(courseId),
      })
    }

    const created = await payload.create({
      collection: 'wishlists',
      data: {
        user: userId,
        course: courseId,
      },
      overrideAccess: true,
    })

    return NextResponse.json(
      {
        success: true,
        wishlisted: true,
        courseId: String(courseId),
        id: created.id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error toggling LMS wishlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
