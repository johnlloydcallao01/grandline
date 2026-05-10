import type { PayloadHandler } from 'payload'
import type { Assessment, Question, SubmissionAnswer } from '../payload-types'

export const submitAssessmentHandler: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await (req.json ? req.json() : req.body)
    const { submissionId, answers } = body as { submissionId: number | string, answers: Record<string, unknown> }

    if (!submissionId) {
      return Response.json({ error: 'Missing submissionId' }, { status: 400 })
    }

   // Ensure submissionId is a number if possible (for SQL relations)
    const submissionIdVal = typeof submissionId === 'string' ? parseInt(submissionId, 10) : submissionId

    // 1. Fetch Submission (with depth 0 first)
    const submission = await payload.findByID({
      collection: 'assessment-submissions',
      id: submissionIdVal,
      depth: 0,
    })

    if (!submission) {
      return Response.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (submission.status !== 'in_progress') {
       return Response.json({ 
         message: 'Already submitted',
         score: submission.score,
         passed: (submission.score || 0) >= (submission.passingScoreSnapshot || 70) 
       })
    }

    // 2. Fetch Assessment (depth 2 for questions/options)
    const assessmentId = typeof submission.assessment === 'object' ? submission.assessment.id : submission.assessment
    const assessment = await payload.findByID({
      collection: 'assessments',
      id: assessmentId,
      depth: 2,
    })

    if (!assessment) {
      return Response.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // 3. Fetch Existing Answers (to handle retries/updates)
    const existingAnswers = await payload.find({
      collection: 'submission-answers',
      where: {
        submission: {
          equals: submissionIdVal,
        },
      },
      limit: 1000,
      depth: 0,
    })

    const existingAnswersMap = new Map()
    for (const ans of existingAnswers.docs) {
      const qId = typeof ans.question === 'object' ? ans.question.id : ans.question
      existingAnswersMap.set(qId, ans.id)
    }

    // 4. Grade Answers
    let totalPointsEarned = 0
    let totalPointsPossible = 0
    const operations = []

    // Ensure answers object exists
    const userAnswers = answers || {}

    // Iterate over assessment items (questions)
    const typedAssessment = assessment as unknown as Assessment

    for (const item of typedAssessment.items || []) {
      const question = item.question as Question
      const possiblePoints = item.points || 1
      totalPointsPossible += possiblePoints

      const userResponse = userAnswers[question.id]
      let isCorrect = false
      let pointsEarned = 0

      if (userResponse !== undefined) {
        if (question.type === 'single_choice' || question.type === 'true_false') {
          const correctOption = question.options?.find((opt) => opt.isCorrect)
          if (correctOption && correctOption.id === userResponse) {
            isCorrect = true
            pointsEarned = possiblePoints
          }
        } else if (question.type === 'multiple_choice') {
          const correctOptionIds = question.options?.filter((opt) => opt.isCorrect).map((opt) => opt.id) || []
          const userResponseIds = Array.isArray(userResponse) ? userResponse : [userResponse]
          
          const isMatch = correctOptionIds.length === userResponseIds.length && 
                          correctOptionIds.every((id: string | null | undefined) => id && userResponseIds.includes(id))
          
          if (isMatch) {
            isCorrect = true
            pointsEarned = possiblePoints
          }
        }
      }

      totalPointsEarned += pointsEarned

      // Prepare upsert operation
      const existingId = existingAnswersMap.get(question.id)
      const data: Omit<SubmissionAnswer, 'id' | 'createdAt' | 'updatedAt'> = {
        submission: submissionIdVal as number,
        question: question.id,
        questionType: question.type,
        response: { value: userResponse ?? null },
        isCorrect,
        pointsEarned,
      }

      if (existingId) {
        operations.push(
          payload.update({
            collection: 'submission-answers',
            id: existingId,
            data,
          })
        )
      } else {
        operations.push(
          payload.create({
            collection: 'submission-answers',
            data,
          })
        )
      }
    }

    // 5. Execute Answer Upserts in Parallel
    await Promise.all(operations)

    // 6. Calculate Final Score
    const finalScore = totalPointsPossible > 0 ? (totalPointsEarned / totalPointsPossible) * 100 : 0
    const passed = finalScore >= (submission.passingScoreSnapshot || 70)

    // 7. Update Submission Status
    await payload.update({
      collection: 'assessment-submissions',
      id: submissionId,
      data: {
        status: 'submitted',
        score: finalScore,
        pointsTotal: totalPointsEarned,
        pointsPossible: totalPointsPossible,
        completedAt: new Date().toISOString(),
      },
    })

    // 8. Update Course Item Progress
    // Check if progress exists
    const traineeId = typeof submission.trainee === 'object' ? submission.trainee.id : submission.trainee
    const courseId = typeof submission.course === 'object' ? submission.course.id : submission.course
    const enrollmentId = typeof submission.enrollment === 'object' ? submission.enrollment.id : submission.enrollment

    const existingProgress = await payload.find({
      collection: 'course-item-progress',
      where: {
        trainee: { equals: traineeId },
        course: { equals: courseId },
        'item.value': { equals: assessmentId },
      },
      limit: 1,
    })

    if (existingProgress.docs.length > 0) {
      const progress = existingProgress.docs[0]
      await payload.update({
        collection: 'course-item-progress',
        id: progress.id,
        data: {
          status: passed ? 'passed' : 'failed',
          isCompleted: true,
          completedAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString(),
          attempts: (progress.attempts || 0) + 1,
          enrollment: enrollmentId,
        },
      })
    } else {
      await payload.create({
        collection: 'course-item-progress',
        data: {
          trainee: traineeId,
          course: courseId,
          enrollment: enrollmentId,
          item: { relationTo: 'assessments', value: assessmentId },
          status: passed ? 'passed' : 'failed',
          isCompleted: true,
          completedAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString(),
          attempts: 1,
        },
      })
    }

    return Response.json({
      success: true,
      score: finalScore,
      passed,
      pointsEarned: totalPointsEarned,
      pointsPossible: totalPointsPossible
    })

  } catch (error) {
    console.error('Submit Assessment Endpoint Error:', error)
    return Response.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
