import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  LMS_PAYOUT_METHOD_OPTIONS,
  LMS_SPONSOR_STATUS_OPTIONS,
} from '@/accounting/constants/accounting'
import {
  AccountingApiError,
  handleAccountingApiError,
  parseNumberParam,
  requireAccountingAdmin,
} from '../../_utils/auth'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

const METHOD_LABELS = new Map<string, string>(LMS_PAYOUT_METHOD_OPTIONS.map((o) => [o.value, o.label]))
const STATUS_LABELS = new Map<string, string>(LMS_SPONSOR_STATUS_OPTIONS.map((o) => [o.value, o.label]))

const IMMUTABLE_STATUSES = new Set(['archived'])

const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0))

const buildInstructorLabel = (instructor: unknown) => {
  if (!instructor) return '-'
  if (typeof instructor === 'number' || typeof instructor === 'string') return String(instructor)
  const r = instructor as Record<string, unknown>
  const userObj = r.user as { firstName?: string; lastName?: string; email?: string } | undefined
  if (userObj) {
    const name = `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim()
    return name || userObj.email || `Instructor ${r.id}`
  }
  return String(r.specialization || `Instructor ${r.id}`)
}

const buildCourseLabel = (course: unknown) => {
  if (!course) return '-'
  if (typeof course === 'number' || typeof course === 'string') return String(course)
  const r = course as Record<string, unknown>
  return String(r.title || r.courseCode || `Course ${r.id}`)
}

export const buildDetailResponse = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  record: Record<string, unknown>,
) => {
  const r = record as Record<string, unknown>

  return {
    id: String(r.id),
    instructorId: String((r.instructor as Record<string, unknown> | undefined)?.id ?? r.instructor ?? ''),
    instructorLabel: buildInstructorLabel(r.instructor),
    courseId: String((r.course as Record<string, unknown> | undefined)?.id ?? r.course ?? ''),
    courseLabel: buildCourseLabel(r.course),
    payoutMethod: String(r.payoutMethod || ''),
    payoutMethodLabel: METHOD_LABELS.get(String(r.payoutMethod || '')) || String(r.payoutMethod || '-'),
    flatAmount: Number(r.flatAmount) || 0,
    flatAmountLabel: formatCurrency(Number(r.flatAmount) || 0),
    percentOfRevenue: Number(r.percentOfRevenue) || 0,
    percentOfRevenueLabel: (Number(r.percentOfRevenue) || 0) > 0 ? `${Number(r.percentOfRevenue) || 0}%` : '0%',
    perEnrollmentAmount: Number(r.perEnrollmentAmount) || 0,
    perEnrollmentAmountLabel: formatCurrency(Number(r.perEnrollmentAmount) || 0),
    completionBonusAmount: Number(r.completionBonusAmount) || 0,
    completionBonusAmountLabel: formatCurrency(Number(r.completionBonusAmount) || 0),
    status: String(r.status || ''),
    statusLabel: STATUS_LABELS.get(String(r.status || '')) || String(r.status || 'Unknown'),
    notes: String(r.notes || ''),
    createdAt: r.createdAt ? String(r.createdAt) : null,
    updatedAt: r.updatedAt ? String(r.updatedAt) : null,
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const record = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.instructorPayoutRules,
      id: parseNumberParam(id) || id,
      depth: 2,
      overrideAccess: true,
    })
    return NextResponse.json(await buildDetailResponse(payload, record as unknown as Record<string, unknown>))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const { id } = await context.params

    const body = await request.json()

    const existing = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.instructorPayoutRules,
      id: parseNumberParam(id) || id,
      depth: 0,
      overrideAccess: true,
    }) as unknown as Record<string, unknown> | undefined

    if (!existing) throw new AccountingApiError('Instructor payout rule not found', 404)

    const existingStatus = String(existing.status || '')
    if (IMMUTABLE_STATUSES.has(existingStatus)) {
      throw new AccountingApiError(`Cannot update a rule with status "${existingStatus}".`, 400)
    }

    const data: Record<string, unknown> = {}
    if (body.instructor !== undefined) data.instructor = Number(body.instructor) || 0
    if (body.course !== undefined) data.course = Number(body.course) || 0
    if (body.payoutMethod !== undefined) data.payoutMethod = String(body.payoutMethod || 'flat')
    if (body.flatAmount !== undefined) data.flatAmount = Math.max(0, Number(body.flatAmount) || 0)
    if (body.percentOfRevenue !== undefined) data.percentOfRevenue = Math.min(100, Math.max(0, Number(body.percentOfRevenue) || 0))
    if (body.perEnrollmentAmount !== undefined) data.perEnrollmentAmount = Math.max(0, Number(body.perEnrollmentAmount) || 0)
    if (body.completionBonusAmount !== undefined) data.completionBonusAmount = Math.max(0, Number(body.completionBonusAmount) || 0)
    if (body.status !== undefined) data.status = String(body.status || 'active')
    if (body.notes !== undefined) data.notes = String(body.notes || '').trim() || null
    data.updatedBy = user.id

    const record = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.instructorPayoutRules,
      id: parseNumberParam(id) || id,
      depth: 2,
      overrideAccess: true,
      data: data as never,
    })

    return NextResponse.json(await buildDetailResponse(payload, record as unknown as Record<string, unknown>))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const ruleId = parseNumberParam(id) || id

    const existing = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.instructorPayoutRules,
      id: ruleId,
      depth: 0,
      overrideAccess: true,
    }) as unknown as Record<string, unknown> | undefined

    if (!existing) throw new AccountingApiError('Instructor payout rule not found', 404)

    const existingStatus = String(existing.status || '')
    if (IMMUTABLE_STATUSES.has(existingStatus)) {
      throw new AccountingApiError(
        `Cannot delete a rule with status "${existingStatus}".`,
        409,
      )
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.instructorPayoutRules,
      id: ruleId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
