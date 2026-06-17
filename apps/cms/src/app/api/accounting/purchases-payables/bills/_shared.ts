import { type Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS, DOCUMENT_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount, roundCurrency } from '@/accounting/utils/amounts'
import { parseNumberParam } from '../../_utils/auth'

type StatusTone = 'amber' | 'blue' | 'gray' | 'green' | 'red'

export type BillsCell =
  | string
  | {
      text: string
      tone?: StatusTone
      emphasis?: boolean
      align?: 'left' | 'right' | 'center'
    }

export type BillDoc = {
  id: number | string
  billNumber?: string | null
  vendor?:
    | {
        id?: number | string
        vendorCode?: string | null
        displayName?: string | null
        status?: string | null
        currencyReference?: {
          code?: string | null
        } | null
        paymentTermReference?: {
          name?: string | null
        } | null
      }
    | number
    | string
    | null
  billDate?: string | null
  postingDate?: string | null
  dueDate?: string | null
  status?: string | null
  postingStatus?: string | null
  currency?: string | null
  exchangeRate?: number | null
  subtotal?: number | null
  taxTotal?: number | null
  total?: number | null
  balanceDue?: number | null
  referenceNumber?: string | null
  memo?: string | null
  payableAccountOverride?:
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

export type BillLineDoc = {
  id: number | string
  bill?: unknown
  lineNumber?: number | null
  description?: string | null
  quantity?: number | null
  unitPrice?: number | null
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
  expenseAccount?:
    | {
        id?: number | string
        code?: string | null
        name?: string | null
      }
    | number
    | string
    | null
  assetAccount?:
    | {
        id?: number | string
        code?: string | null
        name?: string | null
      }
    | number
    | string
    | null
  payableAccountOverride?:
    | {
        id?: number | string
        code?: string | null
        name?: string | null
      }
    | number
    | string
    | null
}

type PaymentMadeDoc = {
  id: number | string
  applications?: Array<
    | {
        bill?: unknown
        amountApplied?: number | null
      }
    | null
  > | null
}

type VendorCreditDoc = {
  id: number | string
  sourceBill?: unknown
  applications?: Array<
    | {
        bill?: unknown
        amountApplied?: number | null
      }
    | null
  > | null
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

export type BillRegisterRow = {
  id: string
  billNumber: string
  vendorId: string
  vendorCode: string
  vendorLabel: string
  billDate: string | null
  billDateLabel: string
  dueDate: string | null
  dueDateLabel: string
  total: number
  totalLabel: string
  balanceDue: number
  balanceDueLabel: string
  status: string
  statusLabel: string
  statusTone: StatusTone
  postingStatus: string
  postingStatusLabel: string
  referenceNumber: string
  memo: string
  postedJournalEntryId: string
  isDueThisWeek: boolean
  isOpenPayable: boolean
  searchableText: string
  cells: BillsCell[]
}

export type BillDetailRegisterRow = {
  id: string
  billNumber: string
  vendorId: string
  vendorLabel: string
  status: string
  statusLabel: string
  statusTone: StatusTone
  postingStatus: string
  postingStatusLabel: string
  taxTotal: number
  taxTotalLabel: string
  balanceDue: number
  balanceDueLabel: string
  lineItemCount: number
  lineItemCountLabel: string
  documentCount: number
  hasDocuments: boolean
  hasJournalLink: boolean
  hasLines: boolean
  hasTax: boolean
  searchableText: string
  cells: BillsCell[]
}

export type BillLineDetail = {
  id: string
  lineNumber: number
  description: string
  quantity: number
  unitPrice: number
  lineSubtotal: number
  lineTax: number
  lineTotal: number
  taxCodeId: string
  taxCodeLabel: string
  taxRate: number
  taxCalculationMethod: string
  expenseAccountId: string
  expenseAccountLabel: string
  assetAccountId: string
  assetAccountLabel: string
  accountType: 'expense' | 'asset'
  accountId: string
  accountLabel: string
  payableAccountOverrideId: string
  payableAccountOverrideLabel: string
  lineSubtotalLabel: string
  lineTaxLabel: string
  lineTotalLabel: string
}

export type BillDetail = {
  id: string
  billNumber: string
  vendorId: string
  vendorLabel: string
  vendorCurrency: string
  vendorPaymentTerms: string
  billDate: string | null
  billDateLabel: string
  postingDate: string | null
  postingDateLabel: string
  dueDate: string | null
  dueDateLabel: string
  status: string
  statusLabel: string
  postingStatus: string
  postingStatusLabel: string
  currency: string
  exchangeRate: number
  subtotal: number
  subtotalLabel: string
  taxTotal: number
  taxTotalLabel: string
  total: number
  totalLabel: string
  balanceDue: number
  balanceDueLabel: string
  referenceNumber: string
  memo: string
  payableAccountOverrideId: string
  payableAccountOverrideLabel: string
  postedJournalEntryId: string
  notes: string
  createdAt: string | null
  updatedAt: string | null
  lineItems: BillLineDetail[]
  documentLinks: Array<{
    id: string
    documentCategory: string
    documentCategoryLabel: string
    documentDate: string | null
    documentDateLabel: string
    isPrimary: boolean
    notes: string
  }>
  usageSummary: {
    lineItemCount: number
    appliedPaymentsCount: number
    appliedVendorCreditsCount: number
    documentCount: number
    hasDependents: boolean
  }
}

export type BillMutationInput = {
  billNumber?: string | null
  vendor: string
  billDate: string
  postingDate: string
  dueDate: string
  status: 'draft' | 'approved'
  currency: string
  exchangeRate: number
  referenceNumber?: string | null
  memo?: string | null
  payableAccountOverride?: string | null
  notes?: string | null
  lines: Array<{
    description: string
    quantity: number
    unitPrice: number
    taxCode?: string | null
    accountType: 'expense' | 'asset'
    accountId: string
    payableAccountOverride?: string | null
  }>
}

const statusLabelMap = new Map<string, string>(
  DOCUMENT_STATUS_OPTIONS.map((option) => [option.value, option.label]),
)

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
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

const buildSearchableText = (parts: Array<unknown>) =>
  parts
    .map((part) => normalizeSearch(part))
    .filter(Boolean)
    .join(' ')

const getStatusTone = (status: string | null | undefined): StatusTone => {
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

const toTitleLabel = (value: string | null | undefined) =>
  String(value || '')
    .split('_')
    .join(' ')
    .replace(/\b\w/g, (char: string) => char.toUpperCase())

const isDueThisWeek = (value: string | null | undefined) => {
  if (!value) return false
  const dueDate = new Date(value)
  if (Number.isNaN(dueDate.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekEnd = new Date(today)
  weekEnd.setDate(today.getDate() + 7)
  dueDate.setHours(0, 0, 0, 0)
  return dueDate >= today && dueDate <= weekEnd
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

export const buildBillRow = (bill: BillDoc): BillRegisterRow => {
  const billId = String(bill.id)
  const vendor = typeof bill.vendor === 'object' && bill.vendor ? bill.vendor : null
  const vendorId = String(getRelationshipId(bill.vendor) || '')
  const vendorLabel = vendor
    ? `${vendor.vendorCode ? `${vendor.vendorCode} - ` : ''}${vendor.displayName || `Vendor ${vendor.id || ''}`}`.trim()
    : String(bill.vendor || 'Unassigned Vendor')
  const total = normalizeAmount(bill.total)
  const balanceDue = normalizeAmount(bill.balanceDue)
  const status = String(bill.status || '')
  const postingStatus = String(bill.postingStatus || '')

  return {
    id: billId,
    billNumber: String(bill.billNumber || `Bill ${billId}`),
    vendorId,
    vendorCode: String(vendor?.vendorCode || ''),
    vendorLabel,
    billDate: bill.billDate || null,
    billDateLabel: formatDate(bill.billDate),
    dueDate: bill.dueDate || null,
    dueDateLabel: formatDate(bill.dueDate),
    total,
    totalLabel: formatCurrency(total, String(bill.currency || 'PHP')),
    balanceDue,
    balanceDueLabel: formatCurrency(balanceDue, String(bill.currency || 'PHP')),
    status,
    statusLabel: statusLabelMap.get(status) || 'Unknown',
    statusTone: getStatusTone(status),
    postingStatus,
    postingStatusLabel: toTitleLabel(postingStatus || 'unposted'),
    referenceNumber: String(bill.referenceNumber || ''),
    memo: String(bill.memo || ''),
    postedJournalEntryId: String(getRelationshipId(bill.postedJournalEntry) || ''),
    isDueThisWeek: isDueThisWeek(bill.dueDate),
    isOpenPayable: balanceDue > 0,
    searchableText: buildSearchableText([
      bill.billNumber,
      vendorLabel,
      bill.referenceNumber,
      bill.memo,
      formatDate(bill.dueDate),
      formatCurrency(total, String(bill.currency || 'PHP')),
      statusLabelMap.get(status),
    ]),
    cells: [
      { text: String(bill.billNumber || `Bill ${billId}`), emphasis: true },
      formatDate(bill.billDate),
      vendorLabel,
      formatDate(bill.dueDate),
      { text: formatCurrency(total, String(bill.currency || 'PHP')), emphasis: true, align: 'right' },
      { text: statusLabelMap.get(status) || 'Unknown', tone: getStatusTone(status) },
    ],
  }
}

export const matchesBillQuickFilter = (row: BillRegisterRow, quickFilter: string) => {
  const [group, value] = quickFilter.split(':')
  if (group === 'status') return row.status === value
  if (group === 'due' && value === 'this_week') return row.isDueThisWeek
  if (group === 'balance' && value === 'open') return row.isOpenPayable
  return false
}

export const matchesSelectedBillFilters = (
  row: BillRegisterRow,
  filters: {
    statuses: string[]
    vendorIds: string[]
    quickFilters: string[]
  },
) => {
  const predicates = [
    ...filters.statuses.map((status) => row.status === status),
    ...filters.vendorIds.map((vendorId) => row.vendorId === vendorId),
    ...filters.quickFilters.map((quickFilter) => matchesBillQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) {
    return true
  }

  return predicates.some(Boolean)
}

export const buildBillsMetrics = (rows: BillRegisterRow[]) => {
  const draftBills = rows.filter((row) => row.status === 'draft').length
  const postedBills = rows.filter((row) => ['posted', 'partially_paid', 'paid'].includes(row.status)).length
  const openPayableBalance = roundCurrency(
    rows.reduce((sum, row) => sum + (['posted', 'partially_paid', 'paid'].includes(row.status) ? row.balanceDue : 0), 0),
  )
  const dueThisWeek = rows.filter((row) => row.isDueThisWeek).length

  return [
    {
      id: 'bills-draft',
      label: 'Draft Bills',
      value: draftBills,
      change: 'Awaiting final review before posting',
      trend: 'neutral' as const,
    },
    {
      id: 'bills-posted',
      label: 'Posted Bills',
      value: postedBills,
      change: 'Includes paid and partially paid records',
      trend: 'up' as const,
    },
    {
      id: 'bills-open-balance',
      label: 'Open Payable Balance',
      value: formatCurrency(openPayableBalance),
      change: 'Across posted and partially paid bills',
      trend: 'neutral' as const,
    },
    {
      id: 'bills-due-week',
      label: 'Due This Week',
      value: dueThisWeek,
      change: 'Based on bill due dates now on file',
      trend: 'down' as const,
    },
  ]
}

export const buildBillDetailRegisterRow = ({
  bill,
  lineItems,
  documentCount,
}: {
  bill: BillDoc
  lineItems: BillLineDoc[]
  documentCount: number
}): BillDetailRegisterRow => {
  const billId = String(bill.id)
  const vendor = typeof bill.vendor === 'object' && bill.vendor ? bill.vendor : null
  const vendorId = String(getRelationshipId(bill.vendor) || '')
  const vendorLabel = vendor
    ? `${vendor.vendorCode ? `${vendor.vendorCode} - ` : ''}${vendor.displayName || `Vendor ${vendor.id || ''}`}`.trim()
    : String(bill.vendor || 'Unassigned Vendor')
  const status = String(bill.status || '')
  const postingStatus = String(bill.postingStatus || '')
  const taxTotal = normalizeAmount(bill.taxTotal)
  const balanceDue = normalizeAmount(bill.balanceDue)
  const hasJournalLink = Boolean(getRelationshipId(bill.postedJournalEntry))
  const searchableText = buildSearchableText([
    bill.billNumber,
    vendorLabel,
    bill.referenceNumber,
    bill.memo,
    getRelationshipId(bill.postedJournalEntry),
    ...lineItems.map((line) => line.description),
    ...lineItems.map((line) =>
      typeof line.taxCode === 'object' && line.taxCode
        ? `${line.taxCode.code || ''} ${line.taxCode.name || ''}`
        : '',
    ),
  ])

  return {
    id: billId,
    billNumber: String(bill.billNumber || `Bill ${billId}`),
    vendorId,
    vendorLabel,
    status,
    statusLabel: statusLabelMap.get(status) || 'Unknown',
    statusTone: getStatusTone(status),
    postingStatus,
    postingStatusLabel: toTitleLabel(postingStatus || 'unposted'),
    taxTotal,
    taxTotalLabel: formatCurrency(taxTotal, String(bill.currency || 'PHP')),
    balanceDue,
    balanceDueLabel: formatCurrency(balanceDue, String(bill.currency || 'PHP')),
    lineItemCount: lineItems.length,
    lineItemCountLabel: `${lineItems.length} ${lineItems.length === 1 ? 'line' : 'lines'}`,
    documentCount,
    hasDocuments: documentCount > 0,
    hasJournalLink,
    hasLines: lineItems.length > 0,
    hasTax: taxTotal > 0,
    searchableText,
    cells: [
      { text: String(bill.billNumber || `Bill ${billId}`), emphasis: true },
      vendorLabel,
      `${lineItems.length} ${lineItems.length === 1 ? 'line' : 'lines'}`,
      { text: formatCurrency(taxTotal, String(bill.currency || 'PHP')), align: 'right' },
      { text: formatCurrency(balanceDue, String(bill.currency || 'PHP')), emphasis: true, align: 'right' },
      { text: statusLabelMap.get(status) || 'Unknown', tone: getStatusTone(status) },
    ],
  }
}

export const matchesBillDetailQuickFilter = (row: BillDetailRegisterRow, quickFilter: string) => {
  const [group, value] = quickFilter.split(':')
  if (group === 'status') return row.status === value
  if (group === 'coverage' && value === 'with_lines') return row.hasLines
  if (group === 'coverage' && value === 'with_tax') return row.hasTax
  if (group === 'coverage' && value === 'with_documents') return row.hasDocuments
  if (group === 'coverage' && value === 'journal_linked') return row.hasJournalLink
  return false
}

export const matchesSelectedBillDetailFilters = (
  row: BillDetailRegisterRow,
  filters: {
    statuses: string[]
    vendorIds: string[]
    coverageStates: string[]
    quickFilters: string[]
  },
) => {
  const predicates = [
    ...filters.statuses.map((status) => row.status === status),
    ...filters.vendorIds.map((vendorId) => row.vendorId === vendorId),
    ...filters.coverageStates.map((state) => matchesBillDetailQuickFilter(row, `coverage:${state}`)),
    ...filters.quickFilters.map((quickFilter) => matchesBillDetailQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) {
    return true
  }

  return predicates.some(Boolean)
}

export const buildBillDetailMetrics = (rows: BillDetailRegisterRow[]) => [
  {
    id: 'bill-detail-with-lines',
    label: 'Bills With Lines',
    value: rows.filter((row) => row.hasLines).length,
    change: 'Normalized through bill line items',
    trend: 'up' as const,
  },
  {
    id: 'bill-detail-line-count',
    label: 'Bill Lines',
    value: rows.reduce((sum, row) => sum + row.lineItemCount, 0),
    change: 'Expense, asset, and tax-coded lines',
    trend: 'up' as const,
  },
  {
    id: 'bill-detail-documents',
    label: 'Linked Documents',
    value: rows.reduce((sum, row) => sum + row.documentCount, 0),
    change: 'Bill support attached through document links',
    trend: 'neutral' as const,
  },
  {
    id: 'bill-detail-journals',
    label: 'Journal-Linked Bills',
    value: rows.filter((row) => row.hasJournalLink).length,
    change: 'Posted bills with journal references',
    trend: 'up' as const,
  },
]

const buildLineDetail = (line: BillLineDoc): BillLineDetail => {
  const hasExpenseAccount = Boolean(getRelationshipId(line.expenseAccount))
  const accountType = hasExpenseAccount ? 'expense' : 'asset'
  const selectedAccount = hasExpenseAccount ? line.expenseAccount : line.assetAccount

  return {
    id: String(line.id),
    lineNumber: Number(line.lineNumber || 0),
    description: String(line.description || ''),
    quantity: normalizeAmount(line.quantity),
    unitPrice: normalizeAmount(line.unitPrice),
    lineSubtotal: normalizeAmount(line.lineSubtotal),
    lineTax: normalizeAmount(line.lineTax),
    lineTotal: normalizeAmount(line.lineTotal),
    taxCodeId: String(getRelationshipId(line.taxCode) || ''),
    taxCodeLabel:
      typeof line.taxCode === 'object' && line.taxCode
        ? `${line.taxCode.code ? `${line.taxCode.code} - ` : ''}${line.taxCode.name || 'Unnamed tax code'}`
        : '',
    taxRate: typeof line.taxCode === 'object' && line.taxCode ? normalizeAmount(line.taxCode.rate) : 0,
    taxCalculationMethod:
      typeof line.taxCode === 'object' && line.taxCode
        ? String(line.taxCode.calculationMethod || 'exclusive')
        : 'exclusive',
    expenseAccountId: String(getRelationshipId(line.expenseAccount) || ''),
    expenseAccountLabel:
      typeof line.expenseAccount === 'object' && line.expenseAccount
        ? `${line.expenseAccount.code ? `${line.expenseAccount.code} - ` : ''}${line.expenseAccount.name || 'Unnamed account'}`
        : '',
    assetAccountId: String(getRelationshipId(line.assetAccount) || ''),
    assetAccountLabel:
      typeof line.assetAccount === 'object' && line.assetAccount
        ? `${line.assetAccount.code ? `${line.assetAccount.code} - ` : ''}${line.assetAccount.name || 'Unnamed account'}`
        : '',
    accountType,
    accountId: String(getRelationshipId(selectedAccount) || ''),
    accountLabel:
      typeof selectedAccount === 'object' && selectedAccount
        ? `${selectedAccount.code ? `${selectedAccount.code} - ` : ''}${selectedAccount.name || 'Unnamed account'}`
        : '',
    payableAccountOverrideId: String(getRelationshipId(line.payableAccountOverride) || ''),
    payableAccountOverrideLabel:
      typeof line.payableAccountOverride === 'object' && line.payableAccountOverride
        ? `${line.payableAccountOverride.code ? `${line.payableAccountOverride.code} - ` : ''}${line.payableAccountOverride.name || 'Unnamed account'}`
        : '',
    lineSubtotalLabel: formatCurrency(line.lineSubtotal),
    lineTaxLabel: formatCurrency(line.lineTax),
    lineTotalLabel: formatCurrency(line.lineTotal),
  }
}

const getAppliedCountForBill = (rows: Array<PaymentMadeDoc | VendorCreditDoc>, billId: string) =>
  rows.reduce((count, row) => {
    const applications = Array.isArray(row.applications) ? row.applications : []
    const matched = applications.some((application) => String(getRelationshipId(application?.bill) || '') === billId)
    return count + (matched ? 1 : 0)
  }, 0)

export const buildBillDetailResponse = async (
  payload: Payload,
  bill: BillDoc,
): Promise<BillDetail> => {
  const billId = String(bill.id)
  const [lineDocs, paymentDocs, vendorCreditDocs, documentLinks] = await Promise.all([
    findAllDocs<BillLineDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.billLineItems,
      depth: 1,
      where: {
        bill: {
          equals: bill.id,
        },
      },
      sort: 'lineNumber',
    }),
    findAllDocs<PaymentMadeDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade,
      depth: 0,
      where: {
        status: {
          equals: 'posted',
        },
      },
      sort: '-paymentDate',
    }),
    findAllDocs<VendorCreditDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.vendorCredits,
      depth: 0,
      where: {
        status: {
          in: ['posted', 'partially_paid', 'paid'],
        },
      },
      sort: '-creditDate',
    }),
    findAllDocs<DocumentLinkDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.documentLinks,
      depth: 0,
      where: {
        and: [
          {
            entityType: {
              equals: 'bill',
            },
          },
          {
            entityId: {
              equals: billId,
            },
          },
        ],
      },
      sort: '-createdAt',
    }),
  ])

  const appliedPaymentsCount = getAppliedCountForBill(paymentDocs, billId)
  const appliedVendorCreditsCount = vendorCreditDocs.reduce((count, vendorCredit) => {
    const isSourceBill = String(getRelationshipId(vendorCredit.sourceBill) || '') === billId
    const hasApplication = Array.isArray(vendorCredit.applications)
      ? vendorCredit.applications.some(
          (application) => String(getRelationshipId(application?.bill) || '') === billId,
        )
      : false
    return count + (isSourceBill || hasApplication ? 1 : 0)
  }, 0)
  const lineItems = lineDocs.map(buildLineDetail)
  const vendor = typeof bill.vendor === 'object' && bill.vendor ? bill.vendor : null
  const status = String(bill.status || '')
  const postingStatus = String(bill.postingStatus || 'unposted')

  return {
    id: billId,
    billNumber: String(bill.billNumber || `Bill ${billId}`),
    vendorId: String(getRelationshipId(bill.vendor) || ''),
    vendorLabel: vendor
      ? `${vendor.vendorCode ? `${vendor.vendorCode} - ` : ''}${vendor.displayName || `Vendor ${vendor.id || ''}`}`.trim()
      : String(bill.vendor || 'Unassigned Vendor'),
    vendorCurrency: String(vendor?.currencyReference?.code || ''),
    vendorPaymentTerms: String(vendor?.paymentTermReference?.name || ''),
    billDate: bill.billDate || null,
    billDateLabel: formatDate(bill.billDate),
    postingDate: bill.postingDate || null,
    postingDateLabel: formatDate(bill.postingDate),
    dueDate: bill.dueDate || null,
    dueDateLabel: formatDate(bill.dueDate),
    status,
    statusLabel: statusLabelMap.get(status) || 'Unknown',
    postingStatus,
    postingStatusLabel: toTitleLabel(postingStatus),
    currency: String(bill.currency || 'PHP'),
    exchangeRate: normalizeAmount(bill.exchangeRate || 1),
    subtotal: normalizeAmount(bill.subtotal),
    subtotalLabel: formatCurrency(bill.subtotal, String(bill.currency || 'PHP')),
    taxTotal: normalizeAmount(bill.taxTotal),
    taxTotalLabel: formatCurrency(bill.taxTotal, String(bill.currency || 'PHP')),
    total: normalizeAmount(bill.total),
    totalLabel: formatCurrency(bill.total, String(bill.currency || 'PHP')),
    balanceDue: normalizeAmount(bill.balanceDue),
    balanceDueLabel: formatCurrency(bill.balanceDue, String(bill.currency || 'PHP')),
    referenceNumber: String(bill.referenceNumber || ''),
    memo: String(bill.memo || ''),
    payableAccountOverrideId: String(getRelationshipId(bill.payableAccountOverride) || ''),
    payableAccountOverrideLabel:
      typeof bill.payableAccountOverride === 'object' && bill.payableAccountOverride
        ? `${bill.payableAccountOverride.code ? `${bill.payableAccountOverride.code} - ` : ''}${bill.payableAccountOverride.name || 'Unnamed account'}`
        : '',
    postedJournalEntryId: String(getRelationshipId(bill.postedJournalEntry) || ''),
    notes: String(bill.notes || ''),
    createdAt: bill.createdAt || null,
    updatedAt: bill.updatedAt || null,
    lineItems,
    documentLinks: documentLinks.map((documentLink) => ({
      id: String(documentLink.id),
      documentCategory: String(documentLink.documentCategory || ''),
      documentCategoryLabel: toTitleLabel(documentLink.documentCategory),
      documentDate: documentLink.documentDate || null,
      documentDateLabel: formatDate(documentLink.documentDate),
      isPrimary: Boolean(documentLink.isPrimary),
      notes: String(documentLink.notes || ''),
    })),
    usageSummary: {
      lineItemCount: lineItems.length,
      appliedPaymentsCount,
      appliedVendorCreditsCount,
      documentCount: documentLinks.length,
      hasDependents:
        appliedPaymentsCount > 0 ||
        appliedVendorCreditsCount > 0 ||
        documentLinks.length > 0 ||
        Boolean(getRelationshipId(bill.postedJournalEntry)),
    },
  }
}

export const buildBillsReferenceData = async (payload: Payload) => {
  const [vendors, chartAccounts, taxCodes] = await Promise.all([
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.vendors,
      depth: 1,
      limit: 500,
      sort: 'displayName',
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      depth: 0,
      limit: 1000,
      sort: 'code',
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
      depth: 0,
      limit: 500,
      sort: 'code',
      overrideAccess: true,
    }),
  ])

  return {
    vendors: vendors.docs.map((vendor: any) => ({
      id: vendor.id,
      vendorCode: vendor.vendorCode || null,
      displayName: vendor.displayName || null,
      paymentTerms: vendor.paymentTermReference?.name || null,
      currency: vendor.currencyReference?.code || null,
      status: vendor.status || null,
    })),
    chartAccounts: chartAccounts.docs.map((account: any) => ({
      id: account.id,
      code: account.code || null,
      name: account.name || null,
      accountType: account.accountType || null,
      accountSubType: account.accountSubType || null,
    })),
    taxCodes: taxCodes.docs.map((taxCode: any) => ({
      id: taxCode.id,
      code: taxCode.code || null,
      name: taxCode.name || null,
      rate: normalizeAmount(taxCode.rate),
      calculationMethod: String(taxCode.calculationMethod || 'exclusive'),
      isActive: Boolean(taxCode.isActive),
    })),
  }
}

type NormalizedBillLine = {
  lineNumber: number
  description: string
  quantity: number
  unitPrice: number
  taxCode: number | string | null
  expenseAccount?: number | string | null
  assetAccount?: number | string | null
  payableAccountOverride?: number | string | null
}

export const normalizeBillMutationBody = (body: Record<string, unknown>) => {
  const billNumber =
    body.billNumber === undefined
      ? undefined
      : typeof body.billNumber === 'string'
        ? body.billNumber.trim() || null
        : String(body.billNumber ?? '').trim() || null

  const lineInputs = Array.isArray(body.lines)
    ? (body.lines as Array<Record<string, unknown>>)
    : undefined

  return {
    ...(billNumber !== undefined ? { billNumber } : {}),
    ...(body.vendor !== undefined ? { vendor: normalizeRelationshipId(body.vendor) } : {}),
    ...(body.billDate !== undefined ? { billDate: normalizeOptionalString(body.billDate) } : {}),
    ...(body.postingDate !== undefined ? { postingDate: normalizeOptionalString(body.postingDate) } : {}),
    ...(body.dueDate !== undefined ? { dueDate: normalizeOptionalString(body.dueDate) } : {}),
    ...(body.status !== undefined ? { status: String(body.status || 'draft') } : {}),
    ...(body.currency !== undefined ? { currency: normalizeOptionalString(body.currency) } : {}),
    ...(body.exchangeRate !== undefined ? { exchangeRate: Number(body.exchangeRate ?? 1) } : {}),
    ...(body.referenceNumber !== undefined
      ? { referenceNumber: normalizeOptionalString(body.referenceNumber) }
      : {}),
    ...(body.memo !== undefined ? { memo: normalizeOptionalString(body.memo) } : {}),
    ...(body.payableAccountOverride !== undefined
      ? { payableAccountOverride: normalizeRelationshipId(body.payableAccountOverride) }
      : {}),
    ...(body.notes !== undefined ? { notes: normalizeOptionalString(body.notes) } : {}),
    ...(lineInputs !== undefined
      ? {
          lines: lineInputs.map((line, index) => {
            const accountType = String(line.accountType || 'expense') === 'asset' ? 'asset' : 'expense'
            const accountId = normalizeRelationshipId(line.accountId)
            const normalizedLine: NormalizedBillLine = {
              lineNumber: index + 1,
              description: String(line.description || '').trim(),
              quantity: Number(line.quantity ?? 0),
              unitPrice: Number(line.unitPrice ?? 0),
              taxCode: normalizeRelationshipId(line.taxCode) || null,
              payableAccountOverride: normalizeRelationshipId(line.payableAccountOverride),
            }
            if (accountType === 'asset') {
              normalizedLine.assetAccount = accountId
              normalizedLine.expenseAccount = null
            } else {
              normalizedLine.expenseAccount = accountId
              normalizedLine.assetAccount = null
            }
            return normalizedLine
          }),
        }
      : {}),
  }
}

const assertRelationshipExists = async (
  payload: Payload,
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

export const assertBillMutationPayload = async (
  payload: Payload,
  body: ReturnType<typeof normalizeBillMutationBody>,
) => {
  if ('vendor' in body) {
    if (!body.vendor) throw new Error('Vendor is required.')
    await assertRelationshipExists(payload, ACCOUNTING_COLLECTION_SLUGS.vendors, body.vendor, 'Vendor')
  }

  if ('billDate' in body && !body.billDate) throw new Error('Bill date is required.')
  if ('postingDate' in body && !body.postingDate) throw new Error('Posting date is required.')
  if ('dueDate' in body && !body.dueDate) throw new Error('Due date is required.')

  if ('status' in body && !['draft', 'approved'].includes(String(body.status || ''))) {
    throw new Error('Editable bills may only be saved as Draft or Approved.')
  }

  if ('payableAccountOverride' in body) {
    await assertRelationshipExists(
      payload,
      ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      body.payableAccountOverride || null,
      'Payable account override',
    )
  }

  if (body.lines) {
    if (!body.lines.length) throw new Error('Bills require at least one line item.')

    for (let index = 0; index < body.lines.length; index += 1) {
      const line = body.lines[index]
      if (!line.description) throw new Error(`Line ${index + 1} description is required.`)
      if (!(line.quantity > 0)) throw new Error(`Line ${index + 1} quantity must be greater than zero.`)
      if (line.unitPrice < 0) throw new Error(`Line ${index + 1} unit price cannot be negative.`)

      const accountId = line.expenseAccount || line.assetAccount || null
      if (!accountId) throw new Error(`Line ${index + 1} account is required.`)

      await assertRelationshipExists(
        payload,
        ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
        accountId,
        `Line ${index + 1} account`,
      )
      await assertRelationshipExists(
        payload,
        ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
        line.payableAccountOverride || null,
        `Line ${index + 1} payable account override`,
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
