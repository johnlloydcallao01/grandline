import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

type FlatItem = {
  id: string
  type: 'lesson' | 'assessment' | 'assignment' | 'finalExam'
}

function normalizeId(value: unknown): string | null {
  if (value === null || value === undefined) return null

  if (typeof value === 'object') {
    if (value && 'id' in value && (value as { id?: unknown }).id != null) {
      return String((value as { id: string | number }).id)
    }

    if (value && 'value' in value) {
      return normalizeId((value as { value?: unknown }).value)
    }

    return null
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  return null
}

function includesFinalExam(evaluationMode: unknown): boolean {
  return [
    'exam',
    'lessons_exam',
    'quizzes_exam',
    'lessons_quizzes_exam',
  ].includes(String(evaluationMode || ''))
}

function extractFlatItems(course: any, finalExam: any): FlatItem[] {
  const items: FlatItem[] = []
  const modules = Array.isArray(course?.modules) ? course.modules : []

  for (const module of modules) {
    const moduleItems = Array.isArray(module?.items) ? module.items : []

    for (const item of moduleItems) {
      const itemId = normalizeId(item?.value)
      if (!itemId || typeof item?.relationTo !== 'string') continue

      if (item.relationTo === 'course-lessons') {
        items.push({ id: itemId, type: 'lesson' })
      } else if (item.relationTo === 'assessments') {
        items.push({ id: itemId, type: 'assessment' })
      } else if (item.relationTo === 'assignments') {
        items.push({ id: itemId, type: 'assignment' })
      }
    }
  }

  if (finalExam) {
    const finalExamId = normalizeId(finalExam)
    if (finalExamId) {
      items.push({ id: finalExamId, type: 'finalExam' })
    }
  }

  return items
}

function computeProgressSummary(args: {
  course: any
  finalExam: any
  storedProgressPercentage: unknown
  progressDocs: any[]
  assessmentSubmissionDocs: any[]
  assignmentSubmissionDocs: any[]
}) {
  const {
    course,
    finalExam,
    storedProgressPercentage,
    progressDocs,
    assessmentSubmissionDocs,
    assignmentSubmissionDocs,
  } = args

  const flatItems = extractFlatItems(course, finalExam)
  const evaluationMode = String(course?.evaluationMode || '')

  const completedLessonIds = new Set<string>()
  for (const doc of progressDocs) {
    const itemId = normalizeId(doc?.item)
    if (!itemId) continue

    const relationTo =
      doc?.item && typeof doc.item === 'object' && 'relationTo' in doc.item
        ? String((doc.item as { relationTo?: string }).relationTo || '')
        : ''

    const isCompleted =
      doc?.isCompleted === true ||
      doc?.status === 'completed' ||
      doc?.status === 'passed'

    if (relationTo === 'course-lessons' && isCompleted) {
      completedLessonIds.add(itemId)
    }
  }

  const assessmentSubmissionIds = new Set<string>()
  for (const doc of assessmentSubmissionDocs) {
    const assessmentId = normalizeId(doc?.assessment)
    if (assessmentId) {
      assessmentSubmissionIds.add(assessmentId)
    }
  }

  const submittedAssignmentIds = new Set<string>()
  for (const doc of assignmentSubmissionDocs) {
    const assignmentId = normalizeId(doc?.assignment)
    if (!assignmentId) continue

    if (doc?.status && String(doc.status) !== 'draft') {
      submittedAssignmentIds.add(assignmentId)
    }
  }

  const stored =
    typeof storedProgressPercentage === 'number' && !Number.isNaN(storedProgressPercentage)
      ? storedProgressPercentage
      : 0

  if (!course || flatItems.length === 0) {
    return {
      progressPercentage: stored,
      completedItems: 0,
      totalItems: 0,
      source: 'stored',
    }
  }

  if (evaluationMode === 'lessons' || evaluationMode === 'lessons_exam') {
    const lessonItems = flatItems.filter((item) => item.type === 'lesson')
    let totalItems = lessonItems.length
    let completedItems = lessonItems.filter((item) => completedLessonIds.has(item.id)).length

    if (evaluationMode === 'lessons_exam' && finalExam) {
      const finalExamId = normalizeId(finalExam)
      if (finalExamId) {
        totalItems += 1
        if (assessmentSubmissionIds.has(finalExamId)) {
          completedItems += 1
        }
      }
    }

    return {
      progressPercentage:
        totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : stored,
      completedItems,
      totalItems,
      source: 'derived',
    }
  }

  if (evaluationMode === 'exam') {
    const trackedItems = flatItems.filter((item) => item.type === 'finalExam')
    const totalItems = trackedItems.length
    let completedItems = 0

    for (const item of trackedItems) {
      if (assessmentSubmissionIds.has(item.id)) {
        completedItems += 1
      }
    }

    return {
      progressPercentage:
        totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : stored,
      completedItems,
      totalItems,
      source: 'derived',
    }
  }

  if (evaluationMode === 'quizzes') {
    const trackedItems = flatItems.filter((item) => item.type === 'assessment')
    const totalItems = trackedItems.length
    let completedItems = 0

    for (const item of trackedItems) {
      if (assessmentSubmissionIds.has(item.id)) {
        completedItems += 1
      }
    }

    return {
      progressPercentage:
        totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : stored,
      completedItems,
      totalItems,
      source: 'derived',
    }
  }

  if (evaluationMode === 'lessons_quizzes') {
    const trackedItems = flatItems.filter(
      (item) => item.type === 'lesson' || item.type === 'assessment',
    )
    const totalItems = trackedItems.length
    let completedItems = 0

    for (const item of trackedItems) {
      if (item.type === 'lesson' && completedLessonIds.has(item.id)) {
        completedItems += 1
      } else if (item.type === 'assessment' && assessmentSubmissionIds.has(item.id)) {
        completedItems += 1
      }
    }

    return {
      progressPercentage:
        totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : stored,
      completedItems,
      totalItems,
      source: 'derived',
    }
  }

  if (evaluationMode === 'quizzes_exam') {
    const trackedItems = flatItems.filter(
      (item) => item.type === 'assessment' || item.type === 'finalExam',
    )
    const totalItems = trackedItems.length
    let completedItems = 0

    for (const item of trackedItems) {
      if (assessmentSubmissionIds.has(item.id)) {
        completedItems += 1
      }
    }

    return {
      progressPercentage:
        totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : stored,
      completedItems,
      totalItems,
      source: 'derived',
    }
  }

  if (evaluationMode === 'lessons_quizzes_exam') {
    const trackedItems = flatItems.filter(
      (item) =>
        item.type === 'lesson' || item.type === 'assessment' || item.type === 'finalExam',
    )
    const totalItems = trackedItems.length
    let completedItems = 0

    for (const item of trackedItems) {
      if (item.type === 'lesson' && completedLessonIds.has(item.id)) {
        completedItems += 1
      } else if (
        (item.type === 'assessment' || item.type === 'finalExam') &&
        assessmentSubmissionIds.has(item.id)
      ) {
        completedItems += 1
      }
    }

    return {
      progressPercentage:
        totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : stored,
      completedItems,
      totalItems,
      source: 'derived',
    }
  }

  return {
    progressPercentage: stored,
    completedItems: 0,
    totalItems: flatItems.length,
    source: 'stored',
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    const enrollmentId = searchParams.get('enrollmentId')

    if (!enrollmentId) {
      return NextResponse.json({ error: 'enrollmentId is required' }, { status: 400 })
    }

    const enrollment = await payload.findByID({
      collection: 'course-enrollments',
      id: enrollmentId,
      depth: 4,
      overrideAccess: true,
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    const course = (enrollment as any).course
    if (!course || typeof course !== 'object') {
      return NextResponse.json({ error: 'Course not found on enrollment' }, { status: 400 })
    }

    const courseId = normalizeId(course)
    const traineeId = normalizeId((enrollment as any).student)

    if (!courseId || !traineeId) {
      return NextResponse.json({ progressPercentage: 0, completedItems: 0, totalItems: 0 })
    }

    const needsFinalExam = includesFinalExam(course.evaluationMode)

    const [progressRes, assessmentSubmissionsRes, assignmentSubmissionsRes, finalExamsRes] =
      await Promise.all([
        payload.find({
          collection: 'course-item-progress',
          where: {
            and: [
              { trainee: { equals: traineeId } },
              { course: { equals: courseId } },
            ],
          },
          limit: 1000,
          depth: 1,
          overrideAccess: true,
        }),
        payload.find({
          collection: 'assessment-submissions',
          where: {
            and: [
              { trainee: { equals: traineeId } },
              { course: { equals: courseId } },
            ],
          },
          limit: 1000,
          depth: 1,
          overrideAccess: true,
        }),
        payload.find({
          collection: 'assignment-submissions',
          where: {
            and: [
              { enrollment: { equals: enrollmentId } },
            ],
          },
          limit: 1000,
          depth: 1,
          overrideAccess: true,
        }),
        needsFinalExam
          ? payload.find({
              collection: 'assessments',
              where: {
                and: [
                  { course: { equals: courseId } },
                  { assessmentType: { equals: 'final_exam' } },
                ],
              },
              limit: 1,
              depth: 0,
              overrideAccess: true,
            })
          : Promise.resolve({ docs: [] as any[] }),
      ])

    const finalExam = finalExamsRes.docs[0] || null

    const progressSummary = computeProgressSummary({
      course,
      finalExam: finalExam?.id || null,
      storedProgressPercentage: (enrollment as any).progressPercentage,
      progressDocs: progressRes.docs || [],
      assessmentSubmissionDocs: assessmentSubmissionsRes.docs || [],
      assignmentSubmissionDocs: assignmentSubmissionsRes.docs || [],
    })

    return NextResponse.json({
      progressPercentage: progressSummary.progressPercentage,
      completedItems: progressSummary.completedItems,
      totalItems: progressSummary.totalItems,
    })
  } catch (error) {
    console.error('Error computing enrollment progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
