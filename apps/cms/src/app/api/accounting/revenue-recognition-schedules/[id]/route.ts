import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { AccountingApiError, handleAccountingApiError, parseNumberParam, requireAccountingAdmin } from '../../_utils/auth'

type RouteContext = {
  params: Promise<{ id: string }>
}

const METHOD_LABEL: Record<string, string> = {
  on_activation: 'On Activation',
  straight_line: 'Straight Line',
  completion_based: 'Completion Based',
  certificate_based: 'Certificate Based',
  manual: 'Manual',
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  partially_recognized: 'Partially Recognized',
  recognized: 'Recognized',
  cancelled: 'Cancelled',
}

const STATUS_TONE: Record<string, string> = {
  draft: 'amber',
  scheduled: 'blue',
  partially_recognized: 'amber',
  recognized: 'green',
  cancelled: 'gray',
}

function buildDetail(d: Record<string, unknown>) {
  const inv = d.invoice as unknown as Record<string, unknown> | undefined
  const ebl = d.enrollmentBillingLink as unknown as Record<string, unknown> | undefined
  const eblEnrollment = ebl?.enrollment as unknown as Record<string, unknown> | undefined
  const status = String(d.status || 'draft')
  const method = String(d.recognitionMethod || 'on_activation')
  const totalDeferred = Number(d.totalDeferredAmount) || 0
  const recognized = Number(d.recognizedAmount) || 0
  const remaining = Number(d.remainingDeferredAmount) || 0
  return {
    id: String(d.id),
    invoiceId: String(inv?.id ?? ''),
    invoiceNumber: inv?.invoiceNumber ? String(inv.invoiceNumber) : inv ? `Invoice #${inv.id}` : '-',
    enrollmentBillingLinkId: String(ebl?.id ?? ''),
    enrollmentBillingLinkLabel: ebl?.sourceReference ? String(ebl.sourceReference) : ebl ? `Billing Link #${ebl.id}` : '-',
    enrollmentId: String(eblEnrollment?.id ?? ''),
    recognitionMethod: method,
    recognitionMethodLabel: METHOD_LABEL[method] || method || '-',
    startDate: d.startDate ? String(d.startDate) : null,
    endDate: d.endDate ? String(d.endDate) : null,
    totalDeferredAmount: totalDeferred,
    totalDeferredLabel: `PHP ${totalDeferred.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    recognizedAmount: recognized,
    recognizedLabel: `PHP ${recognized.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    remainingDeferredAmount: remaining,
    remainingLabel: `PHP ${remaining.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    status,
    statusLabel: STATUS_LABEL[status] || status || 'Draft',
    statusTone: STATUS_TONE[status] || 'gray',
    scheduleData: d.scheduleData ?? null,
    lastRecognitionAt: d.lastRecognitionAt ? String(d.lastRecognitionAt) : null,
    notes: String(d.notes || ''),
    createdAt: d.createdAt ? String(d.createdAt) : null,
    updatedAt: d.updatedAt ? String(d.updatedAt) : null,
  }
}

const IMMUTABLE_STATUSES = new Set(['recognized', 'cancelled'])

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const record = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.revenueRecognitionSchedules,
      id: parseNumberParam(id) || id,
      depth: 2,
      overrideAccess: true,
    })
    return NextResponse.json(buildDetail(record as unknown as Record<string, unknown>))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const couponId = parseNumberParam(id) || id
    const body = await request.json()

    const existing = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.revenueRecognitionSchedules,
      id: couponId,
      depth: 0,
      overrideAccess: true,
    }) as unknown as Record<string, unknown> | undefined

    if (!existing) throw new AccountingApiError('Recognition schedule not found.', 404)
    if (existing.status && IMMUTABLE_STATUSES.has(String(existing.status))) {
      throw new AccountingApiError(`Cannot update a schedule with status "${String(existing.status)}".`, 400)
    }

    const data: Record<string, unknown> = {}
    if (body.invoice !== undefined) {
      const n = Number(body.invoice)
      data.invoice = Number.isFinite(n) && n > 0 ? n : null
    }
    if (body.enrollmentBillingLink !== undefined) {
      const n = Number(body.enrollmentBillingLink)
      data.enrollmentBillingLink = Number.isFinite(n) && n > 0 ? n : null
    }
    if (body.recognitionMethod !== undefined) data.recognitionMethod = String(body.recognitionMethod || 'on_activation')
    if (body.startDate !== undefined) data.startDate = body.startDate || undefined
    if (body.endDate !== undefined) data.endDate = body.endDate || undefined
    if (body.totalDeferredAmount !== undefined) {
      data.totalDeferredAmount = Math.max(0, Number(body.totalDeferredAmount) || 0)
    }
    if (body.recognizedAmount !== undefined) {
      data.recognizedAmount = Math.max(0, Number(body.recognizedAmount) || 0)
    }
    if (body.remainingDeferredAmount !== undefined) {
      data.remainingDeferredAmount = Math.max(0, Number(body.remainingDeferredAmount) || 0)
    }
    if (body.status !== undefined) data.status = String(body.status || 'draft')
    if (body.notes !== undefined) data.notes = String(body.notes || '').trim() || null
    if (body.scheduleData !== undefined) data.scheduleData = body.scheduleData
    data.updatedBy = user.id

    if (data.startDate && data.endDate && new Date(String(data.startDate)).getTime() > new Date(String(data.endDate)).getTime()) {
      throw new AccountingApiError('Start date cannot be after end date.', 400)
    }

    const record = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.revenueRecognitionSchedules,
      id: couponId,
      depth: 2,
      overrideAccess: true,
      data: data as never,
    })

    return NextResponse.json(buildDetail(record as unknown as Record<string, unknown>))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const couponId = parseNumberParam(id) || id

    const existing = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.revenueRecognitionSchedules,
      id: couponId,
      depth: 0,
      overrideAccess: true,
    }) as unknown as Record<string, unknown> | undefined

    if (!existing) throw new AccountingApiError('Recognition schedule not found.', 404)
    if (existing.status && IMMUTABLE_STATUSES.has(String(existing.status))) {
      throw new AccountingApiError(`Cannot delete a schedule with status "${String(existing.status)}".`, 400)
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.revenueRecognitionSchedules,
      id: couponId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
