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
        let isPassed = false

        // Common: Fetch all progress for this user/course
        const progressParams = new URLSearchParams()
        progressParams.set('where[trainee][equals]', trainee.id)
        progressParams.set('where[course][equals]', course.id)
        progressParams.set('limit', '1000') // Assume < 1000 items

        const progressRes = await fetch(`${apiUrl}/course-item-progress?${progressParams.toString()}`, { headers, cache: 'no-store' })
        const progressData = await progressRes.json()
        const allProgressDocs = progressData.docs || []

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

            const completedLessonCount = allProgressDocs.filter((p: any) => {
                const itemId = typeof p.item === 'object' ? p.item.value?.id || p.item.value : p.item
                // Check if it's a lesson and completed
                return lessonIds.includes(itemId) && p.isCompleted
            }).length

            if (completedLessonCount >= totalLessons && totalLessons > 0) {
                isEligible = true
                isPassed = true // In lessons mode, completion = pass
            } else {
                return NextResponse.json({
                    error: 'Course requirements not met',
                    detail: `Completed ${completedLessonCount}/${totalLessons} lessons`
                }, { status: 400 })
            }
        } else if (evaluationMode === 'lessons_quizzes_exam') {
             // Logic: Must complete ALL lessons AND submit ALL quizzes AND submit Final Exam
             
             const lessonIds: string[] = []
             const assessmentIds: string[] = []
             let finalExamId: string | null = null

             // Extract IDs
             if (course.modules && Array.isArray(course.modules)) {
                 for (const mod of course.modules) {
                     if (mod.items && Array.isArray(mod.items)) {
                         for (const item of mod.items) {
                             const val = typeof item.value === 'string' ? item.value : item.value?.id
                             if (item.relationTo === 'course-lessons') {
                                 lessonIds.push(val)
                             } else if (item.relationTo === 'course-assessments') {
                                 assessmentIds.push(val)
                             }
                         }
                     }
                 }
             }
             if (course.finalExam) {
                 finalExamId = typeof course.finalExam === 'string' ? course.finalExam : course.finalExam.id
             }

             // Check Lessons
             const completedLessons = allProgressDocs.filter((p: any) => {
                 const itemId = typeof p.item === 'object' ? p.item.value?.id || p.item.value : p.item
                 return lessonIds.includes(itemId) && p.isCompleted
             })
             const lessonsDone = completedLessons.length === lessonIds.length

             // Check Assessments (Quizzes)
             const assessmentProgress = allProgressDocs.filter((p: any) => {
                 const itemId = typeof p.item === 'object' ? p.item.value?.id || p.item.value : p.item
                 return assessmentIds.includes(itemId)
             })
             // Eligible if all assessments have at least one submission entry
             // Note: course-item-progress is usually one per item per user.
             const assessmentsSubmitted = assessmentIds.every(id => assessmentProgress.some((p: any) => {
                 const pId = typeof p.item === 'object' ? p.item.value?.id || p.item.value : p.item
                 return pId === id
             }))

             const assessmentsPassed = assessmentIds.every(id => assessmentProgress.some((p: any) => {
                 const pId = typeof p.item === 'object' ? p.item.value?.id || p.item.value : p.item
                 // Check for pass status (assuming 'passed' status is set correctly by frontend/backend on submission)
                 // Alternatively check score >= passingScore if available, but status is safer if standardized
                 return pId === id && p.status === 'passed'
             }))

             // Check Final Exam
             let finalExamSubmitted = false
             let finalExamPassed = false
             if (finalExamId) {
                 const examProgress = allProgressDocs.find((p: any) => {
                     const itemId = typeof p.item === 'object' ? p.item.value?.id || p.item.value : p.item
                     return itemId === finalExamId
                 })
                 if (examProgress) {
                     finalExamSubmitted = true
                     finalExamPassed = examProgress.status === 'passed'
                 }
             } else {
                 // If no final exam configured but mode expects it? 
                 // Assume if configured in mode but missing in content, we might skip or fail.
                 // For now, assume it exists if mode is set.
                 finalExamSubmitted = true // Skip check if null
                 finalExamPassed = true
             }

             if (lessonsDone && assessmentsSubmitted && finalExamSubmitted) {
                 isEligible = true
                 isPassed = lessonsDone && assessmentsPassed && finalExamPassed
             } else {
                 return NextResponse.json({
                     error: 'Course requirements not met',
                     detail: `Lessons: ${completedLessons.length}/${lessonIds.length}, Assessments: ${assessmentProgress.length}/${assessmentIds.length}, Exam: ${finalExamSubmitted ? 'Submitted' : 'Missing'}`
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
                completionDate: new Date().toISOString(),
                finalEvaluation: isPassed ? 'passed' : 'failed'
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
