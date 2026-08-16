import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../_utils/service-api-key'

// GET /api/lms/enrollments/trainees?search=&limit=
// Searches trainees by user name or email. Used by the assign slide-over in
// both web-admin and web-instructor.
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const search = (searchParams.get('search') || '').trim()
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!search) {
      return NextResponse.json({ docs: [], totalDocs: 0 })
    }

    const userWhere: Where = {
      or: [
        { firstName: { like: search } },
        { lastName: { like: search } },
        { email: { like: search } },
      ],
    }

    if (search.includes(' ')) {
      const [first, last] = search.split(' ')
      if (first && last) {
        ;(userWhere.or as any[]).push({
          and: [
            { firstName: { like: first } },
            { lastName: { like: last } },
          ],
        })
      }
    }

    const matchingUsers = await payload.find({
      collection: 'users',
      where: userWhere,
      limit: 200,
      overrideAccess: true,
    })

    const userIds = matchingUsers.docs.map((u) => String(u.id))

    if (userIds.length === 0) {
      return NextResponse.json({ docs: [], totalDocs: 0 })
    }

    const trainees = await payload.find({
      collection: 'trainees',
      where: {
        user: { in: userIds },
      },
      depth: 2,
      limit,
      overrideAccess: true,
    })

    return NextResponse.json(trainees)
  } catch (error) {
    console.error('Error searching trainees:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}