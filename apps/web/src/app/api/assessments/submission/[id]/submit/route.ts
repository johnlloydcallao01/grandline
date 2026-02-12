import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: submissionIdRaw } = await context.params
    const body = await request.json()
    let { answers } = body // Expecting { questionId: string | string[] }

    // Ensure ID is number if it looks like one
    const submissionId = (typeof submissionIdRaw === 'string' && !isNaN(Number(submissionIdRaw)) && Number.isInteger(Number(submissionIdRaw)))
      ? Number(submissionIdRaw)
      : submissionIdRaw;

    const apiKey = process.env.PAYLOAD_API_KEY
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api'

    if (!apiKey) {
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `users API-Key ${apiKey}`,
    }

    // 1. Parallelize initial data fetching: Submission, Assessment (depth 2), and Existing Answers
    const [submissionRes, existingAnswersRes] = await Promise.all([
      fetch(`${apiUrl}/assessment-submissions/${submissionId}?depth=1`, { headers, cache: 'no-store' }),
      fetch(`${apiUrl}/submission-answers?where[submission][equals]=${submissionId}&limit=1000`, { headers, cache: 'no-store' })
    ])

    if (!submissionRes.ok) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }
    const submission = await submissionRes.json()

    if (submission.status !== 'in_progress') {
      return NextResponse.json({ error: 'Submission already submitted' }, { status: 400 })
    }

    const assessmentId = typeof submission.assessment === 'object' ? submission.assessment.id : submission.assessment
    const traineeId = typeof submission.trainee === 'object' ? submission.trainee.id : submission.trainee
    const courseId = typeof submission.course === 'object' ? submission.course.id : submission.course
    const enrollmentId = typeof submission.enrollment === 'object' ? submission.enrollment.id : submission.enrollment

    const [assessmentRes, existingAnswersData] = await Promise.all([
      fetch(`${apiUrl}/assessments/${assessmentId}?depth=2`, { headers, cache: 'no-store' }),
      existingAnswersRes.json()
    ])

    if (!assessmentRes.ok) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }
    const assessment = await assessmentRes.json()

    // 1.5. Prepare answers from body or existing
    if (!answers) {
      answers = {}
      for (const a of existingAnswersData.docs || []) {
        const qId = typeof a.question === 'object' ? a.question.id : a.question
        answers[qId] = a.response
      }
    }

    const existingAnswersMap = new Map()
    for (const a of existingAnswersData.docs || []) {
      const qId = typeof a.question === 'object' ? a.question.id : a.question
      existingAnswersMap.set(qId, a.id)
    }

    let totalPointsEarned = 0
    let totalPointsPossible = 0
    const submissionAnswersToUpsert: any[] = []

    // 3. Grade each question
    for (const item of assessment.items || []) {
      const question = item.question
      const possiblePoints = item.points || 1
      totalPointsPossible += possiblePoints

      const userResponse = answers[question.id]
      let isCorrect = false
      let pointsEarned = 0

      if (userResponse !== undefined) {
        if (question.type === 'single_choice' || question.type === 'true_false') {
          const correctOption = question.options?.find((opt: any) => opt.isCorrect)
          if (correctOption && correctOption.id === userResponse) {
            isCorrect = true
            pointsEarned = possiblePoints
          }
        } else if (question.type === 'multiple_choice') {
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

      submissionAnswersToUpsert.push({
        id: existingAnswersMap.get(question.id),
        data: {
          submission: submissionId,
          question: question.id,
          questionType: question.type,
          response: { value: userResponse ?? null },
          isCorrect,
          pointsEarned,
        }
      })
    }

    const finalScore = totalPointsPossible > 0 ? (totalPointsEarned / totalPointsPossible) * 100 : 0
    const passed = finalScore >= (submission.passingScoreSnapshot || 70)

    // 4 & 5. Parallelize Upsert SubmissionAnswers and Progress Lookup
    const progressParams = new URLSearchParams()
    progressParams.set('where[trainee][equals]', traineeId)
    progressParams.set('where[course][equals]', String(courseId))
    progressParams.set('where[item.value][equals]', String(assessmentId))

    const [, progressLookupRes] = await Promise.all([
      Promise.all(submissionAnswersToUpsert.map(item => {
        if (item.id) {
          return fetch(`${apiUrl}/submission-answers/${item.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(item.data)
          })
        } else {
          return fetch(`${apiUrl}/submission-answers`, {
            method: 'POST',
            headers,
            body: JSON.stringify(item.data)
          })
        }
      })),
      fetch(`${apiUrl}/course-item-progress?${progressParams.toString()}`, { headers, cache: 'no-store' })
    ])

    // 6. Update Submission and Progress in parallel
    const submissionUpdatePromise = fetch(`${apiUrl}/assessment-submissions/${submissionId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        status: 'submitted',
        score: finalScore,
        pointsTotal: totalPointsEarned,
        pointsPossible: totalPointsPossible,
        completedAt: new Date().toISOString(),
      })
    })

    const progressLookupData = await progressLookupRes.json()
    const existingProgress = progressLookupData.docs?.[0]
    
    const progressUpdatePromise = existingProgress 
      ? fetch(`${apiUrl}/course-item-progress/${existingProgress.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            status: passed ? 'passed' : 'failed',
            isCompleted: true,
            completedAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
            attempts: (existingProgress.attempts || 0) + 1,
            enrollment: enrollmentId,
          })
        })
      : fetch(`${apiUrl}/course-item-progress`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            trainee: traineeId,
            course: courseId,
            enrollment: enrollmentId,
            item: { relationTo: 'assessments', value: assessmentId },
            status: passed ? 'passed' : 'failed',
            isCompleted: true,
            completedAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
            attempts: 1,
          })
        })

    const [finalSubmissionRes] = await Promise.all([
      submissionUpdatePromise,
      progressUpdatePromise
    ])

    if (!finalSubmissionRes.ok) {
      const errorText = await finalSubmissionRes.text();
      return NextResponse.json({ 
        error: 'Failed to update submission record',
        details: errorText,
      }, { status: finalSubmissionRes.status })
    }

    return NextResponse.json({
      score: finalScore,
      passed,
      pointsEarned: totalPointsEarned,
      pointsPossible: totalPointsPossible
    })

  } catch (error) {
    console.error('Assessment submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
