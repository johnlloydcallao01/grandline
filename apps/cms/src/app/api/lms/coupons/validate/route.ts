import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getEffectiveCoursePrice, validateCouponForEnrollment } from '@/utils/couponEngine'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const courseId = body.courseId || body.course
    if (!courseId) {
      return NextResponse.json({ valid: false, reason: 'Course is required.' }, { status: 400 })
    }

    const course = await payload.findByID({
      collection: 'courses',
      id: courseId,
      depth: 1,
      overrideAccess: true,
    })

    if (!course) {
      return NextResponse.json({ valid: false, reason: 'Course not found.' }, { status: 404 })
    }

    const traineeId = body.traineeId || body.trainee || null
    const userId = body.userId || null

    let userEmail = body.email || null
    if (!userEmail && traineeId) {
      const trainee = await payload.findByID({
        collection: 'trainees',
        id: traineeId,
        depth: 1,
        overrideAccess: true,
      })

      const traineeUser = trainee?.user && typeof trainee.user === 'object' ? trainee.user : null
      userEmail = traineeUser?.email || null
    }

    const subtotal = body.subtotal == null ? getEffectiveCoursePrice(course) : Number(body.subtotal)

    const validation = await validateCouponForEnrollment({
      payload,
      code: String(body.code || ''),
      course,
      traineeId,
      userId,
      userEmail,
      subtotal,
    })

    return NextResponse.json(validation, { status: validation.valid ? 200 : 400 })
  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json(
      { valid: false, reason: 'Internal server error' },
      { status: 500 },
    )
  }
}
