import type { Payload } from 'payload'

type RelationValue =
  | null
  | undefined
  | string
  | number
  | { id?: string | number | null }

type CategoryRelationValue = RelationValue | RelationValue[]

export type CouponValidationResult =
  | {
    valid: true
    coupon: any
    normalizedCode: string
    pricing: {
      originalPrice: number
      courseSalePrice: number | null
      effectivePrice: number
      couponDiscount: number
      finalPrice: number
      discountType: string
      discountValue: number
      maxDiscountAmount: number | null
    }
  }
  | {
    valid: false
    normalizedCode: string
    reason: string
  }

interface ValidateCouponInput {
  payload: Payload
  code: string
  course: any
  traineeId?: string | number | null
  userId?: string | number | null
  userEmail?: string | null
  subtotal?: number | null
  now?: Date
}

function getRelationId(value: RelationValue): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') {
    return value.id == null ? '' : String(value.id)
  }
  return String(value)
}

function getRelationIds(value: CategoryRelationValue): string[] {
  if (Array.isArray(value)) {
    return value.map(getRelationId).filter(Boolean)
  }

  const id = getRelationId(value)
  return id ? [id] : []
}

function parseNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  return fallback
}

export function normalizeCouponCode(code: string): string {
  return String(code || '').trim().toUpperCase()
}

export function getCourseOriginalPrice(course: any): number {
  return Math.max(0, parseNumber(course?.price))
}

export function getCourseSalePrice(course: any): number | null {
  const discountedPrice = parseNumber(course?.discountedPrice, -1)
  const originalPrice = getCourseOriginalPrice(course)

  if (discountedPrice >= 0 && discountedPrice < originalPrice) {
    return discountedPrice
  }

  return null
}

export function getEffectiveCoursePrice(course: any): number {
  return getCourseSalePrice(course) ?? getCourseOriginalPrice(course)
}

function couponTargetsCourse(coupon: any, course: any): boolean {
  const scopeType = coupon.scopeType || 'all_courses'
  const courseId = getRelationId(course?.id)
  const courseCategoryIds = getRelationIds(course?.category)
  const includedCourseIds = getRelationIds(coupon?.includedCourses)
  const excludedCourseIds = getRelationIds(coupon?.excludedCourses)
  const includedCategoryIds = getRelationIds(coupon?.includedCategories)
  const excludedCategoryIds = getRelationIds(coupon?.excludedCategories)

  if (excludedCourseIds.includes(courseId)) {
    return false
  }

  if (excludedCategoryIds.some((id) => courseCategoryIds.includes(id))) {
    return false
  }

  if (coupon?.excludeSaleCourses && getCourseSalePrice(course) !== null) {
    return false
  }

  if (scopeType === 'specific_courses') {
    return includedCourseIds.includes(courseId)
  }

  if (scopeType === 'specific_categories') {
    return includedCategoryIds.some((id) => courseCategoryIds.includes(id))
  }

  return true
}

async function getCouponUsageStats(payload: Payload, couponId: string | number, traineeId?: string | number | null, userId?: string | number | null) {
  const totalUsages = await payload.find({
    collection: 'coupon-redemptions',
    where: {
      and: [
        {
          coupon: {
            equals: couponId,
          },
        },
        {
          status: {
            equals: 'applied',
          },
        },
      ],
    },
    depth: 0,
    limit: 0,
    overrideAccess: true,
  })

  let userUsageCount = 0

  if (traineeId || userId) {
    const userWhere: any[] = [
      {
        coupon: {
          equals: couponId,
        },
      },
      {
        status: {
          equals: 'applied',
        },
      },
    ]

    if (traineeId) {
      userWhere.push({
        trainee: {
          equals: traineeId,
        },
      })
    } else if (userId) {
      userWhere.push({
        user: {
          equals: userId,
        },
      })
    }

    const userUsages = await payload.find({
      collection: 'coupon-redemptions',
      where: {
        and: userWhere,
      },
      depth: 0,
      limit: 0,
      overrideAccess: true,
    })

    userUsageCount = userUsages.totalDocs
  }

  return {
    totalUsageCount: totalUsages.totalDocs,
    userUsageCount,
  }
}

function computeCouponDiscount(coupon: any, effectivePrice: number): number {
  const amount = Math.max(0, parseNumber(coupon?.amount))
  const maxDiscountAmount = coupon?.maxDiscountAmount == null
    ? null
    : Math.max(0, parseNumber(coupon.maxDiscountAmount))

  let discount = 0

  switch (coupon?.discountType) {
    case 'percent':
      discount = effectivePrice * (amount / 100)
      break
    case 'fixed_cart':
    case 'fixed_course':
      discount = amount
      break
    default:
      discount = 0
  }

  if (maxDiscountAmount !== null) {
    discount = Math.min(discount, maxDiscountAmount)
  }

  return Math.max(0, Math.min(discount, effectivePrice))
}

export async function refreshCouponUsageStats(payload: Payload, couponId: string | number): Promise<void> {
  const [redemptionCount, latestRedemption] = await Promise.all([
    payload.find({
      collection: 'coupon-redemptions',
      where: {
        and: [
          {
            coupon: {
              equals: couponId,
            },
          },
          {
            status: {
              equals: 'applied',
            },
          },
        ],
      },
      depth: 0,
      limit: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'coupon-redemptions',
      where: {
        and: [
          {
            coupon: {
              equals: couponId,
            },
          },
          {
            status: {
              equals: 'applied',
            },
          },
        ],
      },
      depth: 0,
      limit: 1,
      sort: '-appliedAt',
      overrideAccess: true,
    }),
  ])

  const latestAppliedAt = latestRedemption.docs[0]?.appliedAt || null

  await payload.update({
    collection: 'coupon-codes',
    id: couponId,
    data: {
      usageCount: redemptionCount.totalDocs,
      lastUsedAt: latestAppliedAt,
    },
    depth: 0,
    overrideAccess: true,
  })
}

export async function validateCouponForEnrollment({
  payload,
  code,
  course,
  traineeId,
  userId,
  userEmail,
  subtotal,
  now = new Date(),
}: ValidateCouponInput): Promise<CouponValidationResult> {
  const normalizedCode = normalizeCouponCode(code)

  if (!normalizedCode) {
    return {
      valid: false,
      normalizedCode,
      reason: 'Coupon code is required.',
    }
  }

  const coupons = await payload.find({
    collection: 'coupon-codes',
    where: {
      code: {
        equals: normalizedCode,
      },
    },
    depth: 2,
    limit: 1,
    overrideAccess: true,
  })

  const coupon = coupons.docs[0]

  if (!coupon) {
    return {
      valid: false,
      normalizedCode,
      reason: 'Coupon code was not found.',
    }
  }

  if (coupon.status !== 'active') {
    return {
      valid: false,
      normalizedCode,
      reason: 'Coupon code is not active.',
    }
  }

  if (coupon.startsAt && new Date(coupon.startsAt) > now) {
    return {
      valid: false,
      normalizedCode,
      reason: 'Coupon code is not active yet.',
    }
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
    return {
      valid: false,
      normalizedCode,
      reason: 'Coupon code has already expired.',
    }
  }

  const allowedEmails = Array.isArray(coupon.allowedEmails)
    ? coupon.allowedEmails
      .map((entry: any) => String(entry?.email || '').trim().toLowerCase())
      .filter(Boolean)
    : []

  if (allowedEmails.length > 0) {
    const normalizedEmail = String(userEmail || '').trim().toLowerCase()
    if (!normalizedEmail || !allowedEmails.includes(normalizedEmail)) {
      return {
        valid: false,
        normalizedCode,
        reason: 'Coupon code is not available for this email address.',
      }
    }
  }

  const allowedTraineeIds = getRelationIds(coupon.allowedTrainees)
  if (allowedTraineeIds.length > 0) {
    const normalizedTraineeId = traineeId == null ? '' : String(traineeId)
    if (!normalizedTraineeId || !allowedTraineeIds.includes(normalizedTraineeId)) {
      return {
        valid: false,
        normalizedCode,
        reason: 'Coupon code is not available for this trainee.',
      }
    }
  }

  if (!couponTargetsCourse(coupon, course)) {
    return {
      valid: false,
      normalizedCode,
      reason: 'Coupon code does not apply to this course.',
    }
  }

  const originalPrice = getCourseOriginalPrice(course)
  const courseSalePrice = getCourseSalePrice(course)
  const effectivePrice = subtotal == null ? getEffectiveCoursePrice(course) : Math.max(0, subtotal)

  const minimumAmount = coupon.minimumAmount == null ? null : Math.max(0, parseNumber(coupon.minimumAmount))
  const maximumAmount = coupon.maximumAmount == null ? null : Math.max(0, parseNumber(coupon.maximumAmount))

  if (minimumAmount !== null && effectivePrice < minimumAmount) {
    return {
      valid: false,
      normalizedCode,
      reason: `Coupon code requires a minimum amount of ${minimumAmount.toFixed(2)}.`,
    }
  }

  if (maximumAmount !== null && effectivePrice > maximumAmount) {
    return {
      valid: false,
      normalizedCode,
      reason: `Coupon code exceeds the maximum allowed amount of ${maximumAmount.toFixed(2)}.`,
    }
  }

  const { totalUsageCount, userUsageCount } = await getCouponUsageStats(payload, coupon.id, traineeId, userId)

  if (coupon.usageLimitTotal != null && totalUsageCount >= parseNumber(coupon.usageLimitTotal)) {
    return {
      valid: false,
      normalizedCode,
      reason: 'Coupon code has reached its total usage limit.',
    }
  }

  if (coupon.usageLimitPerUser != null && userUsageCount >= parseNumber(coupon.usageLimitPerUser)) {
    return {
      valid: false,
      normalizedCode,
      reason: 'Coupon code has reached its usage limit for this user.',
    }
  }

  const couponDiscount = computeCouponDiscount(coupon, effectivePrice)

  return {
    valid: true,
    coupon,
    normalizedCode,
    pricing: {
      originalPrice,
      courseSalePrice,
      effectivePrice,
      couponDiscount,
      finalPrice: Math.max(0, effectivePrice - couponDiscount),
      discountType: coupon.discountType,
      discountValue: Math.max(0, parseNumber(coupon.amount)),
      maxDiscountAmount: coupon.maxDiscountAmount == null ? null : Math.max(0, parseNumber(coupon.maxDiscountAmount)),
    },
  }
}
