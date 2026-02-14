import { NextRequest, NextResponse } from 'next/server'

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: courseId } = await context.params
        const { userId } = await request.json()

        if (!courseId || !userId) {
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

        // 1. Get Course to check evaluation mode and curriculum
        const courseRes = await fetch(`${apiUrl}/courses/${courseId}?depth=2`, { headers, cache: 'no-store' })
        if (!courseRes.ok) {
            return NextResponse.json({ error: 'Invalid Course' }, { status: 404 })
        }
        const course = await courseRes.json()

        // Future-proofing: Switch logic based on evaluation mode
        const evaluationMode = course.evaluationMode || 'default'

        // 2. Find Trainee
        const traineeParams = new URLSearchParams()
        traineeParams.set('where[user][equals]', userId)
        const traineeRes = await fetch(`${apiUrl}/trainees?${traineeParams.toString()}`, { headers, cache: 'no-store' })
        const traineeData = await traineeRes.json()
        const trainee = traineeData.docs?.[0]

        if (!trainee) {
            return NextResponse.json({ error: 'Trainee not found' }, { status: 404 })
        }

        // 3. Find Active Enrollment
        const enrollmentParams = new URLSearchParams()
        enrollmentParams.set('where[student][equals]', trainee.id)
        enrollmentParams.set('where[course][equals]', course.id)
        enrollmentParams.set('where[status][equals]', 'active')
        const enrollmentRes = await fetch(`${apiUrl}/course-enrollments?${enrollmentParams.toString()}`, { headers, cache: 'no-store' })
        const enrollmentData = await enrollmentRes.json()
        const enrollment = enrollmentData.docs?.[0]

        if (!enrollment) {
            return NextResponse.json({ error: 'Active enrollment not found' }, { status: 404 })
        }

        // 4. Validate Completion Requirements based on Mode
        let isEligible = false

        if (evaluationMode === 'lessons') {
            // Logic: Must have completed ALL lessons

            // Calculate total lessons from course structure
            let totalLessons = 0
            const lessonIds: string[] = []

            if (course.modules && Array.isArray(course.modules)) {
                for (const mod of course.modules) {
                    if (mod.items && Array.isArray(mod.items)) {
                        for (const item of mod.items) {
                            if (item.relationTo === 'course-lessons') {
                                totalLessons++
                                if (typeof item.value === 'string') lessonIds.push(item.value)
                                else if (typeof item.value === 'object' && item.value.id) lessonIds.push(item.value.id)
                            }
                        }
                    }
                }
            }

            // Fetch user's completed items
            const progressParams = new URLSearchParams()
            progressParams.set('where[trainee][equals]', trainee.id)
            progressParams.set('where[course][equals]', course.id)
            progressParams.set('where[isCompleted][equals]', 'true')
            progressParams.set('limit', '1000') // Assume < 1000 items

            const progressRes = await fetch(`${apiUrl}/course-item-progress?${progressParams.toString()}`, { headers, cache: 'no-store' })
            const progressData = await progressRes.json()

            const completedLessonCount = progressData.docs.filter((p: any) => {
                // We only care about lessons here
                // The item relation is polymorphic, so we need to check if the item ID matches our known lesson IDs
                // or rely on the item relationship type if available in the response (which might be tricky with depth=0)
                // A safer bet is: check if the item ID exists in our list of course lesson IDs
                const itemId = typeof p.item === 'object' ? p.item.value?.id || p.item.value : p.item
                return lessonIds.includes(itemId)
            }).length

            if (completedLessonCount >= totalLessons && totalLessons > 0) {
                isEligible = true
            } else {
                return NextResponse.json({
                    error: 'Course requirements not met',
                    detail: `Completed ${completedLessonCount}/${totalLessons} lessons`
                }, { status: 400 })
            }
        } else {
            // Fallback or other modes not yet implemented
            // For safety, deny if mode is unknown or not handled
            return NextResponse.json({ error: 'Evaluation mode not supported for this action yet' }, { status: 400 })
        }

        // 5. Update Enrollment Status
        if (isEligible) {
            const updateBody: any = {
                status: 'completed',
                completionDate: new Date().toISOString()
            }

            // If in lessons mode, completion implies passing
            if (evaluationMode === 'lessons') {
                updateBody.finalEvaluation = 'passed'
            }

            const updateRes = await fetch(`${apiUrl}/course-enrollments/${enrollment.id}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(updateBody)
            })

            if (!updateRes.ok) {
                return NextResponse.json({ error: 'Failed to update enrollment' }, { status: 500 })
            }

            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'Unknown error' }, { status: 500 })

    } catch (error) {
        console.error('Finish course error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
