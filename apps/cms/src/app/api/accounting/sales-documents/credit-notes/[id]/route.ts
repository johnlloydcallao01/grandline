import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { AccountingCommercialService } from '@/accounting/services/AccountingCommercialService'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'
import { handleAccountingApiError, parseNumberParam, requireAccountingAdmin } from '../../../_utils/auth'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

type CreditNoteDoc = {
  id: number | string
  creditNoteNumber?: string | null
  customer?:
    | {
        id?: number | string
        customerCode?: string | null
        displayName?: string | null
      }
    | number
    | string
    | null
  creditDate?: string | null
  postingDate?: string | null
  status?: string | null
  currency?: string | null
  subtotal?: number | null
  taxTotal?: number | null
  total?: number | null
  appliedAmount?: number | null
  remainingAmount?: number | null
  sourceInvoice?:
    | {
        id?: number | string
        invoiceNumber?: string | null
      }
    | number
    | string
    | null
  applications?: Array<{
    invoice?:
      | {
          id?: number | string
          invoiceNumber?: string | null
          balanceDue?: number | null
        }
      | number
      | string
      | null
    amountApplied?: number | null
  } | null> | null
  adjustmentAccount?:
    | {
        id?: number | string
        code?: string | null
        name?: string | null
      }
    | number
    | string
    | null
  postedJournalEntry?:
    | {
        id?: number | string
      }
    | number
    | string
    | null
  reason?: string | null
  notes?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

type CreditNoteMutationApplication = {
  invoice?: unknown
  amountApplied?: unknown
}

const formatDate = (value: string | null | undefined) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

const normalizeRelationshipId = (value: unknown) => {
  if (value === undefined || value === null || value === '') return null
  const stringValue = String(value).trim()
  if (!stringValue || stringValue === 'null' || stringValue === 'undefined') return null
  return parseNumberParam(stringValue)
}

const normalizeOptionalString = (value: unknown) => {
  if (value === undefined) return undefined
  if (value === null) return null
  const normalized = String(value).trim()
  return normalized || null
}

const toTitleLabel = (value: string | null | undefined) =>
  String(value || '')
    .split('_')
    .join(' ')
    .replace(/\b\w/g, (char: string) => char.toUpperCase())

const normalizeCreditNoteMutationBody = (body: Record<string, unknown>) => {
  const applications = Array.isArray(body.applications) ? (body.applications as CreditNoteMutationApplication[]) : undefined
  const subtotal = body.subtotal !== undefined ? normalizeAmount(body.subtotal) : undefined
  const taxTotal = body.taxTotal !== undefined ? normalizeAmount(body.taxTotal) : undefined
  const computedTotal =
    subtotal !== undefined || taxTotal !== undefined ? normalizeAmount((subtotal || 0) + (taxTotal || 0)) : undefined

  return {
    ...(body.creditNoteNumber !== undefined ? { creditNoteNumber: normalizeOptionalString(body.creditNoteNumber) } : {}),
    ...(body.customer !== undefined ? { customer: normalizeRelationshipId(body.customer) } : {}),
    ...(body.creditDate !== undefined ? { creditDate: normalizeOptionalString(body.creditDate) } : {}),
    ...(body.postingDate !== undefined ? { postingDate: normalizeOptionalString(body.postingDate) } : {}),
    ...(body.status !== undefined ? { status: String(body.status || 'draft') } : {}),
    ...(body.currency !== undefined ? { currency: normalizeOptionalString(body.currency) } : {}),
    ...(subtotal !== undefined ? { subtotal } : {}),
    ...(taxTotal !== undefined ? { taxTotal } : {}),
    ...(computedTotal !== undefined ? { total: computedTotal } : {}),
    ...(body.sourceInvoice !== undefined ? { sourceInvoice: normalizeRelationshipId(body.sourceInvoice) } : {}),
    ...(body.adjustmentAccount !== undefined ? { adjustmentAccount: normalizeRelationshipId(body.adjustmentAccount) } : {}),
    ...(body.reason !== undefined ? { reason: normalizeOptionalString(body.reason) } : {}),
    ...(body.notes !== undefined ? { notes: normalizeOptionalString(body.notes) } : {}),
    ...(applications !== undefined
      ? {
          applications: applications.map((application) => ({
            invoice: normalizeRelationshipId(application.invoice),
            amountApplied: normalizeAmount(application.amountApplied),
          })),
        }
      : {}),
  }
}

const assertRelationshipExists = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  collection: string,
  relationshipId: string | number | null,
  label: string,
) => {
  if (relationshipId === null) return
  await payload
    .findByID({
      collection: collection as never,
      id: relationshipId,
      depth: 0,
      overrideAccess: true,
    })
    .catch(() => {
      throw new Error(`${label} with ID "${String(relationshipId)}" was not found.`)
    })
}

const assertCreditNoteMutationPayload = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  body: ReturnType<typeof normalizeCreditNoteMutationBody>,
) => {
  if ('customer' in body) {
    if (!body.customer) throw new Error('Customer is required.')
    await assertRelationshipExists(payload, ACCOUNTING_COLLECTION_SLUGS.customers, body.customer, 'Customer')
  }

  if ('adjustmentAccount' in body) {
    if (!body.adjustmentAccount) throw new Error('Adjustment account is required.')
    await assertRelationshipExists(payload, ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, body.adjustmentAccount, 'Adjustment account')
  }

  if ('sourceInvoice' in body) {
    await assertRelationshipExists(payload, ACCOUNTING_COLLECTION_SLUGS.invoices, body.sourceInvoice || null, 'Source invoice')
  }

  if ('creditDate' in body && !body.creditDate) throw new Error('Credit date is required.')
  if ('postingDate' in body && !body.postingDate) throw new Error('Posting date is required.')

  if ('status' in body && !['draft', 'approved'].includes(String(body.status || ''))) {
    throw new Error('Editable credit notes may only be saved as Draft or Approved.')
  }

  if (body.subtotal !== undefined && body.subtotal < 0) throw new Error('Subtotal cannot be negative.')
  if (body.taxTotal !== undefined && body.taxTotal < 0) throw new Error('Tax total cannot be negative.')
  if (body.total !== undefined && body.total <= 0) throw new Error('Credit notes require a positive total.')

  if (body.applications) {
    await AccountingCommercialService.validateCreditNoteApplications(payload, body.applications, body.customer)
    const appliedAmount = AccountingCommercialService.getAppliedAmountFromArray(body.applications)
    if (body.total !== undefined && appliedAmount > body.total) {
      throw new Error('Credit note applications cannot exceed the credit note total.')
    }
  }
}

const buildCreditNoteDetailResponse = (creditNote: CreditNoteDoc) => {
  const total = normalizeAmount(creditNote.total)
  const appliedAmount = AccountingCommercialService.getAppliedAmountFromArray(creditNote.applications)
  const remainingAmount = Math.max(0, normalizeAmount(total - appliedAmount))

  return {
    id: String(creditNote.id),
    creditNoteNumber: String(creditNote.creditNoteNumber || `Credit ${creditNote.id}`),
    customerId: String(getRelationshipId(creditNote.customer) || ''),
    customerLabel:
      typeof creditNote.customer === 'object' && creditNote.customer
        ? `${creditNote.customer.customerCode ? `${creditNote.customer.customerCode} - ` : ''}${creditNote.customer.displayName || 'Unnamed customer'}`
        : '',
    creditDate: creditNote.creditDate || null,
    creditDateLabel: formatDate(creditNote.creditDate),
    postingDate: creditNote.postingDate || null,
    postingDateLabel: formatDate(creditNote.postingDate),
    status: String(creditNote.status || ''),
    statusLabel: toTitleLabel(creditNote.status),
    currency: String(creditNote.currency || 'PHP'),
    subtotal: normalizeAmount(creditNote.subtotal),
    subtotalLabel: formatCurrency(creditNote.subtotal),
    taxTotal: normalizeAmount(creditNote.taxTotal),
    taxTotalLabel: formatCurrency(creditNote.taxTotal),
    total,
    totalLabel: formatCurrency(total),
    appliedAmount,
    appliedAmountLabel: formatCurrency(appliedAmount),
    remainingAmount,
    remainingAmountLabel: formatCurrency(remainingAmount),
    sourceInvoiceId: String(getRelationshipId(creditNote.sourceInvoice) || ''),
    sourceInvoiceLabel:
      typeof creditNote.sourceInvoice === 'object' && creditNote.sourceInvoice
        ? String(creditNote.sourceInvoice.invoiceNumber || `Invoice ${creditNote.sourceInvoice.id || ''}`)
        : '',
    adjustmentAccountId: String(getRelationshipId(creditNote.adjustmentAccount) || ''),
    adjustmentAccountLabel:
      typeof creditNote.adjustmentAccount === 'object' && creditNote.adjustmentAccount
        ? `${creditNote.adjustmentAccount.code ? `${creditNote.adjustmentAccount.code} - ` : ''}${creditNote.adjustmentAccount.name || 'Unnamed account'}`
        : '',
    postedJournalEntryId: String(getRelationshipId(creditNote.postedJournalEntry) || ''),
    reason: String(creditNote.reason || ''),
    notes: String(creditNote.notes || ''),
    createdAt: creditNote.createdAt || null,
    updatedAt: creditNote.updatedAt || null,
    applications: (creditNote.applications || []).map((application, index) => ({
      id: `${creditNote.id}-application-${index + 1}`,
      invoiceId: String(getRelationshipId(application?.invoice) || ''),
      invoiceLabel:
        typeof application?.invoice === 'object' && application?.invoice
          ? String(application.invoice.invoiceNumber || `Invoice ${application.invoice.id || ''}`)
          : '',
      amountApplied: normalizeAmount(application?.amountApplied),
      amountAppliedLabel: formatCurrency(application?.amountApplied),
      invoiceBalanceDue:
        typeof application?.invoice === 'object' && application?.invoice
          ? normalizeAmount(application.invoice.balanceDue)
          : 0,
      invoiceBalanceDueLabel:
        typeof application?.invoice === 'object' && application?.invoice
          ? formatCurrency(application.invoice.balanceDue)
          : formatCurrency(0),
    })),
    usageSummary: {
      applicationCount: Array.isArray(creditNote.applications) ? creditNote.applications.length : 0,
      hasPostedJournalEntry: Boolean(getRelationshipId(creditNote.postedJournalEntry)),
      hasBlockingDependents: Boolean(getRelationshipId(creditNote.postedJournalEntry)),
    },
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const creditNote = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.creditNotes,
      id: params.id,
      depth: 2,
      overrideAccess: true,
    })) as CreditNoteDoc

    return NextResponse.json(buildCreditNoteDetailResponse(creditNote))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const creditNoteId = params.id
    const currentCreditNote = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.creditNotes,
      id: creditNoteId,
      depth: 0,
      overrideAccess: true,
    })) as CreditNoteDoc

    AccountingCommercialService.assertMutableStatus(currentCreditNote.status, 'Credit note')

    const body = normalizeCreditNoteMutationBody(await request.json())
    await assertCreditNoteMutationPayload(payload, body)

    const updated = (await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.creditNotes,
      id: creditNoteId,
      overrideAccess: true,
      data: {
        ...body,
        updatedBy: user.id,
      } as never,
      depth: 2,
    })) as CreditNoteDoc

    return NextResponse.json(buildCreditNoteDetailResponse(updated))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const creditNoteId = params.id
    const currentCreditNote = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.creditNotes,
      id: creditNoteId,
      depth: 0,
      overrideAccess: true,
    })) as CreditNoteDoc

    AccountingCommercialService.assertMutableStatus(currentCreditNote.status, 'Credit note')

    if (getRelationshipId(currentCreditNote.postedJournalEntry)) {
      throw new Error('Credit note cannot be deleted because it already has a posted journal entry.')
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.creditNotes,
      id: creditNoteId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
