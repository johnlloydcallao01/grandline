import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await context.params
    const { lessonId, completed, userId } = await request.json()

    if (!courseId || !lessonId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // 1. Find the Trainee ID from the User ID
    // We try to find a Trainee record where 'user' matches the provided userId.
    const traineeParams = new URLSearchParams()
    traineeParams.set('where[user][equals]', userId)

    const traineeRes = await fetch(
      `${apiUrl}/trainees?${traineeParams.toString()}`,
      { headers, cache: 'no-store' }
    )

    if (!traineeRes.ok) {
      console.error('Failed to find trainee:', traineeRes.status, await traineeRes.text())
      return NextResponse.json({ error: 'Failed to find trainee' }, { status: traineeRes.status })
    }

    const traineeData = await traineeRes.json()
    const trainee = traineeData.docs?.[0]

    // If no trainee found, maybe the userId passed IS the trainee ID? 
    // But let's assume it's the User ID first. If not found, we can't proceed reliably without knowing the architecture.
    // However, for safety, if we don't find a trainee by user ID, we could check if a trainee exists with this ID directly.
    // But let's stick to the strict User -> Trainee lookup.

    if (!trainee) {
      console.error('Trainee profile not found for user:', userId)
      return NextResponse.json({ error: 'Trainee profile not found for this user' }, { status: 404 })
    }

    const traineeId = trainee.id

    // 1.5. Validate Course and get canonical ID
    const courseRes = await fetch(`${apiUrl}/courses/${courseId}`, { headers, cache: 'no-store' })

    if (!courseRes.ok) {
      console.error('Course validation failed:', courseRes.status)
      return NextResponse.json({ error: 'Invalid Course' }, { status: 400 })
    }

    const courseData = await courseRes.json()
    const validCourseId = courseData.id

    // 2. Find active enrollment
    // We need to find the enrollment to link it to the progress record
    const enrollmentParams = new URLSearchParams()
    enrollmentParams.set('where[student][equals]', traineeId)
    enrollmentParams.set('where[course][equals]', validCourseId)
    enrollmentParams.set('where[status][equals]', 'active')

    const findRes = await fetch(
      `${apiUrl}/course-enrollments?${enrollmentParams.toString()}`,
      { headers, cache: 'no-store' }
    )

    if (!findRes.ok) {
      console.error('Failed to find enrollment:', findRes.status, await findRes.text())
      return NextResponse.json({ error: 'Failed to find enrollment' }, { status: findRes.status })
    }

    const findData = await findRes.json()
    const enrollment = findData.docs?.[0]

    if (!enrollment) {
      console.error('Enrollment not found for trainee:', traineeId, 'course:', courseId)
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    // 3. Check if progress record already exists
    // Ensure lessonId is the correct type (number vs string)
    // Based on logs, IDs are numbers (e.g. 10, 8), but frontend sends strings.
    // We try to convert to number if it's a valid number string.
    let formattedLessonId: string | number = lessonId
    if (typeof lessonId === 'string' && !isNaN(Number(lessonId)) && Number.isInteger(Number(lessonId))) {
      formattedLessonId = Number(lessonId)
    }

    const progressParams = new URLSearchParams()
    progressParams.set('where[trainee][equals]', traineeId)
    progressParams.set('where[course][equals]', validCourseId)
    progressParams.set('where[item.value][equals]', String(formattedLessonId))

    const progressRes = await fetch(
      `${apiUrl}/course-item-progress?${progressParams.toString()}`,
      { headers, cache: 'no-store' }
    )

    const progressData = await progressRes.json()
    const existingProgress = progressData.docs?.[0]

    // 4. Create or Update CourseItemProgress
    if (existingProgress) {
      // Update
      const updateBody = {
        status: completed ? 'completed' : 'in_progress', // If unmarking, go back to in_progress or not_started? Let's say in_progress
        isCompleted: completed,
        lastAccessedAt: new Date().toISOString(),
        ...(completed ? { completedAt: new Date().toISOString() } : { completedAt: null })
      }

      const updateRes = await fetch(`${apiUrl}/course-item-progress/${existingProgress.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updateBody)
      })

      if (!updateRes.ok) {
        console.error('Failed to update progress:', updateRes.status, await updateRes.text())
        return NextResponse.json({ error: 'Failed to update progress' }, { status: updateRes.status })
      }

    } else {
      // Create
      // Only create if we are marking as completed (or started)
      // If we are unmarking something that doesn't exist, we do nothing.
      if (completed) {
        const createBody = {
          trainee: traineeId,
          course: validCourseId,
          enrollment: enrollment.id,
          item: {
            relationTo: 'course-lessons', // We assume it's a lesson for this endpoint "lesson-completion"
            value: formattedLessonId
          },
          status: 'completed',
          isCompleted: true,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString(),
          progressPercentage: 100
        }

        console.log('Creating progress with body:', JSON.stringify(createBody, null, 2))

        const createRes = await fetch(`${apiUrl}/course-item-progress`, {
          method: 'POST',
          headers,
          body: JSON.stringify(createBody)
        })

        if (!createRes.ok) {
          const errText = await createRes.text()
          console.error('Create progress failed. Status:', createRes.status, 'Response:', errText)
          return NextResponse.json({ error: 'Failed to create progress record', details: errText }, { status: createRes.status })
        }
      }
    }

    // 5. Return the updated list of completed lesson IDs for the frontend to sync state
    // We need to fetch ALL completed items for this course to return the full list, 
    // as the frontend expects the full list of IDs.

    const allProgressParams = new URLSearchParams()
    allProgressParams.set('where[trainee][equals]', traineeId)
    allProgressParams.set('where[course][equals]', validCourseId)
    allProgressParams.set('where[isCompleted][equals]', 'true')
    allProgressParams.set('limit', '1000')
    allProgressParams.set('depth', '0')

    const allProgressRes = await fetch(
      `${apiUrl}/course-item-progress?${allProgressParams.toString()}`,
      { headers, cache: 'no-store' }
    )

    const allProgressData = await allProgressRes.json()

    const completedLessonIds: string[] = []
    if (allProgressData.docs) {
      allProgressData.docs.forEach((doc: any) => {
        const itemId = typeof doc.item === 'object' ? (doc.item.value?.id || doc.item.value) : doc.item
        if (itemId) completedLessonIds.push(itemId)
      })
    }

    return NextResponse.json({
      success: true,
      completedLessons: completedLessonIds,
    })
  } catch (error) {
    console.error('Error updating lesson completion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
