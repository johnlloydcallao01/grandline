import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { AccountingApiError, handleAccountingApiError, parseNumberParam, requireAccountingAdmin } from '../../_utils/auth'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

type PaymentAllocationDoc = {
  id: number | string
  paymentReceived?: { id?: number | string; receiptNumber?: string | null } | number | string | null
  invoice?: { id?: number | string; invoiceNumber?: string | null } | number | string | null
  enrollmentBillingLink?: { id?: number | string; sourceReference?: string | null } | number | string | null
  allocationDate?: string | null
  allocatedAmount?: number | null
  allocationType?: string | null
  notes?: string | null
  createdBy?: { id?: number | string; firstName?: string | null; lastName?: string | null; email?: string | null } | number | string | null
  updatedBy?: { id?: number | string; firstName?: string | null; lastName?: string | null; email?: string | null } | number | string | null
  createdAt?: string | null
  updatedAt?: string | null
}

const formatDate = (value: string | null | undefined) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

const fmt = (value: number | null | undefined) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0))

const titleCase = (value: string | null | undefined) =>
  String(value || '').split('_').join(' ').replace(/\b\w/g, (c) => c.toUpperCase())

const relLabel = (val: unknown, labelField: string): string => {
  if (!val || typeof val !== 'object') return '-'
  const obj = val as Record<string, unknown>
  return String(obj[labelField] || obj.id || '-')
}

const buildUserDisplayName = (user: unknown) => {
  if (!user || typeof user !== 'object') return '-'
  const u = user as Record<string, unknown>
  const firstName = String(u.firstName || '')
  const lastName = String(u.lastName || '')
  const name = `${firstName} ${lastName}`.trim()
  return name || String(u.email || '-')
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const doc = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentAllocations,
      id: parseNumberParam(id) || id,
      depth: 2,
      overrideAccess: true,
    }) as unknown as PaymentAllocationDoc | undefined

    if (!doc) throw new AccountingApiError('Payment allocation not found', 404)

    return NextResponse.json({
      id: String(doc.id),
      paymentReceivedId: String(getRelationshipId(doc.paymentReceived) || ''),
      paymentLabel: relLabel(doc.paymentReceived, 'receiptNumber') || '-',
      invoiceId: String(getRelationshipId(doc.invoice) || ''),
      invoiceLabel: relLabel(doc.invoice, 'invoiceNumber') || '-',
      billingLinkId: String(getRelationshipId(doc.enrollmentBillingLink) || ''),
      billingLinkLabel: relLabel(doc.enrollmentBillingLink, 'sourceReference') || '-',
      allocationDate: doc.allocationDate || null,
      allocationDateLabel: formatDate(doc.allocationDate) || '-',
      allocatedAmount: Number(doc.allocatedAmount || 0),
      allocatedAmountLabel: fmt(doc.allocatedAmount),
      allocationType: String(doc.allocationType || 'invoice_settlement'),
      allocationTypeLabel: titleCase(doc.allocationType),
      notes: doc.notes || '',
      createdByLabel: buildUserDisplayName(doc.createdBy),
      updatedByLabel: buildUserDisplayName(doc.updatedBy),
      createdAtLabel: formatDate(doc.createdAt) || '-',
      updatedAtLabel: formatDate(doc.updatedAt) || '-',
    })
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
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentAllocations,
      id: parseNumberParam(id) || id,
      depth: 0,
      overrideAccess: true,
    }) as unknown as Record<string, unknown> | undefined

    if (!existing) throw new AccountingApiError('Payment allocation not found', 404)

    const data: Record<string, unknown> = {}
    if (body.paymentReceived !== undefined) data.paymentReceived = Number(body.paymentReceived) || 0
    if (body.invoice !== undefined) data.invoice = body.invoice ? Number(body.invoice) || 0 : null
    if (body.enrollmentBillingLink !== undefined) data.enrollmentBillingLink = body.enrollmentBillingLink ? Number(body.enrollmentBillingLink) || 0 : null
    if (body.allocationDate !== undefined) data.allocationDate = String(body.allocationDate || new Date().toISOString())
    if (body.allocatedAmount !== undefined) data.allocatedAmount = Math.max(0.01, Number(body.allocatedAmount) || 0)
    if (body.allocationType !== undefined) data.allocationType = String(body.allocationType || 'invoice_settlement')
    if (body.notes !== undefined) data.notes = String(body.notes || '').trim() || null
    data.updatedBy = user.id

    const updated = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentAllocations,
      id: parseNumberParam(id) || id,
      depth: 2,
      overrideAccess: true,
      data: data as never,
    }) as unknown as PaymentAllocationDoc | undefined

    if (!updated) throw new AccountingApiError('Payment allocation not found after update', 404)

    return NextResponse.json({
      id: String(updated.id),
      paymentReceivedId: String(getRelationshipId(updated.paymentReceived) || ''),
      paymentLabel: relLabel(updated.paymentReceived, 'receiptNumber') || '-',
      invoiceId: String(getRelationshipId(updated.invoice) || ''),
      invoiceLabel: relLabel(updated.invoice, 'invoiceNumber') || '-',
      billingLinkId: String(getRelationshipId(updated.enrollmentBillingLink) || ''),
      billingLinkLabel: relLabel(updated.enrollmentBillingLink, 'sourceReference') || '-',
      allocationDate: updated.allocationDate || null,
      allocationDateLabel: formatDate(updated.allocationDate) || '-',
      allocatedAmount: Number(updated.allocatedAmount || 0),
      allocatedAmountLabel: fmt(updated.allocatedAmount),
      allocationType: String(updated.allocationType || 'invoice_settlement'),
      allocationTypeLabel: titleCase(updated.allocationType),
      notes: updated.notes || '',
      createdByLabel: buildUserDisplayName(updated.createdBy),
      updatedByLabel: buildUserDisplayName(updated.updatedBy),
      createdAtLabel: formatDate(updated.createdAt) || '-',
      updatedAtLabel: formatDate(updated.updatedAt) || '-',
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const linkId = parseNumberParam(id) || id

    const existing = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentAllocations,
      id: linkId,
      depth: 0,
      overrideAccess: true,
    }) as unknown as Record<string, unknown> | undefined

    if (!existing) throw new AccountingApiError('Payment allocation not found', 404)

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentAllocations,
      id: linkId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
