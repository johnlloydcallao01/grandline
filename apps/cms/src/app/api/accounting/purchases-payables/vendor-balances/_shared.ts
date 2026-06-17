import {
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_PARTY_STATUS_OPTIONS,
  VENDOR_TYPE_OPTIONS,
} from '@/accounting/constants/accounting'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import type { Payload } from 'payload'

export type VendorBalancesCell =
  | string
  | {
      text: string
      tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'
      emphasis?: boolean
      align?: 'left' | 'right' | 'center'
    }

type CurrencyRelation =
  | {
      id?: number | string
      code?: string | null
      name?: string | null
    }
  | number
  | string
  | null

type PaymentTermRelation =
  | {
      id?: number | string
      code?: string | null
      name?: string | null
      dueInDays?: number | null
    }
  | number
  | string
  | null

export type VendorBalanceVendorDoc = {
  id: number | string
  vendorCode?: string | null
  displayName?: string | null
  legalName?: string | null
  vendorType?: string | null
  email?: string | null
  phone?: string | null
  billingAddress?: string | null
  taxId?: string | null
  status?: string | null
  notes?: string | null
  currencyReference?: CurrencyRelation
  paymentTermReference?: PaymentTermRelation
  createdAt?: string | null
  updatedAt?: string | null
}

export type VendorBalanceBillDoc = {
  id: number | string
  billNumber?: string | null
  vendor?:
    | {
        id?: number | string
      }
    | number
    | string
    | null
  billDate?: string | null
  dueDate?: string | null
  status?: string | null
  currency?: string | null
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

export type VendorBalanceRow = {
  id: string
  vendorId: string
  vendorCode: string
  vendorLabel: string
  displayName: string
  legalName: string
  vendorType: string
  vendorTypeLabel: string
  paymentTermId: string
  paymentTermsLabel: string
  paymentTermDays: number
  currencyCode: string
  currencyLabel: string
  balanceDue: number
  balanceDueLabel: string
  openBillCount: number
  overdueBillCount: number
  dueThisWeekCount: number
  highBalanceThreshold: number
  highBalanceAmount: number
  highBalanceAmountLabel: string
  status: string
  statusLabel: string
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
  searchableText: string
  cells: VendorBalancesCell[]
}

export type VendorBalanceOpenBillRow = {
  id: string
  billNumber: string
  billDate: string | null
  billDateLabel: string
  dueDate: string | null
  dueDateLabel: string
  status: string
  statusLabel: string
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
  currency: string
  total: number
  totalLabel: string
  balanceDue: number
  balanceDueLabel: string
  referenceNumber: string
  memo: string
  postedJournalEntryId: string
}

const HIGH_BALANCE_THRESHOLD = 100_000

const vendorStatusLabels = new Map<string, string>(
  ACCOUNTING_PARTY_STATUS_OPTIONS.map((option) => [option.value, option.label]),
)

const vendorTypeLabels = new Map<string, string>(
  VENDOR_TYPE_OPTIONS.map((option) => [
    option.value,
    option.value === 'contractor' ? 'Service Provider' : option.label,
  ]),
)

const billStatusLabels = new Map<string, string>([
  ['draft', 'Draft'],
  ['approved', 'Approved'],
  ['posted', 'Posted'],
  ['partially_paid', 'Partially Paid'],
  ['paid', 'Paid'],
  ['voided', 'Voided'],
])

const OPEN_PAYABLE_STATUSES = new Set(['posted', 'partially_paid'])

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

export const formatCurrency = (value: number | null | undefined, currency = 'PHP') =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency || 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

export const getVendorStatusTone = (
  status: string | null | undefined,
): 'amber' | 'blue' | 'gray' | 'green' | 'red' => {
  switch (String(status || '')) {
    case 'active':
      return 'green'
    case 'on_hold':
      return 'amber'
    case 'inactive':
    case 'archived':
      return 'gray'
    default:
      return 'blue'
  }
}

export const getBillStatusTone = (
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

export const buildCurrencyCode = (currency: CurrencyRelation | undefined) => {
  if (!currency) return 'PHP'
  if (typeof currency === 'number' || typeof currency === 'string') return 'PHP'
  return String(currency.code || 'PHP')
}

export const buildCurrencyLabel = (currency: CurrencyRelation | undefined) => {
  if (!currency) return 'PHP'
  if (typeof currency === 'number' || typeof currency === 'string') return 'PHP'
  return `${currency.code ? `${currency.code} - ` : ''}${currency.name || 'Currency'}`
}

export const buildPaymentTermId = (paymentTerm: PaymentTermRelation | undefined) => {
  if (!paymentTerm) return ''
  if (typeof paymentTerm === 'number' || typeof paymentTerm === 'string') return String(paymentTerm)
  return String(paymentTerm.id || '')
}

export const buildPaymentTermDays = (paymentTerm: PaymentTermRelation | undefined) => {
  if (!paymentTerm || typeof paymentTerm === 'number' || typeof paymentTerm === 'string') return 0
  return Number(paymentTerm.dueInDays || 0)
}

export const buildPaymentTermsLabel = (paymentTerm: PaymentTermRelation | undefined) => {
  if (!paymentTerm) return 'Immediate'
  if (typeof paymentTerm === 'number' || typeof paymentTerm === 'string') return String(paymentTerm)
  const dueInDays = Number(paymentTerm.dueInDays || 0)
  const baseLabel = String(paymentTerm.name || paymentTerm.code || `Terms ${paymentTerm.id || ''}`).trim()
  if (dueInDays <= 0) return baseLabel || 'Immediate'
  return `${baseLabel} (${dueInDays} day${dueInDays === 1 ? '' : 's'})`
}

const isDueThisWeek = (dueDate: string | null | undefined, balanceDue: number) => {
  if (!dueDate || balanceDue <= 0) return false
  const due = new Date(dueDate)
  if (Number.isNaN(due.getTime())) return false
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 7)
  return due >= start && due <= end
}

const isOverdue = (dueDate: string | null | undefined, balanceDue: number) => {
  if (!dueDate || balanceDue <= 0) return false
  const due = new Date(dueDate)
  if (Number.isNaN(due.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today
}

export const isOpenPayableBill = (bill: VendorBalanceBillDoc) => {
  const status = String(bill.status || '')
  const balanceDue = normalizeAmount(bill.balanceDue)
  return OPEN_PAYABLE_STATUSES.has(status) && balanceDue > 0
}

export const buildOpenBillRow = (bill: VendorBalanceBillDoc): VendorBalanceOpenBillRow => {
  const status = String(bill.status || '')
  const currency = String(bill.currency || 'PHP')
  const total = normalizeAmount(bill.total)
  const balanceDue = normalizeAmount(bill.balanceDue)

  return {
    id: String(bill.id),
    billNumber: String(bill.billNumber || `Bill ${bill.id}`),
    billDate: bill.billDate || null,
    billDateLabel: formatDate(bill.billDate),
    dueDate: bill.dueDate || null,
    dueDateLabel: formatDate(bill.dueDate),
    status,
    statusLabel: billStatusLabels.get(status) || 'Unknown',
    statusTone: getBillStatusTone(status),
    currency,
    total,
    totalLabel: formatCurrency(total, currency),
    balanceDue,
    balanceDueLabel: formatCurrency(balanceDue, currency),
    referenceNumber: String(bill.referenceNumber || ''),
    memo: String(bill.memo || ''),
    postedJournalEntryId: String(getRelationshipId(bill.postedJournalEntry) || ''),
  }
}

export const buildVendorBalanceRow = (
  vendor: VendorBalanceVendorDoc,
  bills: VendorBalanceBillDoc[],
): VendorBalanceRow => {
  const vendorId = String(vendor.id)
  const currencyCode = buildCurrencyCode(vendor.currencyReference)
  const openBills = bills.filter(isOpenPayableBill).map(buildOpenBillRow)
  const balanceDue = openBills.reduce((sum, bill) => sum + bill.balanceDue, 0)
  const status = String(vendor.status || '')
  const paymentTermsLabel = buildPaymentTermsLabel(vendor.paymentTermReference)
  const highBalanceAmount = balanceDue >= HIGH_BALANCE_THRESHOLD ? balanceDue : 0

  return {
    id: vendorId,
    vendorId,
    vendorCode: String(vendor.vendorCode || ''),
    vendorLabel: vendor.displayName || vendor.legalName || `Vendor ${vendorId}`,
    displayName: String(vendor.displayName || ''),
    legalName: String(vendor.legalName || ''),
    vendorType: String(vendor.vendorType || ''),
    vendorTypeLabel:
      vendorTypeLabels.get(String(vendor.vendorType || '')) || String(vendor.vendorType || '-'),
    paymentTermId: buildPaymentTermId(vendor.paymentTermReference),
    paymentTermsLabel,
    paymentTermDays: buildPaymentTermDays(vendor.paymentTermReference),
    currencyCode,
    currencyLabel: buildCurrencyLabel(vendor.currencyReference),
    balanceDue,
    balanceDueLabel: formatCurrency(balanceDue, currencyCode),
    openBillCount: openBills.length,
    overdueBillCount: openBills.filter((bill) => isOverdue(bill.dueDate, bill.balanceDue)).length,
    dueThisWeekCount: openBills.filter((bill) => isDueThisWeek(bill.dueDate, bill.balanceDue)).length,
    highBalanceThreshold: HIGH_BALANCE_THRESHOLD,
    highBalanceAmount,
    highBalanceAmountLabel: formatCurrency(highBalanceAmount, currencyCode),
    status,
    statusLabel: vendorStatusLabels.get(status) || 'Unknown',
    statusTone: getVendorStatusTone(status),
    searchableText: buildSearchableText([
      vendor.vendorCode,
      vendor.displayName,
      vendor.legalName,
      vendor.email,
      paymentTermsLabel,
      buildCurrencyLabel(vendor.currencyReference),
      formatCurrency(balanceDue, currencyCode),
      vendorStatusLabels.get(status),
      vendorTypeLabels.get(String(vendor.vendorType || '')),
    ]),
    cells: [
      { text: vendor.displayName || vendor.legalName || `Vendor ${vendorId}`, emphasis: true },
      String(vendor.vendorCode || '-'),
      paymentTermsLabel,
      String(openBills.length),
      { text: formatCurrency(balanceDue, currencyCode), emphasis: true, align: 'right' },
      { text: vendorStatusLabels.get(status) || 'Unknown', tone: getVendorStatusTone(status) },
    ],
  }
}

export const matchesVendorBalanceQuickFilter = (row: VendorBalanceRow, quickFilter: string) => {
  const [group, value] = quickFilter.split(':')

  if (group === 'status') {
    return row.status === value
  }

  if (group === 'balance') {
    if (value === 'with_open_balance') return row.balanceDue > 0
    if (value === 'overdue') return row.overdueBillCount > 0
    if (value === 'due_this_week') return row.dueThisWeekCount > 0
    if (value === 'high_balance') return row.highBalanceAmount > 0
  }

  return false
}

export const matchesSelectedVendorBalanceFilters = (
  row: VendorBalanceRow,
  filters: {
    statuses: string[]
    paymentTermIds: string[]
    balanceStates: string[]
    quickFilters: string[]
  },
) => {
  const predicates = [
    ...filters.statuses.map((status) => row.status === status),
    ...filters.paymentTermIds.map((paymentTermId) => row.paymentTermId === paymentTermId),
    ...filters.balanceStates.map((balanceState) => {
      if (balanceState === 'with_open_balance') return row.balanceDue > 0
      if (balanceState === 'overdue') return row.overdueBillCount > 0
      if (balanceState === 'due_this_week') return row.dueThisWeekCount > 0
      if (balanceState === 'high_balance') return row.highBalanceAmount > 0
      return false
    }),
    ...filters.quickFilters.map((quickFilter) => matchesVendorBalanceQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) {
    return true
  }

  return predicates.some(Boolean)
}

export const buildVendorBalanceMetrics = (rows: VendorBalanceRow[]) => {
  const activeVendors = rows.filter((row) => row.status === 'active').length
  const vendorsWithOpenBills = rows.filter((row) => row.balanceDue > 0).length
  const totalBalanceDue = rows.reduce((sum, row) => sum + row.balanceDue, 0)
  const overdueVendors = rows.filter((row) => row.overdueBillCount > 0).length

  return [
    {
      id: 'active-vendors',
      label: 'Active Vendors',
      value: activeVendors,
      change: 'Master records currently usable for AP',
      trend: 'up' as const,
    },
    {
      id: 'vendors-with-open-bills',
      label: 'Vendors With Open Bills',
      value: vendorsWithOpenBills,
      change: 'Derived from posted and partially paid bills',
      trend: 'neutral' as const,
    },
    {
      id: 'total-balance-due',
      label: 'Total Balance Due',
      value: formatCurrency(totalBalanceDue),
      change: 'Open balances across vendor obligations',
      trend: 'down' as const,
    },
    {
      id: 'overdue-vendors',
      label: 'Overdue Vendors',
      value: overdueVendors,
      change: 'Vendors with at least one overdue bill',
      trend: 'down' as const,
    },
  ]
}

export const buildVendorBalanceDetailResponse = async (
  payload: Payload,
  vendor: VendorBalanceVendorDoc,
) => {
  const vendorId = vendor.id
  const [billDocs, paymentMadeCount, vendorCreditCount, expenseCount] = await Promise.all([
    findAllDocs<VendorBalanceBillDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.bills,
      depth: 0,
      sort: '-dueDate',
      where: {
        vendor: {
          equals: vendorId,
        },
      },
    }),
    payload.count({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade,
      where: {
        vendor: {
          equals: vendorId,
        },
      } as never,
      overrideAccess: true,
    }),
    payload.count({
      collection: ACCOUNTING_COLLECTION_SLUGS.vendorCredits,
      where: {
        vendor: {
          equals: vendorId,
        },
      } as never,
      overrideAccess: true,
    }),
    payload.count({
      collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
      where: {
        vendor: {
          equals: vendorId,
        },
      } as never,
      overrideAccess: true,
    }),
  ])

  const row = buildVendorBalanceRow(vendor, billDocs)
  const openBills = billDocs.filter(isOpenPayableBill).map(buildOpenBillRow)
  const latestBillDate =
    billDocs
      .map((bill) => bill.billDate)
      .filter((value): value is string => Boolean(value))
      .sort()
      .reverse()[0] || null

  const billCount = billDocs.length
  const paymentMadeUsageCount = Number(paymentMadeCount.totalDocs || 0)
  const vendorCreditUsageCount = Number(vendorCreditCount.totalDocs || 0)
  const expenseUsageCount = Number(expenseCount.totalDocs || 0)
  const canDelete =
    billCount === 0 &&
    paymentMadeUsageCount === 0 &&
    vendorCreditUsageCount === 0 &&
    expenseUsageCount === 0

  return {
    id: row.id,
    vendorCode: row.vendorCode || null,
    displayName: row.displayName || null,
    legalName: row.legalName || null,
    vendorType: row.vendorType || null,
    vendorTypeLabel: row.vendorTypeLabel || null,
    email: vendor.email || null,
    phone: vendor.phone || null,
    billingAddress: vendor.billingAddress || null,
    taxId: vendor.taxId || null,
    currencyReferenceId: String(getRelationshipId(vendor.currencyReference) || ''),
    currencyLabel: row.currencyLabel,
    paymentTermReferenceId: row.paymentTermId,
    paymentTermsLabel: row.paymentTermsLabel,
    currentBalanceDue: row.balanceDue,
    currentBalanceDueLabel: row.balanceDueLabel,
    openBillCount: row.openBillCount,
    overdueBillCount: row.overdueBillCount,
    dueThisWeekCount: row.dueThisWeekCount,
    highBalanceAmount: row.highBalanceAmount,
    highBalanceAmountLabel: row.highBalanceAmountLabel,
    latestBillDate,
    latestBillDateLabel: formatDate(latestBillDate),
    status: row.status,
    statusLabel: row.statusLabel,
    statusTone: row.statusTone,
    notes: vendor.notes || null,
    createdAt: vendor.createdAt || null,
    updatedAt: vendor.updatedAt || null,
    openBills,
    usageSummary: {
      billCount,
      paymentMadeCount: paymentMadeUsageCount,
      vendorCreditCount: vendorCreditUsageCount,
      expenseCount: expenseUsageCount,
      canDelete,
    },
  }
}
