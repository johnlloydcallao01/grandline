import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Payload, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../_utils/service-api-key'

// Resolves the instructor profile for a signed-in user. Categories shown to
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

// GET /api/lms/course-categories/instructor?userId=&search=&categoryType=&page=&limit=
// Lists only the categories attached to the instructor's owned/co-taught
// courses, with per-category course references and derived stats. The
// endpoint owns instructor context resolution, course scoping, category
// derivation, filtering, and pagination; the frontend only supplies the
// signed-in userId (see docs/fetching-solution.md).
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

    // Scoping boundary: only categories attached to the instructor's
    // owned/co-taught courses. Everything below is derived from that course
    // set — nothing global leaks in. depth=1 populates the category
    // relationship as objects (not bare ids).
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
      const cats = Array.isArray(course.category)
        ? course.category.filter((c: any) => c != null)
        : []
      const categoryIds = cats
        .map((c: any) => {
          if (typeof c === 'number' || typeof c === 'string') return Number(c)
          if (typeof c === 'object' && c.id != null) return Number(c.id)
          return null
        })
        .filter((id: number | null): id is number => id != null)
      return {
        id: Number(course.id),
        title: course.title || `Course #${course.id}`,
        courseCode: course.courseCode || '',
        status: course.status || 'draft',
        categoryIds,
      }
    })

    const usedCategoryIds = Array.from(new Set(courses.flatMap((course) => course.categoryIds)))

    let categoryDocs: any[] = []
    if (usedCategoryIds.length > 0) {
      const categoryRes = await payload.find({
        collection: 'course-categories',
        where: { id: { in: usedCategoryIds } },
        sort: 'name',
        limit: 200,
        depth: 0,
        overrideAccess: true,
      })
      categoryDocs = categoryRes.docs || []
    }

    const categoryMeta = new Map<number, any>()
    for (const category of categoryDocs) {
      categoryMeta.set(Number(category.id), category)
    }

    const categoryMap = new Map<number, any>()
    for (const course of courses) {
      for (const categoryId of course.categoryIds) {
        let entry = categoryMap.get(categoryId)
        if (!entry) {
          const meta = categoryMeta.get(categoryId) || {}
          entry = {
            id: categoryId,
            name: meta.name || `Category #${categoryId}`,
            slug: meta.slug,
            categoryType: meta.categoryType || 'course',
            colorCode: meta.colorCode,
            isActive: meta.isActive !== false,
            courseCount: 0,
            courses: [],
          }
          categoryMap.set(categoryId, entry)
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

    let allCategories = Array.from(categoryMap.values())
    allCategories.sort((a, b) => b.courseCount - a.courseCount || a.name.localeCompare(b.name))

    const categorizedCourses = courses.filter((course) => course.categoryIds.length > 0).length
    const stats = {
      totalCategories: allCategories.length,
      totalCourses: courses.length,
      categorizedCourses,
      uncategorizedCourses: courses.length - categorizedCourses,
      coursesPerCategory:
        allCategories.length > 0
          ? Math.round((categorizedCourses / allCategories.length) * 10) / 10
          : 0,
    }

    const search = (searchParams.get('search') || '').trim().toLowerCase()
    if (search) {
      allCategories = allCategories.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          (c.slug || '').toLowerCase().includes(search),
      )
    }

    const categoryType = searchParams.get('categoryType')
    if (categoryType) {
      allCategories = allCategories.filter((c) => c.categoryType === categoryType)
    }

    const limit = parseInt(searchParams.get('limit') || '12')
    const page = parseInt(searchParams.get('page') || '1')
    const totalDocs = allCategories.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const start = (page - 1) * limit
    const docs = allCategories.slice(start, start + limit)

    return NextResponse.json({ docs, totalDocs, totalPages, page, limit, stats })
  } catch (error) {
    console.error('[CourseCategories] Error fetching instructor categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}