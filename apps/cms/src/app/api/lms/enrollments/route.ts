import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import { getCourseOriginalPrice, getEffectiveCoursePrice, getCourseSalePrice, validateCouponForEnrollment } from '@/utils/couponEngine'

// GET /api/lms/enrollments - Get enrollments with filtering
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const student = searchParams.get('student')
    const course = searchParams.get('course')
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    // Build where clause
    const where: Where = {}

    // Resolve student from userId when provided
    let effectiveStudent = student

    if (!effectiveStudent && userId) {
      try {
        const traineesForUser = await payload.find({
          collection: 'trainees',
          where: {
            user: { equals: userId },
          } as Where,
          limit: 1,
        })

        const firstTrainee = Array.isArray(traineesForUser.docs)
          ? traineesForUser.docs[0]
          : null

        if (firstTrainee && (firstTrainee as any).id != null) {
          effectiveStudent = String((firstTrainee as any).id)
        }
      } catch (resolveError) {
        console.error('Error resolving trainee from userId:', resolveError)
      }
    }

    if (effectiveStudent) {
      ; (where as any).student = { equals: effectiveStudent }
    }

    if (course) {
      ; (where as any).course = { equals: course }
    }

    if (status) {
      ; (where as any).status = { equals: status }
    }

    // Get enrollments with relationships
    const enrollments = await payload.find({
      collection: 'course-enrollments',
      where,
      page,
      limit,
      depth: 4, // Depth 1: Course, Depth 2: Instructor, Depth 3: User, Depth 4: Profile Picture (Media)
      sort: '-enrolledAt',
    })

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/lms/enrollments - Create new enrollment
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    // Check if enrollment already exists
    const existingEnrollment = await payload.find({
      collection: 'course-enrollments',
      where: {
        and: [
          { student: { equals: body.student } },
          { course: { equals: body.course } }
        ]
      } as Where
    })

    if (existingEnrollment.docs.length > 0) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this course' },
        { status: 400 }
      )
    }

    const course = await payload.findByID({
      collection: 'courses',
      id: body.course,
      depth: 1,
      overrideAccess: true,
    })

    const trainee = await payload.findByID({
      collection: 'trainees',
      id: body.student,
      depth: 1,
      overrideAccess: true,
    })

    const traineeUser = trainee?.user && typeof trainee.user === 'object'
      ? trainee.user
      : null

    const originalPrice = getCourseOriginalPrice(course)
    const courseSalePrice = getCourseSalePrice(course)
    const effectivePrice = getEffectiveCoursePrice(course)
    const couponCodeInput = String(body.couponCode || body.coupon || '').trim()
    let couponValidation: Awaited<ReturnType<typeof validateCouponForEnrollment>> | null = null

    if (couponCodeInput) {
      couponValidation = await validateCouponForEnrollment({
        payload,
        code: couponCodeInput,
        course,
        traineeId: body.student,
        userId: traineeUser?.id || null,
        userEmail: traineeUser?.email || null,
        subtotal: effectivePrice,
      })

      if (!couponValidation.valid) {
        return NextResponse.json(
          { error: couponValidation.reason },
          { status: 400 },
        )
      }
    }

    const couponDiscount = couponValidation?.valid ? couponValidation.pricing.couponDiscount : 0
    const finalPrice = couponValidation?.valid ? couponValidation.pricing.finalPrice : effectivePrice
    const pricingBreakdown = {
      currency: 'PHP',
      originalPrice,
      courseSalePrice,
      effectivePrice,
      couponDiscount,
      finalPrice,
      couponDiscountType: couponValidation?.valid ? couponValidation.pricing.discountType : null,
      couponDiscountValue: couponValidation?.valid ? couponValidation.pricing.discountValue : null,
      couponMaxDiscountAmount: couponValidation?.valid ? couponValidation.pricing.maxDiscountAmount : null,
      calculatedAt: new Date().toISOString(),
    }

    // Create enrollment
    const newEnrollment = await payload.create({
      collection: 'course-enrollments',
      data: {
        ...body,
        enrolledAt: new Date().toISOString(),
        status: body.status || 'active',
        progressPercentage: 0,
        coupon: couponValidation?.valid ? couponValidation.coupon.id : body.coupon || null,
        couponCode: couponValidation?.valid ? couponValidation.normalizedCode : null,
        couponDiscountAmount: couponDiscount,
        listPriceSnapshot: originalPrice,
        finalPriceSnapshot: finalPrice,
        pricingBreakdown,
      },
    })

    if (couponValidation?.valid) {
      const couponId = couponValidation.coupon.id

      try {
        await payload.create({
          collection: 'coupon-redemptions',
          data: {
            coupon: couponId,
            trainee: body.student,
            user: traineeUser?.id || null,
            courseEnrollment: newEnrollment.id,
            course: body.course,
            contextType: 'checkout_commit',
            status: 'applied',
            codeSnapshot: couponValidation.normalizedCode,
            discountTypeSnapshot: couponValidation.pricing.discountType,
            discountAmountSnapshot: couponValidation.pricing.couponDiscount,
            subtotalSnapshot: couponValidation.pricing.effectivePrice,
            finalTotalSnapshot: couponValidation.pricing.finalPrice,
            currencySnapshot: 'PHP',
            appliedAt: new Date().toISOString(),
            metadata: {
              source: 'lms-enrollments-post',
            },
          },
          overrideAccess: true,
        })
      } catch (redemptionError) {
        await payload.delete({
          collection: 'course-enrollments',
          id: newEnrollment.id,
          overrideAccess: true,
        })

        throw redemptionError
      }
    }

    return NextResponse.json(newEnrollment, { status: 201 })
  } catch (error) {
    console.error('Error creating enrollment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
