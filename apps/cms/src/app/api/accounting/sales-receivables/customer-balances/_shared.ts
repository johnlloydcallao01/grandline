import {
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_PARTY_STATUS_OPTIONS,
  CUSTOMER_TYPE_OPTIONS,
} from '@/accounting/constants/accounting'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import type { Payload } from 'payload'

export type HistoryCell =
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

export type CustomerBalanceCustomerDoc = {
  id: number | string
  customerCode?: string | null
  displayName?: string | null
  legalName?: string | null
  customerType?: string | null
  email?: string | null
  phone?: string | null
  billingAddress?: string | null
  shippingAddress?: string | null
  taxId?: string | null
  creditLimit?: number | null
  status?: string | null
  notes?: string | null
  currencyReference?: CurrencyRelation
  paymentTermReference?: PaymentTermRelation
  createdAt?: string | null
  updatedAt?: string | null
}

export type CustomerBalanceInvoiceDoc = {
  id: number | string
  invoiceNumber?: string | null
  customer?:
    | {
        id?: number | string
      }
    | number
    | string
    | null
  invoiceDate?: string | null
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

export type CustomerBalanceRow = {
  id: string
  customerId: string
  customerCode: string
  customerLabel: string
  displayName: string
  legalName: string
  customerType: string
  customerTypeLabel: string
  paymentTermId: string
  paymentTermsLabel: string
  paymentTermDays: number
  currencyCode: string
  currencyLabel: string
  creditLimit: number
  creditLimitLabel: string
  balanceDue: number
  balanceDueLabel: string
  availableCredit: number
  availableCreditLabel: string
  overCreditLimitAmount: number
  overCreditLimitAmountLabel: string
  openInvoiceCount: number
  overdueInvoiceCount: number
  dueThisWeekCount: number
  status: string
  statusLabel: string
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
  searchableText: string
  cells: HistoryCell[]
}

export type CustomerBalanceOpenInvoiceRow = {
  id: string
  invoiceNumber: string
  invoiceDate: string | null
  invoiceDateLabel: string
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

const customerStatusLabels = new Map<string, string>(
  ACCOUNTING_PARTY_STATUS_OPTIONS.map((option) => [option.value, option.label]),
)

const customerTypeLabels = new Map<string, string>(
  CUSTOMER_TYPE_OPTIONS.map((option) => [
    option.value,
    option.value === 'company' ? 'Corporate' : option.label,
  ]),
)

const invoiceStatusLabels = new Map<string, string>([
  ['draft', 'Draft'],
  ['approved', 'Approved'],
  ['posted', 'Posted'],
  ['partially_paid', 'Partially Paid'],
  ['paid', 'Paid'],
  ['voided', 'Voided'],
])

const OPEN_RECEIVABLE_STATUSES = new Set(['posted', 'partially_paid'])

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

export const getCustomerStatusTone = (
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

export const getInvoiceStatusTone = (
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

export const isOpenReceivableInvoice = (invoice: CustomerBalanceInvoiceDoc) => {
  const status = String(invoice.status || '')
  const balanceDue = normalizeAmount(invoice.balanceDue)
  return OPEN_RECEIVABLE_STATUSES.has(status) && balanceDue > 0
}

export const buildOpenInvoiceRow = (
  invoice: CustomerBalanceInvoiceDoc,
): CustomerBalanceOpenInvoiceRow => {
  const status = String(invoice.status || '')
  const currency = String(invoice.currency || 'PHP')
  const total = normalizeAmount(invoice.total)
  const balanceDue = normalizeAmount(invoice.balanceDue)

  return {
    id: String(invoice.id),
    invoiceNumber: String(invoice.invoiceNumber || `Invoice ${invoice.id}`),
    invoiceDate: invoice.invoiceDate || null,
    invoiceDateLabel: formatDate(invoice.invoiceDate),
    dueDate: invoice.dueDate || null,
    dueDateLabel: formatDate(invoice.dueDate),
    status,
    statusLabel: invoiceStatusLabels.get(status) || 'Unknown',
    statusTone: getInvoiceStatusTone(status),
    currency,
    total,
    totalLabel: formatCurrency(total, currency),
    balanceDue,
    balanceDueLabel: formatCurrency(balanceDue, currency),
    referenceNumber: String(invoice.referenceNumber || ''),
    memo: String(invoice.memo || ''),
    postedJournalEntryId: String(getRelationshipId(invoice.postedJournalEntry) || ''),
  }
}

export const buildCustomerBalanceRow = (
  customer: CustomerBalanceCustomerDoc,
  invoices: CustomerBalanceInvoiceDoc[],
): CustomerBalanceRow => {
  const customerId = String(customer.id)
  const currencyCode = buildCurrencyCode(customer.currencyReference)
  const openInvoices = invoices.filter(isOpenReceivableInvoice).map(buildOpenInvoiceRow)
  const balanceDue = openInvoices.reduce((sum, invoice) => sum + invoice.balanceDue, 0)
  const creditLimit = normalizeAmount(customer.creditLimit)
  const availableCredit = Math.max(0, creditLimit - balanceDue)
  const overCreditLimitAmount = creditLimit > 0 ? Math.max(0, balanceDue - creditLimit) : 0
  const status = String(customer.status || '')
  const paymentTermsLabel = buildPaymentTermsLabel(customer.paymentTermReference)

  return {
    id: customerId,
    customerId,
    customerCode: String(customer.customerCode || ''),
    customerLabel: customer.displayName || customer.legalName || `Customer ${customerId}`,
    displayName: String(customer.displayName || ''),
    legalName: String(customer.legalName || ''),
    customerType: String(customer.customerType || ''),
    customerTypeLabel:
      customerTypeLabels.get(String(customer.customerType || '')) || String(customer.customerType || '-'),
    paymentTermId: buildPaymentTermId(customer.paymentTermReference),
    paymentTermsLabel,
    paymentTermDays: buildPaymentTermDays(customer.paymentTermReference),
    currencyCode,
    currencyLabel: buildCurrencyLabel(customer.currencyReference),
    creditLimit,
    creditLimitLabel: formatCurrency(creditLimit, currencyCode),
    balanceDue,
    balanceDueLabel: formatCurrency(balanceDue, currencyCode),
    availableCredit,
    availableCreditLabel: formatCurrency(availableCredit, currencyCode),
    overCreditLimitAmount,
    overCreditLimitAmountLabel: formatCurrency(overCreditLimitAmount, currencyCode),
    openInvoiceCount: openInvoices.length,
    overdueInvoiceCount: openInvoices.filter((invoice) => isOverdue(invoice.dueDate, invoice.balanceDue)).length,
    dueThisWeekCount: openInvoices.filter((invoice) => isDueThisWeek(invoice.dueDate, invoice.balanceDue)).length,
    status,
    statusLabel: customerStatusLabels.get(status) || 'Unknown',
    statusTone: getCustomerStatusTone(status),
    searchableText: buildSearchableText([
      customer.customerCode,
      customer.displayName,
      customer.legalName,
      customer.email,
      paymentTermsLabel,
      buildCurrencyLabel(customer.currencyReference),
      formatCurrency(creditLimit, currencyCode),
      formatCurrency(balanceDue, currencyCode),
      customerStatusLabels.get(status),
    ]),
    cells: [
      { text: customer.displayName || customer.legalName || `Customer ${customerId}`, emphasis: true },
      String(customer.customerCode || '-'),
      paymentTermsLabel,
      { text: formatCurrency(creditLimit, currencyCode), align: 'right' },
      { text: formatCurrency(balanceDue, currencyCode), emphasis: true, align: 'right' },
      { text: customerStatusLabels.get(status) || 'Unknown', tone: getCustomerStatusTone(status) },
    ],
  }
}

export const matchesCustomerBalanceQuickFilter = (
  row: CustomerBalanceRow,
  quickFilter: string,
) => {
  const [group, value] = quickFilter.split(':')

  if (group === 'status') {
    return row.status === value
  }

  if (group === 'balance') {
    if (value === 'with_open_balance') return row.balanceDue > 0
    if (value === 'over_credit_limit') return row.overCreditLimitAmount > 0
    if (value === 'overdue') return row.overdueInvoiceCount > 0
    if (value === 'due_this_week') return row.dueThisWeekCount > 0
  }

  return false
}

export const matchesSelectedCustomerBalanceFilters = (
  row: CustomerBalanceRow,
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
      if (balanceState === 'over_credit_limit') return row.overCreditLimitAmount > 0
      if (balanceState === 'overdue') return row.overdueInvoiceCount > 0
      if (balanceState === 'due_this_week') return row.dueThisWeekCount > 0
      return false
    }),
    ...filters.quickFilters.map((quickFilter) => matchesCustomerBalanceQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) {
    return true
  }

  return predicates.some(Boolean)
}

export const buildCustomerBalanceMetrics = (rows: CustomerBalanceRow[]) => {
  const activeCustomers = rows.filter((row) => row.status === 'active').length
  const customersWithOpenAr = rows.filter((row) => row.balanceDue > 0).length
  const totalBalanceDue = rows.reduce((sum, row) => sum + row.balanceDue, 0)
  const overCreditLimit = rows.filter((row) => row.overCreditLimitAmount > 0).length

  return [
    {
      id: 'active-customers',
      label: 'Active Customers',
      value: activeCustomers,
      change: 'Master records usable for AR',
      trend: 'up' as const,
    },
    {
      id: 'customers-with-open-ar',
      label: 'Customers With Open AR',
      value: customersWithOpenAr,
      change: 'Derived from posted and partially paid invoices',
      trend: 'neutral' as const,
    },
    {
      id: 'total-balance-due',
      label: 'Total Balance Due',
      value: formatCurrency(totalBalanceDue),
      change: 'Open balances across receivable invoices',
      trend: 'down' as const,
    },
    {
      id: 'over-credit-limit',
      label: 'Over Credit Limit',
      value: overCreditLimit,
      change: 'Customers needing credit review',
      trend: 'down' as const,
    },
  ]
}

export const buildCustomerBalanceDetailResponse = async (
  payload: Payload,
  customer: CustomerBalanceCustomerDoc,
) => {
  const customerId = customer.id
  const [invoiceDocs, paymentReceivedCount, creditNoteCount] = await Promise.all([
    findAllDocs<CustomerBalanceInvoiceDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
      depth: 0,
      sort: '-dueDate',
      where: {
        customer: {
          equals: customerId,
        },
      },
    }),
    payload.count({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
      where: {
        customer: {
          equals: customerId,
        },
      } as never,
      overrideAccess: true,
    }),
    payload.count({
      collection: ACCOUNTING_COLLECTION_SLUGS.creditNotes,
      where: {
        customer: {
          equals: customerId,
        },
      } as never,
      overrideAccess: true,
    }),
  ])

  const row = buildCustomerBalanceRow(customer, invoiceDocs)
  const openInvoices = invoiceDocs.filter(isOpenReceivableInvoice).map(buildOpenInvoiceRow)
  const latestInvoiceDate =
    invoiceDocs
      .map((invoice) => invoice.invoiceDate)
      .filter((value): value is string => Boolean(value))
      .sort()
      .reverse()[0] || null

  const invoiceCount = invoiceDocs.length
  const paymentReceivedUsageCount = Number(paymentReceivedCount.totalDocs || 0)
  const creditNoteUsageCount = Number(creditNoteCount.totalDocs || 0)
  const canDelete = invoiceCount === 0 && paymentReceivedUsageCount === 0 && creditNoteUsageCount === 0

  return {
    id: row.id,
    customerCode: row.customerCode || null,
    displayName: row.displayName || null,
    legalName: row.legalName || null,
    customerType: row.customerType || null,
    customerTypeLabel: row.customerTypeLabel || null,
    email: customer.email || null,
    phone: customer.phone || null,
    billingAddress: customer.billingAddress || null,
    shippingAddress: customer.shippingAddress || null,
    taxId: customer.taxId || null,
    currencyReferenceId: String(getRelationshipId(customer.currencyReference) || ''),
    currencyLabel: row.currencyLabel,
    paymentTermReferenceId: row.paymentTermId,
    paymentTermsLabel: row.paymentTermsLabel,
    creditLimit: row.creditLimit,
    creditLimitLabel: row.creditLimitLabel,
    currentBalanceDue: row.balanceDue,
    currentBalanceDueLabel: row.balanceDueLabel,
    availableCredit: row.availableCredit,
    availableCreditLabel: row.availableCreditLabel,
    overCreditLimitAmount: row.overCreditLimitAmount,
    overCreditLimitAmountLabel: row.overCreditLimitAmountLabel,
    openInvoiceCount: row.openInvoiceCount,
    overdueInvoiceCount: row.overdueInvoiceCount,
    dueThisWeekCount: row.dueThisWeekCount,
    latestInvoiceDate,
    latestInvoiceDateLabel: formatDate(latestInvoiceDate),
    status: row.status,
    statusLabel: row.statusLabel,
    statusTone: row.statusTone,
    notes: customer.notes || null,
    createdAt: customer.createdAt || null,
    updatedAt: customer.updatedAt || null,
    openInvoices,
    usageSummary: {
      invoiceCount,
      paymentReceivedCount: paymentReceivedUsageCount,
      creditNoteCount: creditNoteUsageCount,
      canDelete,
    },
  }
}
