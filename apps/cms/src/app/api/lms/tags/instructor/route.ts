import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Payload, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../_utils/service-api-key'

// Resolves the instructor profile for a signed-in user. Tags shown to
// instructors are scoped to their owned/co-taught courses, so the endpoint
// needs the instructor id to derive that course set.
async function resolveInstructorId(payload: Payload, userId: string): Promise<string | null> {
  const result = await payload.find({
    collection: 'instructors',
    where: { user: { equals: userId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const doc = result.docs?.[0]
  return doc ? String(doc.id) : null
}

// GET /api/lms/tags/instructor?userId=&search=&page=&limit=
// Lists only the tags attached to the instructor's owned/co-taught courses,
// with per-tag course references and derived stats. The endpoint owns
// instructor context resolution, course scoping, tag derivation, filtering,
// and pagination; the frontend only supplies the signed-in userId
// (see docs/fetching-solution.md).
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const userId = (searchParams.get('userId') || '').trim()
    if (!userId) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 })
    }

    const instructorId = await resolveInstructorId(payload, userId)
    if (!instructorId) {
      return NextResponse.json({ error: 'Instructor profile not found' }, { status: 404 })
    }

    // Scoping boundary: only tags attached to the instructor's owned/co-taught
    // courses. Everything below is derived from that course set — nothing
    // global leaks in. depth=1 populates the tags relationship as objects (not
    // bare ids).
    const courseWhere: Where = {
      or: [
        { instructor: { equals: instructorId } },
        { coInstructors: { contains: instructorId } },
      ],
    }

    const courseRes = await payload.find({
      collection: 'courses',
      where: courseWhere,
      sort: 'title',
      limit: 500,
      depth: 1,
      overrideAccess: true,
    })
    const courseDocs = courseRes.docs || []

    const courses = courseDocs.map((course: any) => {
      const tags = Array.isArray(course.tags)
        ? course.tags.filter((t: any) => t != null)
        : []
      const tagIds = tags
        .map((t: any) => {
          if (typeof t === 'number' || typeof t === 'string') return Number(t)
          if (typeof t === 'object' && t.id != null) return Number(t.id)
          return null
        })
        .filter((id: number | null): id is number => id != null)
      return {
        id: Number(course.id),
        title: course.title || `Course #${course.id}`,
        courseCode: course.courseCode || '',
        status: course.status || 'draft',
        tagIds,
      }
    })

    const usedTagIds = Array.from(new Set(courses.flatMap((course) => course.tagIds)))

    let tagDocs: any[] = []
    if (usedTagIds.length > 0) {
      const tagRes = await payload.find({
        collection: 'course-tags',
        where: { id: { in: usedTagIds } },
        sort: 'name',
        limit: 200,
        depth: 0,
        overrideAccess: true,
      })
      tagDocs = tagRes.docs || []
    }

    const tagMeta = new Map<number, any>()
    for (const tag of tagDocs) {
      tagMeta.set(Number(tag.id), tag)
    }

    const tagMap = new Map<number, any>()
    for (const course of courses) {
      for (const tagId of course.tagIds) {
        let entry = tagMap.get(tagId)
        if (!entry) {
          const meta = tagMeta.get(tagId) || {}
          entry = {
            id: tagId,
            name: meta.name || `Tag #${tagId}`,
            slug: meta.slug,
            description: meta.description,
            colorCode: meta.colorCode,
            isActive: meta.isActive !== false,
            courseCount: 0,
            courses: [],
          }
          tagMap.set(tagId, entry)
        }
        entry.courses.push({
          id: course.id,
          title: course.title,
          courseCode: course.courseCode,
          status: course.status,
        })
        entry.courseCount += 1
      }
    }

    let allTags = Array.from(tagMap.values())
    allTags.sort((a, b) => b.courseCount - a.courseCount || a.name.localeCompare(b.name))

    const taggedCourses = courses.filter((course) => course.tagIds.length > 0).length
    const stats = {
      totalTags: allTags.length,
      totalCourses: courses.length,
      taggedCourses,
      untaggedCourses: courses.length - taggedCourses,
      coursesPerTag:
        allTags.length > 0
          ? Math.round((taggedCourses / allTags.length) * 10) / 10
          : 0,
    }

    const search = (searchParams.get('search') || '').trim().toLowerCase()
    if (search) {
      allTags = allTags.filter(
        (t) =>
          t.name.toLowerCase().includes(search) ||
          (t.slug || '').toLowerCase().includes(search),
      )
    }

    const limit = parseInt(searchParams.get('limit') || '12')
    const page = parseInt(searchParams.get('page') || '1')
    const totalDocs = allTags.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const start = (page - 1) * limit
    const docs = allTags.slice(start, start + limit)

    return NextResponse.json({ docs, totalDocs, totalPages, page, limit, stats })
  } catch (error) {
    console.error('[Tags] Error fetching instructor tags:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}