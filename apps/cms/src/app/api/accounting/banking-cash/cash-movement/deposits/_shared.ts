import type { Payload } from 'payload'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  SIMPLE_POSTING_STATUS_OPTIONS,
} from '@/accounting/constants/accounting'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { AccountingApiError, parseNumberParam } from '../../../_utils/auth'

type StatusTone = 'amber' | 'blue' | 'gray' | 'green' | 'red'

export type DepositCell =
  | string
  | {
      text: string
      tone?: StatusTone
      emphasis?: boolean
      align?: 'left' | 'right' | 'center'
    }

export type DepositDoc = {
  id: number | string
  depositNumber?: string | null
  depositDate?: string | null
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
  sourceAccount?:
    | {
        id?: number | string
        code?: string | null
        name?: string | null
        accountType?: string | null
        accountSubType?: string | null
        isActive?: boolean | null
      }
    | number
    | string
    | null
  amount?: number | null
  status?: string | null
  postedJournalEntry?:
    | {
        id?: number | string
        entryNumber?: string | null
        referenceNumber?: string | null
        status?: string | null
      }
    | number
    | string
    | null
  notes?: string | null
  createdBy?:
    | {
        id?: number | string
        email?: string | null
        name?: string | null
      }
    | number
    | string
    | null
  updatedBy?:
    | {
        id?: number | string
        email?: string | null
        name?: string | null
      }
    | number
    | string
    | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type DepositRow = {
  id: string
  depositNumber: string
  depositDate: string | null
  depositDateLabel: string
  bankAccountId: string
  bankAccountLabel: string
  bankAccountType: string
  bankAccountCurrency: string
  sourceAccountId: string
  sourceAccountLabel: string
  sourceAccountType: string
  amount: number
  amountLabel: string
  status: string
  statusLabel: string
  statusTone: StatusTone
  postedJournalEntryId: string
  postedJournalEntryLabel: string
  notes: string
  preparedByLabel: string
  updatedByLabel: string
  createdAt: string | null
  updatedAt: string | null
  hasJournalLink: boolean
  hasNotes: boolean
  isDraft: boolean
  isPosted: boolean
  isVoided: boolean
  isToday: boolean
  searchableText: string
  cells: DepositCell[]
}

export type DepositDetail = DepositRow & {
  bankLedgerAccountLabel: string
  usageSummary: {
    canEdit: boolean
    canDelete: boolean
    canPost: boolean
    deleteBlockedReason: string | null
    postBlockedReason: string | null
  }
}

export type DepositMutationBody = {
  depositNumber?: string | null
  depositDate?: string | null
  bankAccount?: string | number | null
  sourceAccount?: string | number | null
  amount?: number | null
  notes?: string | null
}

type DepositPersistedMutationBody = {
  depositNumber?: string | null
  depositDate?: string | null
  bankAccount?: string | number | null
  sourceAccount?: string | number | null
  amount?: number
  notes?: string | null
}

const statusLabelMap = new Map(SIMPLE_POSTING_STATUS_OPTIONS.map((option) => [String(option.value), option.label]))

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

const formatUserLabel = (value: DepositDoc['createdBy'] | DepositDoc['updatedBy']) => {
  if (typeof value === 'object' && value) {
    return String(value.name || value.email || '')
  }
  return ''
}

const formatBankAccountLabel = (value: DepositDoc['bankAccount']) => {
  if (typeof value === 'object' && value) {
    const suffix = value.accountNumberMasked ? ` (${value.accountNumberMasked})` : ''
    return `${value.accountName || 'Unnamed bank account'}${suffix}`
  }
  return ''
}

const formatSourceAccountLabel = (value: DepositDoc['sourceAccount']) => {
  if (typeof value === 'object' && value) {
    const code = String(value.code || '').trim()
    const name = String(value.name || '').trim()
    if (code && name) return `${code} - ${name}`
    return code || name || ''
  }
  return ''
}

const formatJournalLabel = (value: DepositDoc['postedJournalEntry']) => {
  if (typeof value === 'object' && value) {
    return String(value.entryNumber || value.referenceNumber || `Journal ${value.id || ''}`).trim()
  }
  if (value) return `Journal ${String(value)}`
  return 'Not Linked'
}

const formatLedgerAccountLabel = (value: DepositDoc['bankAccount']) => {
  if (typeof value === 'object' && value?.ledgerAccount) {
    const code = String(value.ledgerAccount.code || '').trim()
    const name = String(value.ledgerAccount.name || '').trim()
    if (code && name) return `${code} - ${name}`
    return code || name || ''
  }
  return ''
}

const getStatusTone = (status: string | null | undefined): StatusTone => {
  switch (String(status || '')) {
    case 'posted':
      return 'green'
    case 'voided':
      return 'gray'
    case 'draft':
      return 'blue'
    default:
      return 'amber'
  }
}

const isSameDayAsToday = (value: string | null | undefined) => {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  const today = new Date()
  return (
    date.getUTCFullYear() === today.getUTCFullYear() &&
    date.getUTCMonth() === today.getUTCMonth() &&
    date.getUTCDate() === today.getUTCDate()
  )
}

export const buildDepositRow = (deposit: DepositDoc): DepositRow => {
  const id = String(deposit.id)
  const status = String(deposit.status || 'draft')
  const bankAccountCurrency =
    typeof deposit.bankAccount === 'object' && deposit.bankAccount
      ? String(deposit.bankAccount.currencyReference?.code || 'PHP')
      : 'PHP'
  const amount = Number(deposit.amount || 0)
  const hasJournalLink = Boolean(getRelationshipId(deposit.postedJournalEntry))
  const notes = String(deposit.notes || '').trim()

  return {
    id,
    depositNumber: String(deposit.depositNumber || ''),
    depositDate: deposit.depositDate || null,
    depositDateLabel: formatDate(deposit.depositDate),
    bankAccountId: String(getRelationshipId(deposit.bankAccount) || ''),
    bankAccountLabel: formatBankAccountLabel(deposit.bankAccount) || '-',
    bankAccountType:
      typeof deposit.bankAccount === 'object' && deposit.bankAccount ? String(deposit.bankAccount.accountType || '') : '',
    bankAccountCurrency,
    sourceAccountId: String(getRelationshipId(deposit.sourceAccount) || ''),
    sourceAccountLabel: formatSourceAccountLabel(deposit.sourceAccount) || '-',
    sourceAccountType:
      typeof deposit.sourceAccount === 'object' && deposit.sourceAccount ? String(deposit.sourceAccount.accountType || '') : '',
    amount,
    amountLabel: formatCurrency(amount, bankAccountCurrency),
    status,
    statusLabel: statusLabelMap.get(status) || 'Unknown',
    statusTone: getStatusTone(status),
    postedJournalEntryId: String(getRelationshipId(deposit.postedJournalEntry) || ''),
    postedJournalEntryLabel: formatJournalLabel(deposit.postedJournalEntry),
    notes,
    preparedByLabel: formatUserLabel(deposit.createdBy) || '-',
    updatedByLabel: formatUserLabel(deposit.updatedBy) || '-',
    createdAt: deposit.createdAt || null,
    updatedAt: deposit.updatedAt || null,
    hasJournalLink,
    hasNotes: Boolean(notes),
    isDraft: status === 'draft',
    isPosted: status === 'posted',
    isVoided: status === 'voided',
    isToday: isSameDayAsToday(deposit.depositDate),
    searchableText: normalizeSearch(
      [
        deposit.depositNumber,
        formatBankAccountLabel(deposit.bankAccount),
        formatSourceAccountLabel(deposit.sourceAccount),
        deposit.notes,
        formatUserLabel(deposit.createdBy),
        formatUserLabel(deposit.updatedBy),
      ].join(' '),
    ),
    cells: [
      { text: String(deposit.depositNumber || '-'), emphasis: true },
      formatDate(deposit.depositDate),
      formatBankAccountLabel(deposit.bankAccount) || '-',
      formatSourceAccountLabel(deposit.sourceAccount) || '-',
      { text: formatCurrency(amount, bankAccountCurrency), emphasis: true, align: 'right' },
      { text: statusLabelMap.get(status) || 'Unknown', tone: getStatusTone(status) },
    ],
  }
}

const matchesQuickFilter = (row: DepositRow, quickFilter: string) => {
  switch (quickFilter) {
    case 'status:draft':
      return row.isDraft
    case 'status:posted':
      return row.isPosted
    case 'coverage:with_journal':
      return row.hasJournalLink
    case 'coverage:with_notes':
      return row.hasNotes
    case 'timing:today':
      return row.isToday
    default:
      return false
  }
}

export const matchesDepositFilters = (
  row: DepositRow,
  filters: {
    statuses: string[]
    bankAccounts: string[]
    coverageStates: string[]
    quickFilters: string[]
  },
) => {
  const predicates = [
    ...filters.statuses.map((status) => row.status === status),
    ...filters.bankAccounts.map((bankAccountId) => row.bankAccountId === bankAccountId),
    ...filters.coverageStates.map((coverage) =>
      coverage === 'with_journal'
        ? row.hasJournalLink
        : coverage === 'without_journal'
          ? !row.hasJournalLink
          : coverage === 'with_notes'
            ? row.hasNotes
            : coverage === 'today'
              ? row.isToday
              : false,
    ),
    ...filters.quickFilters.map((quickFilter) => matchesQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) return true
  return predicates.some(Boolean)
}

export const buildDepositMetrics = (rows: DepositRow[]) => [
  {
    id: 'open-deposit-batches',
    label: 'Open Deposit Batches',
    value: rows.filter((row) => row.isDraft).length,
    change: `${rows.filter((row) => row.isToday && row.isDraft).length} prepared today`,
    trend: 'neutral' as const,
  },
  {
    id: 'draft-amount',
    label: 'Draft Deposit Amount',
    value: formatCurrency(rows.filter((row) => row.isDraft).reduce((sum, row) => sum + row.amount, 0)),
    change: `${rows.filter((row) => row.isDraft).length} draft batch${rows.filter((row) => row.isDraft).length === 1 ? '' : 'es'}`,
    trend: 'up' as const,
  },
  {
    id: 'posted-today',
    label: 'Posted Today',
    value: rows.filter((row) => row.isPosted && row.isToday).length,
    change: formatCurrency(rows.filter((row) => row.isPosted && row.isToday).reduce((sum, row) => sum + row.amount, 0)),
    trend: 'up' as const,
  },
  {
    id: 'journal-linked',
    label: 'Journal Linked',
    value: rows.filter((row) => row.hasJournalLink).length,
    change: `${rows.filter((row) => row.hasNotes).length} with notes`,
    trend: 'neutral' as const,
  },
]

export const buildDepositReferenceData = async (payload: Payload) => {
  const [bankAccounts, sourceAccounts] = await Promise.all([
    findAllDocs<{
      id: number | string
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
      isActive?: boolean | null
    }>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
      depth: 2,
      where: {
        isActive: {
          not_equals: false,
        },
      },
      sort: 'accountName',
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
        isActive: {
          not_equals: false,
        },
      },
      sort: 'code',
    }),
  ])

  return {
    bankAccounts: bankAccounts
      .filter((bankAccount) => String(bankAccount.accountType || '') === 'bank')
      .map((bankAccount) => ({
        id: bankAccount.id,
        accountName: bankAccount.accountName || null,
        bankName: bankAccount.bankName || null,
        accountNumberMasked: bankAccount.accountNumberMasked || null,
        accountType: bankAccount.accountType || null,
        currency: bankAccount.currencyReference?.code || null,
        ledgerAccountCode: bankAccount.ledgerAccount?.code || null,
        ledgerAccountName: bankAccount.ledgerAccount?.name || null,
        isActive: bankAccount.isActive !== false,
      })),
    sourceAccounts: sourceAccounts.map((account) => ({
      id: account.id,
      code: account.code || null,
      name: account.name || null,
      accountType: account.accountType || null,
      accountSubType: account.accountSubType || null,
      isActive: account.isActive !== false,
    })),
  }
}

export const buildDepositDetailResponse = async (payload: Payload, deposit: DepositDoc): Promise<DepositDetail> => {
  const row = buildDepositRow(deposit)
  const canEdit = row.isDraft
  const canDelete = row.isDraft
  const canPost = row.isDraft && Boolean(row.bankAccountId) && Boolean(row.sourceAccountId) && row.amount > 0

  return {
    ...row,
    bankLedgerAccountLabel: formatLedgerAccountLabel(deposit.bankAccount) || '-',
    usageSummary: {
      canEdit,
      canDelete,
      canPost,
      deleteBlockedReason: canDelete ? null : 'Posted or voided deposits cannot be deleted.',
      postBlockedReason: canPost ? null : row.isPosted ? 'This deposit is already posted.' : row.isVoided ? 'Voided deposits cannot be posted.' : 'Complete the draft deposit before posting.',
    },
  }
}

export const normalizeDepositMutationBody = (value: Record<string, unknown>): DepositMutationBody => ({
  depositNumber: normalizeOptionalString(value.depositNumber),
  depositDate: normalizeDateValue(value.depositDate),
  bankAccount: normalizeRelationshipId(value.bankAccount),
  sourceAccount: normalizeRelationshipId(value.sourceAccount),
  amount: normalizeAmount(value.amount),
  notes: normalizeOptionalString(value.notes),
})

export const buildDepositPersistenceData = (
  body: DepositMutationBody,
): DepositPersistedMutationBody => ({
  depositNumber: body.depositNumber,
  depositDate: body.depositDate,
  bankAccount: body.bankAccount,
  sourceAccount: body.sourceAccount,
  amount: body.amount === null ? 0 : body.amount,
  notes: body.notes,
})

export const assertDepositMutationPayload = async (
  payload: Payload,
  body: DepositMutationBody,
) => {
  if (!body.depositDate) {
    throw new AccountingApiError('Deposit date is required.', 400)
  }

  if (!body.bankAccount) {
    throw new AccountingApiError('Bank account is required.', 400)
  }

  if (!body.sourceAccount) {
    throw new AccountingApiError('Source account is required.', 400)
  }

  if (!body.amount || Number(body.amount) <= 0) {
    throw new AccountingApiError('Amount must be greater than zero.', 400)
  }

  const [bankAccount, sourceAccount] = await Promise.all([
    payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
      id: body.bankAccount,
      depth: 0,
      overrideAccess: true,
    }).catch(() => null),
    payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      id: body.sourceAccount,
      depth: 0,
      overrideAccess: true,
    }).catch(() => null),
  ])

  if (!bankAccount) {
    throw new AccountingApiError('Selected bank account does not exist.', 400)
  }

  if (String((bankAccount as { accountType?: string | null }).accountType || '') !== 'bank') {
    throw new AccountingApiError('Deposits must be posted into a bank-type account.', 400)
  }

  if (!sourceAccount) {
    throw new AccountingApiError('Selected source account does not exist.', 400)
  }
}
