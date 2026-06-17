import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, DOCUMENT_STATUS_OPTIONS, POSTING_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

type HistoryCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' }

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
  postedJournalEntry?: unknown
  notes?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

type CustomerDoc = {
  id: number | string
  customerCode?: string | null
  displayName?: string | null
  status?: string | null
}

type ChartAccountDoc = {
  id: number | string
  code?: string | null
  name?: string | null
  isActive?: boolean | null
}

type TaxCodeDoc = {
  id: number | string
  code?: string | null
  name?: string | null
  rate?: number | null
  calculationMethod?: string | null
  isActive?: boolean | null
}

type InvoiceRegisterRow = {
  id: string
  invoiceNumber: string
  invoiceDate: string | null
  invoiceDateLabel: string
  customerId: string
  customerCode: string
  customerLabel: string
  dueDate: string | null
  dueDateLabel: string
  total: number
  totalLabel: string
  balanceDue: number
  balanceDueLabel: string
  status: string
  statusLabel: string
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
  postingStatus: string
  postingStatusLabel: string
  referenceNumber: string
  memo: string
  sourceType: string
  sourceReference: string
  receivableAccountLabel: string
  postedJournalEntryId: string
  cells: HistoryCell[]
  searchableText: string
}

const statusLabels = new Map<string, string>(DOCUMENT_STATUS_OPTIONS.map((option) => [option.value, option.label]))
const postingStatusLabels = new Map<string, string>(POSTING_STATUS_OPTIONS.map((option) => [option.value, option.label]))

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

const buildSearchableText = (parts: Array<unknown>) =>
  parts
    .map((part) => normalizeSearch(part))
    .filter(Boolean)
    .join(' ')

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

const getCustomerLabel = (customer: InvoiceDoc['customer']) => {
  if (!customer) return 'Unassigned Customer'
  if (typeof customer === 'number' || typeof customer === 'string') return String(customer)
  const code = customer.customerCode ? `${customer.customerCode} - ` : ''
  return `${code}${customer.displayName || `Customer ${customer.id || ''}`}`.trim()
}

const getCustomerId = (customer: InvoiceDoc['customer']) => {
  if (!customer) return 'unassigned'
  if (typeof customer === 'number' || typeof customer === 'string') return String(customer)
  return String(customer.id || 'unassigned')
}

const getReceivableAccountLabel = (account: InvoiceDoc['receivableAccountOverride']) => {
  if (!account) return '-'
  if (typeof account === 'number' || typeof account === 'string') return String(account)
  return `${account.code ? `${account.code} - ` : ''}${account.name || 'Unnamed account'}`.trim()
}

const isDueThisWeek = (dueDate: string | null | undefined) => {
  if (!dueDate) return false
  const date = new Date(dueDate)
  if (Number.isNaN(date.getTime())) return false
  const now = new Date()
  const end = new Date(now)
  end.setDate(now.getDate() + 7)
  return date >= new Date(now.setHours(0, 0, 0, 0)) && date <= end
}

const isOverdue = (dueDate: string | null | undefined, balanceDue: number) => {
  if (!dueDate || balanceDue <= 0) return false
  const date = new Date(dueDate)
  if (Number.isNaN(date.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

const mapInvoiceRow = (doc: InvoiceDoc): InvoiceRegisterRow => {
  const status = String(doc.status || '')
  const postingStatus = String(doc.postingStatus || '')
  const customerLabel = getCustomerLabel(doc.customer)
  const total = normalizeAmount(doc.total)
  const balanceDue = normalizeAmount(doc.balanceDue)

  return {
    id: String(doc.id),
    invoiceNumber: String(doc.invoiceNumber || `Invoice ${doc.id}`),
    invoiceDate: doc.invoiceDate || null,
    invoiceDateLabel: formatDate(doc.invoiceDate),
    customerId: getCustomerId(doc.customer),
    customerCode: typeof doc.customer === 'object' && doc.customer ? String(doc.customer.customerCode || '') : '',
    customerLabel,
    dueDate: doc.dueDate || null,
    dueDateLabel: formatDate(doc.dueDate),
    total,
    totalLabel: formatCurrency(total),
    balanceDue,
    balanceDueLabel: formatCurrency(balanceDue),
    status,
    statusLabel: statusLabels.get(status) || 'Unknown',
    statusTone: getStatusTone(status),
    postingStatus,
    postingStatusLabel: postingStatusLabels.get(postingStatus) || 'Unknown',
    referenceNumber: String(doc.referenceNumber || ''),
    memo: String(doc.memo || ''),
    sourceType: String(doc.sourceType || ''),
    sourceReference: String(doc.sourceReference || ''),
    receivableAccountLabel: getReceivableAccountLabel(doc.receivableAccountOverride),
    postedJournalEntryId: String(getRelationshipId(doc.postedJournalEntry) || ''),
    cells: [
      { text: String(doc.invoiceNumber || `Invoice ${doc.id}`), emphasis: true },
      formatDate(doc.invoiceDate),
      customerLabel,
      formatDate(doc.dueDate),
      { text: formatCurrency(total), emphasis: true, align: 'right' },
      { text: statusLabels.get(status) || 'Unknown', tone: getStatusTone(status) },
    ],
    searchableText: buildSearchableText([
      doc.invoiceNumber,
      customerLabel,
      doc.referenceNumber,
      doc.memo,
      formatDate(doc.dueDate),
      formatCurrency(total),
      formatCurrency(balanceDue),
      statusLabels.get(status),
      postingStatusLabels.get(postingStatus),
    ]),
  }
}

const matchesInvoiceQuickFilter = (row: InvoiceRegisterRow, quickFilter: string) => {
  const [group, value] = quickFilter.split(':')

  if (group === 'status') {
    return row.status === value
  }

  if (group === 'postingStatus') {
    return row.postingStatus === value
  }

  if (group === 'due') {
    if (value === 'due_this_week') return isDueThisWeek(row.dueDate)
    if (value === 'overdue') return isOverdue(row.dueDate, row.balanceDue)
  }

  if (group === 'balance') {
    if (value === 'open') return row.balanceDue > 0
  }

  return false
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const postingStatuses = parseListParam(searchParams, 'postingStatus')
    const customerIds = parseListParam(searchParams, 'customerId')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [invoiceDocs, customerDocs, chartAccountDocs, taxCodeDocs] = await Promise.all([
      findAllDocs<InvoiceDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
        depth: 1,
        sort: '-invoiceDate',
      }),
      findAllDocs<CustomerDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.customers,
        depth: 0,
        sort: 'displayName',
      }),
      findAllDocs<ChartAccountDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
        depth: 0,
        sort: 'code',
      }),
      findAllDocs<TaxCodeDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
        depth: 0,
        sort: 'code',
      }),
    ])

    const allRows = invoiceDocs.map(mapInvoiceRow)
    const normalizedSearch = normalizeSearch(search)
    const filteredRows = allRows.filter((row) => {
      if (normalizedSearch && !row.searchableText.includes(normalizedSearch)) return false
      if (statuses.length > 0 && !statuses.includes(row.status)) return false
      if (postingStatuses.length > 0 && !postingStatuses.includes(row.postingStatus)) return false
      if (customerIds.length > 0 && !customerIds.includes(row.customerId)) return false
      if (quickFilters.length > 0) {
        const quickFilterMatch = quickFilters.some((quickFilter) => matchesInvoiceQuickFilter(row, quickFilter))
        if (!quickFilterMatch) return false
      }
      return true
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const paginatedRows = filteredRows.slice((page - 1) * limit, page * limit)

    const draftInvoices = filteredRows.filter((row) => row.status === 'draft').length
    const postedInvoices = filteredRows.filter((row) => ['posted', 'partially_paid', 'paid'].includes(row.status)).length
    const openReceivableBalance = filteredRows.reduce((sum, row) => sum + row.balanceDue, 0)
    const dueThisWeekCount = filteredRows.filter((row) => isDueThisWeek(row.dueDate) && row.balanceDue > 0).length

    return NextResponse.json({
      section: {
        id: 'invoices',
        label: 'Invoices',
        description:
          'Create, review, and post customer invoices with due dates, totals, balances, and settlement status.',
        searchPlaceholder: 'Search invoice no., customer, reference no., memo, or due date',
        filters: {
          statuses: DOCUMENT_STATUS_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
          postingStatuses: POSTING_STATUS_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
          customers: customerDocs
            .filter((customer) => customer.status !== 'inactive' && customer.status !== 'archived')
            .map((customer) => ({
              label: `${customer.customerCode ? `${customer.customerCode} - ` : ''}${customer.displayName || `Customer ${customer.id}`}`,
              value: String(customer.id),
            })),
          quickFilters: [
            { label: 'Draft', value: 'status:draft' },
            { label: 'Approved', value: 'status:approved' },
            { label: 'Posted', value: 'status:posted' },
            { label: 'Partially Paid', value: 'status:partially_paid' },
            { label: 'Due This Week', value: 'due:due_this_week' },
            { label: 'Overdue', value: 'due:overdue' },
            { label: 'Open Balance', value: 'balance:open' },
          ],
        },
        metrics: [
          {
            id: 'draft-invoices',
            label: 'Draft Invoices',
            value: draftInvoices,
            change: 'Prepared before posting',
            trend: 'neutral',
          },
          {
            id: 'posted-invoices',
            label: 'Posted Invoices',
            value: postedInvoices,
            change: 'Includes paid and partially paid invoices',
            trend: 'up',
          },
          {
            id: 'open-receivable-balance',
            label: 'Open Receivable Balance',
            value: formatCurrency(openReceivableBalance),
            change: 'Across posted and partially paid invoices',
            trend: 'neutral',
          },
          {
            id: 'due-this-week',
            label: 'Due This Week',
            value: dueThisWeekCount,
            change: 'Upcoming receivable due dates',
            trend: 'down',
          },
        ],
        table: {
          title: 'Invoice Register',
          description: 'Primary invoice register aligned with the invoice collection, due dates, and balance-due fields.',
          columns: ['Invoice No.', 'Invoice Date', 'Customer', 'Due Date', { label: 'Total', align: 'right' }, 'Status'],
          rows: paginatedRows,
        },
      },
      appliedFilters: {
        search,
        statuses,
        postingStatuses,
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
        customers: customerDocs
          .filter((customer) => customer.status !== 'inactive' && customer.status !== 'archived')
          .map((customer) => ({
            id: customer.id,
            customerCode: customer.customerCode || null,
            displayName: customer.displayName || null,
          })),
        chartAccounts: chartAccountDocs
          .filter((account) => account.isActive !== false)
          .map((account) => ({
            id: account.id,
            code: account.code || null,
            name: account.name || null,
          })),
        taxCodes: taxCodeDocs
          .filter((taxCode) => taxCode.isActive !== false)
          .map((taxCode) => ({
            id: taxCode.id,
            code: taxCode.code || null,
            name: taxCode.name || null,
            rate: normalizeAmount(taxCode.rate),
            calculationMethod: String(taxCode.calculationMethod || 'exclusive'),
          })),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
