import { ACCOUNTING_COLLECTION_SLUGS, DOCUMENT_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'
import type { Payload } from 'payload'

export type OverdueHistoryCell =
  | string
  | {
      text: string
      tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'
      emphasis?: boolean
      align?: 'left' | 'right' | 'center'
    }

export type OverdueInvoiceDoc = {
  id: number | string
  invoiceNumber?: string | null
  customer?:
    | {
        id?: number | string
        customerCode?: string | null
        displayName?: string | null
        status?: string | null
      }
    | number
    | string
    | null
  invoiceDate?: string | null
  dueDate?: string | null
  status?: string | null
  postingStatus?: string | null
  total?: number | null
  balanceDue?: number | null
  referenceNumber?: string | null
  memo?: string | null
  postedJournalEntry?:
    | {
        id?: number | string
      }
    | number
    | string
    | null
}

export type OverdueInvoiceRow = {
  id: string
  invoiceNumber: string
  invoiceDate: string | null
  invoiceDateLabel: string
  customerId: string
  customerCode: string
  customerLabel: string
  dueDate: string | null
  dueDateLabel: string
  balanceDue: number
  balanceDueLabel: string
  total: number
  totalLabel: string
  daysOverdue: number
  daysOverdueLabel: string
  agingBucket: string
  agingBucketLabel: string
  status: string
  statusLabel: string
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
  isDueToday: boolean
  isHighBalance: boolean
  referenceNumber: string
  memo: string
  postedJournalEntryId: string
  searchableText: string
  cells: OverdueHistoryCell[]
}

const HIGH_BALANCE_THRESHOLD = 100000
const OPEN_QUEUE_STATUSES = new Set(['posted', 'partially_paid'])
const statusLabels = new Map<string, string>(DOCUMENT_STATUS_OPTIONS.map((option) => [option.value, option.label]))

export const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

export const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
  Array.from(
    new Set(
      searchParams
        .getAll(key)
        .flatMap((value) => String(value || '').split(','))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  )

export const normalizeSearch = (value: unknown) => String(value ?? '').toLowerCase().trim()

export const buildSearchableText = (parts: Array<unknown>) =>
  parts
    .map((part) => normalizeSearch(part))
    .filter(Boolean)
    .join(' ')

export const formatDate = (value: string | null | undefined) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

export const getStatusTone = (
  status: string | null | undefined,
): 'amber' | 'blue' | 'gray' | 'green' | 'red' => {
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

const startOfToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export const computeDaysOverdue = (dueDate: string | null | undefined) => {
  if (!dueDate) return null
  const due = new Date(dueDate)
  if (Number.isNaN(due.getTime())) return null
  due.setHours(0, 0, 0, 0)
  const today = startOfToday()
  return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
}

export const buildAgingBucket = (daysOverdue: number) => {
  if (daysOverdue <= 0) {
    return { value: 'due_today', label: 'Due Today' }
  }

  if (daysOverdue <= 30) {
    return { value: '1_30', label: '1-30 Days' }
  }

  if (daysOverdue <= 60) {
    return { value: '31_60', label: '31-60 Days' }
  }

  if (daysOverdue <= 90) {
    return { value: '61_90', label: '61-90 Days' }
  }

  return { value: 'over_90', label: 'Over 90 Days' }
}

export const isOpenReceivableQueueInvoice = (invoice: OverdueInvoiceDoc) => {
  const balanceDue = normalizeAmount(invoice.balanceDue)
  const status = String(invoice.status || '')
  const daysOverdue = computeDaysOverdue(invoice.dueDate)
  return OPEN_QUEUE_STATUSES.has(status) && balanceDue > 0 && daysOverdue !== null && daysOverdue >= 0
}

export const buildOverdueInvoiceRow = (invoice: OverdueInvoiceDoc): OverdueInvoiceRow => {
  const invoiceId = String(invoice.id)
  const customer =
    typeof invoice.customer === 'object' && invoice.customer ? invoice.customer : null
  const customerId = String(getRelationshipId(invoice.customer) || '')
  const customerLabel = customer
    ? `${customer.customerCode ? `${customer.customerCode} - ` : ''}${customer.displayName || `Customer ${customer.id || ''}`}`.trim()
    : String(invoice.customer || 'Unassigned Customer')
  const status = String(invoice.status || '')
  const total = normalizeAmount(invoice.total)
  const balanceDue = normalizeAmount(invoice.balanceDue)
  const daysOverdue = Math.max(0, computeDaysOverdue(invoice.dueDate) || 0)
  const agingBucket = buildAgingBucket(daysOverdue)
  const isDueToday = daysOverdue === 0
  const isHighBalance = balanceDue >= HIGH_BALANCE_THRESHOLD

  return {
    id: invoiceId,
    invoiceNumber: String(invoice.invoiceNumber || `Invoice ${invoiceId}`),
    invoiceDate: invoice.invoiceDate || null,
    invoiceDateLabel: formatDate(invoice.invoiceDate),
    customerId,
    customerCode: String(customer?.customerCode || ''),
    customerLabel,
    dueDate: invoice.dueDate || null,
    dueDateLabel: formatDate(invoice.dueDate),
    balanceDue,
    balanceDueLabel: formatCurrency(balanceDue),
    total,
    totalLabel: formatCurrency(total),
    daysOverdue,
    daysOverdueLabel: String(daysOverdue),
    agingBucket: agingBucket.value,
    agingBucketLabel: agingBucket.label,
    status,
    statusLabel: statusLabels.get(status) || 'Unknown',
    statusTone: getStatusTone(status),
    isDueToday,
    isHighBalance,
    referenceNumber: String(invoice.referenceNumber || ''),
    memo: String(invoice.memo || ''),
    postedJournalEntryId: String(getRelationshipId(invoice.postedJournalEntry) || ''),
    searchableText: buildSearchableText([
      invoice.invoiceNumber,
      customerLabel,
      formatDate(invoice.dueDate),
      formatCurrency(balanceDue),
      daysOverdue,
      agingBucket.label,
      statusLabels.get(status),
      invoice.referenceNumber,
      invoice.memo,
    ]),
    cells: [
      { text: customerLabel, emphasis: true },
      String(invoice.invoiceNumber || `Invoice ${invoiceId}`),
      formatDate(invoice.dueDate),
      { text: formatCurrency(balanceDue), emphasis: true, align: 'right' },
      { text: String(daysOverdue), align: 'right' },
      { text: statusLabels.get(status) || 'Unknown', tone: getStatusTone(status) },
    ],
  }
}

export const matchesOverdueQuickFilter = (
  row: OverdueInvoiceRow,
  quickFilter: string,
) => {
  const [group, value] = quickFilter.split(':')

  if (group === 'queue') {
    if (value === 'overdue') return row.daysOverdue > 0
    if (value === 'due_today') return row.isDueToday
  }

  if (group === 'status') {
    return row.status === value
  }

  if (group === 'balance') {
    if (value === 'high') return row.isHighBalance
  }

  if (group === 'aging') {
    return row.agingBucket === value
  }

  return false
}

export const matchesSelectedOverdueFilters = (
  row: OverdueInvoiceRow,
  filters: {
    statuses: string[]
    customerIds: string[]
    agingBuckets: string[]
    quickFilters: string[]
  },
) => {
  const predicates = [
    ...filters.statuses.map((status) => row.status === status),
    ...filters.customerIds.map((customerId) => row.customerId === customerId),
    ...filters.agingBuckets.map((agingBucket) => row.agingBucket === agingBucket),
    ...filters.quickFilters.map((quickFilter) => matchesOverdueQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) {
    return true
  }

  return predicates.some(Boolean)
}

export const buildOverdueMetrics = (rows: OverdueInvoiceRow[]) => {
  const overdueRows = rows.filter((row) => row.daysOverdue > 0)
  const partiallyPaidOverdue = overdueRows.filter((row) => row.status === 'partially_paid').length
  const dueTodayCount = rows.filter((row) => row.isDueToday).length
  const overdueBalance = overdueRows.reduce((sum, row) => sum + row.balanceDue, 0)

  return [
    {
      id: 'overdue-invoices',
      label: 'Overdue Invoices',
      value: overdueRows.length,
      change: 'Invoices already beyond due date',
      trend: 'down' as const,
    },
    {
      id: 'overdue-balance',
      label: 'Overdue Balance',
      value: formatCurrency(overdueBalance),
      change: 'Open receivable exposure needing follow-up',
      trend: 'down' as const,
    },
    {
      id: 'partially-paid-overdue',
      label: 'Partially Paid Overdue',
      value: partiallyPaidOverdue,
      change: 'Invoices with residual unpaid balances',
      trend: 'neutral' as const,
    },
    {
      id: 'due-today',
      label: 'Due Today',
      value: dueTodayCount,
      change: 'Immediate collection review window',
      trend: 'neutral' as const,
    },
  ]
}

export const buildOverdueReferenceData = async (payload: Payload) => {
  const customers = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.customers,
    depth: 0,
    limit: 500,
    sort: 'displayName',
    overrideAccess: true,
  })

  return {
    customers: customers.docs
      .filter((customer: any) => customer.status !== 'inactive' && customer.status !== 'archived')
      .map((customer: any) => ({
        id: customer.id,
        customerCode: customer.customerCode || null,
        displayName: customer.displayName || null,
      })),
  }
}
