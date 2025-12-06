import type { Payload } from 'payload'

export async function getActiveAssignedCategories(payload: Payload) {
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
    return { count: 0, categories: [] }
  }

  const categoriesResult = await payload.find({
    collection: 'course-categories',
    where: { id: { in: ids }, isActive: { equals: true } },
    limit: ids.length,
    depth: 2,
  })

  return { count: categoriesResult.totalDocs, categories: categoriesResult.docs }
}

