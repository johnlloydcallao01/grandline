import { ACCOUNTING_COLLECTION_SLUGS, DOCUMENT_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'
import type { Payload } from 'payload'

export type AgingHistoryCell =
  | string
  | {
      text: string
      tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'
      emphasis?: boolean
      align?: 'left' | 'right' | 'center'
    }

export type AgingInvoiceDoc = {
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

export type AgingInvoiceRow = {
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
  isCurrent: boolean
  isDueToday: boolean
  isHighBalance: boolean
  currentAmount: number
  currentAmountLabel: string
  bucket1To30Amount: number
  bucket1To30AmountLabel: string
  bucket31To60Amount: number
  bucket31To60AmountLabel: string
  bucket61To90Amount: number
  bucket61To90AmountLabel: string
  bucketOver90Amount: number
  bucketOver90AmountLabel: string
  referenceNumber: string
  memo: string
  postedJournalEntryId: string
  searchableText: string
  cells: AgingHistoryCell[]
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
  if (!dueDate) return 0
  const due = new Date(dueDate)
  if (Number.isNaN(due.getTime())) return 0
  due.setHours(0, 0, 0, 0)
  const today = startOfToday()
  return Math.max(0, Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)))
}

export const buildAgingBucket = (daysOverdue: number) => {
  if (daysOverdue === 0) {
    return { value: 'current', label: 'Current' }
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

export const isOpenReceivableAgingInvoice = (invoice: AgingInvoiceDoc) => {
  const balanceDue = normalizeAmount(invoice.balanceDue)
  const status = String(invoice.status || '')
  return OPEN_QUEUE_STATUSES.has(status) && balanceDue > 0
}

export const buildAgingInvoiceRow = (invoice: AgingInvoiceDoc): AgingInvoiceRow => {
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
  const daysOverdue = computeDaysOverdue(invoice.dueDate)
  const agingBucket = buildAgingBucket(daysOverdue)
  const isCurrent = agingBucket.value === 'current'
  const isDueToday = daysOverdue === 0
  const isHighBalance = balanceDue >= HIGH_BALANCE_THRESHOLD
  const currentAmount = isCurrent ? balanceDue : 0
  const bucket1To30Amount = agingBucket.value === '1_30' ? balanceDue : 0
  const bucket31To60Amount = agingBucket.value === '31_60' ? balanceDue : 0
  const bucket61To90Amount = agingBucket.value === '61_90' ? balanceDue : 0
  const bucketOver90Amount = agingBucket.value === 'over_90' ? balanceDue : 0

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
    isCurrent,
    isDueToday,
    isHighBalance,
    currentAmount,
    currentAmountLabel: formatCurrency(currentAmount),
    bucket1To30Amount,
    bucket1To30AmountLabel: formatCurrency(bucket1To30Amount),
    bucket31To60Amount,
    bucket31To60AmountLabel: formatCurrency(bucket31To60Amount),
    bucket61To90Amount,
    bucket61To90AmountLabel: formatCurrency(bucket61To90Amount),
    bucketOver90Amount,
    bucketOver90AmountLabel: formatCurrency(bucketOver90Amount),
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
      { text: agingBucket.label, tone: agingBucket.value === 'over_90' ? 'red' : agingBucket.value === 'current' ? 'green' : 'amber' },
    ],
  }
}

export const matchesAgingQuickFilter = (row: AgingInvoiceRow, quickFilter: string) => {
  const [group, value] = quickFilter.split(':')

  if (group === 'aging') {
    return row.agingBucket === value
  }

  if (group === 'status') {
    return row.status === value
  }

  if (group === 'balance') {
    if (value === 'high') return row.isHighBalance
  }

  return false
}

export const matchesSelectedAgingFilters = (
  row: AgingInvoiceRow,
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
    ...filters.quickFilters.map((quickFilter) => matchesAgingQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) {
    return true
  }

  return predicates.some(Boolean)
}

export const buildAgingMetrics = (rows: AgingInvoiceRow[]) => {
  const openArBalance = rows.reduce((sum, row) => sum + row.balanceDue, 0)
  const currentBucketAmount = rows.reduce((sum, row) => sum + row.currentAmount, 0)
  const bucket1To30Amount = rows.reduce((sum, row) => sum + row.bucket1To30Amount, 0)
  const over90Amount = rows.reduce((sum, row) => sum + row.bucketOver90Amount, 0)

  return [
    {
      id: 'aging-open-ar',
      label: 'Open AR Balance',
      value: formatCurrency(openArBalance),
      change: 'From posted and partially paid invoices',
      trend: 'neutral' as const,
    },
    {
      id: 'aging-current',
      label: 'Current Bucket',
      value: formatCurrency(currentBucketAmount),
      change: 'Open balances not yet overdue',
      trend: 'neutral' as const,
    },
    {
      id: 'aging-1-30',
      label: '1-30 Day Bucket',
      value: formatCurrency(bucket1To30Amount),
      change: 'Nearest overdue concentration',
      trend: 'down' as const,
    },
    {
      id: 'aging-over-90',
      label: 'Over 90 Days',
      value: formatCurrency(over90Amount),
      change: 'Longest-aged receivable exposure',
      trend: 'down' as const,
    },
  ]
}

export const buildAgingReferenceData = async (payload: Payload) => {
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
