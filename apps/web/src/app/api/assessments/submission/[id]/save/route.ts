import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: submissionIdRaw } = await context.params
    const { questionId: questionIdRaw, response: responseRaw, questionType } = await request.json()

    // Ensure IDs are numbers if they look like numbers
    const submissionId = (typeof submissionIdRaw === 'string' && !isNaN(Number(submissionIdRaw)) && Number.isInteger(Number(submissionIdRaw)))
      ? Number(submissionIdRaw)
      : submissionIdRaw;

    const questionId = (typeof questionIdRaw === 'string' && !isNaN(Number(questionIdRaw)) && Number.isInteger(Number(questionIdRaw)))
      ? Number(questionIdRaw)
      : questionIdRaw;

    // The 'response' field in CMS is a JSON type. 
    // Payload expects an object for JSON fields, not a primitive string or array.
    const response = { value: responseRaw };

    if (!submissionId || !questionId || responseRaw === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

    // 1. Check if an answer for this question already exists for this submission
    const answerParams = new URLSearchParams()
    answerParams.set('where[submission][equals]', String(submissionId))
    answerParams.set('where[question][equals]', String(questionId))

    const answerRes = await fetch(
      `${apiUrl}/submission-answers?${answerParams.toString()}`,
      { headers, cache: 'no-store' }
    )

    const answerData = await answerRes.json()
    const existingAnswer = answerData.docs?.[0]

    if (existingAnswer) {
      // Update
      const updateRes = await fetch(`${apiUrl}/submission-answers/${existingAnswer.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          response,
          questionType: questionType || existingAnswer.questionType
        })
      })

      if (!updateRes.ok) {
        return NextResponse.json({ error: 'Failed to update answer' }, { status: updateRes.status })
      }
    } else {
      // Create
      const createRes = await fetch(`${apiUrl}/submission-answers`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          submission: submissionId,
          question: questionId,
          questionType: questionType || 'single_choice',
          response,
        })
      })

      if (!createRes.ok) {
        return NextResponse.json({ error: 'Failed to create answer' }, { status: createRes.status })
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Assessment save error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
