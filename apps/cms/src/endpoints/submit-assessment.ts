import type { PayloadHandler } from 'payload'

export const submitAssessmentHandler: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await (req.json ? req.json() : req.body)
    const { submissionId, answers } = body as { submissionId: number | string, answers: Record<string, any> }

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
    // @ts-ignore
    for (const item of assessment.items || []) {
      const question = item.question
      // @ts-ignore
      const possiblePoints = item.points || 1
      totalPointsPossible += possiblePoints

      // @ts-ignore
      const userResponse = userAnswers[question.id]
      let isCorrect = false
      let pointsEarned = 0

      if (userResponse !== undefined) {
        // @ts-ignore
        if (question.type === 'single_choice' || question.type === 'true_false') {
          // @ts-ignore
          const correctOption = question.options?.find((opt: any) => opt.isCorrect)
          // @ts-ignore
          if (correctOption && correctOption.id === userResponse) {
            isCorrect = true
            pointsEarned = possiblePoints
          }
        // @ts-ignore
        } else if (question.type === 'multiple_choice') {
          // @ts-ignore
          const correctOptionIds = question.options?.filter((opt: any) => opt.isCorrect).map((opt: any) => opt.id) || []
          const userResponseIds = Array.isArray(userResponse) ? userResponse : [userResponse]
          
          const isMatch = correctOptionIds.length === userResponseIds.length && 
                          correctOptionIds.every((id: string) => userResponseIds.includes(id))
          
          if (isMatch) {
            isCorrect = true
            pointsEarned = possiblePoints
          }
        }
      }

      totalPointsEarned += pointsEarned

      // Prepare upsert operation
      // @ts-ignore
      const existingId = existingAnswersMap.get(question.id)
      const data = {
        submission: submissionIdVal,
        // @ts-ignore
        question: question.id,
        // @ts-ignore
        questionType: question.type,
        response: { value: userResponse ?? null },
        isCorrect,
        pointsEarned,
      } as any

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

  } catch (error: any) {
    console.error('Submit Assessment Endpoint Error:', error)
    return Response.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}
