import type { Payload } from 'payload'

export type FlatItem = {
  id: string
  type: 'lesson' | 'assessment' | 'assignment' | 'finalExam'
}

export type ProgressResult = {
  progressPercentage: number
  completedItems: number
  totalItems: number
  source: 'derived' | 'stored'
}

export function normalizeId(value: unknown): string | null {
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

export function includesFinalExam(evaluationMode: unknown): boolean {
  return [
    'exam',
    'lessons_exam',
    'quizzes_exam',
    'lessons_quizzes_exam',
  ].includes(String(evaluationMode || ''))
}

export function extractFlatItems(course: any, finalExam: any): FlatItem[] {
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

export function computeProgressSummary(args: {
  course: any
  finalExam?: any
  storedProgressPercentage?: unknown
  progressDocs: any[]
  assessmentSubmissionDocs: any[]
  assignmentSubmissionDocs: any[]
}): ProgressResult {
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

  // Default fallback: count all trackable completed items
  const totalItems = flatItems.length
  let completedItems = 0

  for (const item of flatItems) {
    if (item.type === 'lesson' && completedLessonIds.has(item.id)) {
      completedItems += 1
    } else if (
      (item.type === 'assessment' || item.type === 'finalExam') &&
      assessmentSubmissionIds.has(item.id)
    ) {
      completedItems += 1
    } else if (item.type === 'assignment' && submittedAssignmentIds.has(item.id)) {
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

export async function recalculateEnrollmentProgress(
  payload: Payload,
  enrollmentId: number | string,
): Promise<ProgressResult> {
  const enrollment = await payload.findByID({
    collection: 'course-enrollments',
    id: enrollmentId,
    depth: 1,
    overrideAccess: true,
  })

  if (!enrollment) {
    throw new Error(`Enrollment ${enrollmentId} not found`)
  }

  const courseId = normalizeId(enrollment.course)
  const traineeId = normalizeId(enrollment.student)

  if (!courseId || !traineeId) {
    return {
      progressPercentage: (enrollment.progressPercentage as number) || 0,
      completedItems: 0,
      totalItems: 0,
      source: 'stored',
    }
  }

  const course = await payload.findByID({
    collection: 'courses',
    id: courseId,
    depth: 2,
    overrideAccess: true,
  })

  let finalExam = null
  const courseAny = course as any
  if (courseAny && includesFinalExam(courseAny.evaluationMode) && courseAny.finalExam) {
    const finalExamId = normalizeId(courseAny.finalExam)
    if (finalExamId) {
      try {
        finalExam = await payload.findByID({
          collection: 'assessments',
          id: finalExamId,
          depth: 0,
          overrideAccess: true,
        })
      } catch (_err) {
        finalExam = null
      }
    }
  }

  const [progressRes, assessmentSubmissionsRes, assignmentSubmissionsRes] = await Promise.all([
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
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'assignment-submissions',
      where: {
        trainee: { equals: traineeId },
      },
      limit: 1000,
      depth: 0,
      overrideAccess: true,
    }),
  ])

  const summary = computeProgressSummary({
    course,
    finalExam,
    storedProgressPercentage: enrollment.progressPercentage,
    progressDocs: progressRes.docs || [],
    assessmentSubmissionDocs: assessmentSubmissionsRes.docs || [],
    assignmentSubmissionDocs: assignmentSubmissionsRes.docs || [],
  })

  if (summary.source === 'derived' && summary.progressPercentage !== enrollment.progressPercentage) {
    await payload.update({
      collection: 'course-enrollments',
      id: enrollmentId,
      data: {
        progressPercentage: summary.progressPercentage,
      },
      overrideAccess: true,
    })
  }

  return summary
}
