import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, LMS_RECOGNITION_METHOD_OPTIONS } from '@/accounting/constants/accounting'
import { AccountingApiError, handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseListParam = (sp: URLSearchParams, key: string): string[] =>
  Array.from(new Set(sp.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

const normalizeText = (v?: string | null) => String(v || '').trim().toLowerCase()

function getRecognitionMethodLabel(value: string): string {
  const option = LMS_RECOGNITION_METHOD_OPTIONS.find((o) => o.value === value)
  return option?.label || value || '-'
}

function getRecognitionMethodTone(value: string): string {
  if (value === 'certificate_based' || value === 'completion_based') return 'blue'
  if (value === 'straight_line') return 'amber'
  if (value === 'manual') return 'gray'
  return 'green'
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const sp = new URL(request.url).searchParams
    const search = normalizeText(sp.get('search'))
    const recognitionMethods = parseListParam(sp, 'recognitionMethod')
    const quickFilters = parseListParam(sp, 'quickFilter')
    const page = Math.max(1, Number(sp.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(sp.get('limit')) || 10))

    const allDocs = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.courseFeeProfiles,
      depth: 2,
      limit: 10000,
      sort: '-createdAt',
      overrideAccess: true,
    })

    const rows = allDocs.docs.map((doc) => {
      const d = doc as unknown as Record<string, unknown>
      const course = d.course as unknown as Record<string, unknown> | undefined
      const courseName = course?.title ? String(course.title) : course?.courseCode ? String(course.courseCode) : course ? `Course #${course.id}` : '-'
      const courseCode = course?.courseCode ? String(course.courseCode) : ''
      const revAcct = d.courseRevenueAccount as unknown as Record<string, unknown> | undefined
      const defAcct = d.deferredRevenueAccount as unknown as Record<string, unknown> | undefined
      const discAcct = d.discountContraRevenueAccount as unknown as Record<string, unknown> | undefined
      const certAcct = d.certificateRevenueAccount as unknown as Record<string, unknown> | undefined
      const instrAcct = d.instructorExpenseAccount as unknown as Record<string, unknown> | undefined
      const recMethod = String(d.defaultRecognitionMethod || 'on_activation')
      return {
        id: String(d.id),
        courseId: String(course?.id ?? ''),
        courseName,
        courseCode,
        certificateFee: Number(d.certificateFee) || 0,
        retakeFee: Number(d.retakeFee) || 0,
        reassessmentFee: Number(d.reassessmentFee) || 0,
        renewalFee: Number(d.renewalFee) || 0,
        latePaymentFee: Number(d.latePaymentFee) || 0,
        manualAdjustmentAllowed: Boolean(d.manualAdjustmentAllowed),
        defaultRecognitionMethod: recMethod,
        defaultRecognitionMethodLabel: getRecognitionMethodLabel(recMethod),
        defaultRecognitionMethodTone: getRecognitionMethodTone(recMethod),
        courseRevenueAccountId: String(revAcct?.id ?? ''),
        courseRevenueAccountLabel: revAcct?.name ? String(revAcct.name) : revAcct ? `Account #${revAcct.id}` : '-',
        deferredRevenueAccountId: String(defAcct?.id ?? ''),
        deferredRevenueAccountLabel: defAcct?.name ? String(defAcct.name) : defAcct ? `Account #${defAcct.id}` : '-',
        discountContraRevenueAccountId: String(discAcct?.id ?? ''),
        discountContraRevenueAccountLabel: discAcct?.name ? String(discAcct.name) : discAcct ? `Account #${discAcct.id}` : '-',
        certificateRevenueAccountId: String(certAcct?.id ?? ''),
        certificateRevenueAccountLabel: certAcct?.name ? String(certAcct.name) : certAcct ? `Account #${certAcct.id}` : '-',
        instructorExpenseAccountId: String(instrAcct?.id ?? ''),
        instructorExpenseAccountLabel: instrAcct?.name ? String(instrAcct.name) : instrAcct ? `Account #${instrAcct.id}` : '-',
        notes: String(d.notes || ''),
      }
    })

    let filtered = rows
    if (search) {
      filtered = filtered.filter((r) =>
        [r.courseName, r.courseCode, r.defaultRecognitionMethodLabel, r.courseRevenueAccountLabel, r.deferredRevenueAccountLabel, r.discountContraRevenueAccountLabel, r.instructorExpenseAccountLabel, String(r.certificateFee), String(r.retakeFee), String(r.reassessmentFee), String(r.renewalFee), String(r.latePaymentFee)]
          .map((v) => normalizeText(v))
          .some((v) => v.includes(search)),
      )
    }
    if (recognitionMethods.length > 0) {
      filtered = filtered.filter((r) => recognitionMethods.includes(r.defaultRecognitionMethod))
    }
    if (quickFilters.length > 0) {
      const allQf = ['manualAdjustmentAllowed:true', 'recognition:on_activation', 'hasDeferredRevenue:true', 'hasCertFee:true']
      const allSelected = allQf.every((v) => quickFilters.includes(v))
      if (!allSelected) {
        filtered = filtered.filter((r) =>
          quickFilters.some((qf) => {
            const [prefix, value] = qf.split(':')
            if (prefix === 'manualAdjustmentAllowed') return r.manualAdjustmentAllowed === (value === 'true')
            if (prefix === 'recognition') return r.defaultRecognitionMethod === value
            if (prefix === 'hasDeferredRevenue') return r.deferredRevenueAccountId !== '' === (value === 'true')
            if (prefix === 'hasCertFee') return r.certificateFee > 0 === (value === 'true')
            return false
          }),
        )
      }
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    const [courses, chartAccounts] = await Promise.all([
      payload.find({ collection: 'courses', depth: 0, limit: 500, sort: 'title', overrideAccess: true }),
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, depth: 0, limit: 500, sort: 'name', overrideAccess: true }),
    ])

    const recMethodCounts = new Map<string, number>()
    for (const r of rows) recMethodCounts.set(r.defaultRecognitionMethod, (recMethodCounts.get(r.defaultRecognitionMethod) || 0) + 1)
    const profilesWithRevAccount = rows.filter((r) => r.courseRevenueAccountId).length
    const profilesWithDeferredAccount = rows.filter((r) => r.deferredRevenueAccountId).length
    const profilesWithManualAdjustment = rows.filter((r) => r.manualAdjustmentAllowed).length

    return NextResponse.json({
      rows: paginatedRows,
      metrics: [
        { id: 'total-profiles', label: 'Fee Profiles', value: rows.length, change: 'Courses with LMS monetization overlay records', trend: rows.length > 0 ? 'up' as const : 'neutral' as const },
        { id: 'mapped-revenue-accounts', label: 'Mapped Revenue Accounts', value: profilesWithRevAccount, change: 'Profiles with course revenue mapping set', trend: profilesWithRevAccount > 0 ? 'up' as const : 'neutral' as const },
        { id: 'deferred-revenue-profiles', label: 'Deferred Revenue Profiles', value: profilesWithDeferredAccount, change: 'Profiles configured for deferred recognition handling', trend: profilesWithDeferredAccount > 0 ? 'up' as const : 'neutral' as const },
        { id: 'manual-adjustments-allowed', label: 'Manual Adjustments Allowed', value: profilesWithManualAdjustment, change: 'Profiles permitting finance-side adjustments', trend: profilesWithManualAdjustment > 0 ? 'neutral' as const : 'down' as const },
      ],
      filterOptions: {
        recognitionMethods: LMS_RECOGNITION_METHOD_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
        quickFilters: [
          { label: 'Manual Adj. Allowed', value: 'manualAdjustmentAllowed:true' },
          { label: 'On Activation', value: 'recognition:on_activation' },
          { label: 'Has Deferred Rev.', value: 'hasDeferredRevenue:true' },
          { label: 'Has Cert. Fee', value: 'hasCertFee:true' },
        ],
      },
      meta: {
        searchPlaceholder: 'Search course, recognition method, revenue account, deferred account, or discount contra account',
        columns: ['Course', 'Recognition Method', 'Manual Adjustment', 'Course Revenue', 'Deferred Revenue', 'Discount Contra'],
        tableTitle: 'Course Fee Profile Register',
        tableDescription: 'Profile records aligned to accounting-course-fee-profiles, including course relationship, recognition method, and account-mapping fields.',
      },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: rows.length, filteredRows: totalDocs },
      referenceData: {
        courses: courses.docs.map((d) => {
          const r = d as unknown as Record<string, unknown>
          return { id: String(r.id), name: String(r.title || r.courseCode || ''), courseCode: String(r.courseCode || '') }
        }),
        chartAccounts: chartAccounts.docs.map((d) => {
          const r = d as unknown as Record<string, unknown>
          return { id: String(r.id), code: String(r.code || ''), name: String(r.name || '') }
        }),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = await request.json()

    const toId = (v: unknown): number | null => {
      if (v === null || v === undefined) return null
      const n = Number(v)
      return Number.isFinite(n) && n > 0 ? n : null
    }

    const courseId = toId(body.course)
    if (!courseId) throw new AccountingApiError('Course is required.', 400)

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.courseFeeProfiles,
      where: { course: { equals: courseId } },
      overrideAccess: true,
    })
    if (existing.docs.length > 0) {
      throw new AccountingApiError('A fee profile for this course already exists.', 409)
    }

    const data: Record<string, unknown> = {
      course: courseId,
      certificateFee: Math.max(0, Number(body.certificateFee) || 0),
      retakeFee: Math.max(0, Number(body.retakeFee) || 0),
      reassessmentFee: Math.max(0, Number(body.reassessmentFee) || 0),
      renewalFee: Math.max(0, Number(body.renewalFee) || 0),
      latePaymentFee: Math.max(0, Number(body.latePaymentFee) || 0),
      manualAdjustmentAllowed: body.manualAdjustmentAllowed !== undefined ? Boolean(body.manualAdjustmentAllowed) : true,
      defaultRecognitionMethod: String(body.defaultRecognitionMethod || 'on_activation'),
      createdBy: user.id,
      updatedBy: user.id,
    }

    if (body.courseRevenueAccount) data.courseRevenueAccount = toId(body.courseRevenueAccount)
    if (body.deferredRevenueAccount) data.deferredRevenueAccount = toId(body.deferredRevenueAccount)
    if (body.certificateRevenueAccount) data.certificateRevenueAccount = toId(body.certificateRevenueAccount)
    if (body.discountContraRevenueAccount) data.discountContraRevenueAccount = toId(body.discountContraRevenueAccount)
    if (body.instructorExpenseAccount) data.instructorExpenseAccount = toId(body.instructorExpenseAccount)
    if (body.notes) data.notes = String(body.notes).trim()

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.courseFeeProfiles,
      overrideAccess: true,
      data: data as never,
      depth: 2,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
