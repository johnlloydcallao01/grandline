import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS, BANK_ACCOUNT_TYPE_OPTIONS, BANK_RECONCILIATION_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { AccountingBankingService } from '@/accounting/services/banking/AccountingBankingService'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'
import { parseNumberParam } from '../../../_utils/auth'

type StatusTone = 'amber' | 'blue' | 'gray' | 'green' | 'red'

type CurrencyReference = {
  code?: string | null
  name?: string | null
}

type LedgerAccountReference = {
  id?: number | string | null
  code?: string | null
  name?: string | null
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
  branchName?: string | null
  accountType?: string | null
  isActive?: boolean | null
  currencyReference?: CurrencyReference | null
  ledgerAccount?: LedgerAccountReference | number | string | null
}

type ReconciliationDoc = {
  id: number | string
  bankAccount?: number | string | BankAccountDoc | null
  statementStartDate?: string | null
  statementEndDate?: string | null
  differenceAmount?: number | null
  status?: string | null
  completedAt?: string | null
  completedBy?: UserLike
}

type PaymentReceivedDoc = {
  id: number | string
  receiptNumber?: string | null
  paymentDate?: string | null
  postingDate?: string | null
  depositAccount?: number | string | BankAccountDoc | null
  amountReceived?: number | null
  status?: string | null
  notes?: string | null
}

type PaymentMadeDoc = {
  id: number | string
  paymentNumber?: string | null
  paymentDate?: string | null
  postingDate?: string | null
  bankAccount?: number | string | BankAccountDoc | null
  amountPaid?: number | null
  status?: string | null
  notes?: string | null
}

type ExpenseDoc = {
  id: number | string
  expenseNumber?: string | null
  expenseDate?: string | null
  postingDate?: string | null
  bankAccount?: number | string | BankAccountDoc | null
  total?: number | null
  status?: string | null
  notes?: string | null
}

type DepositDoc = {
  id: number | string
  depositNumber?: string | null
  depositDate?: string | null
  bankAccount?: number | string | BankAccountDoc | null
  amount?: number | null
  status?: string | null
  notes?: string | null
}

type TransferDoc = {
  id: number | string
  transferNumber?: string | null
  transferDate?: string | null
  fromBankAccount?: number | string | BankAccountDoc | null
  toBankAccount?: number | string | BankAccountDoc | null
  amount?: number | null
  status?: string | null
  notes?: string | null
}

type BankTransactionDoc = {
  id: number | string
  bankAccount?: number | string | BankAccountDoc | null
  transactionDate?: string | null
  valueDate?: string | null
  description?: string | null
  referenceNumber?: string | null
  amountIn?: number | null
  amountOut?: number | null
  runningBalance?: number | null
  matchStatus?: string | null
  matchedEntityType?: string | null
  matchedEntityId?: string | null
}

type CashFlowActivityDirection = 'inflow' | 'outflow'

type CashFlowActivitySource =
  | 'payment_received'
  | 'payment_made'
  | 'expense'
  | 'deposit'
  | 'transfer_in'
  | 'transfer_out'

type CashFlowActivityDoc = {
  id: string
  accountId: string
  accountLabel: string
  activityDate: string | null
  documentNumber: string
  sourceType: CashFlowActivitySource
  sourceLabel: string
  direction: CashFlowActivityDirection
  directionLabel: string
  amount: number
  status: string
  notes: string
}

export type CashFlowCell =
  | string
  | {
      text: string
      tone?: StatusTone
      emphasis?: boolean
      align?: 'left' | 'right' | 'center'
    }

export type CashFlowActivityRow = {
  id: string
  activityDate: string | null
  activityDateLabel: string
  documentNumber: string
  sourceType: string
  sourceLabel: string
  direction: CashFlowActivityDirection
  directionLabel: string
  amount: number
  amountLabel: string
  status: string
  notes: string
  cells: CashFlowCell[]
}

export type CashFlowBankTransactionRow = {
  id: string
  transactionDate: string | null
  transactionDateLabel: string
  valueDate: string | null
  valueDateLabel: string
  referenceNumber: string
  description: string
  amount: number
  amountLabel: string
  runningBalance: number
  runningBalanceLabel: string
  matchStatus: string
  matchStatusLabel: string
  matchStatusTone: StatusTone
  matchedEntityLabel: string
  cells: CashFlowCell[]
}

export type CashFlowRow = {
  id: string
  bankAccountId: string
  bankAccountLabel: string
  bankName: string
  accountNumberMasked: string
  branchName: string
  accountType: string
  accountTypeLabel: string
  currency: string
  currentBalance: number
  currentBalanceLabel: string
  rollingInflow30: number
  rollingInflow30Label: string
  rollingOutflow30: number
  rollingOutflow30Label: string
  netMovement30: number
  netMovement30Label: string
  projectedClosingBalance: number
  projectedClosingBalanceLabel: string
  projectedNet7: number
  projectedNet7Label: string
  averageDailyInflow30: number
  averageDailyOutflow30: number
  recentActivityCount: number
  liquidityState: string
  liquidityStateLabel: string
  liquidityStateTone: StatusTone
  reconciliationState: string
  reconciliationStateLabel: string
  reconciliationStateTone: StatusTone
  latestReconciliationId: string | null
  latestReconciliationPeriodLabel: string
  latestReconciliationDifference: number
  latestReconciliationDifferenceLabel: string
  hasReconciliationVariance: boolean
  searchableText: string
  cells: CashFlowCell[]
}

export type CashFlowDetail = CashFlowRow & {
  ledgerAccountLabel: string
  latestReconciliation: {
    id: string
    sessionLabel: string
    status: string
    statusLabel: string
    statusTone: StatusTone
    statementPeriodLabel: string
    completedAt: string | null
    completedAtLabel: string
    completedByLabel: string
    differenceAmount: number
    differenceLabel: string
    bankTransactionCount: number
    matchedTransactionCount: number
    unmatchedTransactionCount: number
  } | null
  summary: {
    currentBalance: number
    currentBalanceLabel: string
    rollingInflow30: number
    rollingInflow30Label: string
    rollingOutflow30: number
    rollingOutflow30Label: string
    netMovement30: number
    netMovement30Label: string
    projectedClosingBalance: number
    projectedClosingBalanceLabel: string
    projectedNet7: number
    projectedNet7Label: string
    averageDailyInflow30: number
    averageDailyInflow30Label: string
    averageDailyOutflow30: number
    averageDailyOutflow30Label: string
  }
  recentActivities: CashFlowActivityRow[]
  recentBankTransactions: CashFlowBankTransactionRow[]
}

const accountTypeLabelMap = new Map(
  BANK_ACCOUNT_TYPE_OPTIONS.map((option) => [String(option.value), option.label]),
)
const reconciliationStatusLabelMap = new Map(
  BANK_RECONCILIATION_STATUS_OPTIONS.map((option) => [String(option.value), option.label]),
)

const ROLLING_DAYS = 30
const PROJECTION_DAYS = 7

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

const normalizeText = (value: unknown) => String(value ?? '').trim()

const buildSearchableText = (parts: Array<unknown>) =>
  parts
    .map((part) => normalizeSearch(part))
    .filter(Boolean)
    .join(' ')

const formatCurrency = (amount: number | null | undefined, currency = 'PHP') =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0))

const formatSignedCurrency = (amount: number, currency = 'PHP') => {
  const absolute = formatCurrency(Math.abs(amount), currency)
  if (amount < 0) return `-${absolute}`
  if (amount > 0) return `+${absolute}`
  return absolute
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
  return String(value.name || value.email || value.id || '-')
}

const getLiquidityState = (row: {
  currentBalance: number
  rollingInflow30: number
  rollingOutflow30: number
  projectedClosingBalance: number
}) => {
  const bufferFloor = Math.max(row.rollingOutflow30 / 12, 250000)

  if (row.projectedClosingBalance < 0) {
    return { value: 'critical', label: 'Critical', tone: 'red' as const }
  }

  if (row.projectedClosingBalance <= bufferFloor) {
    return { value: 'watch', label: 'Watch', tone: 'amber' as const }
  }

  if (row.rollingInflow30 === 0 && row.rollingOutflow30 === 0 && row.currentBalance > 0) {
    return { value: 'reserve', label: 'Reserve', tone: 'blue' as const }
  }

  return { value: 'healthy', label: 'Healthy', tone: 'green' as const }
}

const getReconciliationTone = (status: string) => {
  switch (status) {
    case 'completed':
      return 'green' as const
    case 'locked':
      return 'gray' as const
    case 'in_progress':
      return 'blue' as const
    case 'with_variance':
      return 'amber' as const
    case 'no_session':
      return 'gray' as const
    case 'not_applicable':
      return 'gray' as const
    default:
      return 'amber' as const
  }
}

const getReconciliationState = (
  accountType: string,
  latestReconciliation: ReconciliationDoc | null,
) => {
  if (accountType === 'cash_on_hand') {
    return { value: 'not_applicable', label: 'Not Applicable', tone: getReconciliationTone('not_applicable') }
  }

  if (!latestReconciliation) {
    return { value: 'no_session', label: 'No Session', tone: getReconciliationTone('no_session') }
  }

  const differenceAmount = normalizeAmount(latestReconciliation.differenceAmount)
  if (Math.abs(differenceAmount) > 0.0001) {
    return { value: 'with_variance', label: 'With Variance', tone: getReconciliationTone('with_variance') }
  }

  const status = String(latestReconciliation.status || 'draft')
  return {
    value: status,
    label: reconciliationStatusLabelMap.get(status) || 'Unknown',
    tone: getReconciliationTone(status),
  }
}

const sortRows = (rows: CashFlowRow[]) => {
  const toneWeight: Record<StatusTone, number> = {
    red: 0,
    amber: 1,
    blue: 2,
    green: 3,
    gray: 4,
  }

  return [...rows].sort((left, right) => {
    const toneDiff = toneWeight[left.liquidityStateTone] - toneWeight[right.liquidityStateTone]
    if (toneDiff !== 0) return toneDiff
    return left.projectedClosingBalance - right.projectedClosingBalance
  })
}

const mapCashActivityRow = (activity: CashFlowActivityDoc, currency: string): CashFlowActivityRow => ({
  id: activity.id,
  activityDate: activity.activityDate,
  activityDateLabel: formatDate(activity.activityDate),
  documentNumber: activity.documentNumber || '-',
  sourceType: activity.sourceType,
  sourceLabel: activity.sourceLabel,
  direction: activity.direction,
  directionLabel: activity.directionLabel,
  amount: activity.amount,
  amountLabel: formatSignedCurrency(activity.direction === 'outflow' ? -activity.amount : activity.amount, currency),
  status: activity.status,
  notes: activity.notes,
  cells: [
    formatDate(activity.activityDate),
    { text: activity.documentNumber || '-', emphasis: true },
    activity.sourceLabel,
    activity.directionLabel,
    {
      text: formatSignedCurrency(activity.direction === 'outflow' ? -activity.amount : activity.amount, currency),
      emphasis: true,
      align: 'right',
    },
    activity.status || '-',
  ],
})

const getBankTransactionMatchTone = (status: string): StatusTone => {
  if (status === 'matched') return 'green'
  if (status === 'ignored') return 'gray'
  if (status === 'review' || status === 'suggested') return 'amber'
  return 'blue'
}

const getBankTransactionMatchLabel = (status: string) => {
  if (status === 'matched') return 'Matched'
  if (status === 'ignored') return 'Ignored'
  if (status === 'review') return 'Review'
  if (status === 'suggested') return 'Suggested'
  return 'Unmatched'
}

const mapBankTransactionRow = (transaction: BankTransactionDoc, currency: string): CashFlowBankTransactionRow => {
  const amount = normalizeAmount(transaction.amountIn) - normalizeAmount(transaction.amountOut)
  const matchStatus = String(transaction.matchStatus || 'unmatched')
  return {
    id: String(transaction.id),
    transactionDate: transaction.transactionDate || null,
    transactionDateLabel: formatDate(transaction.transactionDate),
    valueDate: transaction.valueDate || null,
    valueDateLabel: formatDate(transaction.valueDate),
    referenceNumber: String(transaction.referenceNumber || '-'),
    description: String(transaction.description || '-'),
    amount,
    amountLabel: formatSignedCurrency(amount, currency),
    runningBalance: normalizeAmount(transaction.runningBalance),
    runningBalanceLabel: formatCurrency(transaction.runningBalance, currency),
    matchStatus,
    matchStatusLabel: getBankTransactionMatchLabel(matchStatus),
    matchStatusTone: getBankTransactionMatchTone(matchStatus),
    matchedEntityLabel:
      transaction.matchedEntityType || transaction.matchedEntityId
        ? `${normalizeText(transaction.matchedEntityType || 'Entity')} ${normalizeText(transaction.matchedEntityId || '')}`.trim()
        : 'Not linked',
    cells: [
      formatDate(transaction.transactionDate),
      String(transaction.referenceNumber || '-'),
      String(transaction.description || '-'),
      { text: formatSignedCurrency(amount, currency), emphasis: true, align: 'right' },
      { text: formatCurrency(transaction.runningBalance, currency), align: 'right' },
      { text: getBankTransactionMatchLabel(matchStatus), tone: getBankTransactionMatchTone(matchStatus) },
    ],
  }
}

const buildActivityDocs = (args: {
  paymentsReceived: PaymentReceivedDoc[]
  paymentsMade: PaymentMadeDoc[]
  expenses: ExpenseDoc[]
  deposits: DepositDoc[]
  transfers: TransferDoc[]
  bankAccountsById: Map<string, BankAccountDoc>
}) => {
  const { paymentsReceived, paymentsMade, expenses, deposits, transfers, bankAccountsById } = args
  const activities: CashFlowActivityDoc[] = []

  for (const payment of paymentsReceived) {
    const accountId = getRelationshipId(payment.depositAccount)
    if (!accountId) continue
    const bankAccount = bankAccountsById.get(String(accountId))
    activities.push({
      id: `payment-received-${String(payment.id)}`,
      accountId: String(accountId),
      accountLabel: normalizeText(bankAccount?.accountName || bankAccount?.bankName || accountId),
      activityDate: payment.paymentDate || payment.postingDate || null,
      documentNumber: normalizeText(payment.receiptNumber) || `Receipt ${String(payment.id)}`,
      sourceType: 'payment_received',
      sourceLabel: 'Receipt',
      direction: 'inflow',
      directionLabel: 'Inflow',
      amount: normalizeAmount(payment.amountReceived),
      status: normalizeText(payment.status),
      notes: normalizeText(payment.notes),
    })
  }

  for (const payment of paymentsMade) {
    const accountId = getRelationshipId(payment.bankAccount)
    if (!accountId) continue
    const bankAccount = bankAccountsById.get(String(accountId))
    activities.push({
      id: `payment-made-${String(payment.id)}`,
      accountId: String(accountId),
      accountLabel: normalizeText(bankAccount?.accountName || bankAccount?.bankName || accountId),
      activityDate: payment.paymentDate || payment.postingDate || null,
      documentNumber: normalizeText(payment.paymentNumber) || `Payment ${String(payment.id)}`,
      sourceType: 'payment_made',
      sourceLabel: 'Disbursement',
      direction: 'outflow',
      directionLabel: 'Outflow',
      amount: normalizeAmount(payment.amountPaid),
      status: normalizeText(payment.status),
      notes: normalizeText(payment.notes),
    })
  }

  for (const expense of expenses) {
    const accountId = getRelationshipId(expense.bankAccount)
    if (!accountId) continue
    const bankAccount = bankAccountsById.get(String(accountId))
    activities.push({
      id: `expense-${String(expense.id)}`,
      accountId: String(accountId),
      accountLabel: normalizeText(bankAccount?.accountName || bankAccount?.bankName || accountId),
      activityDate: expense.expenseDate || expense.postingDate || null,
      documentNumber: normalizeText(expense.expenseNumber) || `Expense ${String(expense.id)}`,
      sourceType: 'expense',
      sourceLabel: 'Expense',
      direction: 'outflow',
      directionLabel: 'Outflow',
      amount: normalizeAmount(expense.total),
      status: normalizeText(expense.status),
      notes: normalizeText(expense.notes),
    })
  }

  for (const deposit of deposits) {
    const accountId = getRelationshipId(deposit.bankAccount)
    if (!accountId) continue
    const bankAccount = bankAccountsById.get(String(accountId))
    activities.push({
      id: `deposit-${String(deposit.id)}`,
      accountId: String(accountId),
      accountLabel: normalizeText(bankAccount?.accountName || bankAccount?.bankName || accountId),
      activityDate: deposit.depositDate || null,
      documentNumber: normalizeText(deposit.depositNumber) || `Deposit ${String(deposit.id)}`,
      sourceType: 'deposit',
      sourceLabel: 'Deposit',
      direction: 'inflow',
      directionLabel: 'Inflow',
      amount: normalizeAmount(deposit.amount),
      status: normalizeText(deposit.status),
      notes: normalizeText(deposit.notes),
    })
  }

  for (const transfer of transfers) {
    const amount = normalizeAmount(transfer.amount)
    const fromAccountId = getRelationshipId(transfer.fromBankAccount)
    const toAccountId = getRelationshipId(transfer.toBankAccount)

    if (fromAccountId) {
      const bankAccount = bankAccountsById.get(String(fromAccountId))
      activities.push({
        id: `transfer-out-${String(transfer.id)}`,
        accountId: String(fromAccountId),
        accountLabel: normalizeText(bankAccount?.accountName || bankAccount?.bankName || fromAccountId),
        activityDate: transfer.transferDate || null,
        documentNumber: normalizeText(transfer.transferNumber) || `Transfer ${String(transfer.id)}`,
        sourceType: 'transfer_out',
        sourceLabel: 'Transfer Out',
        direction: 'outflow',
        directionLabel: 'Outflow',
        amount,
        status: normalizeText(transfer.status),
        notes: normalizeText(transfer.notes),
      })
    }

    if (toAccountId) {
      const bankAccount = bankAccountsById.get(String(toAccountId))
      activities.push({
        id: `transfer-in-${String(transfer.id)}`,
        accountId: String(toAccountId),
        accountLabel: normalizeText(bankAccount?.accountName || bankAccount?.bankName || toAccountId),
        activityDate: transfer.transferDate || null,
        documentNumber: normalizeText(transfer.transferNumber) || `Transfer ${String(transfer.id)}`,
        sourceType: 'transfer_in',
        sourceLabel: 'Transfer In',
        direction: 'inflow',
        directionLabel: 'Inflow',
        amount,
        status: normalizeText(transfer.status),
        notes: normalizeText(transfer.notes),
      })
    }
  }

  return activities.sort(
    (left, right) => new Date(right.activityDate || 0).getTime() - new Date(left.activityDate || 0).getTime(),
  )
}

const groupByAccount = <T extends { accountId: string }>(rows: T[]) => {
  const grouped = new Map<string, T[]>()
  for (const row of rows) {
    const existing = grouped.get(row.accountId) || []
    existing.push(row)
    grouped.set(row.accountId, existing)
  }
  return grouped
}

const groupBankTransactionsByAccount = (rows: CashFlowBankTransactionRow[], bankAccountIdMap: Map<string, string>) => {
  const grouped = new Map<string, CashFlowBankTransactionRow[]>()
  for (const row of rows) {
    const accountId = bankAccountIdMap.get(row.id) || ''
    if (!accountId) continue
    const existing = grouped.get(accountId) || []
    existing.push(row)
    grouped.set(accountId, existing)
  }
  return grouped
}

const buildLatestReconciliationMap = (reconciliations: ReconciliationDoc[]) => {
  const latestByAccount = new Map<string, ReconciliationDoc>()
  for (const reconciliation of reconciliations) {
    const bankAccountId = String(getRelationshipId(reconciliation.bankAccount) || '')
    if (!bankAccountId) continue
    const existing = latestByAccount.get(bankAccountId)
    const reconciliationTime = new Date(reconciliation.statementEndDate || reconciliation.completedAt || 0).getTime()
    const existingTime = new Date(existing?.statementEndDate || existing?.completedAt || 0).getTime()
    if (!existing || reconciliationTime > existingTime) {
      latestByAccount.set(bankAccountId, reconciliation)
    }
  }
  return latestByAccount
}

const daysAgo = (days: number) => {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - days)
  return date
}

const buildStatementPeriodLabel = (startDate?: string | null, endDate?: string | null) =>
  `${formatDate(startDate)} to ${formatDate(endDate)}`

const buildRowFromAccount = async (args: {
  payload: Payload
  bankAccount: BankAccountDoc
  recentActivities: CashFlowActivityDoc[]
  latestReconciliation: ReconciliationDoc | null
}) => {
  const { payload, bankAccount, recentActivities, latestReconciliation } = args
  const bankAccountId = String(bankAccount.id)
  const currency = String(bankAccount.currencyReference?.code || bankAccount.currencyReference?.name || 'PHP')
  const currentBalance = normalizeAmount(
    await AccountingBankingService.calculateBookClosingBalance(payload, bankAccount.id),
  )
  const rollingThreshold = daysAgo(ROLLING_DAYS)
  const rollingActivities = recentActivities.filter((activity) => {
    if (!activity.activityDate) return false
    return new Date(activity.activityDate).getTime() >= rollingThreshold.getTime()
  })
  const rollingInflow30 = normalizeAmount(
    rollingActivities
      .filter((activity) => activity.direction === 'inflow')
      .reduce((sum, activity) => sum + activity.amount, 0),
  )
  const rollingOutflow30 = normalizeAmount(
    rollingActivities
      .filter((activity) => activity.direction === 'outflow')
      .reduce((sum, activity) => sum + activity.amount, 0),
  )
  const netMovement30 = normalizeAmount(rollingInflow30 - rollingOutflow30)
  const averageDailyInflow30 = normalizeAmount(rollingInflow30 / ROLLING_DAYS)
  const averageDailyOutflow30 = normalizeAmount(rollingOutflow30 / ROLLING_DAYS)
  const projectedNet7 = normalizeAmount((averageDailyInflow30 - averageDailyOutflow30) * PROJECTION_DAYS)
  const projectedClosingBalance = normalizeAmount(currentBalance + projectedNet7)
  const liquidityState = getLiquidityState({
    currentBalance,
    rollingInflow30,
    rollingOutflow30,
    projectedClosingBalance,
  })
  const reconciliationState = getReconciliationState(String(bankAccount.accountType || ''), latestReconciliation)
  const latestReconciliationDifference = normalizeAmount(latestReconciliation?.differenceAmount)

  return {
    id: bankAccountId,
    bankAccountId,
    bankAccountLabel: normalizeText(bankAccount.accountName || bankAccount.bankName || `Account ${bankAccount.id}`),
    bankName: normalizeText(bankAccount.bankName),
    accountNumberMasked: normalizeText(bankAccount.accountNumberMasked),
    branchName: normalizeText(bankAccount.branchName),
    accountType: normalizeText(bankAccount.accountType),
    accountTypeLabel:
      accountTypeLabelMap.get(String(bankAccount.accountType || '')) || normalizeText(bankAccount.accountType) || 'Unknown',
    currency,
    currentBalance,
    currentBalanceLabel: formatCurrency(currentBalance, currency),
    rollingInflow30,
    rollingInflow30Label: formatCurrency(rollingInflow30, currency),
    rollingOutflow30,
    rollingOutflow30Label: formatCurrency(rollingOutflow30, currency),
    netMovement30,
    netMovement30Label: formatSignedCurrency(netMovement30, currency),
    projectedClosingBalance,
    projectedClosingBalanceLabel: formatCurrency(projectedClosingBalance, currency),
    projectedNet7,
    projectedNet7Label: formatSignedCurrency(projectedNet7, currency),
    averageDailyInflow30,
    averageDailyOutflow30,
    recentActivityCount: rollingActivities.length,
    liquidityState: liquidityState.value,
    liquidityStateLabel: liquidityState.label,
    liquidityStateTone: liquidityState.tone,
    reconciliationState: reconciliationState.value,
    reconciliationStateLabel: reconciliationState.label,
    reconciliationStateTone: reconciliationState.tone,
    latestReconciliationId: latestReconciliation ? String(latestReconciliation.id) : null,
    latestReconciliationPeriodLabel: latestReconciliation
      ? buildStatementPeriodLabel(latestReconciliation.statementStartDate, latestReconciliation.statementEndDate)
      : '-',
    latestReconciliationDifference,
    latestReconciliationDifferenceLabel: formatCurrency(latestReconciliationDifference, currency),
    hasReconciliationVariance: Math.abs(latestReconciliationDifference) > 0.0001,
    searchableText: buildSearchableText([
      bankAccount.accountName,
      bankAccount.bankName,
      bankAccount.accountNumberMasked,
      bankAccount.branchName,
      accountTypeLabelMap.get(String(bankAccount.accountType || '')),
      liquidityState.label,
      reconciliationState.label,
      buildStatementPeriodLabel(latestReconciliation?.statementStartDate, latestReconciliation?.statementEndDate),
      formatCurrency(currentBalance, currency),
      formatCurrency(projectedClosingBalance, currency),
    ]),
    cells: [
      { text: normalizeText(bankAccount.accountName || bankAccount.bankName || `Account ${bankAccount.id}`), emphasis: true },
      { text: formatCurrency(currentBalance, currency), emphasis: true, align: 'right' },
      { text: formatCurrency(rollingInflow30, currency), align: 'right' },
      { text: formatCurrency(rollingOutflow30, currency), align: 'right' },
      { text: formatCurrency(projectedClosingBalance, currency), emphasis: true, align: 'right' },
      { text: liquidityState.label, tone: liquidityState.tone },
    ],
  } satisfies CashFlowRow
}

const buildCashFlowData = async (payload: Payload) => {
  const [
    bankAccounts,
    paymentsReceived,
    paymentsMade,
    expenses,
    deposits,
    transfers,
    reconciliations,
    bankTransactions,
  ] = await Promise.all([
    findAllDocs<BankAccountDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
      depth: 1,
      sort: 'accountName',
      where: {
        and: [
          { isActive: { not_equals: false } },
          {
            or: [
              { accountType: { equals: 'bank' } },
              { accountType: { equals: 'cash_on_hand' } },
            ],
          },
        ],
      },
    }),
    findAllDocs<PaymentReceivedDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
      depth: 1,
      where: { status: { equals: 'posted' } },
    }),
    findAllDocs<PaymentMadeDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade,
      depth: 1,
      where: { status: { equals: 'posted' } },
    }),
    findAllDocs<ExpenseDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
      depth: 1,
      where: { status: { equals: 'posted' } },
    }),
    findAllDocs<DepositDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.deposits,
      depth: 1,
      where: { status: { equals: 'posted' } },
    }),
    findAllDocs<TransferDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.transfers,
      depth: 1,
      where: { status: { equals: 'posted' } },
    }),
    findAllDocs<ReconciliationDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.bankReconciliations,
      depth: 1,
      sort: '-statementEndDate',
    }),
    findAllDocs<BankTransactionDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.bankTransactions,
      depth: 1,
      sort: '-transactionDate',
    }),
  ])

  const eligibleBankAccounts = bankAccounts.filter((bankAccount) => Boolean(getRelationshipId(bankAccount.ledgerAccount)))
  const bankAccountsById = new Map(eligibleBankAccounts.map((bankAccount) => [String(bankAccount.id), bankAccount]))
  const activities = buildActivityDocs({
    paymentsReceived,
    paymentsMade,
    expenses,
    deposits,
    transfers,
    bankAccountsById,
  }).filter((activity) => bankAccountsById.has(activity.accountId))
  const activitiesByAccount = groupByAccount(activities)
  const latestReconciliationByAccount = buildLatestReconciliationMap(reconciliations)

  const rows = sortRows(
    await Promise.all(
      eligibleBankAccounts.map((bankAccount) =>
        buildRowFromAccount({
          payload,
          bankAccount,
          recentActivities: activitiesByAccount.get(String(bankAccount.id)) || [],
          latestReconciliation: latestReconciliationByAccount.get(String(bankAccount.id)) || null,
        }),
      ),
    ),
  )

  const bankTransactionRows = bankTransactions
    .filter((transaction) => Boolean(getRelationshipId(transaction.bankAccount)))
    .map((transaction) =>
      mapBankTransactionRow(
        transaction,
        typeof transaction.bankAccount === 'object' && transaction.bankAccount
          ? String(transaction.bankAccount.currencyReference?.code || 'PHP')
          : 'PHP',
      ),
    )
  const bankTransactionAccountMap = new Map(
    bankTransactions
      .filter((transaction) => Boolean(getRelationshipId(transaction.bankAccount)))
      .map((transaction) => [String(transaction.id), String(getRelationshipId(transaction.bankAccount) || '')]),
  )

  return {
    rows,
    bankAccountsById,
    activitiesByAccount,
    latestReconciliationByAccount,
    bankTransactionsByAccount: groupBankTransactionsByAccount(bankTransactionRows, bankTransactionAccountMap),
  }
}

export const buildCashFlowMetrics = (rows: CashFlowRow[]) => {
  const totalCurrentCash = normalizeAmount(rows.reduce((sum, row) => sum + row.currentBalance, 0))
  const projectedClose = normalizeAmount(rows.reduce((sum, row) => sum + row.projectedClosingBalance, 0))
  const netMovement30 = normalizeAmount(rows.reduce((sum, row) => sum + row.netMovement30, 0))
  const atRiskAccounts = rows.filter((row) => ['watch', 'critical'].includes(row.liquidityState)).length
  const varianceAccounts = rows.filter((row) => row.hasReconciliationVariance).length

  return [
    {
      id: 'cash-flow-current',
      label: 'Available Cash',
      value: formatCurrency(totalCurrentCash),
      change: `${rows.length} visible liquidity account(s)`,
      trend: totalCurrentCash >= 0 ? 'up' as const : 'down' as const,
    },
    {
      id: 'cash-flow-projected',
      label: '7-Day Projected Close',
      value: formatCurrency(projectedClose),
      change: 'Rolling 30-day actuals projected forward 7 days',
      trend: projectedClose >= totalCurrentCash ? 'up' as const : 'down' as const,
    },
    {
      id: 'cash-flow-net',
      label: '30-Day Net Movement',
      value: formatSignedCurrency(netMovement30),
      change: 'Posted inflows minus outflows across visible accounts',
      trend: netMovement30 >= 0 ? 'up' as const : 'down' as const,
    },
    {
      id: 'cash-flow-risk',
      label: 'Accounts At Risk',
      value: atRiskAccounts,
      change: `${varianceAccounts} account(s) also carry reconciliation variance`,
      trend: atRiskAccounts > 0 ? 'down' as const : 'up' as const,
    },
  ]
}

export const matchesCashFlowFilters = (
  row: CashFlowRow,
  filters: {
    accountTypes: string[]
    liquidityStates: string[]
    reconciliationStates: string[]
    quickFilters: string[]
  },
) => {
  const quickPredicates = filters.quickFilters.map((quickFilter) => {
    const [group, value] = quickFilter.split(':')
    if (group === 'liquidity' && value === 'at_risk') {
      return ['watch', 'critical'].includes(row.liquidityState)
    }
    if (group === 'liquidity') return row.liquidityState === value
    if (group === 'projection' && value === 'negative') return row.projectedClosingBalance < 0
    if (group === 'projection' && value === 'positive_net') return row.netMovement30 > 0
    if (group === 'reconciliation' && value === 'variance') return row.hasReconciliationVariance
    if (group === 'accountType') return row.accountType === value
    return false
  })

  const predicates = [
    ...filters.accountTypes.map((accountType) => row.accountType === accountType),
    ...filters.liquidityStates.map((liquidityState) => row.liquidityState === liquidityState),
    ...filters.reconciliationStates.map((reconciliationState) => row.reconciliationState === reconciliationState),
    ...quickPredicates,
  ]

  if (predicates.length === 0) return true
  return predicates.some(Boolean)
}

export const buildCashFlowReferenceData = async (payload: Payload) => {
  const bankAccounts = await findAllDocs<BankAccountDoc>({
    payload,
    collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
    depth: 1,
    sort: 'accountName',
    where: {
      and: [
        { isActive: { not_equals: false } },
        {
          or: [
            { accountType: { equals: 'bank' } },
            { accountType: { equals: 'cash_on_hand' } },
          ],
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

export const buildCashFlowRegister = async (payload: Payload) => {
  return buildCashFlowData(payload)
}

export const buildCashFlowDetailResponse = async (
  payload: Payload,
  bankAccountId: number | string,
): Promise<CashFlowDetail> => {
  const data = await buildCashFlowData(payload)
  const row = data.rows.find((entry) => entry.bankAccountId === String(bankAccountId))

  if (!row) {
    throw new Error('Cash-flow account was not found.')
  }

  const bankAccount = data.bankAccountsById.get(row.bankAccountId) || null
  const recentActivities = (data.activitiesByAccount.get(row.bankAccountId) || [])
    .slice(0, 12)
    .map((activity) => mapCashActivityRow(activity, row.currency))
  const recentBankTransactions = (data.bankTransactionsByAccount.get(row.bankAccountId) || [])
    .slice(0, 10)
  const latestReconciliationDoc = data.latestReconciliationByAccount.get(row.bankAccountId) || null

  let latestReconciliation: CashFlowDetail['latestReconciliation'] = null

  if (latestReconciliationDoc) {
    const snapshot = await AccountingBankingService.getReconciliationSnapshot(payload, latestReconciliationDoc.id)
    const status = String(latestReconciliationDoc.status || 'draft')
    latestReconciliation = {
      id: String(latestReconciliationDoc.id),
      sessionLabel: `RECON-${String(latestReconciliationDoc.id)}`,
      status,
      statusLabel: reconciliationStatusLabelMap.get(status) || 'Unknown',
      statusTone: getReconciliationTone(status),
      statementPeriodLabel: buildStatementPeriodLabel(
        latestReconciliationDoc.statementStartDate,
        latestReconciliationDoc.statementEndDate,
      ),
      completedAt: latestReconciliationDoc.completedAt || null,
      completedAtLabel: formatDateTime(latestReconciliationDoc.completedAt),
      completedByLabel: formatUserLabel(latestReconciliationDoc.completedBy),
      differenceAmount: normalizeAmount(snapshot.differenceAmount),
      differenceLabel: formatCurrency(snapshot.differenceAmount, row.currency),
      bankTransactionCount: snapshot.bankTransactionCount,
      matchedTransactionCount: snapshot.matchedTransactionCount,
      unmatchedTransactionCount: snapshot.unmatchedTransactionCount,
    }
  }

  const ledgerAccountLabel =
    typeof bankAccount?.ledgerAccount === 'object' && bankAccount?.ledgerAccount
      ? `${normalizeText(bankAccount.ledgerAccount.code)}${normalizeText(bankAccount.ledgerAccount.code) && normalizeText(bankAccount.ledgerAccount.name) ? ' - ' : ''}${normalizeText(bankAccount.ledgerAccount.name)}`.trim() || '-'
      : '-'

  return {
    ...row,
    ledgerAccountLabel,
    latestReconciliation,
    summary: {
      currentBalance: row.currentBalance,
      currentBalanceLabel: row.currentBalanceLabel,
      rollingInflow30: row.rollingInflow30,
      rollingInflow30Label: row.rollingInflow30Label,
      rollingOutflow30: row.rollingOutflow30,
      rollingOutflow30Label: row.rollingOutflow30Label,
      netMovement30: row.netMovement30,
      netMovement30Label: row.netMovement30Label,
      projectedClosingBalance: row.projectedClosingBalance,
      projectedClosingBalanceLabel: row.projectedClosingBalanceLabel,
      projectedNet7: row.projectedNet7,
      projectedNet7Label: row.projectedNet7Label,
      averageDailyInflow30: row.averageDailyInflow30,
      averageDailyInflow30Label: formatCurrency(row.averageDailyInflow30, row.currency),
      averageDailyOutflow30: row.averageDailyOutflow30,
      averageDailyOutflow30Label: formatCurrency(row.averageDailyOutflow30, row.currency),
    },
    recentActivities,
    recentBankTransactions,
  }
}

export const getCashFlowAccountId = (value: string) => parseNumberParam(value) || value
