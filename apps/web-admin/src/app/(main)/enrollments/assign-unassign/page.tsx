'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import {
  Search, Plus, Loader2, X, Trash2, AlertTriangle,
  CheckCircle, Clock, User, BookOpen, Users, Download, Edit, Eye,
} from '@/components/ui/IconWrapper'
import {
  getEnrollments,
  searchCourses,
  searchTrainees,
  searchEnrollmentCoupons,
  searchEnrollmentUsers,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  archiveEnrollment,
} from './actions'
import type {
  CreateEnrollmentInput,
  EnrollmentCouponOption,
  EnrollmentDoc,
  CourseOption,
  TraineeOption,
  EnrollmentCounts,
  EnrollmentUserOption,
} from '@encreasl/cms-types'

type SortKey = 'student' | 'course' | 'status' | 'enrolledAt' | 'progressPercentage'

const STATUS_CHIPS = ['active', 'pending', 'completed', 'suspended', 'dropped', 'expired'] as const
const STATUS_OPTIONS = ['active', 'pending', 'completed', 'suspended', 'dropped', 'expired'] as const
const ENROLLMENT_TYPES = [
  ['free', 'Free'],
  ['paid', 'Paid'],
  ['scholarship', 'Scholarship'],
  ['trial', 'Trial'],
  ['corporate', 'Corporate'],
] as const
const PAYMENT_STATUSES = [
  ['completed', 'Completed'],
  ['pending', 'Pending'],
  ['failed', 'Failed'],
  ['refunded', 'Refunded'],
  ['not_required', 'Not Required'],
] as const

type EnrollmentFormState = {
  enrolledAt: string
  enrollmentType: string
  status: string
  paymentStatus: string
  accessExpiresAt: string
  amountPaid: string
  couponCode: string
  couponDiscountAmount: string
  listPriceSnapshot: string
  finalPriceSnapshot: string
  pricingBreakdown: string
  progressPercentage: string
  lastAccessedAt: string
  completedAt: string
  currentGrade: string
  finalGrade: string
  finalEvaluation: string
  certificateIssued: boolean
  notes: string
  isArchived: boolean
  metadata: string
  couponId: string
  enrolledById: string
}

function toDateTimeLocal(value?: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16)
}

function initialEnrollmentForm(): EnrollmentFormState {
  return {
    enrolledAt: toDateTimeLocal(new Date().toISOString()),
    enrollmentType: 'free',
    status: 'active',
    paymentStatus: 'not_required',
    accessExpiresAt: '',
    amountPaid: '',
    couponCode: '',
    couponDiscountAmount: '0',
    listPriceSnapshot: '',
    finalPriceSnapshot: '',
    pricingBreakdown: '',
    progressPercentage: '0',
    lastAccessedAt: '',
    completedAt: '',
    currentGrade: '',
    finalGrade: '',
    finalEvaluation: '',
    certificateIssued: false,
    notes: '',
    isArchived: false,
    metadata: '',
    couponId: '',
    enrolledById: '',
  }
}

function enrollmentFormFromDoc(doc: EnrollmentDoc): EnrollmentFormState {
  const form = initialEnrollmentForm()
  return {
    ...form,
    enrolledAt: toDateTimeLocal(doc.enrolledAt),
    enrollmentType: doc.enrollmentType || 'free',
    status: doc.status || 'active',
    paymentStatus: doc.paymentStatus || 'not_required',
    accessExpiresAt: toDateTimeLocal(doc.accessExpiresAt),
    amountPaid: doc.amountPaid == null ? '' : String(doc.amountPaid),
    couponCode: doc.couponCode || '',
    couponDiscountAmount: doc.couponDiscountAmount == null ? '' : String(doc.couponDiscountAmount),
    listPriceSnapshot: doc.listPriceSnapshot == null ? '' : String(doc.listPriceSnapshot),
    finalPriceSnapshot: doc.finalPriceSnapshot == null ? '' : String(doc.finalPriceSnapshot),
    pricingBreakdown: doc.pricingBreakdown ? JSON.stringify(doc.pricingBreakdown, null, 2) : '',
    progressPercentage: doc.progressPercentage == null ? '0' : String(doc.progressPercentage),
    lastAccessedAt: toDateTimeLocal(doc.lastAccessedAt),
    completedAt: toDateTimeLocal(doc.completedAt),
    currentGrade: doc.currentGrade == null ? '' : String(doc.currentGrade),
    finalGrade: doc.finalGrade == null ? '' : String(doc.finalGrade),
    finalEvaluation: doc.finalEvaluation || '',
    certificateIssued: Boolean(doc.certificateIssued),
    notes: doc.notes || '',
    isArchived: Boolean(doc.isArchived),
    metadata: doc.metadata ? JSON.stringify(doc.metadata, null, 2) : '',
    couponId: doc.coupon && typeof doc.coupon === 'object' ? String(doc.coupon.id) : doc.coupon ? String(doc.coupon) : '',
    enrolledById: doc.enrolledBy && typeof doc.enrolledBy === 'object' ? String(doc.enrolledBy.id) : doc.enrolledBy ? String(doc.enrolledBy) : '',
  }
}

function parseOptionalNumber(value: string, field: string, allowNull: boolean): number | null | undefined {
  if (!value.trim()) return allowNull ? null : undefined
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) throw new Error(`${field} must be a valid number`)
  return parsed
}

function parseOptionalJson(value: string, field: string, allowNull: boolean): unknown {
  if (!value.trim()) return allowNull ? null : undefined
  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    throw new Error(`${field} must contain valid JSON`)
  }
  return parsed
}

function buildEnrollmentInput(form: EnrollmentFormState, allowNulls = false): Omit<CreateEnrollmentInput, 'student' | 'course'> {
  const toDate = (value: string) => value ? new Date(value).toISOString() : (allowNulls ? null : undefined)
  const input: Omit<CreateEnrollmentInput, 'student' | 'course'> = {
    enrolledAt: toDate(form.enrolledAt) || undefined,
    enrollmentType: form.enrollmentType as CreateEnrollmentInput['enrollmentType'],
    status: form.status as CreateEnrollmentInput['status'],
    paymentStatus: form.paymentStatus as CreateEnrollmentInput['paymentStatus'],
    accessExpiresAt: toDate(form.accessExpiresAt),
    amountPaid: parseOptionalNumber(form.amountPaid, 'Amount paid', allowNulls),
    couponCode: form.couponCode.trim() || (allowNulls ? null : undefined),
    couponDiscountAmount: parseOptionalNumber(form.couponDiscountAmount, 'Coupon discount amount', allowNulls),
    listPriceSnapshot: parseOptionalNumber(form.listPriceSnapshot, 'List price snapshot', allowNulls),
    finalPriceSnapshot: parseOptionalNumber(form.finalPriceSnapshot, 'Final price snapshot', allowNulls),
    pricingBreakdown: parseOptionalJson(form.pricingBreakdown, 'Pricing breakdown', allowNulls),
    progressPercentage: parseOptionalNumber(form.progressPercentage, 'Progress percentage', allowNulls),
    lastAccessedAt: toDate(form.lastAccessedAt),
    completedAt: toDate(form.completedAt),
    currentGrade: parseOptionalNumber(form.currentGrade, 'Current grade', allowNulls),
    finalGrade: parseOptionalNumber(form.finalGrade, 'Final grade', allowNulls),
    finalEvaluation: (form.finalEvaluation || (allowNulls ? null : undefined)) as CreateEnrollmentInput['finalEvaluation'],
    certificateIssued: form.certificateIssued,
    enrolledBy: form.enrolledById || (allowNulls ? null : undefined),
    notes: form.notes || (allowNulls ? null : undefined),
    isArchived: form.isArchived,
    metadata: parseOptionalJson(form.metadata, 'Metadata', allowNulls),
  }
  if (form.couponId || allowNulls) input.coupon = form.couponId || null
  return input
}

const FORM_INPUT = 'w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400/20 outline-none bg-white dark:bg-[var(--card-background)]'
const FORM_SELECT = `${FORM_INPUT} appearance-none pr-9`

type EnrollmentDetailFieldsProps = {
  form: EnrollmentFormState
  setForm: React.Dispatch<React.SetStateAction<EnrollmentFormState>>
  selectedCoupon: EnrollmentCouponOption | null
  couponSearch: string
  couponResults: EnrollmentCouponOption[]
  isSearchingCoupons: boolean
  onCouponSearch: (value: string) => void
  onSelectCoupon: (coupon: EnrollmentCouponOption) => void
  onClearCoupon: () => void
  selectedEnrolledBy: EnrollmentUserOption | null
  enrolledBySearch: string
  enrolledByResults: EnrollmentUserOption[]
  isSearchingEnrolledBy: boolean
  onEnrolledBySearch: (value: string) => void
  onSelectEnrolledBy: (user: EnrollmentUserOption) => void
  onClearEnrolledBy: () => void
}

function EnrollmentDetailFields({
  form,
  setForm,
  selectedCoupon,
  couponSearch,
  couponResults,
  isSearchingCoupons,
  onCouponSearch,
  onSelectCoupon,
  onClearCoupon,
  selectedEnrolledBy,
  enrolledBySearch,
  enrolledByResults,
  isSearchingEnrolledBy,
  onEnrolledBySearch,
  onSelectEnrolledBy,
  onClearEnrolledBy,
}: EnrollmentDetailFieldsProps) {
  const setField = <K extends keyof EnrollmentFormState>(field: K, value: EnrollmentFormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <>
      <div className="border-t border-gray-200 dark:border-[var(--card-border)] pt-5">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Enrollment Details</h4>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enrolled at
            <input type="datetime-local" value={form.enrolledAt} onChange={(e) => setField('enrolledAt', e.target.value)} className={`${FORM_INPUT} mt-1.5`} />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enrollment type
            <select value={form.enrollmentType} onChange={(e) => setField('enrollmentType', e.target.value)} className={`${FORM_SELECT} mt-1.5`}>
              {ENROLLMENT_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status
            <select value={form.status} onChange={(e) => setField('status', e.target.value)} className={`${FORM_SELECT} mt-1.5`}>
              {STATUS_OPTIONS.map((value) => <option key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment status
            <select value={form.paymentStatus} onChange={(e) => setField('paymentStatus', e.target.value)} className={`${FORM_SELECT} mt-1.5`}>
              {PAYMENT_STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Access expires at
            <input type="datetime-local" value={form.accessExpiresAt} onChange={(e) => setField('accessExpiresAt', e.target.value)} className={`${FORM_INPUT} mt-1.5`} />
          </label>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-[var(--card-border)] pt-5">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Payment & Pricing</h4>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount paid
            <input type="number" min="0" step="0.01" value={form.amountPaid} onChange={(e) => setField('amountPaid', e.target.value)} className={`${FORM_INPUT} mt-1.5`} placeholder="0.00" />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Coupon discount amount
            <input type="number" min="0" step="0.01" value={form.couponDiscountAmount} onChange={(e) => setField('couponDiscountAmount', e.target.value)} className={`${FORM_INPUT} mt-1.5`} placeholder="0.00" />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">List price snapshot
            <input type="number" min="0" step="0.01" value={form.listPriceSnapshot} onChange={(e) => setField('listPriceSnapshot', e.target.value)} className={`${FORM_INPUT} mt-1.5`} placeholder="0.00" />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Final price snapshot
            <input type="number" min="0" step="0.01" value={form.finalPriceSnapshot} onChange={(e) => setField('finalPriceSnapshot', e.target.value)} className={`${FORM_INPUT} mt-1.5`} placeholder="0.00" />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Coupon code snapshot
            <input type="text" value={form.couponCode} onChange={(e) => setField('couponCode', e.target.value)} className={`${FORM_INPUT} mt-1.5`} placeholder="e.g. SCHOLARSHIP2026" />
          </label>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Coupon relationship</label>
            {selectedCoupon ? (
              <div className="mt-1.5 flex items-center justify-between rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
                <span className="text-sm text-gray-900 dark:text-gray-100">{selectedCoupon.code}{selectedCoupon.name ? ` - ${selectedCoupon.name}` : ''}</span>
                <button type="button" onClick={onClearCoupon} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <div className="relative mt-1.5">
                <input type="text" value={couponSearch} onChange={(e) => onCouponSearch(e.target.value)} className={FORM_INPUT} placeholder="Search coupon code or name..." />
                {isSearchingCoupons && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400" />}
                {couponResults.length > 0 && <div className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
                  {couponResults.map((coupon) => <button key={coupon.id} type="button" onClick={() => onSelectCoupon(coupon)} className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"><span className="font-medium text-gray-900 dark:text-gray-100">{coupon.code}</span><span className="ml-2 text-xs text-gray-500">{coupon.name || coupon.status}</span></button>)}
                </div>}
              </div>
            )}
          </div>
        </div>
        <label className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300">Pricing breakdown JSON
          <textarea rows={4} value={form.pricingBreakdown} onChange={(e) => setField('pricingBreakdown', e.target.value)} className={`${FORM_INPUT} mt-1.5 font-mono text-xs`} placeholder={'{"currency":"PHP","originalPrice":0}'}/>
        </label>
      </div>

      <div className="border-t border-gray-200 dark:border-[var(--card-border)] pt-5">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Progress & Grading</h4>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Progress percentage
            <input type="number" min="0" max="100" step="0.01" value={form.progressPercentage} onChange={(e) => setField('progressPercentage', e.target.value)} className={`${FORM_INPUT} mt-1.5`} />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last accessed at
            <input type="datetime-local" value={form.lastAccessedAt} onChange={(e) => setField('lastAccessedAt', e.target.value)} className={`${FORM_INPUT} mt-1.5`} />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Completed at
            <input type="datetime-local" value={form.completedAt} onChange={(e) => setField('completedAt', e.target.value)} className={`${FORM_INPUT} mt-1.5`} />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current grade
            <input type="number" min="0" max="100" step="0.01" value={form.currentGrade} onChange={(e) => setField('currentGrade', e.target.value)} className={`${FORM_INPUT} mt-1.5`} />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Final grade
            <input type="number" min="0" max="100" step="0.01" value={form.finalGrade} onChange={(e) => setField('finalGrade', e.target.value)} className={`${FORM_INPUT} mt-1.5`} />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Final evaluation
            <select value={form.finalEvaluation} onChange={(e) => setField('finalEvaluation', e.target.value)} className={`${FORM_SELECT} mt-1.5`}>
              <option value="">Not evaluated</option><option value="passed">Passed</option><option value="failed">Failed</option>
            </select>
          </label>
        </div>
        <label className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"><input type="checkbox" checked={form.certificateIssued} onChange={(e) => setField('certificateIssued', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /> Certificate issued</label>
      </div>

      <div className="border-t border-gray-200 dark:border-[var(--card-border)] pt-5">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Administration</h4>
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enrolled by</label>
          {selectedEnrolledBy ? (
            <div className="mt-1.5 flex items-center justify-between rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
              <span className="text-sm text-gray-900 dark:text-gray-100">{selectedEnrolledBy.firstName} {selectedEnrolledBy.lastName} <span className="text-xs text-gray-500">({selectedEnrolledBy.email})</span></span>
              <button type="button" onClick={onClearEnrolledBy} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <div className="relative mt-1.5">
              <input type="text" value={enrolledBySearch} onChange={(e) => onEnrolledBySearch(e.target.value)} className={FORM_INPUT} placeholder="Search admin or instructor..." />
              {isSearchingEnrolledBy && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400" />}
              {enrolledByResults.length > 0 && <div className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
                 {enrolledByResults.map((user) => <button key={user.id} type="button" onClick={() => onSelectEnrolledBy(user)} className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"><span className="font-medium text-gray-900 dark:text-gray-100">{user.firstName} {user.lastName}</span><span className="ml-2 text-xs text-gray-500">{user.email} - {user.role}</span></button>)}
              </div>}
            </div>
          )}
        </div>
        <label className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300">Administrative notes
          <textarea rows={3} value={form.notes} onChange={(e) => setField('notes', e.target.value)} className={`${FORM_INPUT} mt-1.5 resize-none`} placeholder="Optional admin notes..." />
        </label>
        <label className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300">Metadata JSON
          <textarea rows={4} value={form.metadata} onChange={(e) => setField('metadata', e.target.value)} className={`${FORM_INPUT} mt-1.5 font-mono text-xs`} placeholder={'{"source":"admin"}'}/>
        </label>
        <label className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"><input type="checkbox" checked={form.isArchived} onChange={(e) => setField('isArchived', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /> Archive immediately</label>
      </div>
    </>
  )
}

function getStatusBadge(status: string) {
  const base = 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium'
  switch (status) {
    case 'active':
      return <span className={`${base} bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 ring-1 ring-inset ring-green-200 dark:ring-green-700/50`}><CheckCircle className="h-3 w-3" />Active</span>
    case 'completed':
      return <span className={`${base} bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-200 dark:ring-blue-700/50`}><CheckCircle className="h-3 w-3" />Completed</span>
    case 'pending':
      return <span className={`${base} bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-200 dark:ring-amber-700/50`}><Clock className="h-3 w-3" />Pending</span>
    case 'suspended':
      return <span className={`${base} bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 ring-1 ring-inset ring-orange-200 dark:ring-orange-700/50`}><AlertTriangle className="h-3 w-3" />Suspended</span>
    case 'dropped':
      return <span className={`${base} bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-1 ring-inset ring-red-200 dark:ring-red-700/50`}><X className="h-3 w-3" />Dropped</span>
    case 'expired':
      return <span className={`${base} bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-200 dark:ring-gray-700`}><Clock className="h-3 w-3" />Expired</span>
    default:
      return <span className={`${base} bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-200 dark:ring-gray-700`}>{status}</span>
  }
}

function getStatusRowAccent(status: string): string {
  switch (status) {
    case 'active': return 'border-l-green-500'
    case 'completed': return 'border-l-blue-500'
    case 'pending': return 'border-l-amber-500'
    case 'suspended': return 'border-l-orange-500'
    case 'dropped': return 'border-l-red-500'
    case 'expired': return 'border-l-gray-400'
    default: return 'border-l-transparent'
  }
}

function getProgressBarColor(pct: number): string {
  if (pct >= 100) return 'bg-green-500'
  if (pct > 0) return 'bg-blue-500 dark:bg-blue-400'
  return 'bg-gray-200 dark:bg-gray-700'
}

function getEnrollmentTypeTag(type: string): string | null {
  if (!type || type === 'free') return null
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '\u2014'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function downloadCSV(docs: EnrollmentDoc[]) {
  const header = ['Student Name', 'Email', 'Course', 'Type', 'Status', 'Enrolled', 'Progress']
  const rows = docs.map((d) => {
    const name = [d.student?.user?.firstName, d.student?.user?.lastName].filter(Boolean).join(' ') || '\u2014'
    const email = d.student?.user?.email || ''
    const course = d.course?.title || ''
    const type = d.enrollmentType || ''
    const status = d.status || ''
    const enrolled = d.enrolledAt ? formatDate(d.enrolledAt) : ''
    const progress = `${d.progressPercentage || 0}%`
    return [name, email, course, type, status, enrolled, progress]
  })

  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `course-enrollments-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function AssignUnassignPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentDoc[]>([])
  const [totalDocs, setTotalDocs] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [statusCounts, setStatusCounts] = useState<EnrollmentCounts | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Assign modal state
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [assignMounted, setAssignMounted] = useState(false)
  const [animateAssign, setAnimateAssign] = useState(false)
  const [traineeSearch, setTraineeSearch] = useState('')
  const [traineeResults, setTraineeResults] = useState<TraineeOption[]>([])
  const [isSearchingTrainees, setIsSearchingTrainees] = useState(false)
  const [selectedTrainee, setSelectedTrainee] = useState<TraineeOption | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(null)
  const [courseSearch, setCourseSearch] = useState('')
  const [courseResults, setCourseResults] = useState<CourseOption[]>([])
  const [isSearchingCourses, setIsSearchingCourses] = useState(false)
  const [assignForm, setAssignForm] = useState<EnrollmentFormState>(initialEnrollmentForm)
  const [selectedCoupon, setSelectedCoupon] = useState<EnrollmentCouponOption | null>(null)
  const [couponSearch, setCouponSearch] = useState('')
  const [couponResults, setCouponResults] = useState<EnrollmentCouponOption[]>([])
  const [isSearchingCoupons, setIsSearchingCoupons] = useState(false)
  const [selectedEnrolledBy, setSelectedEnrolledBy] = useState<EnrollmentUserOption | null>(null)
  const [enrolledBySearch, setEnrolledBySearch] = useState('')
  const [enrolledByResults, setEnrolledByResults] = useState<EnrollmentUserOption[]>([])
  const [isSearchingEnrolledBy, setIsSearchingEnrolledBy] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)
  const [isAssignSubmitting, setIsAssignSubmitting] = useState(false)

  // Delete (archive) confirmation state
  const [deleteTarget, setDeleteTarget] = useState<EnrollmentDoc | null>(null)
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Unassign (drop) confirmation state
  const [unassignTarget, setUnassignTarget] = useState<EnrollmentDoc | null>(null)
  const [isUnassignSubmitting, setIsUnassignSubmitting] = useState(false)
  const [unassignError, setUnassignError] = useState<string | null>(null)

  // Edit enrollment state
  const [editTarget, setEditTarget] = useState<EnrollmentDoc | null>(null)
  const [editForm, setEditForm] = useState<EnrollmentFormState>(initialEnrollmentForm)
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchEnrollments = useCallback(async ({
    nextSearch,
    nextStatus,
    nextPage,
  }: {
    nextSearch: string
    nextStatus: string
    nextPage: number
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getEnrollments({
        search: nextSearch || undefined,
        status: nextStatus || undefined,
        page: nextPage,
        limit: 10,
      })
      setEnrollments(result.docs || [])
      setTotalDocs(result.totalDocs)
      setTotalPages(result.totalPages)
      setStatusCounts(result.counts || null)
    } catch (e: any) {
      setError(e.message || 'Failed to load enrollments')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleRefresh = async () => {
    await fetchEnrollments({
      nextSearch: search,
      nextStatus: statusFilter,
      nextPage: currentPage,
    })
  }

  useEffect(() => {
    void fetchEnrollments({
      nextSearch: search,
      nextStatus: statusFilter,
      nextPage: currentPage,
    })
  }, [currentPage, fetchEnrollments, search, statusFilter])

  useEffect(() => {
    if (isAssignOpen) {
      setAssignMounted(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimateAssign(true)))
    } else {
      setAnimateAssign(false)
      const timer = setTimeout(() => setAssignMounted(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isAssignOpen])

  const handleTraineeSearch = useCallback((value: string) => {
    setTraineeSearch(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (value.length < 1) {
      setTraineeResults([])
      return
    }
    searchTimer.current = setTimeout(async () => {
      setIsSearchingTrainees(true)
      try {
        const results = await searchTrainees(value)
        setTraineeResults(results)
      } catch {
        setTraineeResults([])
      } finally {
        setIsSearchingTrainees(false)
      }
    }, 300)
  }, [])

  const courseSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const couponSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const enrolledBySearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCourseSearch = useCallback((value: string) => {
    setCourseSearch(value)
    if (courseSearchTimer.current) clearTimeout(courseSearchTimer.current)
    if (value.length < 1) {
      setCourseResults([])
      return
    }
    courseSearchTimer.current = setTimeout(async () => {
      setIsSearchingCourses(true)
      try {
        const results = await searchCourses(value)
        setCourseResults(results)
      } catch {
        setCourseResults([])
      } finally {
        setIsSearchingCourses(false)
      }
    }, 300)
  }, [])

  const handleCouponSearch = useCallback((value: string) => {
    setCouponSearch(value)
    if (couponSearchTimer.current) clearTimeout(couponSearchTimer.current)
    if (value.length < 1) {
      setCouponResults([])
      return
    }
    couponSearchTimer.current = setTimeout(async () => {
      setIsSearchingCoupons(true)
      try {
        setCouponResults(await searchEnrollmentCoupons(value))
      } catch {
        setCouponResults([])
      } finally {
        setIsSearchingCoupons(false)
      }
    }, 300)
  }, [])

  const handleEnrolledBySearch = useCallback((value: string) => {
    setEnrolledBySearch(value)
    if (enrolledBySearchTimer.current) clearTimeout(enrolledBySearchTimer.current)
    if (value.length < 1) {
      setEnrolledByResults([])
      return
    }
    enrolledBySearchTimer.current = setTimeout(async () => {
      setIsSearchingEnrolledBy(true)
      try {
        setEnrolledByResults(await searchEnrollmentUsers(value))
      } catch {
        setEnrolledByResults([])
      } finally {
        setIsSearchingEnrolledBy(false)
      }
    }, 300)
  }, [])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(statusFilter === value ? '' : value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === 'asc') {
        setSortDir('desc')
      } else {
        setSortKey(null)
        setSortDir('asc')
      }
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const openAssign = () => {
    setSelectedTrainee(null)
    setSelectedCourse(null)
    setCourseSearch('')
    setCourseResults([])
    setAssignForm(initialEnrollmentForm())
    setSelectedCoupon(null)
    setCouponSearch('')
    setCouponResults([])
    setSelectedEnrolledBy(null)
    setEnrolledBySearch('')
    setEnrolledByResults([])
    setTraineeSearch('')
    setTraineeResults([])
    setAssignError(null)
    setIsAssignOpen(true)
  }

  const closeAssign = () => {
    setIsAssignOpen(false)
    setSelectedTrainee(null)
    setSelectedCourse(null)
    setSelectedCoupon(null)
    setSelectedEnrolledBy(null)
  }

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAssignError(null)

    if (!selectedTrainee) {
      setAssignError('Please select a trainee')
      return
    }
    if (!selectedCourse) {
      setAssignError('Please select a course')
      return
    }

    let enrollmentInput: Omit<CreateEnrollmentInput, 'student' | 'course'>
    try {
      enrollmentInput = buildEnrollmentInput(assignForm)
    } catch (error: any) {
      setAssignError(error.message)
      return
    }

    setIsAssignSubmitting(true)
    try {
      await createEnrollment({
        student: selectedTrainee.id,
        course: selectedCourse.id,
        ...enrollmentInput,
      })
      closeAssign()
      await handleRefresh()
    } catch (e: any) {
      setAssignError(e.message || 'Failed to create enrollment')
    } finally {
      setIsAssignSubmitting(false)
    }
  }

  const handleUnassign = async () => {
    if (!unassignTarget) return
    setUnassignError(null)
    setIsUnassignSubmitting(true)
    try {
      await deleteEnrollment(unassignTarget.id)
      setUnassignTarget(null)
      await handleRefresh()
    } catch (e: any) {
      setUnassignError(e.message || 'Failed to unassign enrollment')
    } finally {
      setIsUnassignSubmitting(false)
    }
  }

  const handleArchive = async () => {
    if (!deleteTarget) return
    setDeleteError(null)
    setIsDeleteSubmitting(true)
    try {
      await archiveEnrollment(deleteTarget.id)
      setDeleteTarget(null)
      await handleRefresh()
    } catch (e: any) {
      setDeleteError(e.message || 'Failed to delete enrollment')
    } finally {
      setIsDeleteSubmitting(false)
    }
  }

  const handleEditSave = async () => {
    if (!editTarget) return
    setEditError(null)
    setIsEditSubmitting(true)
    try {
      const enrollmentInput = buildEnrollmentInput(editForm, true)
      await updateEnrollment(editTarget.id, {
        student: selectedTrainee?.id || String(typeof editTarget.student === 'object' ? editTarget.student.id : editTarget.student),
        course: selectedCourse?.id || String(typeof editTarget.course === 'object' ? editTarget.course.id : editTarget.course),
        ...enrollmentInput,
      })
      setEditTarget(null)
      await handleRefresh()
    } catch (e: any) {
      setEditError(e.message || 'Failed to update enrollment')
    } finally {
      setIsEditSubmitting(false)
    }
  }

  const openEdit = (enrollment: EnrollmentDoc) => {
    setEditTarget(enrollment)
    setEditForm(enrollmentFormFromDoc(enrollment))
    setSelectedTrainee(typeof enrollment.student === 'object' ? {
      id: String(enrollment.student.id),
      user: enrollment.student.user,
      srn: enrollment.student.srn || '',
    } : null)
    setSelectedCourse(typeof enrollment.course === 'object' ? {
      id: String(enrollment.course.id),
      title: enrollment.course.title,
      courseCode: enrollment.course.courseCode,
      status: enrollment.course.status,
    } : null)
    setSelectedCoupon(enrollment.coupon && typeof enrollment.coupon === 'object' ? {
      id: String(enrollment.coupon.id),
      code: enrollment.coupon.code || '',
      name: enrollment.coupon.name || '',
    } : null)
    setSelectedEnrolledBy(enrollment.enrolledBy && typeof enrollment.enrolledBy === 'object' ? {
      id: String(enrollment.enrolledBy.id),
      firstName: enrollment.enrolledBy.firstName || '',
      lastName: enrollment.enrolledBy.lastName || '',
      email: enrollment.enrolledBy.email || '',
    } : null)
    setEditError(null)
  }

  const getStudentName = (doc: EnrollmentDoc) => {
    const u = doc.student?.user
    if (!u) return '\u2014'
    return `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || '\u2014'
  }

  const getStudentEmail = (doc: EnrollmentDoc) => {
    return doc.student?.user?.email || '\u2014'
  }

  const getCourseTitle = (doc: EnrollmentDoc) => {
    return doc.course?.title || '\u2014'
  }

  const metrics = useMemo(() => {
    const c = statusCounts
    return {
      total: c?.total ?? totalDocs,
      active: c?.active ?? 0,
      completed: c?.completed ?? 0,
      pending: c?.pending ?? 0,
    }
  }, [statusCounts, totalDocs])

  const sortedEnrollments = useMemo(() => {
    if (!sortKey) return enrollments
    const sorted = [...enrollments]
    sorted.sort((a, b) => {
      let va: any, vb: any
      switch (sortKey) {
        case 'student':
          va = getStudentName(a).toLowerCase()
          vb = getStudentName(b).toLowerCase()
          break
        case 'course':
          va = getCourseTitle(a).toLowerCase()
          vb = getCourseTitle(b).toLowerCase()
          break
        case 'status':
          va = a.status
          vb = b.status
          break
        case 'enrolledAt':
          va = a.enrolledAt || ''
          vb = b.enrolledAt || ''
          break
        case 'progressPercentage':
          va = a.progressPercentage || 0
          vb = b.progressPercentage || 0
          break
        default:
          return 0
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [enrollments, sortKey, sortDir])

  const renderSortIndicator = (key: SortKey) => {
    if (sortKey !== key) {
      return <span className="ml-1 inline-block w-3 text-gray-300">{'\u2195'}</span>
    }
    return (
      <span className="ml-1 inline-block w-3 text-blue-500">
        {sortDir === 'asc' ? '\u2191' : '\u2193'}
      </span>
    )
  }

  const SortHeader = ({ sortKey: key, label }: { sortKey: SortKey; label: string }) => (
    <button
      onClick={() => handleSort(key)}
      className="group inline-flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
    >
      {label}
      {renderSortIndicator(key)}
    </button>
  )

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Course Enrollments</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage access and enrollment rules</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadCSV(enrollments)}
            disabled={enrollments.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={openAssign}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Assign Enrollment
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4 shadow-sm animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
                <div>
                  <div className="h-7 w-12 bg-gray-100 dark:bg-gray-800 rounded mb-1" />
                  <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.total}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Enrollments</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/30">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.active}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.completed}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.pending}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by student name, email, or course..."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-[#201a7c] focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 outline-none bg-white dark:bg-[var(--card-background)]"
          />
        </div>
        {(search || statusFilter) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter(''); setCurrentPage(1) }}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {/* Quick-Filter Status Chips */}
      <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleStatusFilter('')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              !statusFilter
                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All
            <span className={`tabular-nums ${!statusFilter ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
              {statusCounts?.total ?? enrollments.length}
            </span>
          </button>
          {STATUS_CHIPS.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span className={`tabular-nums ${statusFilter === s ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
                {statusCounts?.[s] ?? 0}
              </span>
            </button>
          ))}
        </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={handleRefresh} className="ml-auto text-red-700 dark:text-red-400 underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="rounded-lg border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Enrolled</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-40" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-44" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-40" /></td>
                  <td className="px-4 py-4"><div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-20" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" /></td>
                  <td className="px-4 py-4"><div className="h-2 bg-gray-100 dark:bg-gray-800 rounded w-20" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-16 ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No enrollments found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
            {search || statusFilter
              ? 'No enrollments match your current filters. Try adjusting your search or status filter.'
              : 'Get started by assigning a trainee to a course.'}
          </p>
          {!search && !statusFilter && (
            <button
              onClick={openAssign}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Assign Enrollment
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)]">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left"><SortHeader sortKey="student" label="Student" /></th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left"><SortHeader sortKey="course" label="Course" /></th>
                  <th className="px-4 py-3 text-left"><SortHeader sortKey="status" label="Status" /></th>
                  <th className="px-4 py-3 text-left"><SortHeader sortKey="enrolledAt" label="Enrolled" /></th>
                  <th className="px-4 py-3 text-left"><SortHeader sortKey="progressPercentage" label="Progress" /></th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {sortedEnrollments.map((enrollment) => {
                  const pct = typeof enrollment.progressPercentage === 'number'
                    ? enrollment.progressPercentage
                    : 0
                  const typeTag = getEnrollmentTypeTag(enrollment.enrollmentType)
                  return (
                    <tr
                      key={enrollment.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-l-[3px] ${getStatusRowAccent(enrollment.status)}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{getStudentName(enrollment)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{getStudentEmail(enrollment)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{getCourseTitle(enrollment)}</span>
                          {typeTag && (
                            <span className="inline-flex items-center rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">
                              {typeTag}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(enrollment.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatDate(enrollment.enrolledAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${getProgressBarColor(pct)}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/enrollments/assign-unassign/${enrollment.id}`}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="View enrollment"
                            aria-label="View enrollment"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Link>
                          <button
                            onClick={() => openEdit(enrollment)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Edit enrollment"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          {enrollment.status === 'dropped' ? (
                            <button
                              onClick={() => setDeleteTarget(enrollment)}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete enrollment"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setUnassignTarget(enrollment)}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Unassign enrollment"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {((currentPage - 1) * 10) + 1}{'\u2013'}{Math.min(currentPage * 10, totalDocs)} of {totalDocs} enrollments
              </p>
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-[var(--card-background)]"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const start = Math.max(1, currentPage - 2)
                  const pageNum = start + i
                  if (pageNum > totalPages) return null
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        pageNum === currentPage
                          ? 'bg-blue-600 dark:bg-blue-500 text-white'
                          : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-[var(--card-background)]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-[var(--card-background)]"
                >
                  Next
                </button>
              </div>
            </div>
        </>
      )}

      {/* Assign SlideOver */}
      {assignMounted && createPortal(
        <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${animateAssign ? 'bg-black/50' : 'bg-transparent'}`} onClick={closeAssign}>
          <div className={`flex w-full max-w-lg flex-col bg-white dark:bg-[var(--card-background)] shadow-xl transition-all duration-300 ease-in-out ${animateAssign ? 'translate-x-0' : 'translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Assign Enrollment</h3>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Enroll a trainee in a course</p>
              </div>
              <button type="button" onClick={closeAssign} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <form onSubmit={handleAssignSubmit} className="space-y-5">
                {assignError && (
                  <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {assignError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Trainee <span className="text-red-500">*</span>
                  </label>
                  {selectedTrainee ? (
                    <div className="flex items-center justify-between rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {selectedTrainee.user.firstName} {selectedTrainee.user.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{selectedTrainee.user.email}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setSelectedTrainee(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <input type="text" value={traineeSearch} onChange={(e) => handleTraineeSearch(e.target.value)} placeholder="Search by name or email..." className="w-full rounded-lg border border-gray-300 dark:border-gray-600 pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400/20 outline-none bg-white dark:bg-[var(--card-background)]" />
                        {isSearchingTrainees && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400 dark:text-gray-500" />
                        )}
                      </div>
                      {traineeResults.length > 0 && (
                        <div className="mt-2 rounded-lg border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm max-h-48 overflow-y-auto">
                          {traineeResults.map((trainee) => (
                            <button key={trainee.id} type="button" onClick={() => { setSelectedTrainee(trainee); setTraineeSearch(''); setTraineeResults([]) }} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                              <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                                <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{trainee.user.firstName} {trainee.user.lastName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{trainee.user.email}{trainee.srn ? ` \u2022 ${trainee.srn}` : ''}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {traineeSearch.length >= 1 && !isSearchingTrainees && traineeResults.length === 0 && (
                        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">No trainees found matching &quot;{traineeSearch}&quot;</p>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Course <span className="text-red-500">*</span>
                  </label>
                  {selectedCourse ? (
                    <div className="flex items-center justify-between rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                          <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedCourse.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{selectedCourse.courseCode}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => { setSelectedCourse(null); setCourseSearch(''); setCourseResults([]) }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <input
                          type="text"
                          value={courseSearch}
                          onChange={(e) => handleCourseSearch(e.target.value)}
                          placeholder="Search by course title or code..."
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400/20 outline-none bg-white dark:bg-[var(--card-background)]"
                        />
                        {isSearchingCourses && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400 dark:text-gray-500" />
                        )}
                      </div>
                      {courseResults.length > 0 && (
                        <div className="mt-2 rounded-lg border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm max-h-48 overflow-y-auto">
                          {courseResults.map((course) => (
                            <button
                              key={course.id}
                              type="button"
                              onClick={() => { setSelectedCourse(course); setCourseSearch(''); setCourseResults([]) }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                            >
                              <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                                <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{course.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{course.courseCode || 'No code'}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {courseSearch.length >= 1 && !isSearchingCourses && courseResults.length === 0 && (
                        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">No courses found matching &quot;{courseSearch}&quot;</p>
                      )}
                    </>
                  )}
                </div>

                 <EnrollmentDetailFields
                   form={assignForm}
                   setForm={setAssignForm}
                   selectedCoupon={selectedCoupon}
                   couponSearch={couponSearch}
                   couponResults={couponResults}
                   isSearchingCoupons={isSearchingCoupons}
                   onCouponSearch={handleCouponSearch}
                   onSelectCoupon={(coupon) => { setSelectedCoupon(coupon); setAssignForm((current) => ({ ...current, couponId: coupon.id })); setCouponSearch(''); setCouponResults([]) }}
                   onClearCoupon={() => { setSelectedCoupon(null); setAssignForm((current) => ({ ...current, couponId: '' })) }}
                   selectedEnrolledBy={selectedEnrolledBy}
                   enrolledBySearch={enrolledBySearch}
                   enrolledByResults={enrolledByResults}
                   isSearchingEnrolledBy={isSearchingEnrolledBy}
                   onEnrolledBySearch={handleEnrolledBySearch}
                   onSelectEnrolledBy={(user) => { setSelectedEnrolledBy(user); setAssignForm((current) => ({ ...current, enrolledById: user.id })); setEnrolledBySearch(''); setEnrolledByResults([]) }}
                   onClearEnrolledBy={() => { setSelectedEnrolledBy(null); setAssignForm((current) => ({ ...current, enrolledById: '' })) }}
                 />

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-[var(--card-border)]">
                  <button type="button" onClick={closeAssign} className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-[var(--card-background)]">Cancel</button>
                  <button type="submit" disabled={isAssignSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                    {isAssignSubmitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Enrolling...</>) : (<><Plus className="h-4 w-4" /> Enroll Trainee</>)}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* Edit SlideOver */}
      {editTarget && createPortal(
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={() => setEditTarget(null)}>
          <div className="flex w-full max-w-lg flex-col bg-white dark:bg-[var(--card-background)] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Enrollment</h3>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{getStudentName(editTarget)} \u2014 {getCourseTitle(editTarget)}</p>
              </div>
              <button type="button" onClick={() => setEditTarget(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-5">
                {editError && (
                  <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {editError}
                  </div>
                )}

                <div className="rounded-lg border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div className="flex justify-between"><span>Student</span><span className="font-medium text-gray-700 dark:text-gray-200">{getStudentName(editTarget)}</span></div>
                  <div className="flex justify-between"><span>Email</span><span className="font-medium text-gray-700 dark:text-gray-200">{getStudentEmail(editTarget)}</span></div>
                  <div className="flex justify-between"><span>Course</span><span className="font-medium text-gray-700 dark:text-gray-200">{getCourseTitle(editTarget)}</span></div>
                  <div className="flex justify-between"><span>Enrolled</span><span className="font-medium text-gray-700 dark:text-gray-200">{formatDate(editTarget.enrolledAt)}</span></div>
                </div>

                <EnrollmentDetailFields
                  form={editForm}
                  setForm={setEditForm}
                  selectedCoupon={selectedCoupon}
                  couponSearch={couponSearch}
                  couponResults={couponResults}
                  isSearchingCoupons={isSearchingCoupons}
                  onCouponSearch={handleCouponSearch}
                  onSelectCoupon={(coupon) => { setSelectedCoupon(coupon); setEditForm((current) => ({ ...current, couponId: coupon.id })); setCouponSearch(''); setCouponResults([]) }}
                  onClearCoupon={() => { setSelectedCoupon(null); setEditForm((current) => ({ ...current, couponId: '' })) }}
                  selectedEnrolledBy={selectedEnrolledBy}
                  enrolledBySearch={enrolledBySearch}
                  enrolledByResults={enrolledByResults}
                  isSearchingEnrolledBy={isSearchingEnrolledBy}
                  onEnrolledBySearch={handleEnrolledBySearch}
                  onSelectEnrolledBy={(user) => { setSelectedEnrolledBy(user); setEditForm((current) => ({ ...current, enrolledById: user.id })); setEnrolledBySearch(''); setEnrolledByResults([]) }}
                  onClearEnrolledBy={() => { setSelectedEnrolledBy(null); setEditForm((current) => ({ ...current, enrolledById: '' })) }}
                />

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-[var(--card-border)]">
                  <button type="button" onClick={() => setEditTarget(null)} className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-[var(--card-background)]">Cancel</button>
                  <button type="button" onClick={handleEditSave} disabled={isEditSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                    {isEditSubmitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>) : (<>Save Changes</>)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* Unassign Modal — sets status to dropped */}
      {unassignTarget && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => { setUnassignTarget(null); setUnassignError(null) }}>
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[var(--card-background)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Unassign Enrollment</h2>
              <button onClick={() => { setUnassignTarget(null); setUnassignError(null) }} className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {unassignError && (<div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 flex items-center gap-2"><AlertTriangle className="h-4 w-4 shrink-0" />{unassignError}</div>)}
              <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm text-amber-700 dark:text-amber-400"><p className="font-medium">Unassign student?</p><p className="mt-1">This will unassign <strong>{getStudentName(unassignTarget)}</strong> from <strong>{getCourseTitle(unassignTarget)}</strong>. The enrollment status will be marked as <strong>Dropped</strong>. Progress data will be preserved and the record will remain visible.</p></div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => { setUnassignTarget(null); setUnassignError(null) }} disabled={isUnassignSubmitting} className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors bg-white dark:bg-[var(--card-background)]">Cancel</button>
                <button onClick={handleUnassign} disabled={isUnassignSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-amber-600 dark:bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 dark:hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                  {isUnassignSubmitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Unassigning...</>) : (<>Unassign</>)}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* Delete Modal — archives the record */}
      {deleteTarget && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => { setDeleteTarget(null); setDeleteError(null) }}>
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[var(--card-background)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete Enrollment</h2>
              <button onClick={() => { setDeleteTarget(null); setDeleteError(null) }} className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {deleteError && (<div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 flex items-center gap-2"><AlertTriangle className="h-4 w-4 shrink-0" />{deleteError}</div>)}
              <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-400"><p className="font-medium">Are you sure?</p><p className="mt-1">This will permanently remove <strong>{getStudentName(deleteTarget)}</strong> from <strong>{getCourseTitle(deleteTarget)}</strong> from the active view. The record will be archived in the database.</p></div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => { setDeleteTarget(null); setDeleteError(null) }} disabled={isDeleteSubmitting} className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors bg-white dark:bg-[var(--card-background)]">Cancel</button>
                <button onClick={handleArchive} disabled={isDeleteSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-red-600 dark:bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                  {isDeleteSubmitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</>) : (<><Trash2 className="h-4 w-4" /> Delete</>)}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
