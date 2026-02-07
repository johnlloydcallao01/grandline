import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, courseId } = body

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'Missing userId or courseId' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config: configPromise })

    // Fetch User
    const user = await payload.findByID({
      collection: 'users',
      id: userId,
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch Course
    const course = await payload.findByID({
      collection: 'courses',
      id: courseId,
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Send Email via Resend
    const resendApiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'info@grandlinemaritime.com'
    const fromName = process.env.EMAIL_FROM_NAME || 'Grandline Maritime'

    // Send to the admin email
    // Use EMAIL_REPLY_TO if available (user preference for admin notification), otherwise fallback
    const adminEmail = process.env.EMAIL_REPLY_TO || 'info@grandlinemaritime.com'

    if (!resendApiKey) {
      console.warn('RESEND_API_KEY is missing')
      return NextResponse.json(
        { error: 'Email configuration missing' },
        { status: 500 }
      )
    }

    const emailHtml = `
      <h2>New Enrollment Request</h2>
      <p><strong>Trainee Name:</strong> ${user.firstName} ${user.lastName}</p>
      <p><strong>Trainee Email:</strong> ${user.email}</p>
      <p><strong>Course:</strong> ${course.title}</p>
      <p><strong>Course ID:</strong> ${course.id}</p>
      <p><strong>User ID:</strong> ${user.id}</p>
      <p>Please review this request in the CMS and process the enrollment.</p>
    `

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: adminEmail,
        subject: `Enrollment Request: ${user.firstName} ${user.lastName} - ${course.title}`,
        html: emailHtml,
        reply_to: user.email, // Admin can reply directly to the trainee
      }),
    })

    if (!resendRes.ok) {
      const errorText = await resendRes.text()
      console.error('Resend API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error processing enrollment request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
