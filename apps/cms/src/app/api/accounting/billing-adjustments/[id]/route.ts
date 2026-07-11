import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  LMS_ADJUSTMENT_DIRECTION_OPTIONS,
  LMS_ADJUSTMENT_TYPE_OPTIONS,
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

const TYPE_LABELS = new Map<string, string>(LMS_ADJUSTMENT_TYPE_OPTIONS.map((o) => [o.value, o.label]))
const DIRECTION_LABELS = new Map<string, string>(LMS_ADJUSTMENT_DIRECTION_OPTIONS.map((o) => [o.value, o.label]))

const formatDate = (value: string | null | undefined) => {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0))

export const buildDetailResponse = async (
  _payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  record: Record<string, unknown>,
) => {
  const r = record as Record<string, unknown>
  const linkObj = r.enrollmentBillingLink as { id?: number | string; sourceReference?: string } | number | string | undefined
  const approverObj = r.approvedBy as { id?: number | string; name?: string; email?: string } | number | string | undefined

  const linkId = typeof linkObj === 'object' && linkObj ? String(linkObj.id || '') : String(linkObj || '')
  const linkLabel = typeof linkObj === 'object' && linkObj ? String(linkObj.sourceReference || `Link ${linkObj.id || ''}`) : String(linkObj || '-')
  const approverId = typeof approverObj === 'object' && approverObj ? String(approverObj.id || '') : String(approverObj || '')
  const approverLabel = typeof approverObj === 'object' && approverObj
    ? String(approverObj.name || approverObj.email || `User ${approverObj.id || ''}`)
    : String(approverObj || '-')

  return {
    id: String(r.id),
    enrollmentBillingLinkId: linkId,
    enrollmentBillingLinkLabel: linkLabel,
    adjustmentType: String(r.adjustmentType || ''),
    adjustmentTypeLabel: TYPE_LABELS.get(String(r.adjustmentType || '')) || String(r.adjustmentType || '-'),
    reason: String(r.reason || ''),
    amount: Number(r.amount) || 0,
    amountLabel: formatCurrency(Number(r.amount) || 0),
    direction: String(r.direction || ''),
    directionLabel: DIRECTION_LABELS.get(String(r.direction || '')) || String(r.direction || '-'),
    approvedById: approverId,
    approvedByLabel: approverLabel,
    appliedAt: r.appliedAt ? String(r.appliedAt) : null,
    appliedAtLabel: formatDate(r.appliedAt as string | null | undefined),
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
      collection: ACCOUNTING_COLLECTION_SLUGS.billingAdjustments,
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
      collection: ACCOUNTING_COLLECTION_SLUGS.billingAdjustments,
      id: parseNumberParam(id) || id,
      depth: 0,
      overrideAccess: true,
    }) as unknown as Record<string, unknown> | undefined

    if (!existing) throw new AccountingApiError('Billing adjustment not found', 404)

    const data: Record<string, unknown> = {}
    if (body.enrollmentBillingLink !== undefined) data.enrollmentBillingLink = Number(body.enrollmentBillingLink) || 0
    if (body.adjustmentType !== undefined) data.adjustmentType = String(body.adjustmentType || '')
    if (body.reason !== undefined) data.reason = String(body.reason || '').trim() || null
    if (body.amount !== undefined) data.amount = Math.max(0, Number(body.amount) || 0)
    if (body.direction !== undefined) data.direction = String(body.direction || 'increase')
    if (body.approvedBy !== undefined) data.approvedBy = body.approvedBy ? Number(body.approvedBy) : null
    if (body.appliedAt !== undefined) data.appliedAt = body.appliedAt || new Date().toISOString()
    if (body.notes !== undefined) data.notes = String(body.notes || '').trim() || null
    data.updatedBy = user.id

    const record = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.billingAdjustments,
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
    const adjId = parseNumberParam(id) || id

    const existing = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.billingAdjustments,
      id: adjId,
      depth: 0,
      overrideAccess: true,
    }) as unknown as Record<string, unknown> | undefined

    if (!existing) throw new AccountingApiError('Billing adjustment not found', 404)

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.billingAdjustments,
      id: adjId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
