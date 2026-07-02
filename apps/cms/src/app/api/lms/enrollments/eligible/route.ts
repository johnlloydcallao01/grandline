import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = (searchParams.get('search') || '').trim()

    const where: Where = {
      and: [
        { finalEvaluation: { equals: 'passed' } },
        { certificateIssued: { not_equals: true } },
        { isArchived: { not_equals: true } },
        { status: { not_in: 'dropped,expired,suspended' } },
      ],
    } as any

    if (search) {
      const orConditions: any[] = []

      const matchingUsers = await payload.find({
        collection: 'users',
        where: {
          or: [
            { firstName: { like: search } },
            { lastName: { like: search } },
            { email: { like: search } },
          ],
        },
        limit: 200,
        overrideAccess: true,
      })

      const userIds = matchingUsers.docs.map((u) => String(u.id))

      if (userIds.length > 0) {
        const matchingTrainees = await payload.find({
          collection: 'trainees',
          where: {
            user: { in: userIds },
          },
          limit: 200,
          overrideAccess: true,
        })

        const traineeIds = matchingTrainees.docs.map((t) => String(t.id))
        if (traineeIds.length > 0) {
          orConditions.push({ student: { in: traineeIds } })
        }
      }

      orConditions.push({ 'course.title': { like: search } })

      if (search.includes(' ')) {
        const [first, last] = search.split(' ')
        if (first && last) {
          const firstLastUsers = await payload.find({
            collection: 'users',
            where: {
              and: [
                { firstName: { like: first } },
                { lastName: { like: last } },
              ],
            },
            limit: 200,
            overrideAccess: true,
          })

          const firstLastUserIds = firstLastUsers.docs.map((u) => String(u.id))
          if (firstLastUserIds.length > 0) {
            const firstLastTrainees = await payload.find({
              collection: 'trainees',
              where: {
                user: { in: firstLastUserIds },
              },
              limit: 200,
              overrideAccess: true,
            })

            const flTraineeIds = firstLastTrainees.docs.map((t) => String(t.id))
            if (flTraineeIds.length > 0) {
              orConditions.push({ student: { in: flTraineeIds } })
            }
          }
        }
      }

      if (orConditions.length > 0) {
        ;(where as any).and.push({ or: orConditions })
      }
    }

    const enrollments = await payload.find({
      collection: 'course-enrollments',
      where,
      page,
      limit,
      depth: 3,
      sort: '-enrolledAt',
      overrideAccess: true,
    })

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error('Error fetching eligible enrollments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
