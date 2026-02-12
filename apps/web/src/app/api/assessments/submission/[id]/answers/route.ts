import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: submissionIdRaw } = await context.params

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

    // Fetch SubmissionAnswers for this submission
    const savedAnswersRes = await fetch(
      `${apiUrl}/submission-answers?where[submission][equals]=${submissionId}&limit=1000`,
      { headers, cache: 'no-store' }
    )

    if (!savedAnswersRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch saved answers' }, { status: savedAnswersRes.status })
    }

    const savedAnswersData = await savedAnswersRes.json()
    const answers: Record<string, any> = {}

    for (const a of savedAnswersData.docs || []) {
      const qId = typeof a.question === 'object' ? a.question.id : a.question
      // Extract the value from the JSON object we stored
      answers[qId] = a.response?.value ?? a.response
    }

    return NextResponse.json({ answers })

  } catch (error) {
    console.error('Fetch answers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
