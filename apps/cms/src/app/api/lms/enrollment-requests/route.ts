import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import {
  getCourseOriginalPrice,
  getCourseSalePrice,
  getEffectiveCoursePrice,
  validateCouponForEnrollment,
} from '@/utils/couponEngine'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, courseId } = body
    const couponCode = typeof body.couponCode === 'string' ? body.couponCode.trim().toUpperCase() : ''

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
      overrideAccess: true,
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
      overrideAccess: true,
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    const traineeLookup = await payload.find({
      collection: 'trainees',
      where: {
        user: {
          equals: userId,
        },
      },
      limit: 1,
      depth: 1,
      overrideAccess: true,
    })

    const trainee = traineeLookup.docs[0] || null
    if (!trainee) {
      return NextResponse.json(
        { error: 'Trainee record not found' },
        { status: 404 },
      )
    }

    const existingEnrollments = await payload.find({
      collection: 'course-enrollments',
      where: {
        and: [
          {
            student: {
              equals: trainee.id,
            },
          },
          {
            course: {
              equals: courseId,
            },
          },
        ],
      } as Where,
      limit: 10,
      depth: 0,
      sort: '-enrolledAt',
      overrideAccess: true,
    })

    const blockingEnrollment = existingEnrollments.docs.find((enrollment: any) => {
      const status = typeof enrollment?.status === 'string'
        ? enrollment.status.toLowerCase().trim()
        : ''

      return (
        status === 'active' ||
        status === 'pending' ||
        status === 'completed' ||
        status === 'suspended'
      )
    })

    if (blockingEnrollment) {
      const status = String(blockingEnrollment.status).toLowerCase().trim()
      const messageByStatus: Record<string, string> = {
        active: 'An active enrollment already exists for this course.',
        pending: 'A pending enrollment request already exists for this course.',
        completed: 'This course has already been completed under your account.',
        suspended: 'This course already has a suspended enrollment under your account.',
      }

      return NextResponse.json(
        { error: messageByStatus[status] || 'An enrollment already exists for this course.' },
        { status: 409 },
      )
    }

    const originalPrice = getCourseOriginalPrice(course)
    const salePrice = getCourseSalePrice(course)
    const effectivePrice = getEffectiveCoursePrice(course)
    let couponSummaryHtml = ''
    let couponValidation: Awaited<ReturnType<typeof validateCouponForEnrollment>> | null = null

    if (couponCode) {
      couponValidation = await validateCouponForEnrollment({
        payload,
        code: couponCode,
        course,
        traineeId: trainee?.id || null,
        userId,
        userEmail: user.email || null,
        subtotal: effectivePrice,
      })

      if (!couponValidation.valid) {
        return NextResponse.json(
          { error: couponValidation.reason },
          { status: 400 },
        )
      }

      couponSummaryHtml = `
        <p><strong>Coupon Code:</strong> ${couponValidation.normalizedCode}</p>
        <p><strong>Coupon Discount:</strong> PHP ${couponValidation.pricing.couponDiscount.toFixed(2)}</p>
        <p><strong>Estimated Final Price:</strong> PHP ${couponValidation.pricing.finalPrice.toFixed(2)}</p>
      `
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

    const couponDiscount = couponValidation?.valid ? couponValidation.pricing.couponDiscount : 0
    const finalPrice = couponValidation?.valid ? couponValidation.pricing.finalPrice : effectivePrice
    const enrollmentType = finalPrice > 0 ? 'paid' : 'free'
    const paymentStatus = finalPrice > 0 ? 'pending' : 'not_required'
    const pricingBreakdown = {
      currency: 'PHP',
      originalPrice,
      courseSalePrice: salePrice,
      effectivePrice,
      couponDiscount,
      finalPrice,
      couponDiscountType: couponValidation?.valid ? couponValidation.pricing.discountType : null,
      couponDiscountValue: couponValidation?.valid ? couponValidation.pricing.discountValue : null,
      couponMaxDiscountAmount: couponValidation?.valid ? couponValidation.pricing.maxDiscountAmount : null,
      calculatedAt: new Date().toISOString(),
    }

    const pendingEnrollment = await payload.create({
      collection: 'course-enrollments',
      data: {
        student: trainee.id,
        course: course.id,
        enrolledAt: new Date().toISOString(),
        enrollmentType,
        status: 'pending',
        paymentStatus,
        amountPaid: 0,
        progressPercentage: 0,
        coupon: couponValidation?.valid ? couponValidation.coupon.id : null,
        couponCode: couponValidation?.valid ? couponValidation.normalizedCode : null,
        couponDiscountAmount: couponDiscount,
        listPriceSnapshot: originalPrice,
        finalPriceSnapshot: finalPrice,
        pricingBreakdown,
        notes: 'Created from self-service enrollment request flow.',
        metadata: {
          requestChannel: 'view-course-request-enrollment',
          requestSubmittedAt: new Date().toISOString(),
          requestedByUserId: user.id,
          source: 'lms-enrollment-request',
        },
      },
      overrideAccess: true,
    })

    const emailHtml = `
      <h2>New Enrollment Request</h2>
      <p><strong>Trainee Name:</strong> ${user.firstName} ${user.lastName}</p>
      <p><strong>Trainee Email:</strong> ${user.email}</p>
      <p><strong>Course:</strong> ${course.title}</p>
      <p><strong>Course ID:</strong> ${course.id}</p>
      <p><strong>User ID:</strong> ${user.id}</p>
      ${trainee ? `<p><strong>Trainee ID:</strong> ${trainee.id}</p>` : ''}
      <p><strong>Enrollment Record ID:</strong> ${pendingEnrollment.id}</p>
      <p><strong>Enrollment Status:</strong> pending</p>
      <p><strong>Original Course Price:</strong> PHP ${originalPrice.toFixed(2)}</p>
      <p><strong>Current Course Price:</strong> PHP ${(salePrice ?? effectivePrice).toFixed(2)}</p>
      <p><strong>Enrollment Type:</strong> ${enrollmentType}</p>
      <p><strong>Payment Status:</strong> ${paymentStatus}</p>
      ${couponSummaryHtml}
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
      await payload.delete({
        collection: 'course-enrollments',
        id: pendingEnrollment.id,
        overrideAccess: true,
      })
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      enrollmentId: pendingEnrollment.id,
      status: pendingEnrollment.status,
    })

  } catch (error) {
    console.error('Error processing enrollment request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
