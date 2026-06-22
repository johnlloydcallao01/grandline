import type { Payload } from 'payload'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  BANK_RECONCILIATION_STATUS_OPTIONS,
  BANK_TRANSACTION_MATCH_STATUS_OPTIONS,
} from '@/accounting/constants/accounting'
import { AccountingBankingService } from '@/accounting/services/banking/AccountingBankingService'
import { type AccountingBankReconciliationStatus, type AccountingBankTransactionMatchStatus } from '@/accounting/types/accounting'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { buildUserDisplayName } from '@/accounting/utils/lms'
import { isLockedReconciliationStatus } from '@/accounting/utils/commercial'
import { AccountingApiError, parseNumberParam } from '../../../_utils/auth'

type StatusTone = 'amber' | 'blue' | 'gray' | 'green' | 'red'

export type ReconciliationCell =
  | string
  | {
      text: string
      tone?: StatusTone
      emphasis?: boolean
      align?: 'left' | 'right' | 'center'
    }

type UserLike =
  | {
      id?: number | string
      email?: string | null
      name?: string | null
    }
  | number
  | string
  | null
  | undefined

type BankAccountDoc = {
  id: number | string
  accountName?: string | null
  bankName?: string | null
  accountNumberMasked?: string | null
  accountType?: string | null
  isActive?: boolean | null
  currencyReference?: {
    code?: string | null
    name?: string | null
  } | null
  ledgerAccount?: {
    id?: number | string
    code?: string | null
    name?: string | null
  } | number | string | null
}

export type ReconciliationDoc = {
  id: number | string
  bankAccount?: BankAccountDoc | number | string | null
  statementStartDate?: string | null
  statementEndDate?: string | null
  statementClosingBalance?: number | null
  bookClosingBalance?: number | null
  differenceAmount?: number | null
  status?: AccountingBankReconciliationStatus | string | null
  completedAt?: string | null
  completedBy?: UserLike
  notes?: string | null
  createdBy?: UserLike
  updatedBy?: UserLike
  createdAt?: string | null
  updatedAt?: string | null
}

export type ReconciliationSnapshotMatchRow = {
  id: string
  bankTransactionId: string
  transactionDate: string | null
  transactionDateLabel: string
  referenceNumber: string
  description: string
  directionLabel: string
  amount: number
  amountLabel: string
  runningBalance: number
  runningBalanceLabel: string
  matchStatus: string
  matchStatusLabel: string
  matchStatusTone: StatusTone
  matchedEntityLabel: string
  cells: ReconciliationCell[]
}

export type ReconciliationRow = {
  id: string
  sessionLabel: string
  bankAccountId: string
  bankAccountLabel: string
  bankAccountType: string
  bankAccountCurrency: string
  statementStartDate: string | null
  statementStartDateLabel: string
  statementEndDate: string | null
  statementEndDateLabel: string
  statementPeriodLabel: string
  statementClosingBalance: number
  statementClosingBalanceLabel: string
  bookClosingBalance: number
  bookClosingBalanceLabel: string
  differenceAmount: number
  differenceLabel: string
  status: string
  statusLabel: string
  statusTone: StatusTone
  completedAt: string | null
  completedAtLabel: string
  completedByLabel: string
  preparedByLabel: string
  updatedByLabel: string
  notes: string
  createdAt: string | null
  updatedAt: string | null
  isDraft: boolean
  isInProgress: boolean
  isCompleted: boolean
  isLocked: boolean
  hasDifference: boolean
  zeroDifference: boolean
  searchableText: string
  cells: ReconciliationCell[]
}

export type ReconciliationDetail = ReconciliationRow & {
  bankLedgerAccountLabel: string
  snapshot: {
    bankTransactionCount: number
    matchedTransactionCount: number
    unmatchedTransactionCount: number
    statementActivityNet: number
    statementActivityNetLabel: string
    statementClosingBalance: number
    statementClosingBalanceLabel: string
    bookClosingBalance: number
    bookClosingBalanceLabel: string
    differenceAmount: number
    differenceLabel: string
    canComplete: boolean
    rows: ReconciliationSnapshotMatchRow[]
  }
  usageSummary: {
    canEdit: boolean
    canDelete: boolean
    canComplete: boolean
    deleteBlockedReason: string | null
    completeBlockedReason: string | null
  }
}

export type ReconciliationMutationBody = {
  bankAccount?: string | number | null
  statementStartDate?: string | null
  statementEndDate?: string | null
  statementClosingBalance?: number | null
  status?: string | null
  notes?: string | null
}

const statusLabelMap = new Map(BANK_RECONCILIATION_STATUS_OPTIONS.map((option) => [String(option.value), option.label]))
const matchStatusLabelMap = new Map(BANK_TRANSACTION_MATCH_STATUS_OPTIONS.map((option) => [String(option.value), option.label]))

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

const buildSearchableText = (parts: Array<unknown>) =>
  parts
    .map((part) => normalizeSearch(part))
    .filter(Boolean)
    .join(' ')

const normalizeOptionalString = (value: unknown) => {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
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

const normalizeAmount = (value: unknown) => {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  return Math.round((parsed + Number.EPSILON) * 100) / 100
}

const formatCurrency = (amount: number | null | undefined, currency = 'PHP') =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0))

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

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const formatUserLabel = (value: UserLike) => {
  if (!value) return '-'
  if (typeof value === 'number' || typeof value === 'string') return String(value)
  return buildUserDisplayName(value as Record<string, unknown>)
}

const formatBankAccountLabel = (value: ReconciliationDoc['bankAccount']) => {
  if (typeof value === 'object' && value) {
    const suffix = value.accountNumberMasked ? ` (${value.accountNumberMasked})` : ''
    return `${value.accountName || value.bankName || `Bank Account ${value.id}`}${suffix}`.trim()
  }
  if (value) return String(value)
  return 'Unassigned Bank Account'
}

const formatBankLedgerAccountLabel = (value: ReconciliationDoc['bankAccount']) => {
  if (typeof value === 'object' && value?.ledgerAccount && typeof value.ledgerAccount === 'object') {
    const code = String(value.ledgerAccount.code || '').trim()
    const name = String(value.ledgerAccount.name || '').trim()
    if (code && name) return `${code} - ${name}`
    return code || name || '-'
  }
  return '-'
}

const getStatusTone = (status: string | null | undefined): StatusTone => {
  switch (String(status || '')) {
    case 'completed':
      return 'green'
    case 'locked':
      return 'gray'
    case 'in_progress':
      return 'blue'
    default:
      return 'amber'
  }
}

const getMatchStatusTone = (status: string | null | undefined): StatusTone => {
  switch (String(status || '')) {
    case 'matched':
      return 'green'
    case 'ignored':
      return 'gray'
    case 'review':
      return 'amber'
    case 'partially_matched':
      return 'blue'
    default:
      return 'red'
  }
}

const buildSessionLabel = (doc: ReconciliationDoc) => `RECON-${String(doc.id)}`

const buildStatementPeriodLabel = (doc: Pick<ReconciliationDoc, 'statementStartDate' | 'statementEndDate'>) =>
  `${formatDate(doc.statementStartDate)} to ${formatDate(doc.statementEndDate)}`

export const buildReconciliationRow = (doc: ReconciliationDoc): ReconciliationRow => {
  const sessionLabel = buildSessionLabel(doc)
  const bankAccountId = String(getRelationshipId(doc.bankAccount) || '')
  const bankAccountLabel = formatBankAccountLabel(doc.bankAccount)
  const bankAccountType =
    typeof doc.bankAccount === 'object' && doc.bankAccount ? String(doc.bankAccount.accountType || '') : ''
  const bankAccountCurrency =
    typeof doc.bankAccount === 'object' && doc.bankAccount
      ? String(doc.bankAccount.currencyReference?.code || doc.bankAccount.currencyReference?.name || 'PHP')
      : 'PHP'
  const statementClosingBalance = Number(doc.statementClosingBalance || 0)
  const bookClosingBalance = Number(doc.bookClosingBalance || 0)
  const differenceAmount = Number(doc.differenceAmount || 0)
  const status = String(doc.status || 'draft')
  const statusLabel = statusLabelMap.get(status) || 'Unknown'
  const preparedByLabel = formatUserLabel(doc.createdBy)
  const updatedByLabel = formatUserLabel(doc.updatedBy)
  const completedByLabel = formatUserLabel(doc.completedBy)
  const statementPeriodLabel = buildStatementPeriodLabel(doc)

  return {
    id: String(doc.id),
    sessionLabel,
    bankAccountId,
    bankAccountLabel,
    bankAccountType,
    bankAccountCurrency,
    statementStartDate: doc.statementStartDate || null,
    statementStartDateLabel: formatDate(doc.statementStartDate),
    statementEndDate: doc.statementEndDate || null,
    statementEndDateLabel: formatDate(doc.statementEndDate),
    statementPeriodLabel,
    statementClosingBalance,
    statementClosingBalanceLabel: formatCurrency(statementClosingBalance, bankAccountCurrency || 'PHP'),
    bookClosingBalance,
    bookClosingBalanceLabel: formatCurrency(bookClosingBalance, bankAccountCurrency || 'PHP'),
    differenceAmount,
    differenceLabel: formatCurrency(differenceAmount, bankAccountCurrency || 'PHP'),
    status,
    statusLabel,
    statusTone: getStatusTone(status),
    completedAt: doc.completedAt || null,
    completedAtLabel: formatDateTime(doc.completedAt),
    completedByLabel,
    preparedByLabel,
    updatedByLabel,
    notes: String(doc.notes || ''),
    createdAt: doc.createdAt || null,
    updatedAt: doc.updatedAt || null,
    isDraft: status === 'draft',
    isInProgress: status === 'in_progress',
    isCompleted: status === 'completed',
    isLocked: status === 'locked',
    hasDifference: Math.abs(differenceAmount) > 0.0001,
    zeroDifference: Math.abs(differenceAmount) <= 0.0001,
    searchableText: buildSearchableText([
      sessionLabel,
      bankAccountLabel,
      statementPeriodLabel,
      preparedByLabel,
      updatedByLabel,
      completedByLabel,
      statusLabel,
      doc.notes,
      formatCurrency(statementClosingBalance, bankAccountCurrency || 'PHP'),
      formatCurrency(bookClosingBalance, bankAccountCurrency || 'PHP'),
      formatCurrency(differenceAmount, bankAccountCurrency || 'PHP'),
    ]),
    cells: [
      { text: sessionLabel, emphasis: true },
      bankAccountLabel,
      statementPeriodLabel,
      preparedByLabel,
      { text: formatCurrency(differenceAmount, bankAccountCurrency || 'PHP'), emphasis: true, align: 'right' },
      { text: statusLabel, tone: getStatusTone(status) },
    ],
  }
}

const buildSnapshotMatchRow = (
  snapshotRow: {
    bankTransactionId: number | string
    transactionDate?: string | null
    description?: string | null
    referenceNumber?: string | null
    amountIn: number
    amountOut: number
    runningBalance?: number | null
    matchStatus?: AccountingBankTransactionMatchStatus | null
    matchedEntityType?: string | null
    matchedEntityId?: string | null
  },
  currency = 'PHP',
): ReconciliationSnapshotMatchRow => {
  const amount = Math.abs(Number(snapshotRow.amountIn || 0) - Number(snapshotRow.amountOut || 0))
  const directionLabel = Number(snapshotRow.amountIn || 0) > 0 ? 'Inflow' : 'Outflow'
  const matchStatus = String(snapshotRow.matchStatus || 'unmatched')
  const matchStatusLabel = matchStatusLabelMap.get(matchStatus) || 'Unmatched'
  const matchedEntityLabel =
    snapshotRow.matchedEntityType || snapshotRow.matchedEntityId
      ? `${String(snapshotRow.matchedEntityType || 'Entity')} ${String(snapshotRow.matchedEntityId || '').trim()}`.trim()
      : 'Not linked'

  return {
    id: `transaction-${String(snapshotRow.bankTransactionId)}`,
    bankTransactionId: String(snapshotRow.bankTransactionId),
    transactionDate: snapshotRow.transactionDate || null,
    transactionDateLabel: formatDate(snapshotRow.transactionDate),
    referenceNumber: String(snapshotRow.referenceNumber || '-'),
    description: String(snapshotRow.description || '-'),
    directionLabel,
    amount,
    amountLabel: formatCurrency(amount, currency),
    runningBalance: Number(snapshotRow.runningBalance || 0),
    runningBalanceLabel: formatCurrency(snapshotRow.runningBalance, currency),
    matchStatus,
    matchStatusLabel,
    matchStatusTone: getMatchStatusTone(matchStatus),
    matchedEntityLabel,
    cells: [
      formatDate(snapshotRow.transactionDate),
      String(snapshotRow.referenceNumber || '-'),
      String(snapshotRow.description || '-'),
      directionLabel,
      { text: formatCurrency(amount, currency), emphasis: true, align: 'right' },
      { text: formatCurrency(snapshotRow.runningBalance, currency), align: 'right' },
      { text: matchStatusLabel, tone: getMatchStatusTone(matchStatus) },
    ],
  }
}

const buildCompleteBlockedReason = (
  row: ReconciliationRow,
  snapshot: {
    canComplete: boolean
    unmatchedTransactionCount: number
    differenceAmount: number
  },
) => {
  if (row.isCompleted || row.isLocked) {
    return 'Completed or locked reconciliation sessions cannot be completed again.'
  }

  if (snapshot.canComplete) {
    return null
  }

  const reasons: string[] = []
  if (Math.abs(Number(snapshot.differenceAmount || 0)) > 0.0001) {
    reasons.push(`Difference must be zero before completion. Current variance: ${formatCurrency(snapshot.differenceAmount, row.bankAccountCurrency || 'PHP')}.`)
  }
  if (snapshot.unmatchedTransactionCount > 0) {
    reasons.push(`${snapshot.unmatchedTransactionCount} bank transaction(s) still need to be matched or ignored.`)
  }

  return reasons.join(' ')
}

export const buildReconciliationDetailResponse = async (
  payload: Payload,
  doc: ReconciliationDoc,
): Promise<ReconciliationDetail> => {
  const snapshot = await AccountingBankingService.getReconciliationSnapshot(payload, doc.id)
  const enrichedRow = buildReconciliationRow({
    ...doc,
    bookClosingBalance: snapshot.bookClosingBalance,
    differenceAmount: snapshot.differenceAmount,
  })

  const snapshotRows = snapshot.matches.map((row) =>
    buildSnapshotMatchRow(row, enrichedRow.bankAccountCurrency || 'PHP'),
  )
  const completeBlockedReason = buildCompleteBlockedReason(enrichedRow, snapshot)
  const canMutate = !isLockedReconciliationStatus(enrichedRow.status)

  return {
    ...enrichedRow,
    bankLedgerAccountLabel: formatBankLedgerAccountLabel(doc.bankAccount),
    snapshot: {
      bankTransactionCount: snapshot.bankTransactionCount,
      matchedTransactionCount: snapshot.matchedTransactionCount,
      unmatchedTransactionCount: snapshot.unmatchedTransactionCount,
      statementActivityNet: snapshot.statementActivityNet,
      statementActivityNetLabel: formatCurrency(snapshot.statementActivityNet, enrichedRow.bankAccountCurrency || 'PHP'),
      statementClosingBalance: snapshot.statementClosingBalance,
      statementClosingBalanceLabel: formatCurrency(snapshot.statementClosingBalance, enrichedRow.bankAccountCurrency || 'PHP'),
      bookClosingBalance: snapshot.bookClosingBalance,
      bookClosingBalanceLabel: formatCurrency(snapshot.bookClosingBalance, enrichedRow.bankAccountCurrency || 'PHP'),
      differenceAmount: snapshot.differenceAmount,
      differenceLabel: formatCurrency(snapshot.differenceAmount, enrichedRow.bankAccountCurrency || 'PHP'),
      canComplete: snapshot.canComplete,
      rows: snapshotRows,
    },
    usageSummary: {
      canEdit: canMutate,
      canDelete: canMutate,
      canComplete: canMutate && snapshot.canComplete,
      deleteBlockedReason: canMutate ? null : 'Completed or locked reconciliation sessions cannot be deleted.',
      completeBlockedReason,
    },
  }
}

export const normalizeReconciliationMutationBody = (
  body: Record<string, unknown>,
): ReconciliationMutationBody => ({
  bankAccount: normalizeRelationshipId(body.bankAccount),
  statementStartDate: normalizeDateValue(body.statementStartDate),
  statementEndDate: normalizeDateValue(body.statementEndDate),
  statementClosingBalance: normalizeAmount(body.statementClosingBalance),
  status: normalizeOptionalString(body.status),
  notes: normalizeOptionalString(body.notes),
})

export const buildReconciliationPersistenceData = (body: ReconciliationMutationBody) => ({
  bankAccount: body.bankAccount,
  statementStartDate: body.statementStartDate,
  statementEndDate: body.statementEndDate,
  statementClosingBalance: body.statementClosingBalance,
  status: body.status,
  notes: body.notes,
})

export const buildReconciliationReferenceData = async (payload: Payload) => {
  const bankAccounts = await findAllDocs<BankAccountDoc>({
    payload,
    collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
    depth: 1,
    sort: 'accountName',
    where: {
      and: [
        {
          isActive: {
            not_equals: false,
          },
        },
        {
          accountType: {
            equals: 'bank',
          },
        },
      ],
    },
  })

  return {
    bankAccounts: bankAccounts
      .filter((bankAccount) => Boolean(getRelationshipId(bankAccount.ledgerAccount)))
      .map((bankAccount) => ({
        id: bankAccount.id,
        accountName: bankAccount.accountName || null,
        bankName: bankAccount.bankName || null,
        accountNumberMasked: bankAccount.accountNumberMasked || null,
        accountType: bankAccount.accountType || null,
        currency: bankAccount.currencyReference?.code || bankAccount.currencyReference?.name || 'PHP',
        ledgerAccountCode:
          typeof bankAccount.ledgerAccount === 'object' && bankAccount.ledgerAccount
            ? bankAccount.ledgerAccount.code || null
            : null,
        ledgerAccountName:
          typeof bankAccount.ledgerAccount === 'object' && bankAccount.ledgerAccount
            ? bankAccount.ledgerAccount.name || null
            : null,
        isActive: bankAccount.isActive !== false,
      })),
  }
}

export const buildReconciliationMetrics = (rows: ReconciliationRow[]) => {
  const activeCount = rows.filter((row) => row.isDraft || row.isInProgress).length
  const varianceSessions = rows.filter((row) => row.hasDifference)
  const totalVariance = varianceSessions.reduce((sum, row) => sum + Math.abs(row.differenceAmount), 0)
  const completedCount = rows.filter((row) => row.isCompleted).length
  const lockedCount = rows.filter((row) => row.isLocked).length

  return [
    {
      id: 'active-reconciliations',
      label: 'Active Reconciliations',
      value: activeCount,
      change: `${varianceSessions.length} session(s) still have variance`,
      trend: varianceSessions.length > 0 ? 'down' : 'neutral',
    },
    {
      id: 'open-variance',
      label: 'Open Variance',
      value: formatCurrency(totalVariance),
      change: `${varianceSessions.length} session(s) with non-zero difference`,
      trend: totalVariance > 0 ? 'down' : 'up',
    },
    {
      id: 'completed-sessions',
      label: 'Completed Sessions',
      value: completedCount,
      change: `${rows.length} visible reconciliation session(s)`,
      trend: completedCount > 0 ? 'up' : 'neutral',
    },
    {
      id: 'locked-sessions',
      label: 'Locked Sessions',
      value: lockedCount,
      change: `${rows.filter((row) => row.zeroDifference).length} zero-difference session(s)`,
      trend: lockedCount > 0 ? 'up' : 'neutral',
    },
  ] as Array<{
    id: string
    label: string
    value: string | number
    change: string
    trend: 'up' | 'down' | 'neutral'
  }>
}

export const matchesReconciliationFilters = (
  row: ReconciliationRow,
  filters: {
    statuses: string[]
    bankAccountIds: string[]
    differenceStates: string[]
    quickFilters: string[]
  },
) => {
  const quickFilterPredicates = filters.quickFilters.map((quickFilter) => {
    const [group, value] = quickFilter.split(':')
    if (group === 'status') return row.status === value
    if (group === 'difference') return value === 'zero' ? row.zeroDifference : row.hasDifference
    if (group === 'workflow') return value === 'active' ? row.isDraft || row.isInProgress : false
    return false
  })

  const predicates = [
    ...filters.statuses.map((status) => row.status === status),
    ...filters.bankAccountIds.map((bankAccountId) => row.bankAccountId === bankAccountId),
    ...filters.differenceStates.map((differenceState) =>
      differenceState === 'zero_difference' ? row.zeroDifference : row.hasDifference,
    ),
    ...quickFilterPredicates,
  ]

  if (predicates.length === 0) return true
  return predicates.some(Boolean)
}

export const assertReconciliationMutationPayload = async (
  payload: Payload,
  body: ReconciliationMutationBody,
  options?: {
    existingId?: number | string | null
  },
) => {
  if (!body.bankAccount) {
    throw new AccountingApiError('Bank account is required.', 400)
  }
  if (!body.statementStartDate) {
    throw new AccountingApiError('Statement start date is required.', 400)
  }
  if (!body.statementEndDate) {
    throw new AccountingApiError('Statement end date is required.', 400)
  }
  if (body.statementClosingBalance === null || body.statementClosingBalance === undefined) {
    throw new AccountingApiError('Statement closing balance is required.', 400)
  }

  const startDate = new Date(body.statementStartDate)
  const endDate = new Date(body.statementEndDate)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new AccountingApiError('Statement dates must be valid dates.', 400)
  }
  if (endDate < startDate) {
    throw new AccountingApiError('Statement end date cannot be earlier than the statement start date.', 400)
  }

  if (body.status && !['draft', 'in_progress'].includes(String(body.status))) {
    throw new AccountingApiError('Only Draft or In Progress status can be saved directly.', 400)
  }

  const bankAccount = (await payload.findByID({
    collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
    id: body.bankAccount,
    depth: 1,
    overrideAccess: true,
  })) as BankAccountDoc

  if (!bankAccount) {
    throw new AccountingApiError('Selected bank account could not be found.', 404)
  }
  if (bankAccount.isActive === false) {
    throw new AccountingApiError('Selected bank account is inactive.', 400)
  }
  if (String(bankAccount.accountType || '') !== 'bank') {
    throw new AccountingApiError('Only bank-type accounts can be reconciled in this workspace.', 400)
  }
  if (!getRelationshipId(bankAccount.ledgerAccount)) {
    throw new AccountingApiError('Selected bank account must have a linked ledger account before reconciliation can start.', 400)
  }

  const duplicatePredicates: Array<Record<string, unknown>> = [
    {
      bankAccount: {
        equals: body.bankAccount,
      },
    },
    {
      statementStartDate: {
        equals: body.statementStartDate,
      },
    },
    {
      statementEndDate: {
        equals: body.statementEndDate,
      },
    },
  ]

  if (options?.existingId) {
    duplicatePredicates.push({
      id: {
        not_equals: options.existingId,
      },
    })
  }

  const duplicateRecord = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.bankReconciliations,
    where: {
      and: duplicatePredicates,
    } as never,
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (duplicateRecord.totalDocs > 0) {
    throw new AccountingApiError('A reconciliation session already exists for the selected bank account and statement period.', 400)
  }
}

export const refreshReconciliationComputedFields = async (
  payload: Payload,
  reconciliationId: number | string,
) => {
  const snapshot = await AccountingBankingService.getReconciliationSnapshot(payload, reconciliationId)
  return (await payload.update({
    collection: ACCOUNTING_COLLECTION_SLUGS.bankReconciliations,
    id: reconciliationId,
    overrideAccess: true,
    depth: 2,
    data: {
      bookClosingBalance: snapshot.bookClosingBalance,
      differenceAmount: snapshot.differenceAmount,
    } as never,
  })) as ReconciliationDoc
}
