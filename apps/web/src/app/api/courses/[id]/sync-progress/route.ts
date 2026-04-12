import { NextRequest, NextResponse } from 'next/server'

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: courseId } = await context.params
        const body = await request.json()
        const { userId, progressPercentage } = body

        if (!userId || progressPercentage === undefined) {
            return NextResponse.json({ error: 'Missing userId or progressPercentage' }, { status: 400 })
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

        // 1. Get Trainee
        const traineeParams = new URLSearchParams()
        traineeParams.set('where[user][equals]', userId)

        const traineeRes = await fetch(
            `${apiUrl}/trainees?${traineeParams.toString()}`,
            { headers, cache: 'no-store' }
        )

        if (!traineeRes.ok) {
            return NextResponse.json({ error: 'Failed to find trainee' }, { status: traineeRes.status })
        }

        const traineeData = await traineeRes.json()
        const trainee = traineeData.docs?.[0]

        if (!trainee) {
            return NextResponse.json({ error: 'Trainee profile not found' }, { status: 404 })
        }

        // 2. Validate Course and get canonical ID
        const courseRes = await fetch(`${apiUrl}/courses/${courseId}`, { headers, cache: 'no-store' })
        if (!courseRes.ok) {
            return NextResponse.json({ error: 'Invalid Course' }, { status: 400 })
        }
        const courseData = await courseRes.json()
        const validCourseId = courseData.id

        // 3. Find Enrollment
        const enrollParams = new URLSearchParams()
        enrollParams.set('where[student][equals]', trainee.id)
        enrollParams.set('where[course][equals]', validCourseId)
        
        const enrollRes = await fetch(
            `${apiUrl}/course-enrollments?${enrollParams.toString()}`,
            { headers, cache: 'no-store' }
        )

        if (!enrollRes.ok) {
            return NextResponse.json({ error: 'Failed to find enrollment' }, { status: enrollRes.status })
        }

        const enrollData = await enrollRes.json()
        const enrollment = enrollData.docs?.[0]

        if (!enrollment) {
            return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
        }

        // Only update if progress actually changed
        if (enrollment.progressPercentage === progressPercentage) {
            return NextResponse.json({ success: true, progressPercentage, updated: false })
        }

        // 4. Update Enrollment Progress
        const updateRes = await fetch(`${apiUrl}/course-enrollments/${enrollment.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ progressPercentage })
        })

        if (!updateRes.ok) {
            console.error('Failed to update enrollment progress:', updateRes.status, await updateRes.text())
            return NextResponse.json({ error: 'Failed to update enrollment progress' }, { status: updateRes.status })
        }

        return NextResponse.json({ success: true, progressPercentage, updated: true })
    } catch (error) {
        console.error('Error syncing progress:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
