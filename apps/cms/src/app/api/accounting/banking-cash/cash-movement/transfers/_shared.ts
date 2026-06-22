import type { Payload } from 'payload'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  BANK_ACCOUNT_TYPE_OPTIONS,
  SIMPLE_POSTING_STATUS_OPTIONS,
} from '@/accounting/constants/accounting'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { AccountingApiError, parseNumberParam } from '../../../_utils/auth'

type StatusTone = 'amber' | 'blue' | 'gray' | 'green' | 'red'

export type TransferCell =
  | string
  | {
      text: string
      tone?: StatusTone
      emphasis?: boolean
      align?: 'left' | 'right' | 'center'
    }

type BankAccountRelationship =
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
      isActive?: boolean | null
    }
  | number
  | string
  | null

export type TransferDoc = {
  id: number | string
  transferNumber?: string | null
  transferDate?: string | null
  fromBankAccount?: BankAccountRelationship
  toBankAccount?: BankAccountRelationship
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

export type TransferRow = {
  id: string
  transferNumber: string
  transferDate: string | null
  transferDateLabel: string
  fromBankAccountId: string
  fromBankAccountLabel: string
  fromBankAccountType: string
  fromBankAccountCurrency: string
  toBankAccountId: string
  toBankAccountLabel: string
  toBankAccountType: string
  toBankAccountCurrency: string
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
  involvesUndepositedFunds: boolean
  isBankToBank: boolean
  isDraft: boolean
  isPosted: boolean
  isVoided: boolean
  isToday: boolean
  searchableText: string
  cells: TransferCell[]
}

export type TransferDetail = TransferRow & {
  fromLedgerAccountLabel: string
  toLedgerAccountLabel: string
  usageSummary: {
    canEdit: boolean
    canDelete: boolean
    canPost: boolean
    deleteBlockedReason: string | null
    postBlockedReason: string | null
  }
}

export type TransferMutationBody = {
  transferNumber?: string | null
  transferDate?: string | null
  fromBankAccount?: string | number | null
  toBankAccount?: string | number | null
  amount?: number | null
  notes?: string | null
}

type TransferPersistedMutationBody = {
  transferNumber?: string | null
  transferDate?: string | null
  fromBankAccount?: string | number | null
  toBankAccount?: string | number | null
  amount?: number
  notes?: string | null
}

const statusLabelMap = new Map(SIMPLE_POSTING_STATUS_OPTIONS.map((option) => [String(option.value), option.label]))
const bankAccountTypeLabelMap = new Map(BANK_ACCOUNT_TYPE_OPTIONS.map((option) => [String(option.value), option.label]))

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

const formatUserLabel = (value: TransferDoc['createdBy'] | TransferDoc['updatedBy']) => {
  if (typeof value === 'object' && value) return String(value.name || value.email || '')
  return ''
}

const formatBankAccountLabel = (value: BankAccountRelationship | undefined) => {
  if (typeof value === 'object' && value) {
    const suffix = value.accountNumberMasked ? ` (${value.accountNumberMasked})` : ''
    return `${value.accountName || value.bankName || 'Unnamed account'}${suffix}`
  }
  return ''
}

const formatJournalLabel = (value: TransferDoc['postedJournalEntry']) => {
  if (typeof value === 'object' && value) return String(value.entryNumber || value.referenceNumber || `Journal ${value.id || ''}`).trim()
  if (value) return `Journal ${String(value)}`
  return 'Not Linked'
}

const formatLedgerAccountLabel = (value: BankAccountRelationship | undefined) => {
  if (typeof value === 'object' && value?.ledgerAccount) {
    const code = String(value.ledgerAccount.code || '').trim()
    const name = String(value.ledgerAccount.name || '').trim()
    if (code && name) return `${code} - ${name}`
    return code || name || ''
  }
  return ''
}

const getBankAccountCurrency = (value: BankAccountRelationship | undefined) =>
  typeof value === 'object' && value ? String(value.currencyReference?.code || 'PHP') : 'PHP'

const getBankAccountType = (value: BankAccountRelationship | undefined) =>
  typeof value === 'object' && value ? String(value.accountType || '') : ''

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

export const buildTransferRow = (transfer: TransferDoc): TransferRow => {
  const id = String(transfer.id)
  const status = String(transfer.status || 'draft')
  const amount = Number(transfer.amount || 0)
  const fromType = getBankAccountType(transfer.fromBankAccount)
  const toType = getBankAccountType(transfer.toBankAccount)
  const involvesUndepositedFunds = fromType === 'undeposited_funds' || toType === 'undeposited_funds'
  const isBankToBank = fromType === 'bank' && toType === 'bank'
  const hasJournalLink = Boolean(getRelationshipId(transfer.postedJournalEntry))
  const notes = String(transfer.notes || '').trim()

  return {
    id,
    transferNumber: String(transfer.transferNumber || ''),
    transferDate: transfer.transferDate || null,
    transferDateLabel: formatDate(transfer.transferDate),
    fromBankAccountId: String(getRelationshipId(transfer.fromBankAccount) || ''),
    fromBankAccountLabel: formatBankAccountLabel(transfer.fromBankAccount) || '-',
    fromBankAccountType: fromType,
    fromBankAccountCurrency: getBankAccountCurrency(transfer.fromBankAccount),
    toBankAccountId: String(getRelationshipId(transfer.toBankAccount) || ''),
    toBankAccountLabel: formatBankAccountLabel(transfer.toBankAccount) || '-',
    toBankAccountType: toType,
    toBankAccountCurrency: getBankAccountCurrency(transfer.toBankAccount),
    amount,
    amountLabel: formatCurrency(amount, getBankAccountCurrency(transfer.toBankAccount)),
    status,
    statusLabel: statusLabelMap.get(status) || 'Unknown',
    statusTone: getStatusTone(status),
    postedJournalEntryId: String(getRelationshipId(transfer.postedJournalEntry) || ''),
    postedJournalEntryLabel: formatJournalLabel(transfer.postedJournalEntry),
    notes,
    preparedByLabel: formatUserLabel(transfer.createdBy) || '-',
    updatedByLabel: formatUserLabel(transfer.updatedBy) || '-',
    createdAt: transfer.createdAt || null,
    updatedAt: transfer.updatedAt || null,
    hasJournalLink,
    hasNotes: Boolean(notes),
    involvesUndepositedFunds,
    isBankToBank,
    isDraft: status === 'draft',
    isPosted: status === 'posted',
    isVoided: status === 'voided',
    isToday: isSameDayAsToday(transfer.transferDate),
    searchableText: normalizeSearch(
      [
        transfer.transferNumber,
        formatBankAccountLabel(transfer.fromBankAccount),
        bankAccountTypeLabelMap.get(fromType),
        formatBankAccountLabel(transfer.toBankAccount),
        bankAccountTypeLabelMap.get(toType),
        transfer.notes,
        formatUserLabel(transfer.createdBy),
        formatUserLabel(transfer.updatedBy),
      ].join(' '),
    ),
    cells: [
      { text: String(transfer.transferNumber || '-'), emphasis: true },
      formatDate(transfer.transferDate),
      formatBankAccountLabel(transfer.fromBankAccount) || '-',
      formatBankAccountLabel(transfer.toBankAccount) || '-',
      { text: formatCurrency(amount, getBankAccountCurrency(transfer.toBankAccount)), emphasis: true, align: 'right' },
      { text: statusLabelMap.get(status) || 'Unknown', tone: getStatusTone(status) },
    ],
  }
}

const matchesQuickFilter = (row: TransferRow, quickFilter: string) => {
  switch (quickFilter) {
    case 'status:draft':
      return row.isDraft
    case 'status:posted':
      return row.isPosted
    case 'coverage:undeposited':
      return row.involvesUndepositedFunds
    case 'coverage:bank_to_bank':
      return row.isBankToBank
    case 'coverage:with_journal':
      return row.hasJournalLink
    case 'timing:today':
      return row.isToday
    default:
      return false
  }
}

export const matchesTransferFilters = (
  row: TransferRow,
  filters: {
    statuses: string[]
    bankAccounts: string[]
    coverageStates: string[]
    quickFilters: string[]
  },
) => {
  const predicates = [
    ...filters.statuses.map((status) => row.status === status),
    ...filters.bankAccounts.map((bankAccountId) => row.fromBankAccountId === bankAccountId || row.toBankAccountId === bankAccountId),
    ...filters.coverageStates.map((coverage) =>
      coverage === 'with_journal'
        ? row.hasJournalLink
        : coverage === 'without_journal'
          ? !row.hasJournalLink
          : coverage === 'undeposited'
            ? row.involvesUndepositedFunds
            : coverage === 'bank_to_bank'
              ? row.isBankToBank
              : coverage === 'today'
                ? row.isToday
                : false,
    ),
    ...filters.quickFilters.map((quickFilter) => matchesQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) return true
  return predicates.some(Boolean)
}

export const buildTransferMetrics = (rows: TransferRow[]) => [
  {
    id: 'pending-transfers',
    label: 'Pending Transfers',
    value: rows.filter((row) => row.isDraft).length,
    change: `${rows.filter((row) => row.isToday && row.isDraft).length} prepared today`,
    trend: 'neutral' as const,
  },
  {
    id: 'undeposited-moves',
    label: 'Undeposited Moves',
    value: formatCurrency(rows.filter((row) => row.involvesUndepositedFunds).reduce((sum, row) => sum + row.amount, 0)),
    change: `${rows.filter((row) => row.involvesUndepositedFunds).length} rows involve undeposited funds`,
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
    change: `${rows.filter((row) => row.isBankToBank).length} bank-to-bank moves`,
    trend: 'neutral' as const,
  },
]

export const buildTransferReferenceData = async (payload: Payload) => {
  const bankAccounts = await findAllDocs<{
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
      and: [
        {
          isActive: {
            not_equals: false,
          },
        },
        {
          or: [
            { accountType: { equals: 'bank' } },
            { accountType: { equals: 'cash_on_hand' } },
            { accountType: { equals: 'undeposited_funds' } },
          ],
        },
      ],
    },
    sort: 'accountName',
  })

  return {
    bankAccounts: bankAccounts.map((bankAccount) => ({
      id: bankAccount.id,
      accountName: bankAccount.accountName || null,
      bankName: bankAccount.bankName || null,
      accountNumberMasked: bankAccount.accountNumberMasked || null,
      accountType: bankAccount.accountType || null,
      accountTypeLabel: bankAccountTypeLabelMap.get(String(bankAccount.accountType || '')) || 'Unknown',
      currency: bankAccount.currencyReference?.code || null,
      ledgerAccountCode: bankAccount.ledgerAccount?.code || null,
      ledgerAccountName: bankAccount.ledgerAccount?.name || null,
      isActive: bankAccount.isActive !== false,
    })),
  }
}

export const buildTransferDetailResponse = async (payload: Payload, transfer: TransferDoc): Promise<TransferDetail> => {
  const row = buildTransferRow(transfer)
  const canEdit = row.isDraft
  const canDelete = row.isDraft
  const canPost = row.isDraft && Boolean(row.fromBankAccountId) && Boolean(row.toBankAccountId) && row.amount > 0

  return {
    ...row,
    fromLedgerAccountLabel: formatLedgerAccountLabel(transfer.fromBankAccount) || '-',
    toLedgerAccountLabel: formatLedgerAccountLabel(transfer.toBankAccount) || '-',
    usageSummary: {
      canEdit,
      canDelete,
      canPost,
      deleteBlockedReason: canDelete ? null : 'Posted or voided transfers cannot be deleted.',
      postBlockedReason: canPost ? null : row.isPosted ? 'This transfer is already posted.' : row.isVoided ? 'Voided transfers cannot be posted.' : 'Complete the draft transfer before posting.',
    },
  }
}

export const normalizeTransferMutationBody = (value: Record<string, unknown>): TransferMutationBody => ({
  transferNumber: normalizeOptionalString(value.transferNumber),
  transferDate: normalizeDateValue(value.transferDate),
  fromBankAccount: normalizeRelationshipId(value.fromBankAccount),
  toBankAccount: normalizeRelationshipId(value.toBankAccount),
  amount: normalizeAmount(value.amount),
  notes: normalizeOptionalString(value.notes),
})

export const buildTransferPersistenceData = (
  body: TransferMutationBody,
): TransferPersistedMutationBody => ({
  transferNumber: body.transferNumber,
  transferDate: body.transferDate,
  fromBankAccount: body.fromBankAccount,
  toBankAccount: body.toBankAccount,
  amount: body.amount === null ? 0 : body.amount,
  notes: body.notes,
})

export const assertTransferMutationPayload = async (payload: Payload, body: TransferMutationBody) => {
  if (!body.transferDate) throw new AccountingApiError('Transfer date is required.', 400)
  if (!body.fromBankAccount) throw new AccountingApiError('From account is required.', 400)
  if (!body.toBankAccount) throw new AccountingApiError('To account is required.', 400)
  if (String(body.fromBankAccount) === String(body.toBankAccount)) {
    throw new AccountingApiError('From account and to account must be different.', 400)
  }
  if (!body.amount || Number(body.amount) <= 0) throw new AccountingApiError('Amount must be greater than zero.', 400)

  const [fromBankAccount, toBankAccount] = await Promise.all([
    payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
      id: body.fromBankAccount,
      depth: 0,
      overrideAccess: true,
    }).catch(() => null),
    payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
      id: body.toBankAccount,
      depth: 0,
      overrideAccess: true,
    }).catch(() => null),
  ])

  if (!fromBankAccount) throw new AccountingApiError('Selected from account does not exist.', 400)
  if (!toBankAccount) throw new AccountingApiError('Selected to account does not exist.', 400)

  if (!['bank', 'cash_on_hand', 'undeposited_funds'].includes(String((fromBankAccount as { accountType?: string | null }).accountType || ''))) {
    throw new AccountingApiError('From account must be a bank, cash-on-hand, or undeposited-funds account.', 400)
  }
  if (!['bank', 'cash_on_hand', 'undeposited_funds'].includes(String((toBankAccount as { accountType?: string | null }).accountType || ''))) {
    throw new AccountingApiError('To account must be a bank, cash-on-hand, or undeposited-funds account.', 400)
  }
}
