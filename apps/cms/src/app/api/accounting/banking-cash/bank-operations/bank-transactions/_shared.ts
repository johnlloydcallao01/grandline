import type { Payload } from 'payload'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_ENTITY_TYPE_OPTIONS,
  BANK_TRANSACTION_MATCH_STATUS_OPTIONS,
} from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'
import { parseNumberParam } from '../../../_utils/auth'

type StatusTone = 'amber' | 'blue' | 'gray' | 'green' | 'red'

export type BankTransactionCell =
  | string
  | {
      text: string
      tone?: StatusTone
      emphasis?: boolean
      align?: 'left' | 'right' | 'center'
    }

export type BankTransactionDoc = {
  id: number | string
  bankAccount?:
    | {
        id?: number | string
        accountName?: string | null
        bankName?: string | null
        accountNumberMasked?: string | null
        accountType?: string | null
        currencyReference?: {
          code?: string | null
          name?: string | null
        } | null
        ledgerAccount?: {
          id?: number | string
          code?: string | null
          name?: string | null
        } | null
      }
    | number
    | string
    | null
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
  metadata?: Record<string, unknown> | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type BankTransactionRow = {
  id: string
  bankAccountId: string
  bankAccountLabel: string
  bankAccountType: string
  currency: string
  transactionDate: string | null
  transactionDateLabel: string
  valueDate: string | null
  valueDateLabel: string
  referenceNumber: string
  description: string
  amountIn: number
  amountInLabel: string
  amountOut: number
  amountOutLabel: string
  netAmount: number
  netAmountLabel: string
  runningBalance: number
  runningBalanceLabel: string
  direction: 'incoming' | 'outgoing' | 'mixed'
  directionLabel: string
  matchStatus: string
  matchStatusLabel: string
  matchStatusTone: StatusTone
  matchedEntityType: string
  matchedEntityTypeLabel: string
  matchedEntityId: string
  hasMatchLink: boolean
  hasValueDate: boolean
  hasRunningBalance: boolean
  searchableText: string
  cells: BankTransactionCell[]
}

export type BankTransactionDetail = {
  id: string
  bankAccountId: string
  bankAccountLabel: string
  bankAccountType: string
  bankAccountCurrency: string
  bankLedgerAccountLabel: string
  transactionDate: string | null
  transactionDateLabel: string
  valueDate: string | null
  valueDateLabel: string
  referenceNumber: string
  description: string
  amountIn: number
  amountInLabel: string
  amountOut: number
  amountOutLabel: string
  netAmount: number
  netAmountLabel: string
  runningBalance: number
  runningBalanceLabel: string
  direction: 'incoming' | 'outgoing' | 'mixed'
  directionLabel: string
  matchStatus: string
  matchStatusLabel: string
  matchStatusTone: StatusTone
  matchedEntityType: string
  matchedEntityTypeLabel: string
  matchedEntityId: string
  metadata: Record<string, unknown> | null
  createdAt: string | null
  updatedAt: string | null
  usageSummary: {
    hasEntityMatch: boolean
    canEdit: boolean
    canDelete: boolean
  }
}

export type BankTransactionMutationBody = {
  bankAccount?: number | string | null
  transactionDate?: string | null
  valueDate?: string | null
  description?: string | null
  referenceNumber?: string | null
  amountIn?: number
  amountOut?: number
  runningBalance?: number | null
  matchStatus?: string | null
  matchedEntityType?: string | null
  matchedEntityId?: string | null
  metadata?: Record<string, unknown> | null
}

type BankTransactionPersistedMutationBody = {
  bankAccount?: number | string | null
  transactionDate?: string
  valueDate?: string | null
  description?: string
  referenceNumber?: string | null
  amountIn?: number
  amountOut?: number
  runningBalance?: number | null
  matchStatus?: string
  matchedEntityType?: string | null
  matchedEntityId?: string | null
  metadata?: Record<string, unknown> | null
}

const statusLabelMap = new Map<string, string>(
  BANK_TRANSACTION_MATCH_STATUS_OPTIONS.map((option) => [String(option.value), option.label]),
)
const entityTypeLabelMap = new Map<string, string>(
  ACCOUNTING_ENTITY_TYPE_OPTIONS.map((option) => [String(option.value), option.label]),
)

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

const buildSearchableText = (parts: Array<unknown>) =>
  parts
    .map((part) => normalizeSearch(part))
    .filter(Boolean)
    .join(' ')

const formatDate = (value: string | null | undefined) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

const formatCurrency = (value: number | null | undefined, currency = 'PHP') =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

const formatSignedCurrency = (value: number, currency = 'PHP') => {
  const absolute = formatCurrency(Math.abs(value), currency)
  if (value < 0) return `-${absolute}`
  if (value > 0) return `+${absolute}`
  return absolute
}

const getStatusTone = (status: string | null | undefined): StatusTone => {
  switch (String(status || '')) {
    case 'matched':
      return 'green'
    case 'suggested':
      return 'amber'
    case 'ignored':
      return 'gray'
    default:
      return 'blue'
  }
}

const getDirection = (amountIn: number, amountOut: number): 'incoming' | 'outgoing' | 'mixed' => {
  if (amountIn > 0 && amountOut <= 0) return 'incoming'
  if (amountOut > 0 && amountIn <= 0) return 'outgoing'
  return 'mixed'
}

const getDirectionLabel = (direction: 'incoming' | 'outgoing' | 'mixed') => {
  if (direction === 'incoming') return 'Incoming'
  if (direction === 'outgoing') return 'Outgoing'
  return 'Mixed'
}

const formatBankAccountLabel = (bankAccount: BankTransactionDoc['bankAccount']) => {
  if (typeof bankAccount === 'object' && bankAccount) {
    const suffix = bankAccount.accountNumberMasked ? ` (${bankAccount.accountNumberMasked})` : ''
    return `${bankAccount.accountName || 'Unnamed bank account'}${suffix}`
  }

  return ''
}

const formatLedgerAccountLabel = (bankAccount: BankTransactionDoc['bankAccount']) => {
  if (typeof bankAccount === 'object' && bankAccount?.ledgerAccount) {
    const code = String(bankAccount.ledgerAccount.code || '').trim()
    const name = String(bankAccount.ledgerAccount.name || '').trim()
    if (code && name) return `${code} - ${name}`
    return code || name || ''
  }

  return ''
}

export const buildBankTransactionRow = (transaction: BankTransactionDoc): BankTransactionRow => {
  const id = String(transaction.id)
  const amountIn = normalizeAmount(transaction.amountIn)
  const amountOut = normalizeAmount(transaction.amountOut)
  const netAmount = normalizeAmount(amountIn - amountOut)
  const currency =
    typeof transaction.bankAccount === 'object' && transaction.bankAccount
      ? String(transaction.bankAccount.currencyReference?.code || 'PHP')
      : 'PHP'
  const direction = getDirection(amountIn, amountOut)
  const bankAccountLabel = formatBankAccountLabel(transaction.bankAccount)
  const bankAccountType =
    typeof transaction.bankAccount === 'object' && transaction.bankAccount
      ? String(transaction.bankAccount.accountType || '')
      : ''
  const matchStatus = String(transaction.matchStatus || 'unmatched')
  const matchedEntityType = String(transaction.matchedEntityType || '')
  const matchedEntityId = String(transaction.matchedEntityId || '')
  const hasMatchLink = Boolean(matchedEntityType && matchedEntityId)

  return {
    id,
    bankAccountId: String(getRelationshipId(transaction.bankAccount) || ''),
    bankAccountLabel,
    bankAccountType,
    currency,
    transactionDate: transaction.transactionDate || null,
    transactionDateLabel: formatDate(transaction.transactionDate),
    valueDate: transaction.valueDate || null,
    valueDateLabel: formatDate(transaction.valueDate),
    referenceNumber: String(transaction.referenceNumber || ''),
    description: String(transaction.description || ''),
    amountIn,
    amountInLabel: formatCurrency(amountIn, currency),
    amountOut,
    amountOutLabel: formatCurrency(amountOut, currency),
    netAmount,
    netAmountLabel: formatSignedCurrency(netAmount, currency),
    runningBalance: normalizeAmount(transaction.runningBalance),
    runningBalanceLabel: formatCurrency(transaction.runningBalance, currency),
    direction,
    directionLabel: getDirectionLabel(direction),
    matchStatus,
    matchStatusLabel: statusLabelMap.get(matchStatus) || 'Unknown',
    matchStatusTone: getStatusTone(matchStatus),
    matchedEntityType,
    matchedEntityTypeLabel: entityTypeLabelMap.get(matchedEntityType) || '',
    matchedEntityId,
    hasMatchLink,
    hasValueDate: Boolean(transaction.valueDate),
    hasRunningBalance: transaction.runningBalance !== null && transaction.runningBalance !== undefined,
    searchableText: buildSearchableText([
      transaction.transactionDate,
      transaction.referenceNumber,
      transaction.description,
      bankAccountLabel,
      bankAccountType,
      formatSignedCurrency(netAmount, currency),
      statusLabelMap.get(matchStatus),
      entityTypeLabelMap.get(matchedEntityType),
      matchedEntityId,
      JSON.stringify(transaction.metadata || {}),
    ]),
    cells: [
      transaction.transactionDate ? formatDate(transaction.transactionDate) : '-',
      { text: bankAccountLabel || '-', emphasis: true },
      String(transaction.referenceNumber || '-'),
      String(transaction.description || '-'),
      { text: formatSignedCurrency(netAmount, currency), emphasis: true, align: 'right' },
      { text: statusLabelMap.get(matchStatus) || 'Unknown', tone: getStatusTone(matchStatus) },
    ],
  }
}

export const matchesBankTransactionFilters = (
  row: BankTransactionRow,
  filters: {
    statuses: string[]
    directions: string[]
    coverageStates: string[]
    quickFilters: string[]
  },
) => {
  const quickPredicates = filters.quickFilters.map((quickFilter) => {
    const [group, value] = quickFilter.split(':')
    if (group === 'status') return row.matchStatus === value
    if (group === 'direction') return row.direction === value
    if (group === 'coverage' && value === 'entity_linked') return row.hasMatchLink
    if (group === 'coverage' && value === 'with_value_date') return row.hasValueDate
    return false
  })

  const predicates = [
    ...filters.statuses.map((status) => row.matchStatus === status),
    ...filters.directions.map((direction) => row.direction === direction),
    ...filters.coverageStates.map((coverageState) =>
      coverageState === 'entity_linked'
        ? row.hasMatchLink
        : coverageState === 'with_value_date'
          ? row.hasValueDate
          : coverageState === 'with_running_balance'
            ? row.hasRunningBalance
            : false,
    ),
    ...quickPredicates,
  ]

  if (predicates.length === 0) return true
  return predicates.some(Boolean)
}

export const buildBankTransactionMetrics = (rows: BankTransactionRow[]) => [
  {
    id: 'bank-transactions-open',
    label: 'Open Bank Items',
    value: rows.filter((row) => ['unmatched', 'suggested'].includes(row.matchStatus)).length,
    change: 'Still needs review or matching',
    trend: 'neutral' as const,
  },
  {
    id: 'bank-transactions-matched',
    label: 'Matched Items',
    value: rows.filter((row) => row.matchStatus === 'matched').length,
    change: 'Already linked to accounting entities',
    trend: 'up' as const,
  },
  {
    id: 'bank-transactions-suggested',
    label: 'Suggested Matches',
    value: rows.filter((row) => row.matchStatus === 'suggested').length,
    change: 'Awaiting confirmation or cleanup',
    trend: 'neutral' as const,
  },
  {
    id: 'bank-transactions-net',
    label: 'Net Activity',
    value: formatSignedCurrency(
      rows.reduce((total, row) => total + row.netAmount, 0),
      rows[0]?.currency || 'PHP',
    ),
    change: 'Filtered movement across visible rows',
    trend: 'up' as const,
  },
]

export const buildBankTransactionReferenceData = async (payload: Payload) => {
  const bankAccounts = await findAllDocs<any>({
    payload,
    collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
    depth: 1,
    sort: 'accountName',
  })

  return {
    bankAccounts: bankAccounts.map((bankAccount) => ({
      id: bankAccount.id,
      accountName: bankAccount.accountName || null,
      bankName: bankAccount.bankName || null,
      accountNumberMasked: bankAccount.accountNumberMasked || null,
      accountType: bankAccount.accountType || null,
      currency: bankAccount.currencyReference?.code || null,
      ledgerAccountCode: bankAccount.ledgerAccount?.code || null,
      ledgerAccountName: bankAccount.ledgerAccount?.name || null,
      isActive: Boolean(bankAccount.isActive),
    })),
    matchedEntityTypes: ACCOUNTING_ENTITY_TYPE_OPTIONS.map((option) => ({
      label: option.label,
      value: option.value,
    })),
  }
}

export const buildBankTransactionDetailResponse = async (
  payload: Payload,
  transaction: BankTransactionDoc,
): Promise<BankTransactionDetail> => {
  const row = buildBankTransactionRow(transaction)
  const bankLedgerAccountLabel = formatLedgerAccountLabel(transaction.bankAccount)
  const canMutate = !(row.matchStatus === 'matched' && row.hasMatchLink)

  return {
    id: row.id,
    bankAccountId: row.bankAccountId,
    bankAccountLabel: row.bankAccountLabel,
    bankAccountType: row.bankAccountType,
    bankAccountCurrency: row.currency,
    bankLedgerAccountLabel,
    transactionDate: row.transactionDate,
    transactionDateLabel: row.transactionDateLabel,
    valueDate: row.valueDate,
    valueDateLabel: row.valueDateLabel,
    referenceNumber: row.referenceNumber,
    description: row.description,
    amountIn: row.amountIn,
    amountInLabel: row.amountInLabel,
    amountOut: row.amountOut,
    amountOutLabel: row.amountOutLabel,
    netAmount: row.netAmount,
    netAmountLabel: row.netAmountLabel,
    runningBalance: row.runningBalance,
    runningBalanceLabel: row.runningBalanceLabel,
    direction: row.direction,
    directionLabel: row.directionLabel,
    matchStatus: row.matchStatus,
    matchStatusLabel: row.matchStatusLabel,
    matchStatusTone: row.matchStatusTone,
    matchedEntityType: row.matchedEntityType,
    matchedEntityTypeLabel: row.matchedEntityTypeLabel,
    matchedEntityId: row.matchedEntityId,
    metadata: transaction.metadata || null,
    createdAt: transaction.createdAt || null,
    updatedAt: transaction.updatedAt || null,
    usageSummary: {
      hasEntityMatch: row.hasMatchLink,
      canEdit: canMutate,
      canDelete: canMutate,
    },
  }
}

export const normalizeBankTransactionMutationBody = (
  body: Record<string, unknown>,
): BankTransactionMutationBody => ({
  ...(body.bankAccount !== undefined ? { bankAccount: normalizeRelationshipId(body.bankAccount) } : {}),
  ...(body.transactionDate !== undefined ? { transactionDate: normalizeOptionalString(body.transactionDate) } : {}),
  ...(body.valueDate !== undefined ? { valueDate: normalizeOptionalString(body.valueDate) } : {}),
  ...(body.description !== undefined ? { description: normalizeOptionalString(body.description) } : {}),
  ...(body.referenceNumber !== undefined ? { referenceNumber: normalizeOptionalString(body.referenceNumber) } : {}),
  ...(body.amountIn !== undefined ? { amountIn: Number(body.amountIn ?? 0) } : {}),
  ...(body.amountOut !== undefined ? { amountOut: Number(body.amountOut ?? 0) } : {}),
  ...(body.runningBalance !== undefined
    ? {
        runningBalance:
          body.runningBalance === null || body.runningBalance === ''
            ? null
            : Number(body.runningBalance),
      }
    : {}),
  ...(body.matchStatus !== undefined ? { matchStatus: normalizeOptionalString(body.matchStatus) } : {}),
  ...(body.matchedEntityType !== undefined
    ? { matchedEntityType: normalizeOptionalString(body.matchedEntityType) }
    : {}),
  ...(body.matchedEntityId !== undefined
    ? { matchedEntityId: normalizeOptionalString(body.matchedEntityId) }
    : {}),
  ...(body.metadata !== undefined
    ? { metadata: body.metadata && typeof body.metadata === 'object' ? (body.metadata as Record<string, unknown>) : null }
    : {}),
})

export const buildBankTransactionPersistenceData = (
  body: BankTransactionMutationBody,
): BankTransactionPersistedMutationBody => ({
  ...(body.bankAccount !== undefined ? { bankAccount: body.bankAccount } : {}),
  ...(body.transactionDate !== undefined ? { transactionDate: body.transactionDate ?? undefined } : {}),
  ...(body.valueDate !== undefined ? { valueDate: body.valueDate ?? null } : {}),
  ...(body.description !== undefined ? { description: body.description ?? undefined } : {}),
  ...(body.referenceNumber !== undefined ? { referenceNumber: body.referenceNumber ?? null } : {}),
  ...(body.amountIn !== undefined ? { amountIn: body.amountIn } : {}),
  ...(body.amountOut !== undefined ? { amountOut: body.amountOut } : {}),
  ...(body.runningBalance !== undefined ? { runningBalance: body.runningBalance ?? null } : {}),
  ...(body.matchStatus !== undefined ? { matchStatus: body.matchStatus ?? 'unmatched' } : {}),
  ...(body.matchedEntityType !== undefined ? { matchedEntityType: body.matchedEntityType ?? null } : {}),
  ...(body.matchedEntityId !== undefined ? { matchedEntityId: body.matchedEntityId ?? null } : {}),
  ...(body.metadata !== undefined ? { metadata: body.metadata ?? null } : {}),
})

const assertRelationshipExists = async (
  payload: Payload,
  collection: string,
  relationshipId: string | number | null | undefined,
  label: string,
) => {
  if (relationshipId === undefined || relationshipId === null) return
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

export const assertBankTransactionMutationPayload = async (
  payload: Payload,
  body: BankTransactionMutationBody,
) => {
  if ('bankAccount' in body && !body.bankAccount) throw new Error('Bank account is required.')
  if ('transactionDate' in body && !body.transactionDate) throw new Error('Transaction date is required.')
  if ('description' in body && !body.description) throw new Error('Description is required.')
  if ('amountIn' in body && Number(body.amountIn || 0) < 0) throw new Error('Amount in cannot be negative.')
  if ('amountOut' in body && Number(body.amountOut || 0) < 0) throw new Error('Amount out cannot be negative.')
  if (
    ('amountIn' in body || 'amountOut' in body) &&
    !(Number(body.amountIn || 0) > 0 || Number(body.amountOut || 0) > 0)
  ) {
    throw new Error('Enter an amount in or amount out greater than zero.')
  }

  if (
    body.matchStatus &&
    !BANK_TRANSACTION_MATCH_STATUS_OPTIONS.some((option) => option.value === body.matchStatus)
  ) {
    throw new Error('Match status is invalid.')
  }

  if (
    body.matchedEntityType &&
    !ACCOUNTING_ENTITY_TYPE_OPTIONS.some((option) => option.value === body.matchedEntityType)
  ) {
    throw new Error('Matched entity type is invalid.')
  }

  if ((body.matchedEntityType && !body.matchedEntityId) || (!body.matchedEntityType && body.matchedEntityId)) {
    throw new Error('Matched entity type and matched entity ID must be provided together.')
  }

  if (body.matchStatus === 'matched' && (!body.matchedEntityType || !body.matchedEntityId)) {
    throw new Error('Matched transactions require a matched entity type and matched entity ID.')
  }

  await assertRelationshipExists(
    payload,
    ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
    body.bankAccount,
    'Bank account',
  )
}

export const assertMutableBankTransaction = (transaction: BankTransactionDoc) => {
  const row = buildBankTransactionRow(transaction)
  if (row.matchStatus === 'matched' && row.hasMatchLink) {
    throw new Error('Matched bank transactions linked to an accounting entity cannot be edited directly.')
  }
}

export const computeBankTransactionDeleteBarriers = (transaction: BankTransactionDoc) => {
  const row = buildBankTransactionRow(transaction)
  const barriers: string[] = []

  if (row.matchStatus === 'matched') {
    barriers.push('transaction is already marked as matched')
  }

  if (row.hasMatchLink) {
    barriers.push(
      `linked to ${row.matchedEntityTypeLabel || row.matchedEntityType || 'an accounting entity'} ${row.matchedEntityId}`,
    )
  }

  return barriers
}
