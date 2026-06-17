import { ACCOUNTING_COLLECTION_SLUGS, DOCUMENT_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import type { Payload } from 'payload'

export type PayableAgingCell =
  | string
  | {
      text: string
      tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'
      emphasis?: boolean
      align?: 'left' | 'right' | 'center'
    }

export type PayableAgingBillDoc = {
  id: number | string
  billNumber?: string | null
  vendor?:
    | {
        id?: number | string
        vendorCode?: string | null
        displayName?: string | null
        status?: string | null
      }
    | number
    | string
    | null
  billDate?: string | null
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

export type PayableAgingVendorReference = {
  id: number | string
  vendorCode?: string | null
  displayName?: string | null
}

export type PayableAgingRow = {
  id: string
  billNumber: string
  billDate: string | null
  billDateLabel: string
  vendorId: string
  vendorCode: string
  vendorLabel: string
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
  cells: PayableAgingCell[]
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

export const isOpenAccountsPayableAgingBill = (bill: PayableAgingBillDoc) => {
  const balanceDue = normalizeAmount(bill.balanceDue)
  const status = String(bill.status || '')
  return OPEN_QUEUE_STATUSES.has(status) && balanceDue > 0
}

export const buildAccountsPayableAgingRow = (bill: PayableAgingBillDoc): PayableAgingRow => {
  const billId = String(bill.id)
  const vendor = typeof bill.vendor === 'object' && bill.vendor ? bill.vendor : null
  const vendorId = String(getRelationshipId(bill.vendor) || '')
  const vendorLabel = vendor
    ? `${vendor.vendorCode ? `${vendor.vendorCode} - ` : ''}${vendor.displayName || `Vendor ${vendor.id || ''}`}`.trim()
    : String(bill.vendor || 'Unassigned Vendor')
  const status = String(bill.status || '')
  const total = normalizeAmount(bill.total)
  const balanceDue = normalizeAmount(bill.balanceDue)
  const daysOverdue = computeDaysOverdue(bill.dueDate)
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
    id: billId,
    billNumber: String(bill.billNumber || `Bill ${billId}`),
    billDate: bill.billDate || null,
    billDateLabel: formatDate(bill.billDate),
    vendorId,
    vendorCode: String(vendor?.vendorCode || ''),
    vendorLabel,
    dueDate: bill.dueDate || null,
    dueDateLabel: formatDate(bill.dueDate),
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
    referenceNumber: String(bill.referenceNumber || ''),
    memo: String(bill.memo || ''),
    postedJournalEntryId: String(getRelationshipId(bill.postedJournalEntry) || ''),
    searchableText: buildSearchableText([
      bill.billNumber,
      vendorLabel,
      formatDate(bill.dueDate),
      formatCurrency(balanceDue),
      daysOverdue,
      agingBucket.label,
      statusLabels.get(status),
      bill.referenceNumber,
      bill.memo,
    ]),
    cells: [
      { text: vendorLabel, emphasis: true },
      String(bill.billNumber || `Bill ${billId}`),
      formatDate(bill.dueDate),
      { text: formatCurrency(balanceDue), emphasis: true, align: 'right' },
      { text: String(daysOverdue), align: 'right' },
      {
        text: agingBucket.label,
        tone:
          agingBucket.value === 'over_90'
            ? 'red'
            : agingBucket.value === 'current'
              ? 'green'
              : 'amber',
      },
    ],
  }
}

export const matchesAccountsPayableAgingQuickFilter = (
  row: PayableAgingRow,
  quickFilter: string,
) => {
  const [group, value] = quickFilter.split(':')

  if (group === 'aging') {
    return row.agingBucket === value
  }

  if (group === 'status') {
    return row.status === value
  }

  if (group === 'balance' && value === 'high') {
    return row.isHighBalance
  }

  return false
}

export const matchesSelectedAccountsPayableAgingFilters = (
  row: PayableAgingRow,
  filters: {
    statuses: string[]
    vendorIds: string[]
    agingBuckets: string[]
    quickFilters: string[]
  },
) => {
  const predicates = [
    ...filters.statuses.map((status) => row.status === status),
    ...filters.vendorIds.map((vendorId) => row.vendorId === vendorId),
    ...filters.agingBuckets.map((agingBucket) => row.agingBucket === agingBucket),
    ...filters.quickFilters.map((quickFilter) =>
      matchesAccountsPayableAgingQuickFilter(row, quickFilter),
    ),
  ]

  if (predicates.length === 0) {
    return true
  }

  return predicates.some(Boolean)
}

export const buildAccountsPayableAgingMetrics = (rows: PayableAgingRow[]) => {
  const openApBalance = rows.reduce((sum, row) => sum + row.balanceDue, 0)
  const overdueBills = rows.filter((row) => row.daysOverdue > 0).length
  const bucket1To30Amount = rows.reduce((sum, row) => sum + row.bucket1To30Amount, 0)
  const over90Amount = rows.reduce((sum, row) => sum + row.bucketOver90Amount, 0)

  return [
    {
      id: 'aging-open-ap',
      label: 'Open AP Balance',
      value: formatCurrency(openApBalance),
      change: 'From posted and partially paid bills',
      trend: 'neutral' as const,
    },
    {
      id: 'aging-overdue-bills',
      label: 'Overdue Bills',
      value: overdueBills,
      change: 'Bills already past due date',
      trend: 'down' as const,
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
      change: 'Longest-aged payable exposure',
      trend: 'down' as const,
    },
  ]
}

export const buildAccountsPayableAgingReferenceData = async (payload: Payload) => {
  const vendors = await findAllDocs<PayableAgingVendorReference>({
    payload,
    collection: ACCOUNTING_COLLECTION_SLUGS.vendors,
    depth: 0,
    sort: 'displayName',
  })

  return {
    vendors: vendors.map((vendor) => ({
      id: vendor.id,
      vendorCode: vendor.vendorCode || null,
      displayName: vendor.displayName || null,
    })),
  }
}
