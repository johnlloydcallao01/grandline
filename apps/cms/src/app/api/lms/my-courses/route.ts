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

    const userId = searchParams.get('userId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200)

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 },
      )
    }

    const trainees = await payload.find({
      collection: 'trainees',
      where: {
        user: { equals: userId },
      },
      limit: 1,
      overrideAccess: true,
    })

    const trainee = Array.isArray(trainees.docs) ? trainees.docs[0] : null
    if (!trainee) {
      return NextResponse.json(
        { error: 'Trainee profile not found' },
        { status: 404 },
      )
    }

    const traineeId = String(trainee.id)

    const enrollments = await payload.find({
      collection: 'course-enrollments',
      where: {
        student: { equals: traineeId },
      },
      limit,
      depth: 4,
      sort: '-enrolledAt',
      overrideAccess: true,
    })

    const courseIds = Array.from(
      new Set(
        enrollments.docs
          .map((enrollment: any) => normalizeId(enrollment?.course))
          .filter(Boolean) as string[],
      ),
    )

    const coursesNeedingFinalExam = enrollments.docs
      .map((enrollment: any) => {
        const course = enrollment?.course && typeof enrollment.course === 'object'
          ? enrollment.course
          : null
        const courseId = normalizeId(course)
        return course && courseId && includesFinalExam(course.evaluationMode)
          ? courseId
          : null
      })
      .filter(Boolean) as string[]

    const [progressRes, assessmentSubmissionsRes, assignmentSubmissionsRes, finalExamsRes] =
      await Promise.all([
        courseIds.length > 0
          ? payload.find({
              collection: 'course-item-progress',
              where: {
                and: [
                  { trainee: { equals: traineeId } },
                  { course: { in: courseIds } },
                ],
              },
              limit: 1000,
              depth: 1,
              overrideAccess: true,
            })
          : Promise.resolve({ docs: [] as any[] }),
        courseIds.length > 0
          ? payload.find({
              collection: 'assessment-submissions',
              where: {
                and: [
                  { trainee: { equals: traineeId } },
                  { course: { in: courseIds } },
                ],
              },
              limit: 1000,
              depth: 1,
              overrideAccess: true,
            })
          : Promise.resolve({ docs: [] as any[] }),
        courseIds.length > 0
          ? payload.find({
              collection: 'assignment-submissions',
              where: {
                and: [
                  { trainee: { equals: traineeId } },
                  { enrollment: { in: enrollments.docs.map((doc: any) => doc.id) } },
                ],
              },
              limit: 1000,
              depth: 1,
              overrideAccess: true,
            })
          : Promise.resolve({ docs: [] as any[] }),
        coursesNeedingFinalExam.length > 0
          ? payload.find({
              collection: 'assessments',
              where: {
                and: [
                  { course: { in: coursesNeedingFinalExam } },
                  { assessmentType: { equals: 'final_exam' } },
                ],
              },
              limit: 200,
              depth: 0,
              overrideAccess: true,
            })
          : Promise.resolve({ docs: [] as any[] }),
      ])

    const progressByCourse = new Map<string, any[]>()
    for (const doc of progressRes.docs || []) {
      const courseId = normalizeId(doc?.course)
      if (!courseId) continue
      const existing = progressByCourse.get(courseId) || []
      existing.push(doc)
      progressByCourse.set(courseId, existing)
    }

    const assessmentSubmissionsByCourse = new Map<string, any[]>()
    for (const doc of assessmentSubmissionsRes.docs || []) {
      const courseId = normalizeId(doc?.course)
      if (!courseId) continue
      const existing = assessmentSubmissionsByCourse.get(courseId) || []
      existing.push(doc)
      assessmentSubmissionsByCourse.set(courseId, existing)
    }

    const assignmentSubmissionsByEnrollment = new Map<string, any[]>()
    for (const doc of assignmentSubmissionsRes.docs || []) {
      const enrollmentId = normalizeId(doc?.enrollment)
      if (!enrollmentId) continue
      const existing = assignmentSubmissionsByEnrollment.get(enrollmentId) || []
      existing.push(doc)
      assignmentSubmissionsByEnrollment.set(enrollmentId, existing)
    }

    const finalExamByCourse = new Map<string, any>()
    for (const doc of finalExamsRes.docs || []) {
      const courseId = normalizeId(doc?.course)
      if (courseId && !finalExamByCourse.has(courseId)) {
        finalExamByCourse.set(courseId, doc?.id)
      }
    }

    const docs = enrollments.docs.map((enrollment: any) => {
      const course =
        enrollment?.course && typeof enrollment.course === 'object'
          ? enrollment.course
          : null
      const courseId = normalizeId(course)
      const enrollmentId = normalizeId(enrollment?.id)

      const progressSummary = computeProgressSummary({
        course,
        finalExam: courseId ? finalExamByCourse.get(courseId) : null,
        storedProgressPercentage: enrollment?.progressPercentage,
        progressDocs: courseId ? progressByCourse.get(courseId) || [] : [],
        assessmentSubmissionDocs:
          courseId ? assessmentSubmissionsByCourse.get(courseId) || [] : [],
        assignmentSubmissionDocs:
          enrollmentId ? assignmentSubmissionsByEnrollment.get(enrollmentId) || [] : [],
      })

      return {
        ...enrollment,
        progressPercentage: progressSummary.progressPercentage,
        computedProgressPercentage: progressSummary.progressPercentage,
        completedItems: progressSummary.completedItems,
        totalItems: progressSummary.totalItems,
        progressSource: progressSummary.source,
      }
    })

    return NextResponse.json({
      docs,
      totalDocs: docs.length,
      limit,
    })
  } catch (error) {
    console.error('Error fetching LMS my courses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
