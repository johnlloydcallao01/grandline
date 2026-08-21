'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, BookOpen, CheckCircle, Clock, Eye, User } from '@/components/ui/IconWrapper'
import { getEnrollment } from '../actions'
import type { EnrollmentDoc } from '@encreasl/cms-types'

function formatDate(value?: string | null): string {
  if (!value) return 'N/A'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
}

function display(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'N/A'
  return String(value)
}

function relationshipId(value: unknown): string {
  if (value && typeof value === 'object' && 'id' in value) return String(value.id)
  return display(value)
}

function statusClass(status: string): string {
  if (status === 'active' || status === 'completed') return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  if (status === 'pending') return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
  if (status === 'dropped' || status === 'suspended') return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
}

function DetailItem({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="mt-1 break-words text-sm text-gray-900 dark:text-gray-100">{display(value)}</dd>
    </div>
  )
}

function EnrollmentDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-4 w-36 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-8 w-64 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="h-8 w-24 rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4].map((card) => (
          <div key={card} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
            <div className="mb-5 h-5 w-40 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="grid gap-5 sm:grid-cols-2">
              {[1, 2, 3, 4].map((field) => <div key={field} className="space-y-2"><div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-800" /><div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800" /></div>)}
            </div>
          </div>
        ))}
      </div>
      <div className="h-32 rounded-xl border border-gray-200 bg-white dark:border-[var(--card-border)] dark:bg-[var(--card-background)]" />
    </div>
  )
}

export default function EnrollmentViewPage() {
  const params = useParams<{ id: string }>()
  const enrollmentId = Array.isArray(params.id) ? params.id[0] : params.id
  const [enrollment, setEnrollment] = useState<EnrollmentDoc | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enrollmentId) return
    void getEnrollment(enrollmentId)
      .then(setEnrollment)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Failed to load enrollment'))
      .finally(() => setIsLoading(false))
  }, [enrollmentId])

  if (isLoading) {
    return <EnrollmentDetailSkeleton />
  }

  if (error || !enrollment) {
    return (
      <div className="py-10">
        <Link href="/enrollments/assign-unassign" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
          <ArrowLeft className="h-4 w-4" /> Back to enrollments
        </Link>
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">{error || 'Enrollment not found'}</div>
      </div>
    )
  }

  const student = enrollment.student && typeof enrollment.student === 'object' ? enrollment.student : null
  const course = enrollment.course && typeof enrollment.course === 'object' ? enrollment.course : null
  const enrolledBy = enrollment.enrolledBy && typeof enrollment.enrolledBy === 'object' ? enrollment.enrolledBy : null
  const coupon = enrollment.coupon && typeof enrollment.coupon === 'object' ? enrollment.coupon : null

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/enrollments/assign-unassign" className="mb-3 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
            <ArrowLeft className="h-4 w-4" /> Back to enrollments
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30"><Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Enrollment Details</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Enrollment #{enrollment.id}</p>
            </div>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-sm font-medium ${statusClass(enrollment.status)}`}>{enrollment.status}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100"><User className="h-4 w-4 text-blue-600" /> Student</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Name" value={student ? `${student.user.firstName} ${student.user.lastName}`.trim() : relationshipId(enrollment.student)} />
            <DetailItem label="Email" value={student?.user.email} />
            <DetailItem label="SRN" value={student?.srn} />
            <DetailItem label="Student ID" value={relationshipId(enrollment.student)} />
          </dl>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100"><BookOpen className="h-4 w-4 text-blue-600" /> Course</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Title" value={course?.title} />
            <DetailItem label="Course code" value={course?.courseCode} />
            <DetailItem label="Course ID" value={relationshipId(enrollment.course)} />
            <DetailItem label="Enrollment type" value={enrollment.enrollmentType} />
          </dl>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100"><CheckCircle className="h-4 w-4 text-blue-600" /> Enrollment and progress</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Enrolled at" value={formatDate(enrollment.enrolledAt)} />
            <DetailItem label="Access expires" value={formatDate(enrollment.accessExpiresAt)} />
            <DetailItem label="Payment status" value={enrollment.paymentStatus} />
            <DetailItem label="Progress" value={`${enrollment.progressPercentage || 0}%`} />
            <DetailItem label="Last accessed" value={formatDate(enrollment.lastAccessedAt)} />
            <DetailItem label="Completed at" value={formatDate(enrollment.completedAt)} />
            <DetailItem label="Current grade" value={enrollment.currentGrade} />
            <DetailItem label="Final grade" value={enrollment.finalGrade} />
            <DetailItem label="Final evaluation" value={enrollment.finalEvaluation} />
            <DetailItem label="Certificate issued" value={enrollment.certificateIssued ? 'Yes' : 'No'} />
          </dl>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100"><Clock className="h-4 w-4 text-blue-600" /> Payment and administration</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Amount paid" value={enrollment.amountPaid} />
            <DetailItem label="List price" value={enrollment.listPriceSnapshot} />
            <DetailItem label="Final price" value={enrollment.finalPriceSnapshot} />
            <DetailItem label="Coupon code" value={enrollment.couponCode || coupon?.code} />
            <DetailItem label="Discount" value={enrollment.couponDiscountAmount} />
            <DetailItem label="Enrolled by" value={enrolledBy ? `${enrolledBy.firstName || ''} ${enrolledBy.lastName || ''}`.trim() || enrolledBy.email : relationshipId(enrollment.enrolledBy)} />
            <DetailItem label="Archived" value={enrollment.isArchived ? 'Yes' : 'No'} />
            <DetailItem label="Notes" value={enrollment.notes} />
          </dl>
        </section>
      </div>

      {(enrollment.pricingBreakdown || enrollment.metadata) && (
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
          <h2 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Additional data</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            {enrollment.pricingBreakdown && <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 text-xs text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">{JSON.stringify(enrollment.pricingBreakdown, null, 2)}</pre>}
            {enrollment.metadata && <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 text-xs text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">{JSON.stringify(enrollment.metadata, null, 2)}</pre>}
          </div>
        </section>
      )}
    </div>
  )
}
