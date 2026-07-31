import type { Payload } from 'payload'

interface GradeResult {
  currentGrade: number | null
  finalGrade: number | null
  totalWeight: number
  weightedScore: number
}

/**
 * Recalculates the course grade for a given enrollment by querying all
 * graded assessments and assignments, weighting them by their `gradeWeight`,
 * and computing the weighted average.
 *
 * Called from afterChange hooks on AssessmentSubmissions and AssignmentSubmissions,
 * and from beforeChange on CourseEnrollments when status becomes 'completed'.
 */
export async function recalculateEnrollmentGrade(
  payload: Payload,
  enrollmentId: number | string,
): Promise<GradeResult> {
  // 1. Load enrollment with course
  const enrollment = await payload.findByID({
    collection: 'course-enrollments',
    id: enrollmentId,
    depth: 1,
  })

  if (!enrollment) {
    throw new Error(`Enrollment ${enrollmentId} not found`)
  }

  const courseId = typeof enrollment.course === 'object' ? enrollment.course.id : enrollment.course
  const traineeId = typeof enrollment.student === 'object' ? enrollment.student.id : enrollment.student

  // Load course
  const course = await payload.findByID({
    collection: 'courses',
    id: courseId,
    depth: 1,
  })

  if (!course) {
    throw new Error(`Course ${courseId} not found`)
  }

  const evaluationMode = course.evaluationMode || 'lessons_exam'

  const countsQuizzes = ['quizzes', 'lessons_quizzes', 'quizzes_exam', 'lessons_quizzes_exam'].includes(evaluationMode)
  const countsExam = ['exam', 'lessons_exam', 'quizzes_exam', 'lessons_quizzes_exam'].includes(evaluationMode)
  const countsAssignments = true

  let totalWeight = 0
  let weightedScore = 0

  // 2. Process ALL graded assessments (quizzes + exams) in this course
  const assessmentsResult = await payload.find({
    collection: 'assessments',
    where: {
      or: [
        // Quizzes and exams linked via module → course
        {
          and: [
            { assessmentType: { not_equals: 'final_exam' } },
          ],
        },
        // Final exams linked directly to course
        {
          and: [
            { assessmentType: { equals: 'final_exam' } },
            { course: { equals: courseId } },
          ],
        },
      ],
    },
    depth: 0,
    limit: 0,
  })

  // For non-final-exam assessments, we need to find them via course modules
  // Load course modules
  const modulesResult = await payload.find({
    collection: 'course-modules',
    where: {
      course: { equals: courseId },
    },
    depth: 0,
    limit: 0,
  })

  const moduleIds = modulesResult.docs.map((m: any) => m.id)

  // Get all assessments in these modules
  const moduleAssessments = assessmentsResult.docs.filter((a: any) => {
    if (a.assessmentType === 'final_exam') return true
    const aModuleId = typeof a.module === 'object' ? a.module?.id : a.module
    return aModuleId && moduleIds.includes(aModuleId)
  })

  for (const assessment of moduleAssessments) {
    const shouldCount =
      (assessment.assessmentType === 'quiz' && countsQuizzes) ||
      (assessment.assessmentType === 'exam' && countsQuizzes) ||
      (assessment.assessmentType === 'final_exam' && countsExam)

    if (!shouldCount) continue

    // Find the best (highest-scoring) submission for this trainee + assessment
    const submissions = await payload.find({
      collection: 'assessment-submissions',
      where: {
        and: [
          { trainee: { equals: traineeId } },
          { assessment: { equals: assessment.id } },
          { status: { equals: 'graded' } },
        ],
      },
      sort: '-score',
      depth: 0,
      limit: 1,
    })

    const bestSubmission = submissions.docs[0]
    if (bestSubmission && bestSubmission.score != null) {
      const weight = (assessment as any).gradeWeight ?? 1
      totalWeight += weight
      weightedScore += bestSubmission.score * weight
    }
  }

  // 3. Process ALL graded assignments in this course
  if (countsAssignments) {
    const assignmentSubmissions = await payload.find({
      collection: 'assignment-submissions',
      where: {
        and: [
          { enrollment: { equals: enrollmentId } },
          { status: { equals: 'graded' } },
        ],
      },
      depth: 1,
      limit: 0,
    })

    for (const sub of assignmentSubmissions.docs) {
      if (sub.score != null) {
        const assignmentId = typeof sub.assignment === 'object' ? sub.assignment.id : sub.assignment
        // Load the assignment to get its gradeWeight
        const assignment = await payload.findByID({
          collection: 'assignments',
          id: assignmentId,
          depth: 0,
        })
        if (assignment) {
          const weight = (assignment as any).gradeWeight ?? 1
          // Normalize score to percentage
          const maxScore = assignment.maxScore || 100
          const pct = (sub.score / maxScore) * 100
          totalWeight += weight
          weightedScore += pct * weight
        }
      }
    }
  }

  // 4. Compute final grade
  const finalGrade = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) / 100 : null
  const currentGrade = finalGrade

  return {
    currentGrade: currentGrade != null ? Math.round(currentGrade * 100) / 100 : null,
    finalGrade: finalGrade != null ? Math.round(finalGrade * 100) / 100 : null,
    totalWeight,
    weightedScore,
  }
}

/**
 * Determine pass/fail based on evaluation mode and grade.
 */
export function determineFinalEvaluation(
  grade: number | null,
  course: any,
): 'passed' | 'failed' | undefined {
  if (grade == null) return undefined

  const passingGrade = course.passingGrade ?? 70
  const evaluationMode = course.evaluationMode || 'lessons_exam'

  // For progress-based mode, passing is determined by completion %
  if (evaluationMode === 'lessons') {
    return undefined // handled separately by progress
  }

  return grade >= passingGrade ? 'passed' : 'failed'
}
