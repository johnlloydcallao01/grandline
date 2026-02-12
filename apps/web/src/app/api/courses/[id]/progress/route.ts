import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: courseId } = await context.params
        const apiKey = process.env.PAYLOAD_API_KEY
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api'

        if (!apiKey) {
            return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `users API-Key ${apiKey}`,
        }

        // 1. Get the current user from the request (in a real app, this would be from session/token)
        // For now, we expect userId to be passed as a query param or header, or we rely on the client
        // to pass it. However, the secure way is to use the session.
        // Since we don't have easy access to the session here without more context on auth,
        // we'll assume the client sends the user ID in a header or query param for this internal API.
        // CHECK: The existing lesson-completion route expects userId in the body.
        // Let's look for userId in query params.
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
        }

        // 1.5 Fetch Trainee ID for this user
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

        if (!trainee) {
            console.error('Trainee profile not found for user:', userId)
            return NextResponse.json({ error: 'Trainee profile not found' }, { status: 404 })
        }

        const traineeId = trainee.id

        // 1.7. Validate Course and get canonical ID
        // This is important if courseId is a slug
        const courseRes = await fetch(`${apiUrl}/courses/${courseId}`, { headers, cache: 'no-store' })

        if (!courseRes.ok) {
            console.error('Course validation failed:', courseRes.status)
            return NextResponse.json({ error: 'Invalid Course' }, { status: 400 })
        }

        const courseData = await courseRes.json()
        const validCourseId = courseData.id

        // 2. Fetch CourseItemProgress for this trainee and course
        const progressParams = new URLSearchParams()
        progressParams.set('where[trainee][equals]', traineeId)
        progressParams.set('where[course][equals]', validCourseId)
        progressParams.set('limit', '1000')
        progressParams.set('depth', '0') // We only need IDs and status, not full objects

        const res = await fetch(
            `${apiUrl}/course-item-progress?${progressParams.toString()}`,
            { headers, cache: 'no-store' }
        )

        if (!res.ok) {
            console.error('Failed to fetch progress:', res.status, await res.text())
            return NextResponse.json({ error: 'Failed to fetch progress' }, { status: res.status })
        }

        const data = await res.json()

        console.log(`[Progress API] Found ${data.docs?.length || 0} progress records for user ${userId} in course ${validCourseId}`)

        // 3. Transform to a simple map or list for the frontend
        // We want to return a list of completed lesson IDs for compatibility with the current frontend logic
        // But also the full map for future use.

        const progressMap: Record<string, any> = {}
        const completedLessonIds: string[] = []
        const attemptCounts: Record<string, number> = {}

        if (data.docs && data.docs.length > 0) {
            // DEBUG: Log the first document structure to understand why we might be missing data
            // console.log('[Progress API] Sample doc structure:', JSON.stringify(data.docs[0], null, 2))

            data.docs.forEach((doc: any) => {
                // Handle polymorphic 'item' field (relationTo: ['course-lessons', 'assessments'])
                // In Payload, when querying with depth=0 or if depth is populated, 
                // polymorphic fields return as an object { relationTo: string, value: string | object }
                let itemId: string | undefined

                if (doc.item && typeof doc.item === 'object') {
                    if (typeof doc.item.value === 'object' && doc.item.value !== null) {
                        itemId = doc.item.value.id
                    } else {
                        itemId = doc.item.value
                    }
                } else if (typeof doc.item === 'string') {
                    itemId = doc.item
                }

                if (itemId) {
                    progressMap[itemId] = {
                        status: doc.status,
                        isCompleted: doc.isCompleted,
                        score: doc.score,
                        attempts: 0, // Reset attempts here, will be populated by submissions below
                    }

                    // Reset attemptCounts for this item, we will only count actual submissions
                    attemptCounts[itemId] = 0

                    // We include ALL completed items (lessons, assessments, etc.)
                    // Check both boolean flag AND status string for robustness
                    const isCompleted = doc.isCompleted === true || doc.status === 'completed' || doc.status === 'passed'

                    if (isCompleted) {
                        completedLessonIds.push(itemId)
                    }
                }
            })
        }

        // 3. Fetch Assessment Submissions to get accurate attempt counts and history
        const submissionParams = new URLSearchParams()
        submissionParams.set('where[trainee][equals]', traineeId)
        submissionParams.set('where[course][equals]', validCourseId)
        submissionParams.set('sort', 'attemptNumber') // Sort by attempt number
        submissionParams.set('limit', '1000')

        const submissionHistory: Record<string, any[]> = {}

        const submissionsRes = await fetch(
            `${apiUrl}/assessment-submissions?${submissionParams.toString()}`,
            { headers, cache: 'no-store' }
        )

        if (submissionsRes.ok) {
            const submissionsData = await submissionsRes.json()
            submissionsData.docs?.forEach((sub: any) => {
                const assessmentId = typeof sub.assessment === 'object' ? sub.assessment.id : sub.assessment
                if (assessmentId) {
                    // Count how many submissions exist for this assessment
                    attemptCounts[assessmentId] = (attemptCounts[assessmentId] || 0) + 1
                    
                    // Build history
                    if (!submissionHistory[assessmentId]) {
                        submissionHistory[assessmentId] = []
                    }
                    submissionHistory[assessmentId].push({
                        id: sub.id,
                        attemptNumber: sub.attemptNumber,
                        score: sub.score,
                        status: sub.status,
                        completedAt: sub.completedAt,
                        pointsTotal: sub.pointsTotal,
                        pointsPossible: sub.pointsPossible
                    })
                    
                    // Also update the progressMap for consistency
                    if (progressMap[assessmentId]) {
                        progressMap[assessmentId].attempts = attemptCounts[assessmentId]
                    }
                }
            })
        }

        console.log(`[Progress API] Returning ${completedLessonIds.length} completed items, ${Object.keys(attemptCounts).length} attempt counts, and history`)

        return NextResponse.json({
            progressMap,
            completedLessonIds,
            attemptCounts,
            submissionHistory
        })

    } catch (error) {
        console.error('Error fetching course progress:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
