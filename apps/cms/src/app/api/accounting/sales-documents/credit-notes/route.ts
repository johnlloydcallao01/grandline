import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, DOCUMENT_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { AccountingCommercialService } from '@/accounting/services/AccountingCommercialService'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'
import { parseNumberParam } from '../../_utils/auth'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

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
  status?: string | null
  subtotal?: number | null
  taxTotal?: number | null
  total?: number | null
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
        }
      | number
      | string
      | null
    amountApplied?: number | null
  } | null> | null
  postedJournalEntry?: unknown
  reason?: string | null
}

type CustomerDoc = {
  id: number | string
  customerCode?: string | null
  displayName?: string | null
  status?: string | null
}

type InvoiceDoc = {
  id: number | string
  invoiceNumber?: string | null
  status?: string | null
  balanceDue?: number | null
  customer?:
    | {
        id?: number | string
        customerCode?: string | null
        displayName?: string | null
      }
    | number
    | string
    | null
}

type ChartAccountDoc = {
  id: number | string
  code?: string | null
  name?: string | null
  isActive?: boolean | null
}

type HistoryCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' }

type CreditNoteRow = {
  id: string
  creditNoteNumber: string
  creditDate: string | null
  creditDateLabel: string
  customerId: string
  customerLabel: string
  sourceInvoiceId: string
  sourceInvoiceLabel: string
  total: number
  totalLabel: string
  appliedAmount: number
  appliedAmountLabel: string
  remainingAmount: number
  remainingAmountLabel: string
  status: string
  statusLabel: string
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
  postedJournalEntryId: string
  reason: string
  searchableText: string
  cells: HistoryCell[]
}

type CreditNoteMutationApplication = {
  invoice?: unknown
  amountApplied?: unknown
}

const statusLabels = new Map<string, string>(DOCUMENT_STATUS_OPTIONS.map((option) => [option.value, option.label]))

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
  Array.from(
    new Set(
      searchParams
        .getAll(key)
        .flatMap((value) => String(value || '').split(','))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  )

const normalizeSearch = (value: unknown) => String(value ?? '').toLowerCase().trim()

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

const getStatusTone = (status: string | null | undefined): 'amber' | 'blue' | 'gray' | 'green' | 'red' => {
  switch (String(status || '')) {
    case 'draft':
      return 'blue'
    case 'approved':
    case 'partially_paid':
      return 'amber'
    case 'posted':
    case 'paid':
      return 'green'
    case 'voided':
      return 'red'
    default:
      return 'gray'
  }
}

const getAppliedAmount = (applications: CreditNoteDoc['applications']) =>
  normalizeAmount((applications || []).reduce((total, application) => total + normalizeAmount(application?.amountApplied), 0))

const buildCustomerLabel = (customer: CreditNoteDoc['customer'] | InvoiceDoc['customer']) => {
  if (!customer) return 'Unassigned Customer'
  if (typeof customer === 'number' || typeof customer === 'string') return String(customer)
  return `${customer.customerCode ? `${customer.customerCode} - ` : ''}${customer.displayName || `Customer ${customer.id || ''}`}`.trim()
}

const buildCustomerId = (customer: CreditNoteDoc['customer']) => {
  if (!customer) return 'unassigned'
  if (typeof customer === 'number' || typeof customer === 'string') return String(customer)
  return String(customer.id || 'unassigned')
}

const matchesCreditNoteQuickFilter = (row: CreditNoteRow, quickFilter: string) => {
  const [group, value] = quickFilter.split(':')

  if (group === 'status') {
    return row.status === value
  }

  if (group === 'balance') {
    if (value === 'remaining_balance') return row.remainingAmount > 0
    if (value === 'applied') return row.appliedAmount > 0
  }

  return false
}

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

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = normalizeCreditNoteMutationBody(await request.json())
    await assertCreditNoteMutationPayload(payload, body)

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.creditNotes,
      overrideAccess: true,
      data: {
        ...body,
        createdBy: user.id,
        updatedBy: user.id,
      } as never,
      depth: 0,
    })

    return NextResponse.json({ id: record.id }, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const customerIds = parseListParam(searchParams, 'customerId')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [creditNotes, customers, invoices, chartAccounts] = await Promise.all([
      findAllDocs<CreditNoteDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.creditNotes,
        depth: 2,
        sort: '-creditDate',
      }),
      findAllDocs<CustomerDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.customers,
        depth: 0,
        sort: 'displayName',
      }),
      findAllDocs<InvoiceDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
        depth: 1,
        sort: '-invoiceDate',
      }),
      findAllDocs<ChartAccountDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
        depth: 0,
        sort: 'code',
      }),
    ])

    const allRows = creditNotes.map<CreditNoteRow>((creditNote) => {
      const total = normalizeAmount(creditNote.total)
      const appliedAmount = getAppliedAmount(creditNote.applications)
      const remainingAmount = Math.max(0, normalizeAmount(total - appliedAmount))
      const status = String(creditNote.status || '')
      const sourceInvoiceLabel =
        typeof creditNote.sourceInvoice === 'object' && creditNote.sourceInvoice
          ? String(creditNote.sourceInvoice.invoiceNumber || `Invoice ${creditNote.sourceInvoice.id || ''}`)
          : String(creditNote.sourceInvoice || '-')
      const customerLabel = buildCustomerLabel(creditNote.customer)
      const sourceInvoiceId = String(getRelationshipId(creditNote.sourceInvoice) || '')

      return {
        id: String(creditNote.id),
        creditNoteNumber: String(creditNote.creditNoteNumber || `Credit ${creditNote.id}`),
        creditDate: creditNote.creditDate || null,
        creditDateLabel: formatDate(creditNote.creditDate),
        customerId: buildCustomerId(creditNote.customer),
        customerLabel,
        sourceInvoiceId,
        sourceInvoiceLabel,
        total,
        totalLabel: formatCurrency(total),
        appliedAmount,
        appliedAmountLabel: formatCurrency(appliedAmount),
        remainingAmount,
        remainingAmountLabel: formatCurrency(remainingAmount),
        status,
        statusLabel: statusLabels.get(status) || 'Unknown',
        statusTone: getStatusTone(status),
        postedJournalEntryId: String(getRelationshipId(creditNote.postedJournalEntry) || ''),
        reason: String(creditNote.reason || ''),
        searchableText: [
          creditNote.creditNoteNumber,
          customerLabel,
          sourceInvoiceLabel,
          creditNote.reason,
          formatDate(creditNote.creditDate),
        ]
          .map((value) => normalizeSearch(value))
          .filter(Boolean)
          .join(' '),
        cells: [
          { text: String(creditNote.creditNoteNumber || `Credit ${creditNote.id}`), emphasis: true },
          formatDate(creditNote.creditDate),
          customerLabel,
          sourceInvoiceLabel || '-',
          { text: formatCurrency(remainingAmount), emphasis: true, align: 'right' },
          { text: statusLabels.get(status) || 'Unknown', tone: getStatusTone(status) },
        ],
      }
    })

    const normalizedSearch = normalizeSearch(search)
    const filteredRows = allRows.filter((row) => {
      if (normalizedSearch && !row.searchableText.includes(normalizedSearch)) return false
      if (statuses.length > 0 && !statuses.includes(row.status)) return false
      if (customerIds.length > 0 && !customerIds.includes(row.customerId)) return false
      if (quickFilters.length > 0) {
        const quickFilterMatch = quickFilters.some((quickFilter) => matchesCreditNoteQuickFilter(row, quickFilter))
        if (!quickFilterMatch) return false
      }
      return true
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const paginatedRows = filteredRows.slice((page - 1) * limit, page * limit)

    const draftCredits = filteredRows.filter((row) => row.status === 'draft').length
    const postedCredits = filteredRows.filter((row) => ['posted', 'partially_paid', 'paid'].includes(row.status)).length
    const appliedAmountTotal = filteredRows.reduce((sum, row) => sum + row.appliedAmount, 0)
    const remainingCreditTotal = filteredRows.reduce((sum, row) => sum + row.remainingAmount, 0)

    return NextResponse.json({
      section: {
        id: 'credit-notes',
        label: 'Credit Notes',
        description: 'Manage customer credit notes through source invoices, applications, remaining balances, and posting status.',
        searchPlaceholder: 'Search credit note no., customer, source invoice, reason, or posting date',
        filters: {
          statuses: DOCUMENT_STATUS_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
          customers: customers
            .filter((customer) => customer.status !== 'inactive' && customer.status !== 'archived')
            .map((customer) => ({
              label: `${customer.customerCode ? `${customer.customerCode} - ` : ''}${customer.displayName || `Customer ${customer.id}`}`,
              value: String(customer.id),
            })),
          quickFilters: [
            { label: 'Draft', value: 'status:draft' },
            { label: 'Approved', value: 'status:approved' },
            { label: 'Posted', value: 'status:posted' },
            { label: 'Remaining Balance', value: 'balance:remaining_balance' },
            { label: 'Applied Credits', value: 'balance:applied' },
          ],
        },
        metrics: [
          { id: 'draft-credits', label: 'Draft Credits', value: draftCredits, change: 'Prepared but not yet posted', trend: 'neutral' },
          { id: 'posted-credits', label: 'Posted Credits', value: postedCredits, change: 'Reducing open receivable balances', trend: 'up' },
          { id: 'applied-amount', label: 'Applied Amount', value: formatCurrency(appliedAmountTotal), change: 'Applied back to customer invoices', trend: 'up' },
          { id: 'remaining-credit', label: 'Remaining Credit', value: formatCurrency(remainingCreditTotal), change: 'Available for further application', trend: 'down' },
        ],
        table: {
          title: 'Credit Note Register',
          description: 'Customer credit notes with source-invoice references, application progress, and remaining balances.',
          columns: ['Credit No.', 'Credit Date', 'Customer', 'Source Invoice', { label: 'Remaining', align: 'right' }, 'Status'],
          rows: paginatedRows,
        },
      },
      appliedFilters: {
        search,
        statuses,
        customerIds,
        quickFilters,
      },
      pagination: {
        page,
        limit,
        totalDocs,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
      totals: {
        totalRows: allRows.length,
        filteredRows: totalDocs,
      },
      referenceData: {
        customers: customers
          .filter((customer) => customer.status !== 'inactive' && customer.status !== 'archived')
          .map((customer) => ({
            id: customer.id,
            customerCode: customer.customerCode || null,
            displayName: customer.displayName || null,
          })),
        invoices: invoices
          .filter((invoice) => String(invoice.status || '') !== 'voided')
          .map((invoice) => ({
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber || null,
            status: String(invoice.status || ''),
            balanceDue: normalizeAmount(invoice.balanceDue),
            customerId: String(getRelationshipId(invoice.customer) || ''),
            customerLabel: buildCustomerLabel(invoice.customer),
          })),
        chartAccounts: chartAccounts
          .filter((account) => account.isActive !== false)
          .map((account) => ({
            id: account.id,
            code: account.code || null,
            name: account.name || null,
          })),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
