import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import {
  computeProgressSummary,
  includesFinalExam,
  normalizeId,
} from '@/utils/progressCalculation'

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
        and: [
          { student: { equals: traineeId } },
          { isArchived: { not_equals: true } },
          { 'course.status': { not_equals: 'archived' } },
        ],
      } as any,
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

      if (
        progressSummary.source === 'derived' &&
        enrollmentId &&
        progressSummary.progressPercentage !== enrollment?.progressPercentage
      ) {
        void payload.update({
          collection: 'course-enrollments',
          id: enrollmentId,
          data: { progressPercentage: progressSummary.progressPercentage },
          overrideAccess: true,
        })
      }

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
