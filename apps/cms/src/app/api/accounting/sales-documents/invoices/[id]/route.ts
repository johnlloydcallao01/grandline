import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_HOOK_CONTEXT } from '@/accounting/constants/accounting'
import { AccountingCommercialService } from '@/accounting/services/AccountingCommercialService'
import { AccountingInvoiceService } from '@/accounting/services/invoices/AccountingInvoiceService'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'
import { handleAccountingApiError, parseNumberParam, requireAccountingAdmin } from '../../../_utils/auth'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

type InvoiceDoc = {
  id: number | string
  invoiceNumber?: string | null
  customer?:
    | {
        id?: number | string
        customerCode?: string | null
        displayName?: string | null
      }
    | number
    | string
    | null
  invoiceDate?: string | null
  postingDate?: string | null
  dueDate?: string | null
  status?: string | null
  postingStatus?: string | null
  currency?: string | null
  exchangeRate?: number | null
  subtotal?: number | null
  taxTotal?: number | null
  discountTotal?: number | null
  total?: number | null
  balanceDue?: number | null
  referenceNumber?: string | null
  memo?: string | null
  sourceType?: string | null
  sourceReference?: string | null
  receivableAccountOverride?:
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
  notes?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

type InvoiceLineDoc = {
  id: number | string
  lineNumber?: number | null
  description?: string | null
  itemType?: string | null
  quantity?: number | null
  unitPrice?: number | null
  discountAmount?: number | null
  lineSubtotal?: number | null
  lineTax?: number | null
  lineTotal?: number | null
  taxCode?:
    | {
        id?: number | string
        code?: string | null
        name?: string | null
        rate?: number | null
        calculationMethod?: string | null
      }
    | number
    | string
    | null
  incomeAccount?:
    | {
        id?: number | string
        code?: string | null
        name?: string | null
      }
    | number
    | string
    | null
  receivableAccountOverride?:
    | {
        id?: number | string
        code?: string | null
        name?: string | null
      }
    | number
    | string
    | null
}

type PaymentDoc = {
  applications?: Array<{
    invoice?: unknown
    amountApplied?: number | null
  } | null> | null
}

type CreditNoteDoc = {
  applications?: Array<{
    invoice?: unknown
    amountApplied?: number | null
  } | null> | null
}

type DocumentLinkDoc = {
  id: number | string
  entityType?: string | null
  entityId?: string | null
  documentCategory?: string | null
  documentDate?: string | null
  isPrimary?: boolean | null
  notes?: string | null
}

type InvoiceMutationLine = {
  description?: unknown
  itemType?: unknown
  quantity?: unknown
  unitPrice?: unknown
  discountAmount?: unknown
  taxCode?: unknown
  incomeAccount?: unknown
  receivableAccountOverride?: unknown
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

const normalizeInvoiceMutationBody = (body: Record<string, unknown>) => {
  const invoiceNumber =
    body.invoiceNumber === undefined
      ? undefined
      : typeof body.invoiceNumber === 'string'
        ? body.invoiceNumber.trim() || null
        : String(body.invoiceNumber ?? '').trim() || null

  const lineInputs = Array.isArray(body.lines) ? (body.lines as InvoiceMutationLine[]) : undefined

  return {
    ...(invoiceNumber !== undefined ? { invoiceNumber } : {}),
    ...(body.customer !== undefined ? { customer: normalizeRelationshipId(body.customer) } : {}),
    ...(body.invoiceDate !== undefined ? { invoiceDate: normalizeOptionalString(body.invoiceDate) } : {}),
    ...(body.postingDate !== undefined ? { postingDate: normalizeOptionalString(body.postingDate) } : {}),
    ...(body.dueDate !== undefined ? { dueDate: normalizeOptionalString(body.dueDate) } : {}),
    ...(body.status !== undefined ? { status: String(body.status || 'draft') } : {}),
    ...(body.currency !== undefined ? { currency: normalizeOptionalString(body.currency) } : {}),
    ...(body.exchangeRate !== undefined ? { exchangeRate: Number(body.exchangeRate ?? 1) } : {}),
    ...(body.referenceNumber !== undefined ? { referenceNumber: normalizeOptionalString(body.referenceNumber) } : {}),
    ...(body.memo !== undefined ? { memo: normalizeOptionalString(body.memo) } : {}),
    ...(body.sourceType !== undefined ? { sourceType: normalizeOptionalString(body.sourceType) } : {}),
    ...(body.sourceReference !== undefined ? { sourceReference: normalizeOptionalString(body.sourceReference) } : {}),
    ...(body.receivableAccountOverride !== undefined
      ? { receivableAccountOverride: normalizeRelationshipId(body.receivableAccountOverride) }
      : {}),
    ...(body.notes !== undefined ? { notes: normalizeOptionalString(body.notes) } : {}),
    ...(lineInputs !== undefined
      ? {
          lines: lineInputs.map((line, index) => ({
            lineNumber: index + 1,
            description: String(line.description || '').trim(),
            itemType: String(line.itemType || 'service'),
            quantity: Number(line.quantity ?? 0),
            unitPrice: Number(line.unitPrice ?? 0),
            discountAmount: Number(line.discountAmount ?? 0),
            taxCode: normalizeRelationshipId(line.taxCode),
            incomeAccount: normalizeRelationshipId(line.incomeAccount),
            receivableAccountOverride: normalizeRelationshipId(line.receivableAccountOverride),
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
  await payload.findByID({
    collection: collection as never,
    id: relationshipId,
    depth: 0,
    overrideAccess: true,
  }).catch(() => {
    throw new Error(`${label} with ID "${String(relationshipId)}" was not found.`)
  })
}

const assertInvoiceMutationPayload = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  body: ReturnType<typeof normalizeInvoiceMutationBody>,
) => {
  if ('customer' in body) {
    if (!body.customer) throw new Error('Customer is required.')
    await assertRelationshipExists(payload, ACCOUNTING_COLLECTION_SLUGS.customers, body.customer, 'Customer')
  }

  if ('invoiceDate' in body && !body.invoiceDate) throw new Error('Invoice date is required.')
  if ('postingDate' in body && !body.postingDate) throw new Error('Posting date is required.')
  if ('dueDate' in body && !body.dueDate) throw new Error('Due date is required.')

  if ('status' in body && !['draft', 'approved'].includes(String(body.status || ''))) {
    throw new Error('Editable invoices may only be saved as Draft or Approved.')
  }

  if ('receivableAccountOverride' in body) {
    await assertRelationshipExists(
      payload,
      ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      body.receivableAccountOverride || null,
      'Receivable account override',
    )
  }

  if (body.lines) {
    if (!body.lines.length) throw new Error('Invoices require at least one line item.')

    for (let index = 0; index < body.lines.length; index += 1) {
      const line = body.lines[index]
      if (!line.description) throw new Error(`Line ${index + 1} description is required.`)
      if (!(line.quantity > 0)) throw new Error(`Line ${index + 1} quantity must be greater than zero.`)
      if (line.unitPrice < 0) throw new Error(`Line ${index + 1} unit price cannot be negative.`)
      if (!line.incomeAccount) throw new Error(`Line ${index + 1} income account is required.`)

      await assertRelationshipExists(
        payload,
        ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
        line.incomeAccount,
        `Line ${index + 1} income account`,
      )
      await assertRelationshipExists(
        payload,
        ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
        line.receivableAccountOverride || null,
        `Line ${index + 1} receivable account override`,
      )
      await assertRelationshipExists(
        payload,
        ACCOUNTING_COLLECTION_SLUGS.taxCodes,
        line.taxCode || null,
        `Line ${index + 1} tax code`,
      )
    }
  }
}

const buildLineDetail = (line: InvoiceLineDoc) => ({
  id: String(line.id),
  lineNumber: Number(line.lineNumber || 0),
  description: String(line.description || ''),
  itemType: String(line.itemType || 'service'),
  quantity: normalizeAmount(line.quantity),
  unitPrice: normalizeAmount(line.unitPrice),
  discountAmount: normalizeAmount(line.discountAmount),
  lineSubtotal: normalizeAmount(line.lineSubtotal),
  lineTax: normalizeAmount(line.lineTax),
  lineTotal: normalizeAmount(line.lineTotal),
  taxCodeId: String(getRelationshipId(line.taxCode) || ''),
  taxCodeLabel:
    typeof line.taxCode === 'object' && line.taxCode
      ? `${line.taxCode.code ? `${line.taxCode.code} - ` : ''}${line.taxCode.name || 'Unnamed tax code'}`
      : '-',
  taxRate: typeof line.taxCode === 'object' && line.taxCode ? normalizeAmount(line.taxCode.rate) : 0,
  taxCalculationMethod:
    typeof line.taxCode === 'object' && line.taxCode ? String(line.taxCode.calculationMethod || 'exclusive') : 'exclusive',
  incomeAccountId: String(getRelationshipId(line.incomeAccount) || ''),
  incomeAccountLabel:
    typeof line.incomeAccount === 'object' && line.incomeAccount
      ? `${line.incomeAccount.code ? `${line.incomeAccount.code} - ` : ''}${line.incomeAccount.name || 'Unnamed account'}`
      : '',
  receivableAccountOverrideId: String(getRelationshipId(line.receivableAccountOverride) || ''),
  receivableAccountOverrideLabel:
    typeof line.receivableAccountOverride === 'object' && line.receivableAccountOverride
      ? `${line.receivableAccountOverride.code ? `${line.receivableAccountOverride.code} - ` : ''}${line.receivableAccountOverride.name || 'Unnamed account'}`
      : '',
  lineSubtotalLabel: formatCurrency(line.lineSubtotal),
  lineTaxLabel: formatCurrency(line.lineTax),
  lineTotalLabel: formatCurrency(line.lineTotal),
})

const getAppliedCountForInvoice = (
  rows: Array<PaymentDoc | CreditNoteDoc>,
  invoiceId: string,
) =>
  rows.reduce((count, row) => {
    const applications = Array.isArray(row.applications) ? row.applications : []
    return (
      count +
      applications.filter((application) => String(getRelationshipId(application?.invoice) || '') === invoiceId).length
    )
  }, 0)

const buildInvoiceDetailResponse = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  invoiceId: string,
) => {
  const [invoice, lineItems, postedPayments, creditNotes, documentLinks] = await Promise.all([
    payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
      id: invoiceId,
      depth: 2,
      overrideAccess: true,
    }) as Promise<InvoiceDoc>,
    findAllDocs<InvoiceLineDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems,
      depth: 2,
      where: {
        invoice: {
          equals: invoiceId,
        },
      },
      sort: 'lineNumber',
    }),
    findAllDocs<PaymentDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
      depth: 0,
      where: {
        status: {
          equals: 'posted',
        },
      },
    }),
    findAllDocs<CreditNoteDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.creditNotes,
      depth: 0,
      where: {
        status: {
          in: ['posted', 'partially_paid', 'paid'],
        },
      },
    }),
    findAllDocs<DocumentLinkDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.documentLinks,
      depth: 0,
      where: {
        and: [
          {
            entityType: {
              equals: 'invoice',
            },
          },
          {
            entityId: {
              equals: invoiceId,
            },
          },
        ],
      },
      sort: '-createdAt',
    }),
  ])

  const appliedPaymentsCount = getAppliedCountForInvoice(postedPayments, invoiceId)
  const appliedCreditNotesCount = getAppliedCountForInvoice(creditNotes, invoiceId)

  return {
    id: String(invoice.id),
    invoiceNumber: String(invoice.invoiceNumber || `Invoice ${invoice.id}`),
    customerId: String(getRelationshipId(invoice.customer) || ''),
    customerLabel:
      typeof invoice.customer === 'object' && invoice.customer
        ? `${invoice.customer.customerCode ? `${invoice.customer.customerCode} - ` : ''}${invoice.customer.displayName || 'Unnamed customer'}`
        : '',
    invoiceDate: invoice.invoiceDate || null,
    invoiceDateLabel: formatDate(invoice.invoiceDate),
    postingDate: invoice.postingDate || null,
    postingDateLabel: formatDate(invoice.postingDate),
    dueDate: invoice.dueDate || null,
    dueDateLabel: formatDate(invoice.dueDate),
    status: String(invoice.status || ''),
    statusLabel: toTitleLabel(invoice.status),
    postingStatus: String(invoice.postingStatus || ''),
    postingStatusLabel: toTitleLabel(invoice.postingStatus),
    currency: String(invoice.currency || 'PHP'),
    exchangeRate: normalizeAmount(invoice.exchangeRate || 1),
    subtotal: normalizeAmount(invoice.subtotal),
    subtotalLabel: formatCurrency(invoice.subtotal),
    taxTotal: normalizeAmount(invoice.taxTotal),
    taxTotalLabel: formatCurrency(invoice.taxTotal),
    discountTotal: normalizeAmount(invoice.discountTotal),
    discountTotalLabel: formatCurrency(invoice.discountTotal),
    total: normalizeAmount(invoice.total),
    totalLabel: formatCurrency(invoice.total),
    balanceDue: normalizeAmount(invoice.balanceDue),
    balanceDueLabel: formatCurrency(invoice.balanceDue),
    referenceNumber: String(invoice.referenceNumber || ''),
    memo: String(invoice.memo || ''),
    sourceType: String(invoice.sourceType || ''),
    sourceReference: String(invoice.sourceReference || ''),
    receivableAccountOverrideId: String(getRelationshipId(invoice.receivableAccountOverride) || ''),
    receivableAccountOverrideLabel:
      typeof invoice.receivableAccountOverride === 'object' && invoice.receivableAccountOverride
        ? `${invoice.receivableAccountOverride.code ? `${invoice.receivableAccountOverride.code} - ` : ''}${invoice.receivableAccountOverride.name || 'Unnamed account'}`
        : '',
    postedJournalEntryId: String(getRelationshipId(invoice.postedJournalEntry) || ''),
    notes: String(invoice.notes || ''),
    createdAt: invoice.createdAt || null,
    updatedAt: invoice.updatedAt || null,
    lineItems: lineItems.map(buildLineDetail),
    documentLinks: documentLinks.map((documentLink) => ({
      id: String(documentLink.id),
      documentCategory: String(documentLink.documentCategory || 'other'),
      documentCategoryLabel: toTitleLabel(documentLink.documentCategory),
      documentDate: documentLink.documentDate || null,
      documentDateLabel: formatDate(documentLink.documentDate),
      isPrimary: Boolean(documentLink.isPrimary),
      notes: String(documentLink.notes || ''),
    })),
    usageSummary: {
      lineItemCount: lineItems.length,
      appliedPaymentsCount,
      appliedCreditNotesCount,
      documentCount: documentLinks.length,
      hasDependents:
        appliedPaymentsCount > 0 ||
        appliedCreditNotesCount > 0 ||
        documentLinks.length > 0 ||
        Boolean(getRelationshipId(invoice.postedJournalEntry)),
    },
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    return NextResponse.json(await buildInvoiceDetailResponse(payload, params.id))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const invoiceId = params.id
    const currentInvoice = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
      id: invoiceId,
      depth: 0,
      overrideAccess: true,
    })) as InvoiceDoc

    AccountingCommercialService.assertMutableStatus(currentInvoice.status, 'Invoice')

    const body = normalizeInvoiceMutationBody(await request.json())
    await assertInvoiceMutationPayload(payload, body)

    const { lines, ...headerData } = body
    await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
      id: invoiceId,
      overrideAccess: true,
      context: {
        [ACCOUNTING_HOOK_CONTEXT.skipInvoiceTotalsSync]: true,
        [ACCOUNTING_HOOK_CONTEXT.skipInvoiceBalanceSync]: true,
      },
      data: {
        ...headerData,
        updatedBy: user.id,
      } as never,
    })

    if (lines) {
      const existingLines = await findAllDocs<InvoiceLineDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems,
        depth: 0,
        where: {
          invoice: {
            equals: invoiceId,
          },
        },
      })

      for (const existingLine of existingLines) {
        await payload.delete({
          collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems,
          id: existingLine.id,
          overrideAccess: true,
          context: {
            [ACCOUNTING_HOOK_CONTEXT.skipInvoiceTotalsSync]: true,
          },
        })
      }

      for (const line of lines) {
        await payload.create({
          collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems,
          overrideAccess: true,
          context: {
            [ACCOUNTING_HOOK_CONTEXT.skipInvoiceTotalsSync]: true,
          },
          data: {
            invoice: invoiceId,
            ...line,
            createdBy: user.id,
            updatedBy: user.id,
          } as never,
        })
      }

      await AccountingInvoiceService.syncTotals(payload, invoiceId)
    } else {
      await AccountingInvoiceService.syncBalance(payload, invoiceId)
    }

    return NextResponse.json(await buildInvoiceDetailResponse(payload, invoiceId))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const invoiceId = params.id
    const invoiceDetail = await buildInvoiceDetailResponse(payload, invoiceId)

    AccountingCommercialService.assertMutableStatus(invoiceDetail.status, 'Invoice')

    if (invoiceDetail.usageSummary.hasDependents) {
      throw new Error(
        'Invoice cannot be deleted because it already has dependent postings, payments, or credit note applications.',
      )
    }

    const existingLines = await findAllDocs<InvoiceLineDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems,
      depth: 0,
      where: {
        invoice: {
          equals: invoiceId,
        },
      },
    })

    for (const existingLine of existingLines) {
      await payload.delete({
        collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems,
        id: existingLine.id,
        overrideAccess: true,
        context: {
          [ACCOUNTING_HOOK_CONTEXT.skipInvoiceTotalsSync]: true,
        },
      })
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
      id: invoiceId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
