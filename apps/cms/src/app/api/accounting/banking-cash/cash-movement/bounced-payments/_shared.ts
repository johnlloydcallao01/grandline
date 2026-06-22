import type { Payload } from 'payload'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  BOUNCED_PAYMENT_CASE_STATUS_OPTIONS,
  BOUNCED_PAYMENT_REASON_OPTIONS,
} from '@/accounting/constants/accounting'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { AccountingApiError, parseNumberParam } from '../../../_utils/auth'

type StatusTone = 'amber' | 'blue' | 'gray' | 'green' | 'red'

export type BouncedPaymentCell =
  | string
  | {
      text: string
      tone?: StatusTone
      emphasis?: boolean
      align?: 'left' | 'right' | 'center'
    }

type UserRelation =
  | {
      id?: number | string
      name?: string | null
      email?: string | null
    }
  | number
  | string
  | null

type CustomerRelation =
  | {
      id?: number | string
      customerCode?: string | null
      displayName?: string | null
      status?: string | null
    }
  | number
  | string
  | null

type BankAccountRelation =
  | {
      id?: number | string
      accountName?: string | null
      bankName?: string | null
      accountNumberMasked?: string | null
      accountType?: string | null
      ledgerAccount?: {
        id?: number | string
        code?: string | null
        name?: string | null
      } | null
    }
  | number
  | string
  | null

type ChartAccountRelation =
  | {
      id?: number | string
      code?: string | null
      name?: string | null
      accountType?: string | null
      accountSubType?: string | null
    }
  | number
  | string
  | null

type JournalRelation =
  | {
      id?: number | string
      entryNumber?: string | null
      referenceNumber?: string | null
      status?: string | null
    }
  | number
  | string
  | null

type PaymentRelation =
  | {
      id?: number | string
      receiptNumber?: string | null
      amountReceived?: number | null
      paymentDate?: string | null
      postingDate?: string | null
      status?: string | null
      customer?: CustomerRelation
      depositAccount?: BankAccountRelation
      undepositedFundsAccount?: ChartAccountRelation
      postedJournalEntry?: JournalRelation
      referenceNumber?: string | null
    }
  | number
  | string
  | null

export type BouncedPaymentDoc = {
  id: number | string
  caseNumber?: string | null
  originalPayment?: PaymentRelation
  customer?: CustomerRelation
  originalReceiptNumber?: string | null
  originalPaymentDate?: string | null
  originalPaymentAmount?: number | null
  originalDepositAccount?: BankAccountRelation
  originalJournalEntry?: JournalRelation
  bounceDate?: string | null
  bankNoticeDate?: string | null
  bounceReason?: string | null
  caseStatus?: string | null
  bankChargeAmount?: number | null
  chargeExpenseAccount?: ChartAccountRelation
  reversalJournalEntry?: JournalRelation
  chargeJournalEntry?: JournalRelation
  recoveryPayment?: PaymentRelation
  recoveryDate?: string | null
  followUpDate?: string | null
  resolutionDate?: string | null
  notes?: string | null
  resolutionNotes?: string | null
  createdBy?: UserRelation
  updatedBy?: UserRelation
  createdAt?: string | null
  updatedAt?: string | null
}

export type BouncedPaymentRow = {
  id: string
  caseNumber: string
  customerId: string
  customerLabel: string
  originalPaymentId: string
  originalReceiptNumber: string
  originalPaymentAmount: number
  originalPaymentAmountLabel: string
  originalPaymentDate: string | null
  originalPaymentDateLabel: string
  originalDepositAccountId: string
  originalDepositAccountLabel: string
  originalJournalEntryId: string
  originalJournalEntryLabel: string
  bounceDate: string | null
  bounceDateLabel: string
  bankNoticeDate: string | null
  bankNoticeDateLabel: string
  bounceReason: string
  bounceReasonLabel: string
  caseStatus: string
  caseStatusLabel: string
  caseStatusTone: StatusTone
  bankChargeAmount: number
  bankChargeAmountLabel: string
  chargeExpenseAccountId: string
  chargeExpenseAccountLabel: string
  reversalJournalEntryId: string
  reversalJournalEntryLabel: string
  chargeJournalEntryId: string
  chargeJournalEntryLabel: string
  recoveryPaymentId: string
  recoveryPaymentLabel: string
  recoveryAmount: number
  recoveryAmountLabel: string
  recoveryDate: string | null
  recoveryDateLabel: string
  followUpDate: string | null
  followUpDateLabel: string
  resolutionDate: string | null
  resolutionDateLabel: string
  exposureAmount: number
  exposureAmountLabel: string
  notes: string
  resolutionNotes: string
  preparedByLabel: string
  updatedByLabel: string
  createdAt: string | null
  updatedAt: string | null
  hasReversal: boolean
  hasChargeJournal: boolean
  hasRecovery: boolean
  hasBankCharge: boolean
  isOpen: boolean
  needsFollowUp: boolean
  searchableText: string
  cells: BouncedPaymentCell[]
}

export type BouncedPaymentDetail = BouncedPaymentRow & {
  usageSummary: {
    canEdit: boolean
    canDelete: boolean
    canReverse: boolean
    deleteBlockedReason: string | null
    reverseBlockedReason: string | null
    financialLockReason: string | null
  }
}

export type BouncedPaymentMutationBody = {
  caseNumber?: string | null
  originalPayment?: string | number | null
  bounceDate?: string | null
  bankNoticeDate?: string | null
  bounceReason?: string | null
  caseStatus?: string | null
  bankChargeAmount?: number | null
  chargeExpenseAccount?: string | number | null
  recoveryPayment?: string | number | null
  recoveryDate?: string | null
  followUpDate?: string | null
  resolutionDate?: string | null
  notes?: string | null
  resolutionNotes?: string | null
}

const caseStatusLabelMap = new Map(
  BOUNCED_PAYMENT_CASE_STATUS_OPTIONS.map((option) => [String(option.value), option.label]),
)
const reasonLabelMap = new Map(BOUNCED_PAYMENT_REASON_OPTIONS.map((option) => [String(option.value), option.label]))

export const parseIntegerParam = (value: string | null | undefined, fallback: number) => {
  const parsedValue = Number.parseInt(String(value ?? ''), 10)
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

const normalizeOptionalString = (value: unknown) => {
  if (value === undefined) return undefined
  if (value === null) return null
  const normalized = String(value).trim()
  return normalized || null
}

const normalizeRelationshipId = (value: unknown) => {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  const normalized = String(value).trim()
  if (!normalized || normalized === 'null' || normalized === 'undefined') return null
  return parseNumberParam(normalized)
}

const normalizeDateValue = (value: unknown) => {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

const normalizeNonNegativeAmount = (value: unknown) => {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return Math.round((parsed + Number.EPSILON) * 100) / 100
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

const resolveUserLabel = (value: UserRelation | undefined) => {
  if (typeof value === 'object' && value) return String(value.name || value.email || '')
  return ''
}

const buildCustomerLabel = (customer: CustomerRelation | undefined) => {
  if (!customer) return 'Unassigned Customer'
  if (typeof customer === 'number' || typeof customer === 'string') return String(customer)
  return `${customer.customerCode ? `${customer.customerCode} - ` : ''}${customer.displayName || `Customer ${customer.id || ''}`}`.trim()
}

const buildCustomerId = (customer: CustomerRelation | undefined) => {
  if (!customer) return ''
  if (typeof customer === 'number' || typeof customer === 'string') return String(customer)
  return String(customer.id || '')
}

const buildBankAccountLabel = (account: BankAccountRelation | undefined) => {
  if (!account) return '-'
  if (typeof account === 'number' || typeof account === 'string') return String(account)
  const parts = [account.accountName || 'Unnamed account', account.bankName || null, account.accountNumberMasked || null].filter(Boolean)
  return parts.join(' • ')
}

const buildChartAccountLabel = (account: ChartAccountRelation | undefined) => {
  if (!account) return '-'
  if (typeof account === 'number' || typeof account === 'string') return String(account)
  return `${account.code ? `${account.code} - ` : ''}${account.name || 'Unnamed account'}`.trim()
}

const buildJournalLabel = (journal: JournalRelation | undefined) => {
  if (!journal) return 'Not Posted'
  if (typeof journal === 'number' || typeof journal === 'string') return `Journal ${journal}`
  return String(journal.entryNumber || journal.referenceNumber || `Journal ${journal.id || ''}`).trim()
}

const buildPaymentLabel = (payment: PaymentRelation | undefined) => {
  if (!payment) return 'No Recovery Linked'
  if (typeof payment === 'number' || typeof payment === 'string') return `Receipt ${payment}`
  return String(payment.receiptNumber || `Receipt ${payment.id || ''}`).trim()
}

const getStatusTone = (status: string | null | undefined): StatusTone => {
  switch (String(status || '')) {
    case 'resolved':
      return 'green'
    case 'written_off':
      return 'gray'
    case 'awaiting_reversal':
      return 'red'
    case 'collections_follow_up':
      return 'amber'
    case 'open':
      return 'blue'
    default:
      return 'gray'
  }
}

export const buildBouncedPaymentRow = (doc: BouncedPaymentDoc): BouncedPaymentRow => {
  const originalPaymentAmount = normalizeAmount(doc.originalPaymentAmount)
  const bankChargeAmount = normalizeAmount(doc.bankChargeAmount)
  const recoveryAmount =
    typeof doc.recoveryPayment === 'object' && doc.recoveryPayment ? normalizeAmount(doc.recoveryPayment.amountReceived) : 0
  const exposureAmount = Math.max(0, normalizeAmount(originalPaymentAmount + bankChargeAmount - recoveryAmount))
  const caseStatus = String(doc.caseStatus || 'open')
  const notes = String(doc.notes || '').trim()
  const resolutionNotes = String(doc.resolutionNotes || '').trim()
  const hasReversal = Boolean(getRelationshipId(doc.reversalJournalEntry))
  const hasChargeJournal = Boolean(getRelationshipId(doc.chargeJournalEntry))
  const hasRecovery = Boolean(getRelationshipId(doc.recoveryPayment))
  const hasBankCharge = bankChargeAmount > 0
  const customerLabel = buildCustomerLabel(doc.customer)

  return {
    id: String(doc.id),
    caseNumber: String(doc.caseNumber || `Bounce ${doc.id}`),
    customerId: buildCustomerId(doc.customer),
    customerLabel,
    originalPaymentId: String(getRelationshipId(doc.originalPayment) || ''),
    originalReceiptNumber: String(doc.originalReceiptNumber || buildPaymentLabel(doc.originalPayment)),
    originalPaymentAmount,
    originalPaymentAmountLabel: formatCurrency(originalPaymentAmount),
    originalPaymentDate: doc.originalPaymentDate || null,
    originalPaymentDateLabel: formatDate(doc.originalPaymentDate),
    originalDepositAccountId: String(getRelationshipId(doc.originalDepositAccount) || ''),
    originalDepositAccountLabel: buildBankAccountLabel(doc.originalDepositAccount),
    originalJournalEntryId: String(getRelationshipId(doc.originalJournalEntry) || ''),
    originalJournalEntryLabel: buildJournalLabel(doc.originalJournalEntry),
    bounceDate: doc.bounceDate || null,
    bounceDateLabel: formatDate(doc.bounceDate),
    bankNoticeDate: doc.bankNoticeDate || null,
    bankNoticeDateLabel: formatDate(doc.bankNoticeDate),
    bounceReason: String(doc.bounceReason || 'other'),
    bounceReasonLabel: reasonLabelMap.get(String(doc.bounceReason || 'other')) || 'Other',
    caseStatus,
    caseStatusLabel: caseStatusLabelMap.get(caseStatus) || 'Unknown',
    caseStatusTone: getStatusTone(caseStatus),
    bankChargeAmount,
    bankChargeAmountLabel: formatCurrency(bankChargeAmount),
    chargeExpenseAccountId: String(getRelationshipId(doc.chargeExpenseAccount) || ''),
    chargeExpenseAccountLabel: buildChartAccountLabel(doc.chargeExpenseAccount),
    reversalJournalEntryId: String(getRelationshipId(doc.reversalJournalEntry) || ''),
    reversalJournalEntryLabel: buildJournalLabel(doc.reversalJournalEntry),
    chargeJournalEntryId: String(getRelationshipId(doc.chargeJournalEntry) || ''),
    chargeJournalEntryLabel: buildJournalLabel(doc.chargeJournalEntry),
    recoveryPaymentId: String(getRelationshipId(doc.recoveryPayment) || ''),
    recoveryPaymentLabel: buildPaymentLabel(doc.recoveryPayment),
    recoveryAmount,
    recoveryAmountLabel: formatCurrency(recoveryAmount),
    recoveryDate: doc.recoveryDate || null,
    recoveryDateLabel: formatDate(doc.recoveryDate),
    followUpDate: doc.followUpDate || null,
    followUpDateLabel: formatDate(doc.followUpDate),
    resolutionDate: doc.resolutionDate || null,
    resolutionDateLabel: formatDate(doc.resolutionDate),
    exposureAmount,
    exposureAmountLabel: formatCurrency(exposureAmount),
    notes,
    resolutionNotes,
    preparedByLabel: resolveUserLabel(doc.createdBy) || '-',
    updatedByLabel: resolveUserLabel(doc.updatedBy) || '-',
    createdAt: doc.createdAt || null,
    updatedAt: doc.updatedAt || null,
    hasReversal,
    hasChargeJournal,
    hasRecovery,
    hasBankCharge,
    isOpen: ['open', 'awaiting_reversal', 'collections_follow_up'].includes(caseStatus),
    needsFollowUp: caseStatus === 'collections_follow_up' || (caseStatus === 'awaiting_reversal' && !hasReversal),
    searchableText: normalizeSearch(
      [
        doc.caseNumber,
        customerLabel,
        doc.originalReceiptNumber,
        reasonLabelMap.get(String(doc.bounceReason || '')),
        doc.notes,
        doc.resolutionNotes,
        buildPaymentLabel(doc.recoveryPayment),
        buildJournalLabel(doc.originalJournalEntry),
      ].join(' '),
    ),
    cells: [
      { text: String(doc.caseNumber || `Bounce ${doc.id}`), emphasis: true },
      customerLabel,
      String(doc.originalReceiptNumber || buildPaymentLabel(doc.originalPayment)),
      reasonLabelMap.get(String(doc.bounceReason || '')) || 'Other',
      { text: formatCurrency(exposureAmount), emphasis: true, align: 'right' },
      { text: caseStatusLabelMap.get(caseStatus) || 'Unknown', tone: getStatusTone(caseStatus) },
    ],
  }
}

const matchesQuickFilter = (row: BouncedPaymentRow, quickFilter: string) => {
  switch (quickFilter) {
    case 'caseStatus:open':
      return row.caseStatus === 'open'
    case 'workflow:awaiting_reversal':
      return !row.hasReversal
    case 'charges:applied':
      return row.hasBankCharge
    case 'caseStatus:resolved':
      return row.caseStatus === 'resolved'
    case 'workflow:follow_up':
      return row.needsFollowUp
    default:
      return false
  }
}

export const matchesBouncedPaymentFilters = (
  row: BouncedPaymentRow,
  filters: {
    statuses: string[]
    reasons: string[]
    customerIds: string[]
    quickFilters: string[]
  },
) => {
  const predicates = [
    ...filters.statuses.map((status) => row.caseStatus === status),
    ...filters.reasons.map((reason) => row.bounceReason === reason),
    ...filters.customerIds.map((customerId) => row.customerId === customerId),
    ...filters.quickFilters.map((quickFilter) => matchesQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) return true
  return predicates.some(Boolean)
}

export const buildBouncedPaymentMetrics = (rows: BouncedPaymentRow[]) => {
  const openCases = rows.filter((row) => row.isOpen).length
  const bankCharges = rows.reduce((sum, row) => sum + row.bankChargeAmount, 0)
  const recoverableCases = rows.filter((row) => row.hasReversal || row.hasRecovery || row.caseStatus === 'resolved').length
  const recoveredCases = rows.filter((row) => row.hasRecovery || row.caseStatus === 'resolved').length
  const recoveryRate = recoverableCases === 0 ? 0 : Math.round((recoveredCases / recoverableCases) * 100)
  const followUps = rows.filter((row) => row.needsFollowUp).length

  return [
    {
      id: 'open-cases',
      label: 'Open Bounce Cases',
      value: openCases,
      change: `${rows.filter((row) => row.caseStatus === 'awaiting_reversal').length} require reversal`,
      trend: openCases > 0 ? ('down' as const) : ('neutral' as const),
    },
    {
      id: 'bank-charges',
      label: 'Bank Charges',
      value: formatCurrency(bankCharges),
      change: `${rows.filter((row) => row.hasBankCharge).length} cases with charges`,
      trend: bankCharges > 0 ? ('up' as const) : ('neutral' as const),
    },
    {
      id: 'recovery-rate',
      label: 'Recovery Rate',
      value: `${recoveryRate}%`,
      change: `${recoveredCases} recovered or resolved`,
      trend: recoveryRate >= 70 ? ('up' as const) : ('neutral' as const),
    },
    {
      id: 'customer-follow-ups',
      label: 'Customer Follow-ups',
      value: followUps,
      change: `${rows.filter((row) => row.hasReversal && !row.hasRecovery).length} reversed but unrecovered`,
      trend: followUps > 0 ? ('neutral' as const) : ('up' as const),
    },
  ]
}

export const buildBouncedPaymentReferenceData = async (payload: Payload) => {
  const [paymentDocs, chartAccountDocs, customerDocs] = await Promise.all([
    findAllDocs<{
      id: number | string
      receiptNumber?: string | null
      amountReceived?: number | null
      paymentDate?: string | null
      status?: string | null
      customer?: CustomerRelation
      postedJournalEntry?: JournalRelation
      depositAccount?: BankAccountRelation
      referenceNumber?: string | null
    }>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
      depth: 2,
      where: {
        status: {
          equals: 'posted',
        },
      },
      sort: '-paymentDate',
    }),
    findAllDocs<{
      id: number | string
      code?: string | null
      name?: string | null
      accountType?: string | null
      accountSubType?: string | null
      isActive?: boolean | null
    }>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      depth: 0,
      where: {
        and: [
          {
            isActive: {
              not_equals: false,
            },
          },
          {
            accountType: {
              equals: 'expense',
            },
          },
        ],
      },
      sort: 'code',
    }),
    findAllDocs<{
      id: number | string
      customerCode?: string | null
      displayName?: string | null
      status?: string | null
    }>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.customers,
      depth: 0,
      sort: 'displayName',
    }),
  ])

  return {
    originalPayments: paymentDocs.map((payment) => ({
      id: payment.id,
      receiptNumber: payment.receiptNumber || null,
      amountReceived: normalizeAmount(payment.amountReceived),
      paymentDate: payment.paymentDate || null,
      customerId:
        typeof payment.customer === 'object' && payment.customer ? String(payment.customer.id || '') : String(payment.customer || ''),
      customerLabel: buildCustomerLabel(payment.customer),
      postedJournalEntryId: String(getRelationshipId(payment.postedJournalEntry) || ''),
      depositAccountLabel: buildBankAccountLabel(payment.depositAccount),
      referenceNumber: payment.referenceNumber || null,
    })),
    chargeExpenseAccounts: chartAccountDocs.map((account) => ({
      id: account.id,
      code: account.code || null,
      name: account.name || null,
      accountType: account.accountType || null,
      accountSubType: account.accountSubType || null,
      isActive: account.isActive !== false,
    })),
    customers: customerDocs
      .filter((customer) => customer.status !== 'inactive' && customer.status !== 'archived')
      .map((customer) => ({
        id: customer.id,
        customerCode: customer.customerCode || null,
        displayName: customer.displayName || null,
      })),
  }
}

export const buildBouncedPaymentDetailResponse = async (
  payload: Payload,
  doc: BouncedPaymentDoc,
): Promise<BouncedPaymentDetail> => {
  const row = buildBouncedPaymentRow(doc)
  const canDelete = !row.hasReversal && !row.hasChargeJournal
  const canReverse = Boolean(row.originalJournalEntryId) && !row.hasReversal
  const financialLockReason =
    row.hasReversal || row.hasChargeJournal ? 'Financial core is locked after reversal or charge journals are posted.' : null

  return {
    ...row,
    usageSummary: {
      canEdit: row.caseStatus !== 'written_off',
      canDelete,
      canReverse,
      deleteBlockedReason: canDelete ? null : 'Cases with posted reversal or charge journals cannot be deleted.',
      reverseBlockedReason: canReverse ? null : row.hasReversal ? 'This bounced-payment case already has a reversal journal.' : 'Original journal entry is missing.',
      financialLockReason,
    },
  }
}

export const normalizeBouncedPaymentMutationBody = (value: Record<string, unknown>): BouncedPaymentMutationBody => ({
  caseNumber: normalizeOptionalString(value.caseNumber),
  originalPayment: normalizeRelationshipId(value.originalPayment),
  bounceDate: normalizeDateValue(value.bounceDate),
  bankNoticeDate: normalizeDateValue(value.bankNoticeDate),
  bounceReason: normalizeOptionalString(value.bounceReason),
  caseStatus: normalizeOptionalString(value.caseStatus),
  bankChargeAmount: normalizeNonNegativeAmount(value.bankChargeAmount),
  chargeExpenseAccount: normalizeRelationshipId(value.chargeExpenseAccount),
  recoveryPayment: normalizeRelationshipId(value.recoveryPayment),
  recoveryDate: normalizeDateValue(value.recoveryDate),
  followUpDate: normalizeDateValue(value.followUpDate),
  resolutionDate: normalizeDateValue(value.resolutionDate),
  notes: normalizeOptionalString(value.notes),
  resolutionNotes: normalizeOptionalString(value.resolutionNotes),
})

export const buildBouncedPaymentPersistenceData = (body: BouncedPaymentMutationBody) => ({
  caseNumber: body.caseNumber,
  originalPayment: body.originalPayment,
  bounceDate: body.bounceDate,
  bankNoticeDate: body.bankNoticeDate,
  bounceReason: body.bounceReason,
  caseStatus: body.caseStatus,
  bankChargeAmount: body.bankChargeAmount ?? 0,
  chargeExpenseAccount: body.chargeExpenseAccount,
  recoveryPayment: body.recoveryPayment,
  recoveryDate: body.recoveryDate,
  followUpDate: body.followUpDate,
  resolutionDate: body.resolutionDate,
  notes: body.notes,
  resolutionNotes: body.resolutionNotes,
})

export const assertBouncedPaymentMutationPayload = async (
  payload: Payload,
  body: BouncedPaymentMutationBody,
  options?: {
    existingId?: string | number | null
    financialLock?: boolean
  },
) => {
  if (!body.originalPayment) {
    throw new AccountingApiError('Original payment is required.', 400)
  }
  if (!body.bounceDate) {
    throw new AccountingApiError('Bounce date is required.', 400)
  }
  if (!body.bounceReason) {
    throw new AccountingApiError('Bounce reason is required.', 400)
  }
  if (body.bankChargeAmount && body.bankChargeAmount > 0 && !body.chargeExpenseAccount) {
    throw new AccountingApiError('Charge expense account is required when a bank charge amount is entered.', 400)
  }

  const originalPayment = await payload
    .findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
      id: body.originalPayment,
      depth: 1,
      overrideAccess: true,
    })
    .catch(() => null)

  if (!originalPayment) {
    throw new AccountingApiError('Original payment was not found.', 404)
  }
  if (String((originalPayment as { status?: string | null }).status || '') !== 'posted') {
    throw new AccountingApiError('Only posted payment receipts can be used for bounced-payment cases.', 400)
  }
  if (!getRelationshipId((originalPayment as { postedJournalEntry?: JournalRelation }).postedJournalEntry)) {
    throw new AccountingApiError('Original payment must have a posted journal entry before it can be bounced.', 400)
  }

  const duplicateCase = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.bouncedPayments,
    where: {
      and: [
        {
          originalPayment: {
            equals: body.originalPayment,
          },
        },
        ...(options?.existingId
          ? [
              {
                id: {
                  not_equals: options.existingId,
                },
              },
            ]
          : []),
      ],
    } as never,
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (duplicateCase.totalDocs > 0) {
    throw new AccountingApiError('A bounced-payment case already exists for the selected original payment.', 400)
  }

  if (body.chargeExpenseAccount) {
    const expenseAccount = await payload
      .findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
        id: body.chargeExpenseAccount,
        depth: 0,
        overrideAccess: true,
      })
      .catch(() => null)

    if (!expenseAccount || String((expenseAccount as { accountType?: string | null }).accountType || '') !== 'expense') {
      throw new AccountingApiError('Charge expense account must be an active expense account.', 400)
    }
  }

  if (body.recoveryPayment) {
    const recoveryPayment = await payload
      .findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
        id: body.recoveryPayment,
        depth: 1,
        overrideAccess: true,
      })
      .catch(() => null)

    if (!recoveryPayment) {
      throw new AccountingApiError('Recovery payment was not found.', 404)
    }
    if (String((recoveryPayment as { status?: string | null }).status || '') !== 'posted') {
      throw new AccountingApiError('Recovery payment must already be posted.', 400)
    }

    const originalCustomerId = getRelationshipId((originalPayment as { customer?: CustomerRelation }).customer)
    const recoveryCustomerId = getRelationshipId((recoveryPayment as { customer?: CustomerRelation }).customer)
    if (String(originalCustomerId || '') !== String(recoveryCustomerId || '')) {
      throw new AccountingApiError('Recovery payment must belong to the same customer as the original payment.', 400)
    }
  }

  if (options?.financialLock && (body.originalPayment || body.bankChargeAmount !== undefined || body.chargeExpenseAccount !== undefined)) {
    throw new AccountingApiError(
      'Original payment and bank-charge fields cannot be changed after reversal or charge journals are posted.',
      400,
    )
  }
}
