import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const apiKey = request.headers.get('PAYLOAD_API_KEY')
    if (!apiKey) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const coursesResult = await payload.find({
      collection: 'courses',
      limit: 10000,
      depth: 0,
    })

    const courses = coursesResult.docs as Array<{ category?: number[] }>

    const set = new Set<number>()
    for (const course of courses) {
      const catIds = (Array.isArray(course.category) ? course.category : []) as number[]
      for (const id of catIds) set.add(id)
    }
    const ids = Array.from(set)

    if (ids.length === 0) {
      return NextResponse.json({ count: 0, categories: [] })
    }

    const categoriesResult = await payload.find({
      collection: 'course-categories',
      where: { id: { in: ids }, isActive: { equals: true } },
      limit: ids.length,
      depth: 2,
    })

    return NextResponse.json({ count: categoriesResult.totalDocs, categories: categoriesResult.docs })
  } catch (error) {
    console.error('Error fetching assigned course categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
