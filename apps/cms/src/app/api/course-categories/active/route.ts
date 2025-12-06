import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    const { searchParams } = new URL(request.url)
    const strict = searchParams.get('strict') === 'true' || searchParams.get('requireAll') === 'true'

    const coursesResult = await payload.find({
      collection: 'courses',
      limit: 10000,
      depth: 0,
    })

    const courses = coursesResult.docs as Array<{ category?: number[] }>

    let ids: number[] = []
    if (strict) {
      if (courses.length === 0) {
        ids = []
      } else {
        let set = new Set<number>((Array.isArray(courses[0].category) ? courses[0].category : []) as number[])
        for (let i = 1; i < courses.length; i++) {
          const catIds = (Array.isArray(courses[i].category) ? courses[i].category : []) as number[]
          if (set.size === 0) break
          set = new Set(Array.from(set).filter(id => catIds.includes(id)))
        }
        ids = Array.from(set)
      }
    } else {
      const set = new Set<number>()
      for (const course of courses) {
        const catIds = (Array.isArray(course.category) ? course.category : []) as number[]
        for (const id of catIds) set.add(id)
      }
      ids = Array.from(set)
    }

    if (ids.length === 0) {
      return NextResponse.json({ count: 0, categories: [] })
    }

    const categoriesResult = await payload.find({
      collection: 'course-categories',
      where: { id: { in: ids } },
      limit: ids.length,
      depth: 0,
    })

    return NextResponse.json({ count: categoriesResult.totalDocs, categories: categoriesResult.docs })
  } catch (error) {
    console.error('Error fetching assigned course categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

