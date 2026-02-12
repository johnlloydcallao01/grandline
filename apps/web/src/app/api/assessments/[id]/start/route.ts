import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentIdRaw } = await context.params
    const { userId, courseId: courseIdRaw } = await request.json()

    // Ensure IDs are numbers if they look like numbers, as Payload relationship validation 
    // can be strict about types (especially with Postgres)
    const assessmentId = (typeof assessmentIdRaw === 'string' && !isNaN(Number(assessmentIdRaw)) && Number.isInteger(Number(assessmentIdRaw)))
      ? Number(assessmentIdRaw)
      : assessmentIdRaw;

    const courseId = (typeof courseIdRaw === 'string' && !isNaN(Number(courseIdRaw)) && Number.isInteger(Number(courseIdRaw)))
      ? Number(courseIdRaw)
      : courseIdRaw;

    if (!assessmentId || !userId || !courseId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, courseId' },
        { status: 400 }
      )
    }

    const apiKey = process.env.PAYLOAD_API_KEY
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api'

    if (!apiKey) {
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `users API-Key ${apiKey}`,
    }

    // 1. Parallelize lookup for Trainee and Assessment
    const [traineeRes, assessmentRes] = await Promise.all([
      fetch(`${apiUrl}/trainees?where[user][equals]=${userId}`, { headers, cache: 'no-store' }),
      fetch(`${apiUrl}/assessments/${assessmentId}`, { headers, cache: 'no-store' })
    ])

    if (!traineeRes.ok) {
      return NextResponse.json({ error: 'Failed to find trainee' }, { status: traineeRes.status })
    }
    if (!assessmentRes.ok) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    const [traineeData, assessment] = await Promise.all([
      traineeRes.json(),
      assessmentRes.json()
    ])

    const trainee = traineeData.docs?.[0]
    if (!trainee) {
      return NextResponse.json({ error: 'Trainee profile not found' }, { status: 404 })
    }

    const traineeId = trainee.id

    // 2. Parallelize lookup for Enrollment and existing Submissions
    const enrollmentParams = new URLSearchParams()
    enrollmentParams.set('where[student][equals]', traineeId)
    enrollmentParams.set('where[course][equals]', String(courseId))
    enrollmentParams.set('where[status][equals]', 'active')

    const submissionParams = new URLSearchParams()
    submissionParams.set('where[trainee][equals]', traineeId)
    submissionParams.set('where[assessment][equals]', String(assessmentId))
    submissionParams.set('sort', '-attemptNumber')

    const [enrollmentRes, submissionsRes] = await Promise.all([
      fetch(`${apiUrl}/course-enrollments?${enrollmentParams.toString()}`, { headers, cache: 'no-store' }),
      fetch(`${apiUrl}/assessment-submissions?${submissionParams.toString()}`, { headers, cache: 'no-store' })
    ])

    if (!enrollmentRes.ok) {
      return NextResponse.json({ error: 'Failed to find enrollment' }, { status: enrollmentRes.status })
    }
    if (!submissionsRes.ok) {
      return NextResponse.json({ error: 'Failed to find submissions' }, { status: submissionsRes.status })
    }

    const [enrollmentData, submissionsData] = await Promise.all([
      enrollmentRes.json(),
      submissionsRes.json()
    ])

    const enrollment = enrollmentData.docs?.[0]
    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    const previousSubmissions = submissionsData.docs || []
    
    // Check if there's an active (in_progress) submission
    const activeSubmission = previousSubmissions.find((s: any) => s.status === 'in_progress')
    
    if (activeSubmission) {
      return NextResponse.json({
        submissionId: activeSubmission.id,
        attemptNumber: activeSubmission.attemptNumber,
        isResumed: true
      })
    }

    const latestAttempt = previousSubmissions[0]
    const nextAttemptNumber = (latestAttempt?.attemptNumber || 0) + 1

    if (assessment.maxAttempts && nextAttemptNumber > assessment.maxAttempts) {
      return NextResponse.json({ error: 'Maximum attempts reached' }, { status: 403 })
    }

    // 3. Create new AssessmentSubmission and update previous latest in parallel
    const createBody = {
      trainee: traineeId,
      enrollment: enrollment.id,
      assessment: assessmentId,
      course: courseId,
      status: 'in_progress',
      attemptNumber: nextAttemptNumber,
      startedAt: new Date().toISOString(),
      isLatest: true,
      passingScoreSnapshot: assessment.passingScore || 70,
    }

    const promises: Promise<any>[] = [
      fetch(`${apiUrl}/assessment-submissions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(createBody)
      })
    ]

    if (latestAttempt) {
      promises.push(
        fetch(`${apiUrl}/assessment-submissions/${latestAttempt.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ isLatest: false })
        })
      )
    }

    const [createRes] = await Promise.all(promises)

    if (!createRes.ok) {
      const errorText = await createRes.text()
      console.error('Failed to create submission:', createRes.status, errorText)
      return NextResponse.json({ error: 'Failed to create submission' }, { status: createRes.status })
    }

    const newSubmission = await createRes.json()

    return NextResponse.json({
      submissionId: newSubmission.doc.id,
      attemptNumber: nextAttemptNumber
    })

  } catch (error) {
    console.error('Assessment start error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
