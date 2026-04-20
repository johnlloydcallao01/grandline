import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: courseId } = await context.params
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!courseId || !userId) {
            return NextResponse.json({ hasSubmitted: false }, { status: 400 })
        }

        const apiKey = process.env.PAYLOAD_API_KEY
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api'

        if (!apiKey) {
            return NextResponse.json({ hasSubmitted: false }, { status: 500 })
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `users API-Key ${apiKey}`,
        }

        // 1. Find Trainee ID from User ID
        const traineeParams = new URLSearchParams()
        traineeParams.set('where[user][equals]', userId)
        const traineeRes = await fetch(`${apiUrl}/trainees?${traineeParams.toString()}`, { headers, cache: 'no-store' })
        const traineeData = await traineeRes.json()
        const trainee = traineeData.docs?.[0]

        if (!trainee) {
            return NextResponse.json({ hasSubmitted: false }, { status: 404 })
        }

        // 2. Check if a Feedback Submission exists for this trainee + course
        const feedbackParams = new URLSearchParams()
        feedbackParams.set('where[trainee][equals]', trainee.id)
        feedbackParams.set('where[course][equals]', courseId)
        feedbackParams.set('limit', '1')

        const feedbackRes = await fetch(`${apiUrl}/feedback-submissions?${feedbackParams.toString()}`, { headers, cache: 'no-store' })
        const feedbackData = await feedbackRes.json()

        const hasSubmitted = feedbackData.docs && feedbackData.docs.length > 0;

        return NextResponse.json({ hasSubmitted })

    } catch (error) {
        console.error('Feedback status check error:', error)
        return NextResponse.json({ hasSubmitted: false }, { status: 500 })
    }
}
