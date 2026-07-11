import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  LMS_REFUND_STATUS_OPTIONS,
  LMS_REFUND_TYPE_OPTIONS,
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

const STATUS_LABELS = new Map<string, string>(LMS_REFUND_STATUS_OPTIONS.map((o) => [o.value, o.label]))
const TYPE_LABELS = new Map<string, string>(LMS_REFUND_TYPE_OPTIONS.map((o) => [o.value, o.label]))

const IMMUTABLE_STATUSES = new Set(['processed', 'voided'])

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
  const invoiceObj = r.invoice as { id?: number | string; invoiceNumber?: string } | number | string | undefined
  const creditNoteObj = r.creditNote as { id?: number | string; creditNoteNumber?: string } | number | string | undefined

  const linkId = typeof linkObj === 'object' && linkObj ? String(linkObj.id || '') : String(linkObj || '')
  const linkLabel = typeof linkObj === 'object' && linkObj ? String(linkObj.sourceReference || `Link ${linkObj.id || ''}`) : String(linkObj || '-')
  const invoiceId = typeof invoiceObj === 'object' && invoiceObj ? String(invoiceObj.id || '') : String(invoiceObj || '')
  const invoiceLabel = typeof invoiceObj === 'object' && invoiceObj
    ? String(invoiceObj.invoiceNumber || `Invoice ${invoiceObj.id || ''}`)
    : String(invoiceObj || '-')
  const creditNoteId = typeof creditNoteObj === 'object' && creditNoteObj ? String(creditNoteObj.id || '') : String(creditNoteObj || '')
  const creditNoteLabel = typeof creditNoteObj === 'object' && creditNoteObj
    ? String(creditNoteObj.creditNoteNumber || `CN #${creditNoteObj.id || ''}`)
    : String(creditNoteObj || null)

  return {
    id: String(r.id),
    refundNumber: String(r.refundNumber || ''),
    enrollmentBillingLinkId: linkId,
    enrollmentBillingLinkLabel: linkLabel,
    invoiceId,
    invoiceLabel,
    paymentReceivedId: String((r.paymentReceived as { id?: string | number } | undefined)?.id ?? r.paymentReceived ?? ''),
    creditNoteId,
    creditNoteLabel,
    refundDate: r.refundDate ? String(r.refundDate) : null,
    refundDateLabel: formatDate(r.refundDate as string | null | undefined),
    refundReason: String(r.refundReason || ''),
    refundType: String(r.refundType || ''),
    refundTypeLabel: TYPE_LABELS.get(String(r.refundType || '')) || String(r.refundType || '-'),
    requestedAmount: Number(r.requestedAmount) || 0,
    requestedAmountLabel: formatCurrency(Number(r.requestedAmount) || 0),
    approvedAmount: r.approvedAmount != null ? Number(r.approvedAmount) || 0 : null,
    approvedAmountLabel: r.approvedAmount != null ? formatCurrency(Number(r.approvedAmount) || 0) : '-',
    currency: String(r.currency || 'PHP'),
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
      collection: ACCOUNTING_COLLECTION_SLUGS.refunds,
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
      collection: ACCOUNTING_COLLECTION_SLUGS.refunds,
      id: parseNumberParam(id) || id,
      depth: 0,
      overrideAccess: true,
    }) as unknown as Record<string, unknown> | undefined

    if (!existing) throw new AccountingApiError('Refund not found', 404)

    const existingStatus = String(existing.status || '')
    if (IMMUTABLE_STATUSES.has(existingStatus)) {
      throw new AccountingApiError(`Cannot update a refund with status "${existingStatus}".`, 400)
    }

    const data: Record<string, unknown> = {}
    if (body.enrollmentBillingLink !== undefined) data.enrollmentBillingLink = Number(body.enrollmentBillingLink) || 0
    if (body.invoice !== undefined) data.invoice = body.invoice ? Number(body.invoice) : null
    if (body.paymentReceived !== undefined) data.paymentReceived = body.paymentReceived ? Number(body.paymentReceived) : null
    if (body.refundDate !== undefined) data.refundDate = body.refundDate
    if (body.refundReason !== undefined) data.refundReason = String(body.refundReason || '').trim() || null
    if (body.refundType !== undefined) data.refundType = String(body.refundType || 'partial')
    if (body.requestedAmount !== undefined) data.requestedAmount = Math.max(0, Number(body.requestedAmount) || 0)
    if (body.approvedAmount !== undefined) data.approvedAmount = body.approvedAmount !== null ? Math.max(0, Number(body.approvedAmount) || 0) : null
    if (body.currency !== undefined) data.currency = String(body.currency || 'PHP')
    if (body.status !== undefined) data.status = String(body.status || 'draft')
    if (body.notes !== undefined) data.notes = String(body.notes || '').trim() || null
    data.updatedBy = user.id

    const record = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.refunds,
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
    const refundId = parseNumberParam(id) || id

    const existing = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.refunds,
      id: refundId,
      depth: 0,
      overrideAccess: true,
    }) as unknown as Record<string, unknown> | undefined

    if (!existing) throw new AccountingApiError('Refund not found', 404)

    const existingStatus = String(existing.status || '')
    if (IMMUTABLE_STATUSES.has(existingStatus)) {
      throw new AccountingApiError(
        `Cannot delete a refund with status "${existingStatus}". Set it to Draft first.`,
        409,
      )
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.refunds,
      id: refundId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
