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

        // 4. Extract Required Items from Curriculum
        const lessonIds: string[] = []
        const quizIds: string[] = [] // Actually all assessments inside modules

        if (course.modules && Array.isArray(course.modules)) {
            for (const mod of course.modules) {
                if (mod.items && Array.isArray(mod.items)) {
                    for (const item of mod.items) {
                        const val = typeof item.value === 'string' ? item.value : item.value?.id
                        if (!val) continue;

                        if (item.relationTo === 'course-lessons') {
                            lessonIds.push(String(val))
                        } else if (item.relationTo === 'assessments') {
                            quizIds.push(String(val))
                        }
                    }
                }
            }
        }

        // 4.5 Fetch Final Exam if needed
        let finalExamId: string | null = null;
        if (['exam', 'lessons_exam', 'quizzes_exam', 'lessons_quizzes_exam'].includes(evaluationMode)) {
            const paramsFinalExam = new URLSearchParams()
            paramsFinalExam.set('where[course][equals]', String(course.id))
            paramsFinalExam.set('where[assessmentType][equals]', 'final_exam')
            paramsFinalExam.set('limit', '1')
            
            const finalExamRes = await fetch(`${apiUrl}/assessments?${paramsFinalExam.toString()}`, { headers, cache: 'no-store' })
            if (finalExamRes.ok) {
                const finalExamJson = await finalExamRes.json()
                if (finalExamJson.docs && finalExamJson.docs.length > 0) {
                    finalExamId = String(finalExamJson.docs[0].id)
                }
            }
        }

        // 5. Fetch all progress for this user/course
        const progressParams = new URLSearchParams()
        progressParams.set('where[trainee][equals]', trainee.id)
        progressParams.set('where[course][equals]', course.id)
        progressParams.set('limit', '1000') // Assume < 1000 items

        const progressRes = await fetch(`${apiUrl}/course-item-progress?${progressParams.toString()}`, { headers, cache: 'no-store' })
        const progressData = await progressRes.json()
        const allProgressDocs = progressData.docs || []

        // 6. Map Progress States
        const completedLessonIds = new Set<string>();
        const passedQuizIds = new Set<string>();
        const submittedQuizIds = new Set<string>();
        let finalExamPassed = false;
        let finalExamSubmitted = false;

        for (const p of allProgressDocs) {
            const itemId = String(typeof p.item === 'object' ? p.item.value?.id || p.item.value : p.item);
            const status = p.status;
            
            if (lessonIds.includes(itemId) && p.isCompleted) {
                completedLessonIds.add(itemId);
            }
            if (quizIds.includes(itemId)) {
                submittedQuizIds.add(itemId);
                if (status === 'passed') {
                    passedQuizIds.add(itemId);
                }
            }
            if (finalExamId && itemId === finalExamId) {
                finalExamSubmitted = true;
                if (status === 'passed') {
                    finalExamPassed = true;
                }
            }
        }

        const allLessonsCompleted = lessonIds.length === 0 || lessonIds.every(id => completedLessonIds.has(id));
        const allQuizzesSubmitted = quizIds.length === 0 || quizIds.every(id => submittedQuizIds.has(id));
        const allQuizzesPassed = quizIds.length === 0 || quizIds.every(id => passedQuizIds.has(id));
        
        // Handle edge case where final exam doesn't exist in DB but mode expects it
        if (!finalExamId && ['exam', 'lessons_exam', 'quizzes_exam', 'lessons_quizzes_exam'].includes(evaluationMode)) {
            finalExamSubmitted = true;
            finalExamPassed = true;
        }

        // 6.5 Fetch Feedback Submission Status
        let hasSubmittedFeedback = false;
        if (course.isFeedbackRequired && course.feedbackForm) {
            const feedbackParams = new URLSearchParams()
            feedbackParams.set('where[trainee][equals]', trainee.id)
            feedbackParams.set('where[course][equals]', course.id)
            feedbackParams.set('limit', '1')

            const feedbackRes = await fetch(`${apiUrl}/feedback-submissions?${feedbackParams.toString()}`, { headers, cache: 'no-store' })
            if (feedbackRes.ok) {
                const feedbackData = await feedbackRes.json()
                if (feedbackData.docs && feedbackData.docs.length > 0) {
                    hasSubmittedFeedback = true;
                }
            }
        }

        // 7. Validate Completion Requirements based on Mode
        let isEligible = false;
        let isPassed = false;
        let errorMessage = 'Course requirements not met';

        switch (evaluationMode) {
            case 'lessons':
                isEligible = allLessonsCompleted;
                isPassed = allLessonsCompleted;
                errorMessage = `Completed ${completedLessonIds.size}/${lessonIds.length} lessons`;
                break;
            case 'exam':
                isEligible = finalExamSubmitted;
                isPassed = finalExamPassed;
                errorMessage = finalExamSubmitted ? 'Final Exam failed' : 'Final Exam not submitted';
                break;
            case 'quizzes':
                isEligible = allQuizzesSubmitted;
                isPassed = allQuizzesPassed;
                errorMessage = `Submitted ${submittedQuizIds.size}/${quizIds.length} quizzes. Passed ${passedQuizIds.size}/${quizIds.length} quizzes`;
                break;
            case 'lessons_exam':
                isEligible = allLessonsCompleted && finalExamSubmitted;
                isPassed = allLessonsCompleted && finalExamPassed;
                errorMessage = `Lessons: ${completedLessonIds.size}/${lessonIds.length}. Final Exam: ${finalExamSubmitted ? (finalExamPassed ? 'Passed' : 'Failed') : 'Missing'}`;
                break;
            case 'lessons_quizzes':
                isEligible = allLessonsCompleted && allQuizzesSubmitted;
                isPassed = allLessonsCompleted && allQuizzesPassed;
                errorMessage = `Lessons: ${completedLessonIds.size}/${lessonIds.length}. Quizzes Passed: ${passedQuizIds.size}/${quizIds.length}`;
                break;
            case 'quizzes_exam':
                isEligible = allQuizzesSubmitted && finalExamSubmitted;
                isPassed = allQuizzesPassed && finalExamPassed;
                errorMessage = `Quizzes Passed: ${passedQuizIds.size}/${quizIds.length}. Final Exam: ${finalExamSubmitted ? (finalExamPassed ? 'Passed' : 'Failed') : 'Missing'}`;
                break;
            case 'lessons_quizzes_exam':
                isEligible = allLessonsCompleted && allQuizzesSubmitted && finalExamSubmitted;
                isPassed = allLessonsCompleted && allQuizzesPassed && finalExamPassed;
                errorMessage = `Lessons: ${completedLessonIds.size}/${lessonIds.length}. Quizzes Passed: ${passedQuizIds.size}/${quizIds.length}. Final Exam: ${finalExamSubmitted ? (finalExamPassed ? 'Passed' : 'Failed') : 'Missing'}`;
                break;
            default:
                return NextResponse.json({ error: `Evaluation mode '${evaluationMode}' not supported for this action yet` }, { status: 400 });
        }

        if (course.isFeedbackRequired && course.feedbackForm && !hasSubmittedFeedback) {
            isEligible = false;
            errorMessage = 'Required Course Feedback has not been submitted';
        }

        if (!isEligible) {
            return NextResponse.json({
                error: 'Course requirements not met',
                detail: errorMessage
            }, { status: 400 })
        }

        // 8. Update Enrollment Status
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
