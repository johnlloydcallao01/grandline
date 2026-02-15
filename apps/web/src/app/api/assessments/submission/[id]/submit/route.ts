import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: submissionIdRaw } = await context.params
    const body = await request.json()
    const { answers } = body

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

    // Call the new optimized CMS endpoint
    const response = await fetch(`${apiUrl}/assessment-submissions/submit-assessment`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        submissionId,
        answers
      }),
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorText = await response.text()
      try {
        const errorJson = JSON.parse(errorText)
        return NextResponse.json(errorJson, { status: response.status })
      } catch {
        return NextResponse.json({ error: 'Submission failed', details: errorText }, { status: response.status })
      }
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Assessment submission proxy error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
