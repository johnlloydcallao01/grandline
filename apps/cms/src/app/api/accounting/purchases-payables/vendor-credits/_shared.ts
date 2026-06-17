import { APIError, type Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS, DOCUMENT_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { AccountingCommercialService } from '@/accounting/services/AccountingCommercialService'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'
import {
  buildBillsReferenceData,
  formatCurrency,
  formatDate,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
} from '../bills/_shared'

type StatusTone = 'amber' | 'blue' | 'gray' | 'green' | 'red'

export type VendorCreditDoc = {
  id: number | string
  vendorCreditNumber?: string | null
  vendor?:
    | {
        id?: number | string
        vendorCode?: string | null
        displayName?: string | null
        currencyReference?: { code?: string | null } | null
        paymentTermReference?: { name?: string | null } | null
      }
    | number
    | string
    | null
  creditDate?: string | null
  postingDate?: string | null
  fiscalYear?: unknown
  period?: unknown
  status?: string | null
  currency?: string | null
  subtotal?: number | null
  taxTotal?: number | null
  total?: number | null
  appliedAmount?: number | null
  remainingAmount?: number | null
  sourceBill?:
    | {
        id?: number | string
        billNumber?: string | null
        vendor?: unknown
        balanceDue?: number | null
      }
    | number
    | string
    | null
  applications?: Array<
    | {
        bill?:
          | {
              id?: number | string
              billNumber?: string | null
              balanceDue?: number | null
            }
          | number
          | string
          | null
        amountApplied?: number | null
      }
    | null
  > | null
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

type VendorDoc = {
  id: number | string
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

export type VendorCreditBillDoc = {
  id: number | string
  billNumber?: string | null
  vendor?:
    | {
        id?: number | string
        vendorCode?: string | null
        displayName?: string | null
      }
    | number
    | string
    | null
  status?: string | null
  billDate?: string | null
  dueDate?: string | null
  total?: number | null
  balanceDue?: number | null
  currency?: string | null
}

type ChartAccountDoc = {
  id: number | string
  code?: string | null
  name?: string | null
  accountType?: string | null
  accountSubType?: string | null
}

type PaymentMadeDoc = {
  id: number | string
  vendor?: unknown
  applications?: Array<
    | {
        bill?: unknown
        amountApplied?: number | null
      }
    | null
  > | null
}

type VendorCreditMutationApplication = {
  bill?: unknown
  amountApplied?: unknown
}

export type VendorCreditsCell =
  | string
  | {
      text: string
      tone?: StatusTone
      emphasis?: boolean
      align?: 'left' | 'right' | 'center'
    }

export type VendorCreditRegisterRow = {
  id: string
  vendorCreditNumber: string
  creditDate: string | null
  creditDateLabel: string
  vendorId: string
  vendorLabel: string
  sourceBillId: string
  sourceBillLabel: string
  total: number
  totalLabel: string
  appliedAmount: number
  appliedAmountLabel: string
  remainingAmount: number
  remainingAmountLabel: string
  status: string
  statusLabel: string
  statusTone: StatusTone
  postedJournalEntryId: string
  reason: string
  hasApplications: boolean
  hasSourceBill: boolean
  hasRemainingCredit: boolean
  searchableText: string
  cells: VendorCreditsCell[]
}

export type VendorCreditDetail = {
  id: string
  vendorCreditNumber: string
  vendorId: string
  vendorLabel: string
  vendorCurrency: string
  vendorPaymentTerms: string
  creditDate: string | null
  creditDateLabel: string
  postingDate: string | null
  postingDateLabel: string
  status: string
  statusLabel: string
  currency: string
  subtotal: number
  subtotalLabel: string
  taxTotal: number
  taxTotalLabel: string
  total: number
  totalLabel: string
  appliedAmount: number
  appliedAmountLabel: string
  remainingAmount: number
  remainingAmountLabel: string
  sourceBillId: string
  sourceBillLabel: string
  sourceBillBalanceDue: number
  sourceBillBalanceDueLabel: string
  adjustmentAccountId: string
  adjustmentAccountLabel: string
  postedJournalEntryId: string
  reason: string
  notes: string
  createdAt: string | null
  updatedAt: string | null
  applications: Array<{
    id: string
    billId: string
    billLabel: string
    amountApplied: number
    amountAppliedLabel: string
    billBalanceDue: number
    billBalanceDueLabel: string
  }>
  usageSummary: {
    applicationCount: number
    hasPostedJournalEntry: boolean
    hasBlockingDependents: boolean
  }
}

const statusLabels = new Map<string, string>(DOCUMENT_STATUS_OPTIONS.map((option) => [option.value, option.label]))

const toTitleLabel = (value: string | null | undefined) =>
  String(value || '')
    .split('_')
    .join(' ')
    .replace(/\b\w/g, (character: string) => character.toUpperCase())

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

const buildSearchableText = (parts: Array<unknown>) =>
  parts
    .map((part) => normalizeSearch(part))
    .filter(Boolean)
    .join(' ')

const normalizeRelationshipId = (value: unknown) => {
  if (value === undefined || value === null || value === '') return null
  const stringValue = String(value).trim()
  if (!stringValue || stringValue === 'null' || stringValue === 'undefined') return null
  const numeric = Number(stringValue)
  return Number.isFinite(numeric) ? numeric : stringValue
}

const normalizeOptionalString = (value: unknown) => {
  if (value === undefined) return undefined
  if (value === null) return null
  const normalized = String(value).trim()
  return normalized || null
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

const assertBillMatchesVendor = async (
  payload: Payload,
  billId: string | number | null,
  vendorId: string | number | null,
  label: string,
) => {
  if (!billId || !vendorId) return
  const bill = (await payload.findByID({
    collection: ACCOUNTING_COLLECTION_SLUGS.bills,
    id: billId,
    depth: 0,
    overrideAccess: true,
  })) as VendorCreditBillDoc

  if (String(getRelationshipId(bill.vendor) || '') !== String(vendorId)) {
    throw new Error(`${label} must belong to the selected vendor.`)
  }
}

export const normalizeVendorCreditMutationBody = (body: Record<string, unknown>) => {
  const applications = Array.isArray(body.applications)
    ? (body.applications as VendorCreditMutationApplication[])
    : undefined
  const subtotal = body.subtotal !== undefined ? normalizeAmount(body.subtotal) : undefined
  const taxTotal = body.taxTotal !== undefined ? normalizeAmount(body.taxTotal) : undefined
  const computedTotal =
    subtotal !== undefined || taxTotal !== undefined ? normalizeAmount((subtotal || 0) + (taxTotal || 0)) : undefined

  return {
    ...(body.vendorCreditNumber !== undefined
      ? { vendorCreditNumber: normalizeOptionalString(body.vendorCreditNumber) }
      : {}),
    ...(body.vendor !== undefined ? { vendor: normalizeRelationshipId(body.vendor) } : {}),
    ...(body.creditDate !== undefined ? { creditDate: normalizeOptionalString(body.creditDate) } : {}),
    ...(body.postingDate !== undefined ? { postingDate: normalizeOptionalString(body.postingDate) } : {}),
    ...(body.status !== undefined ? { status: String(body.status || 'draft') } : {}),
    ...(body.currency !== undefined ? { currency: normalizeOptionalString(body.currency) } : {}),
    ...(subtotal !== undefined ? { subtotal } : {}),
    ...(taxTotal !== undefined ? { taxTotal } : {}),
    ...(computedTotal !== undefined ? { total: computedTotal } : {}),
    ...(body.sourceBill !== undefined ? { sourceBill: normalizeRelationshipId(body.sourceBill) } : {}),
    ...(body.adjustmentAccount !== undefined
      ? { adjustmentAccount: normalizeRelationshipId(body.adjustmentAccount) }
      : {}),
    ...(body.reason !== undefined ? { reason: normalizeOptionalString(body.reason) } : {}),
    ...(body.notes !== undefined ? { notes: normalizeOptionalString(body.notes) } : {}),
    ...(applications !== undefined
      ? {
          applications: applications.map((application) => ({
            bill: normalizeRelationshipId(application.bill),
            amountApplied: normalizeAmount(application.amountApplied),
          })),
        }
      : {}),
  }
}

export const assertVendorCreditMutationPayload = async (
  payload: Payload,
  body: ReturnType<typeof normalizeVendorCreditMutationBody>,
) => {
  if ('vendor' in body) {
    if (!body.vendor) throw new Error('Vendor is required.')
    await assertRelationshipExists(payload, ACCOUNTING_COLLECTION_SLUGS.vendors, body.vendor, 'Vendor')
  }

  if ('adjustmentAccount' in body) {
    if (!body.adjustmentAccount) throw new Error('Adjustment account is required.')
    await assertRelationshipExists(
      payload,
      ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      body.adjustmentAccount,
      'Adjustment account',
    )
  }

  if ('sourceBill' in body) {
    await assertRelationshipExists(payload, ACCOUNTING_COLLECTION_SLUGS.bills, body.sourceBill || null, 'Source bill')
    await assertBillMatchesVendor(payload, body.sourceBill || null, body.vendor || null, 'Source bill')
  }

  if ('creditDate' in body && !body.creditDate) throw new Error('Credit date is required.')
  if ('postingDate' in body && !body.postingDate) throw new Error('Posting date is required.')

  if ('status' in body && !['draft', 'approved'].includes(String(body.status || ''))) {
    throw new Error('Editable vendor credits may only be saved as Draft or Approved.')
  }

  if (body.subtotal !== undefined && body.subtotal < 0) throw new Error('Subtotal cannot be negative.')
  if (body.taxTotal !== undefined && body.taxTotal < 0) throw new Error('Tax total cannot be negative.')
  if (body.total !== undefined && body.total <= 0) throw new Error('Vendor credits require a positive total.')

  if (body.applications) {
    await AccountingCommercialService.validateVendorCreditApplications(payload, body.applications, body.vendor)
    const appliedAmount = AccountingCommercialService.getAppliedAmountFromArray(body.applications)
    if (body.total !== undefined && appliedAmount > body.total) {
      throw new Error('Vendor credit applications cannot exceed the vendor credit total.')
    }
  }
}

export const buildVendorCreditRow = (vendorCredit: VendorCreditDoc): VendorCreditRegisterRow => {
  const vendorCreditId = String(vendorCredit.id)
  const vendor = typeof vendorCredit.vendor === 'object' && vendorCredit.vendor ? vendorCredit.vendor : null
  const vendorLabel = vendor
    ? `${vendor.vendorCode ? `${vendor.vendorCode} - ` : ''}${vendor.displayName || `Vendor ${vendor.id || ''}`}`.trim()
    : String(vendorCredit.vendor || 'Unassigned Vendor')
  const status = String(vendorCredit.status || '')
  const total = normalizeAmount(vendorCredit.total)
  const appliedAmount = normalizeAmount(vendorCredit.appliedAmount)
  const remainingAmount = normalizeAmount(vendorCredit.remainingAmount ?? total - appliedAmount)
  const sourceBillLabel =
    typeof vendorCredit.sourceBill === 'object' && vendorCredit.sourceBill
      ? String(vendorCredit.sourceBill.billNumber || `Bill ${vendorCredit.sourceBill.id || ''}`)
      : ''

  return {
    id: vendorCreditId,
    vendorCreditNumber: String(vendorCredit.vendorCreditNumber || `Vendor Credit ${vendorCreditId}`),
    creditDate: vendorCredit.creditDate || null,
    creditDateLabel: formatDate(vendorCredit.creditDate),
    vendorId: String(getRelationshipId(vendorCredit.vendor) || ''),
    vendorLabel,
    sourceBillId: String(getRelationshipId(vendorCredit.sourceBill) || ''),
    sourceBillLabel,
    total,
    totalLabel: formatCurrency(total, String(vendorCredit.currency || 'PHP')),
    appliedAmount,
    appliedAmountLabel: formatCurrency(appliedAmount, String(vendorCredit.currency || 'PHP')),
    remainingAmount,
    remainingAmountLabel: formatCurrency(remainingAmount, String(vendorCredit.currency || 'PHP')),
    status,
    statusLabel: statusLabels.get(status) || toTitleLabel(status),
    statusTone: getStatusTone(status),
    postedJournalEntryId: String(getRelationshipId(vendorCredit.postedJournalEntry) || ''),
    reason: String(vendorCredit.reason || ''),
    hasApplications: Array.isArray(vendorCredit.applications) && vendorCredit.applications.length > 0,
    hasSourceBill: Boolean(getRelationshipId(vendorCredit.sourceBill)),
    hasRemainingCredit: remainingAmount > 0,
    searchableText: buildSearchableText([
      vendorCredit.vendorCreditNumber,
      vendorLabel,
      sourceBillLabel,
      vendorCredit.reason,
      vendorCredit.notes,
      formatDate(vendorCredit.creditDate),
      formatCurrency(remainingAmount, String(vendorCredit.currency || 'PHP')),
      statusLabels.get(status),
    ]),
    cells: [
      { text: String(vendorCredit.vendorCreditNumber || `Vendor Credit ${vendorCreditId}`), emphasis: true },
      formatDate(vendorCredit.creditDate),
      vendorLabel,
      sourceBillLabel || '-',
      { text: formatCurrency(remainingAmount, String(vendorCredit.currency || 'PHP')), emphasis: true, align: 'right' },
      { text: statusLabels.get(status) || toTitleLabel(status), tone: getStatusTone(status) },
    ],
  }
}

export const matchesVendorCreditQuickFilter = (
  row: VendorCreditRegisterRow,
  quickFilter: string,
) => {
  const [group, value] = quickFilter.split(':')
  if (group === 'status') return row.status === value
  if (group === 'balance' && value === 'remaining') return row.hasRemainingCredit
  if (group === 'balance' && value === 'fully_applied') return row.remainingAmount <= 0
  if (group === 'coverage' && value === 'with_source_bill') return row.hasSourceBill
  if (group === 'coverage' && value === 'with_applications') return row.hasApplications
  return false
}

export const matchesSelectedVendorCreditFilters = (
  row: VendorCreditRegisterRow,
  filters: {
    statuses: string[]
    vendorIds: string[]
    balanceStates: string[]
    quickFilters: string[]
  },
) => {
  const predicates = [
    ...filters.statuses.map((status) => row.status === status),
    ...filters.vendorIds.map((vendorId) => row.vendorId === vendorId),
    ...filters.balanceStates.map((state) => matchesVendorCreditQuickFilter(row, `balance:${state}`)),
    ...filters.quickFilters.map((quickFilter) => matchesVendorCreditQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) {
    return true
  }

  return predicates.some(Boolean)
}

export const buildVendorCreditMetrics = (rows: VendorCreditRegisterRow[]) => [
  {
    id: 'vendor-credits-draft',
    label: 'Draft Credits',
    value: rows.filter((row) => row.status === 'draft').length,
    change: 'Prepared but not yet posted',
    trend: 'neutral' as const,
  },
  {
    id: 'vendor-credits-posted',
    label: 'Posted Credits',
    value: rows.filter((row) => ['posted', 'partially_paid', 'paid'].includes(row.status)).length,
    change: 'Reducing open payable balances',
    trend: 'up' as const,
  },
  {
    id: 'vendor-credits-applied',
    label: 'Applied Amount',
    value: formatCurrency(rows.reduce((sum, row) => sum + row.appliedAmount, 0)),
    change: 'Applied against source and target bills',
    trend: 'up' as const,
  },
  {
    id: 'vendor-credits-remaining',
    label: 'Remaining Credit',
    value: formatCurrency(rows.reduce((sum, row) => sum + row.remainingAmount, 0)),
    change: 'Available for future bill application',
    trend: 'down' as const,
  },
]

export const buildVendorCreditDetailResponse = (vendorCredit: VendorCreditDoc): VendorCreditDetail => {
  const total = normalizeAmount(vendorCredit.total)
  const appliedAmount = normalizeAmount(vendorCredit.appliedAmount)
  const remainingAmount = normalizeAmount(vendorCredit.remainingAmount ?? total - appliedAmount)
  const vendor = typeof vendorCredit.vendor === 'object' && vendorCredit.vendor ? vendorCredit.vendor : null

  return {
    id: String(vendorCredit.id),
    vendorCreditNumber: String(vendorCredit.vendorCreditNumber || `Vendor Credit ${vendorCredit.id}`),
    vendorId: String(getRelationshipId(vendorCredit.vendor) || ''),
    vendorLabel: vendor
      ? `${vendor.vendorCode ? `${vendor.vendorCode} - ` : ''}${vendor.displayName || `Vendor ${vendor.id || ''}`}`.trim()
      : '',
    vendorCurrency: String(vendor?.currencyReference?.code || ''),
    vendorPaymentTerms: String(vendor?.paymentTermReference?.name || ''),
    creditDate: vendorCredit.creditDate || null,
    creditDateLabel: formatDate(vendorCredit.creditDate),
    postingDate: vendorCredit.postingDate || null,
    postingDateLabel: formatDate(vendorCredit.postingDate),
    status: String(vendorCredit.status || ''),
    statusLabel: statusLabels.get(String(vendorCredit.status || '')) || toTitleLabel(vendorCredit.status),
    currency: String(vendorCredit.currency || 'PHP'),
    subtotal: normalizeAmount(vendorCredit.subtotal),
    subtotalLabel: formatCurrency(vendorCredit.subtotal, String(vendorCredit.currency || 'PHP')),
    taxTotal: normalizeAmount(vendorCredit.taxTotal),
    taxTotalLabel: formatCurrency(vendorCredit.taxTotal, String(vendorCredit.currency || 'PHP')),
    total,
    totalLabel: formatCurrency(total, String(vendorCredit.currency || 'PHP')),
    appliedAmount,
    appliedAmountLabel: formatCurrency(appliedAmount, String(vendorCredit.currency || 'PHP')),
    remainingAmount,
    remainingAmountLabel: formatCurrency(remainingAmount, String(vendorCredit.currency || 'PHP')),
    sourceBillId: String(getRelationshipId(vendorCredit.sourceBill) || ''),
    sourceBillLabel:
      typeof vendorCredit.sourceBill === 'object' && vendorCredit.sourceBill
        ? String(vendorCredit.sourceBill.billNumber || `Bill ${vendorCredit.sourceBill.id || ''}`)
        : '',
    sourceBillBalanceDue:
      typeof vendorCredit.sourceBill === 'object' && vendorCredit.sourceBill
        ? normalizeAmount(vendorCredit.sourceBill.balanceDue)
        : 0,
    sourceBillBalanceDueLabel:
      typeof vendorCredit.sourceBill === 'object' && vendorCredit.sourceBill
        ? formatCurrency(vendorCredit.sourceBill.balanceDue, String(vendorCredit.currency || 'PHP'))
        : formatCurrency(0, String(vendorCredit.currency || 'PHP')),
    adjustmentAccountId: String(getRelationshipId(vendorCredit.adjustmentAccount) || ''),
    adjustmentAccountLabel:
      typeof vendorCredit.adjustmentAccount === 'object' && vendorCredit.adjustmentAccount
        ? `${vendorCredit.adjustmentAccount.code ? `${vendorCredit.adjustmentAccount.code} - ` : ''}${vendorCredit.adjustmentAccount.name || 'Unnamed account'}`
        : '',
    postedJournalEntryId: String(getRelationshipId(vendorCredit.postedJournalEntry) || ''),
    reason: String(vendorCredit.reason || ''),
    notes: String(vendorCredit.notes || ''),
    createdAt: vendorCredit.createdAt || null,
    updatedAt: vendorCredit.updatedAt || null,
    applications: (vendorCredit.applications || []).map((application, index) => ({
      id: `${vendorCredit.id}-application-${index + 1}`,
      billId: String(getRelationshipId(application?.bill) || ''),
      billLabel:
        typeof application?.bill === 'object' && application?.bill
          ? String(application.bill.billNumber || `Bill ${application.bill.id || ''}`)
          : '',
      amountApplied: normalizeAmount(application?.amountApplied),
      amountAppliedLabel: formatCurrency(application?.amountApplied, String(vendorCredit.currency || 'PHP')),
      billBalanceDue:
        typeof application?.bill === 'object' && application?.bill
          ? normalizeAmount(application.bill.balanceDue)
          : 0,
      billBalanceDueLabel:
        typeof application?.bill === 'object' && application?.bill
          ? formatCurrency(application.bill.balanceDue, String(vendorCredit.currency || 'PHP'))
          : formatCurrency(0, String(vendorCredit.currency || 'PHP')),
    })),
    usageSummary: {
      applicationCount: Array.isArray(vendorCredit.applications) ? vendorCredit.applications.length : 0,
      hasPostedJournalEntry: Boolean(getRelationshipId(vendorCredit.postedJournalEntry)),
      hasBlockingDependents:
        ['posted', 'partially_paid', 'paid', 'voided'].includes(String(vendorCredit.status || '')) ||
        Boolean(getRelationshipId(vendorCredit.postedJournalEntry)),
    },
  }
}

export const buildVendorCreditsReferenceData = async (payload: Payload) => {
  const [baseReferenceData, billsResult] = await Promise.all([
    buildBillsReferenceData(payload),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.bills,
      depth: 1,
      limit: 1000,
      sort: '-billDate',
      overrideAccess: true,
    }),
  ])

  return {
    ...baseReferenceData,
    bills: billsResult.docs.map((bill: any) => ({
      id: bill.id,
      billNumber: bill.billNumber || null,
      vendorId: getRelationshipId(bill.vendor),
      vendorLabel:
        bill.vendor && typeof bill.vendor === 'object'
          ? `${bill.vendor.vendorCode ? `${bill.vendor.vendorCode} - ` : ''}${bill.vendor.displayName || `Vendor ${bill.vendor.id || ''}`}`.trim()
          : '',
      status: bill.status || null,
      billDate: bill.billDate || null,
      dueDate: bill.dueDate || null,
      total: normalizeAmount(bill.total),
      balanceDue: normalizeAmount(bill.balanceDue),
      currency: bill.currency || 'PHP',
    })),
  }
}

export const buildVendorCreditsDetailContext = async (
  payload: Payload,
  vendorCreditId: string | number,
) => {
  const vendorCredit = (await payload.findByID({
    collection: ACCOUNTING_COLLECTION_SLUGS.vendorCredits,
    id: vendorCreditId,
    depth: 2,
    overrideAccess: true,
  })) as VendorCreditDoc

  return buildVendorCreditDetailResponse(vendorCredit)
}

export const assertMutableVendorCredit = (vendorCredit: VendorCreditDoc) => {
  try {
    AccountingCommercialService.assertMutableStatus(vendorCredit.status, 'Vendor credit')
  } catch (error) {
    throw new APIError(error instanceof Error ? error.message : 'Vendor credit cannot be edited directly.', 400)
  }
}

export { normalizeSearch, parseIntegerParam, parseListParam }
export type { ChartAccountDoc, PaymentMadeDoc, VendorCreditMutationApplication, VendorDoc }
