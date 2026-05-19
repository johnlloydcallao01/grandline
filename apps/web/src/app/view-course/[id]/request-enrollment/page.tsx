'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useAuth'
import type { CourseWithInstructor, Media } from '@/types/course'
import { getTraineeRecord } from '@/app/actions/user'

type CourseResponse = CourseWithInstructor & {
  enrollmentStatus?: string | null
}

type CouponValidationResponse = {
  valid: boolean
  normalizedCode: string
  reason?: string
  pricing?: {
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

function getImageUrl(media: Media | null | undefined): string | null {
  if (!media) return null
  return media.cloudinaryURL || media.url || media.thumbnailURL || null
}

function formatPrice(price: number | null | undefined): string {
  if (price == null || Number.isNaN(price)) return 'Free'
  if (price === 0) return 'Free'

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(price)
}

function formatEnrollmentStatus(status: string | null): string {
  if (!status) return ''

  switch (status) {
    case 'active':
      return 'You are already actively enrolled in this course.'
    case 'pending':
      return 'Your enrollment request or enrollment for this course is currently pending.'
    case 'suspended':
      return 'Your access to this course is currently suspended.'
    case 'completed':
      return 'You have already completed this course.'
    case 'dropped':
      return 'You can submit a new enrollment request for this dropped course.'
    case 'expired':
      return 'You can submit a new enrollment request for this expired course.'
    default:
      return `Current enrollment status: ${status}.`
  }
}

export default function RequestEnrollmentPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated, isLoading: isAuthLoading } = useUser()
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string)

  const [course, setCourse] = useState<CourseResponse | null>(null)
  const [isLoadingCourse, setIsLoadingCourse] = useState(true)
  const [courseError, setCourseError] = useState<string | null>(null)
  const [traineeId, setTraineeId] = useState<number | null>(null)
  const [shouldApplyCoupon, setShouldApplyCoupon] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResponse | null>(null)
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const [requestMessage, setRequestMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [requestCompleted, setRequestCompleted] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
  }, [])

  useEffect(() => {
    if (!id) return

    let active = true

    const fetchCourse = async () => {
      try {
        setIsLoadingCourse(true)
        setCourseError(null)

        const query = new URLSearchParams()
        if (user?.id) {
          query.set('userId', String(user.id))
        }

        const url = query.toString()
          ? `/api/courses/${id}?${query.toString()}`
          : `/api/courses/${id}`

        const response = await fetch(url, {
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Failed to load course')
        }

        const data = await response.json() as CourseResponse

        if (active) {
          setCourse(data)
        }
      } catch (_error) {
        if (active) {
          setCourse(null)
          setCourseError('We could not load this course right now.')
        }
      } finally {
        if (active) {
          setIsLoadingCourse(false)
        }
      }
    }

    fetchCourse()

    return () => {
      active = false
    }
  }, [id, user?.id])

  useEffect(() => {
    if (!user?.id) {
      setTraineeId(null)
      return
    }

    let active = true

    const fetchTrainee = async () => {
      const traineeRes = await getTraineeRecord(user.id)
      if (!active || !traineeRes.success || !traineeRes.trainee) return

      const nextTraineeId = Number(traineeRes.trainee.id)
      setTraineeId(Number.isFinite(nextTraineeId) ? nextTraineeId : null)

      const savedCouponCode = typeof traineeRes.trainee.couponCode === 'string'
        ? traineeRes.trainee.couponCode.trim().toUpperCase()
        : ''

      if (savedCouponCode) {
        setCouponCode((prev) => prev || savedCouponCode)
      }
    }

    fetchTrainee()

    return () => {
      active = false
    }
  }, [user?.id])

  const normalizedEnrollmentStatus = course?.enrollmentStatus
    ? String(course.enrollmentStatus).toLowerCase().trim()
    : null

  const canRequestEnrollment = !normalizedEnrollmentStatus ||
    normalizedEnrollmentStatus === 'dropped' ||
    normalizedEnrollmentStatus === 'expired'

  const imageUrl = getImageUrl(course?.thumbnail)
  const originalPrice = typeof course?.price === 'number' ? course.price : 0
  const currentCoursePrice = useMemo(() => {
    if (typeof course?.discountedPrice === 'number' && course.discountedPrice >= 0) {
      return course.discountedPrice
    }

    if (typeof course?.price === 'number') {
      return course.price
    }

    return 0
  }, [course?.discountedPrice, course?.price])

  const estimatedDiscount = appliedCoupon?.valid ? appliedCoupon.pricing?.couponDiscount ?? 0 : 0
  const estimatedTotal = appliedCoupon?.valid ? appliedCoupon.pricing?.finalPrice ?? currentCoursePrice : currentCoursePrice

  const getCouponHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('grandline_auth_token_trainee')
      if (token) {
        headers.Authorization = `users JWT ${token}`
      }
    }

    return headers
  }

  const validateCoupon = async (codeOverride?: string): Promise<CouponValidationResponse | null> => {
    if (!course?.id || !user?.id) {
      return null
    }

    if (!shouldApplyCoupon) {
      setAppliedCoupon(null)
      setCouponMessage(null)
      return null
    }

    const normalizedCode = (codeOverride ?? couponCode).trim().toUpperCase()
    if (!normalizedCode) {
      setAppliedCoupon(null)
      setCouponMessage(null)
      return null
    }

    setIsApplyingCoupon(true)
    setCouponMessage(null)

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api'
      const response = await fetch(`${apiBase}/lms/coupons/validate`, {
        method: 'POST',
        headers: getCouponHeaders(),
        body: JSON.stringify({
          code: normalizedCode,
          courseId: course.id,
          traineeId,
          userId: user.id,
          email: user.email,
          subtotal: currentCoursePrice,
        }),
      })

      const data = await response.json() as CouponValidationResponse

      if (!response.ok || !data.valid) {
        setAppliedCoupon(null)
        setCouponMessage({
          type: 'error',
          text: data.reason || 'Coupon code could not be applied.',
        })
        return null
      }

      setCouponCode(data.normalizedCode)
      setAppliedCoupon(data)
      setCouponMessage({
        type: 'success',
        text: `Coupon ${data.normalizedCode} applied successfully.`,
      })
      return data
    } catch (_error) {
      setAppliedCoupon(null)
      setCouponMessage({
        type: 'error',
        text: 'We could not validate that coupon code right now.',
      })
      return null
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const handleApplyCoupon = async () => {
    await validateCoupon()
  }

  const handleSubmitRequest = async () => {
    if (!course?.id || !user?.id || isSubmittingRequest || !canRequestEnrollment) return

    const normalizedCoupon = shouldApplyCoupon ? couponCode.trim().toUpperCase() : ''
    setIsSubmittingRequest(true)
    setRequestMessage(null)

    try {
      if (normalizedCoupon) {
        const validationResult = await validateCoupon(normalizedCoupon)
        if (!validationResult?.valid) {
          setRequestMessage({
            type: 'error',
            text: 'Please fix the coupon code before sending the enrollment request.',
          })
          return
        }
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api'
      const response = await fetch(`${apiBase}/lms/enrollment-requests`, {
        method: 'POST',
        headers: getCouponHeaders(),
        body: JSON.stringify({
          userId: user.id,
          courseId: course.id,
          couponCode: normalizedCoupon || undefined,
        }),
      })

      const data = await response.json().catch(() => ({} as { error?: string }))

      if (!response.ok) {
        throw new Error(data.error || 'We could not submit your enrollment request.')
      }

      setRequestCompleted(true)
      setRequestMessage({
        type: 'success',
        text: 'Your enrollment request has been sent successfully. Our team will review it and contact you shortly via email.',
      })
    } catch (error) {
      setRequestMessage({
        type: 'error',
        text: error instanceof Error
          ? error.message
          : 'Something went wrong while sending your enrollment request.',
      })
    } finally {
      setIsSubmittingRequest(false)
    }
  }

  if (isAuthLoading || isLoadingCourse) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <div className="w-full px-[10px] py-8">
          <div className="h-8 w-52 rounded bg-gray-200 dark:bg-gray-700 animate-pulse mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6">
              <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-700 animate-pulse mb-4" />
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="h-4 w-3/5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6">
              <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700 animate-pulse mb-4" />
              <div className="h-36 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <div className="w-full px-[10px] py-12">
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-8 shadow-sm">
            <p className="text-sm text-[#201a7c] dark:text-[#5c54e0] font-semibold mb-2">Enrollment Request</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Login Required
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You need to log in first before you can continue to the enrollment request page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/login?redirect=/view-course/${id}/request-enrollment` as any}
                className="inline-flex items-center justify-center rounded-xl bg-[#201a7c] px-5 py-3 text-white font-semibold hover:bg-[#1a1563] dark:bg-[#3028a3] dark:hover:bg-[#3b32c4] transition-colors"
              >
                Log In
              </Link>
              <Link
                href={`/register?redirect=/view-course/${id}/request-enrollment` as any}
                className="inline-flex items-center justify-center rounded-xl border border-[var(--card-border)] px-5 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (courseError || !course) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <div className="w-full px-[10px] py-12">
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Course Not Available
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {courseError || 'We could not load this course right now.'}
            </p>
            <button
              type="button"
              onClick={() => router.push(`/view-course/${id}`)}
              className="inline-flex items-center justify-center rounded-xl bg-[#201a7c] px-5 py-3 text-white font-semibold hover:bg-[#1a1563] dark:bg-[#3028a3] dark:hover:bg-[#3b32c4] transition-colors"
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (requestCompleted) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <div className="w-full px-[10px] py-12">
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-8 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-5">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-[#201a7c] dark:text-[#5c54e0] font-semibold mb-2">Enrollment Request</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Request Sent
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {requestMessage?.text}
            </p>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4 mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Requested course</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{course.title}</p>
              {couponCode.trim() ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Coupon code submitted: <span className="font-semibold text-gray-900 dark:text-gray-100">{couponCode.trim().toUpperCase()}</span>
                </p>
              ) : null}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/view-course/${course.id}` as any}
                className="inline-flex items-center justify-center rounded-xl bg-[#201a7c] px-5 py-3 text-white font-semibold hover:bg-[#1a1563] dark:bg-[#3028a3] dark:hover:bg-[#3b32c4] transition-colors"
              >
                Back to Course
              </Link>
              <Link
                href="/portal/courses"
                className="inline-flex items-center justify-center rounded-xl border border-[var(--card-border)] px-5 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Go to My Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="w-full px-[10px] py-8">
        <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
          <Link
            href={`/view-course/${course.id}` as any}
            className="text-gray-600 dark:text-gray-400 hover:text-[#201a7c] dark:hover:text-[#5c54e0] transition-colors"
          >
            View Course
          </Link>
          <span className="text-gray-400 dark:text-gray-500">/</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">Enrollment Request</span>
        </div>

        <div className="mb-8">
          <p className="text-sm font-semibold text-[#201a7c] dark:text-[#5c54e0] mb-2">Checkout-Style Enrollment Request</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Request Enrollment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
            Review your requested course, optionally apply a coupon code, and submit your enrollment request.
            No payment is collected on this page.
          </p>
        </div>

        {!canRequestEnrollment && (
          <div className="mb-6 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20 p-4">
            <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Enrollment status already exists</p>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              {formatEnrollmentStatus(normalizedEnrollmentStatus)}
            </p>
          </div>
        )}

        {requestMessage && requestMessage.type === 'error' && (
          <div className="mb-6 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300">
            {requestMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
          <div className="space-y-6">
            <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Course Details
              </h2>

              <div className="flex flex-col md:flex-row gap-5">
                <div className="relative h-48 md:h-40 md:w-64 flex-shrink-0 overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--background)]">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={course.thumbnail?.alt || `${course.title} thumbnail`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                      No image available
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {course.title}
                  </h3>
                  {course.excerpt ? (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {course.excerpt}
                    </p>
                  ) : null}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="block text-gray-500 dark:text-gray-500">Instructor</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {course.instructor?.user
                          ? `${course.instructor.user.firstName} ${course.instructor.user.lastName}`
                          : 'To be assigned'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-500 dark:text-gray-500">Category</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {course.category?.map((item) => item.name).join(', ') || 'General'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Trainee Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">Full name</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">Email address</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 break-all">
                    {user.email}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Coupon Code
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Enter a coupon code if you want it included and validated in your enrollment request.
                  </p>
                </div>
              </div>

              <label className="mb-4 flex items-start gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shouldApplyCoupon}
                  onChange={(event) => {
                    const checked = event.target.checked
                    setShouldApplyCoupon(checked)
                    setAppliedCoupon(null)
                    setCouponMessage(null)
                    setRequestMessage(null)
                  }}
                  className="mt-1 h-4 w-4 rounded border-[var(--card-border)] text-[#201a7c] focus:ring-[#201a7c]"
                />
                <span>
                  <span className="block font-medium text-gray-900 dark:text-gray-100">
                    Apply coupon code
                  </span>
                  <span className="block text-sm text-gray-600 dark:text-gray-400">
                    This is unchecked by default. Your coupon code is only included and validated when this box is checked.
                  </span>
                </span>
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(event) => {
                    setCouponCode(event.target.value.toUpperCase())
                    setAppliedCoupon(null)
                    setCouponMessage(null)
                    setRequestMessage(null)
                  }}
                  placeholder="Enter coupon code"
                  disabled={!shouldApplyCoupon}
                  className="flex-1 rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={!shouldApplyCoupon || isApplyingCoupon || !couponCode.trim()}
                  className="inline-flex items-center justify-center rounded-xl border border-[#201a7c] px-5 py-3 font-semibold text-[#201a7c] hover:bg-[#201a7c] hover:text-white disabled:opacity-60 disabled:cursor-not-allowed dark:border-[#5c54e0] dark:text-[#5c54e0] dark:hover:bg-[#3028a3] dark:hover:text-white transition-colors"
                >
                  {isApplyingCoupon ? 'Applying...' : 'Apply Coupon'}
                </button>
              </div>

              {shouldApplyCoupon && couponMessage && (
                <div
                  className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                    couponMessage.type === 'success'
                      ? 'border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  }`}
                >
                  {couponMessage.text}
                </div>
              )}

              {shouldApplyCoupon && appliedCoupon?.valid && appliedCoupon.pricing && (
                <div className="mt-4 rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Applied coupon summary
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="block text-gray-500 dark:text-gray-500">Current course price</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatPrice(appliedCoupon.pricing.effectivePrice)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-500 dark:text-gray-500">Coupon discount</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        -{formatPrice(appliedCoupon.pricing.couponDiscount)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-500 dark:text-gray-500">Estimated final price</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatPrice(appliedCoupon.pricing.finalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-20 h-fit">
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Enrollment Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400">Original price</span>
                  <span className="text-gray-900 dark:text-gray-100">{formatPrice(originalPrice)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400">Current course price</span>
                  <span className="text-gray-900 dark:text-gray-100">{formatPrice(currentCoursePrice)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400">Coupon discount</span>
                  <span className="text-green-600 dark:text-green-400">
                    {estimatedDiscount > 0 ? `-${formatPrice(estimatedDiscount)}` : formatPrice(0)}
                  </span>
                </div>
                <div className="border-t border-[var(--card-border)] pt-3 flex items-center justify-between gap-4">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Estimated final price</span>
                  <span className="text-xl font-bold text-[#201a7c] dark:text-[#5c54e0]">
                    {formatPrice(estimatedTotal)}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
                This page only sends an enrollment request. No payment method is collected and no payment is charged here.
              </p>

              <button
                type="button"
                onClick={handleSubmitRequest}
                disabled={isSubmittingRequest || !canRequestEnrollment}
                className="mt-6 w-full rounded-xl bg-[#201a7c] px-5 py-3 text-white font-semibold hover:bg-[#1a1563] disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-[#3028a3] dark:hover:bg-[#3b32c4] dark:disabled:bg-gray-700 transition-colors"
              >
                {isSubmittingRequest ? 'Sending Request...' : 'Request Enrollment'}
              </button>

              <Link
                href={`/view-course/${course.id}` as any}
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-[var(--card-border)] px-5 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Back to Course
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
