import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { parseNumberParam, AccountingApiError } from '../../../_utils/auth'

type StatusTone = 'amber' | 'blue' | 'gray' | 'green' | 'red'

const importStatusOptions = [
  { label: 'Queued', value: 'queued' },
  { label: 'Imported', value: 'imported' },
  { label: 'Partial Import', value: 'partial_import' },
  { label: 'Parse Error', value: 'parse_error' },
  { label: 'Needs Re-upload', value: 'reupload_required' },
] as const

const sourceFormatOptions = [
  { label: 'CSV', value: 'csv' },
  { label: 'Excel', value: 'xlsx' },
  { label: 'OFX', value: 'ofx' },
  { label: 'PDF', value: 'pdf' },
  { label: 'Other', value: 'other' },
] as const

const importStatusLabelMap = new Map<string, string>(importStatusOptions.map((option) => [option.value, option.label]))
const sourceFormatLabelMap = new Map<string, string>(sourceFormatOptions.map((option) => [option.value, option.label]))

export type StatementImportCell =
  | string
  | {
      text: string
      tone?: StatusTone
      emphasis?: boolean
      align?: 'left' | 'right' | 'center'
    }

type RelatedUser =
  | {
      id?: number | string
      email?: string | null
      firstName?: string | null
      lastName?: string | null
    }
  | number
  | string
  | null

type RelatedMedia =
  | {
      id?: number | string
      filename?: string | null
      mimeType?: string | null
      filesize?: number | null
      alt?: string | null
      url?: string | null
    }
  | number
  | string
  | null

type RelatedBankAccount =
  | {
      id?: number | string
      accountName?: string | null
      bankName?: string | null
      accountNumberMasked?: string | null
      accountType?: string | null
      currencyReference?: {
        code?: string | null
      } | null
      ledgerAccount?: {
        code?: string | null
        name?: string | null
      } | null
    }
  | number
  | string
  | null

export type StatementImportDoc = {
  id: number | string
  importBatchNumber?: string | null
  bankAccount?: RelatedBankAccount
  statementFile?: RelatedMedia
  statementDateFrom?: string | null
  statementDateTo?: string | null
  sourceFormat?: string | null
  importStatus?: string | null
  totalLines?: number | null
  importedLines?: number | null
  failedLines?: number | null
  duplicateLines?: number | null
  importedTransactionCount?: number | null
  uploadedBy?: RelatedUser
  importedBy?: RelatedUser
  importedAt?: string | null
  parseErrorSummary?: string | null
  notes?: string | null
  metadata?: Record<string, unknown> | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type StatementImportRow = {
  id: string
  importBatchNumber: string
  bankAccountId: string
  bankAccountLabel: string
  sourceFormat: string
  sourceFormatLabel: string
  importStatus: string
  importStatusLabel: string
  importStatusTone: StatusTone
  statementFileId: string
  statementFilename: string
  statementFileUrl: string
  statementDateFrom: string | null
  statementDateTo: string | null
  statementDateRangeLabel: string
  uploadedAt: string | null
  uploadedAtLabel: string
  uploadedByLabel: string
  importedAt: string | null
  importedAtLabel: string
  importedByLabel: string
  totalLines: number
  importedLines: number
  failedLines: number
  duplicateLines: number
  importedTransactionCount: number
  parseErrorSummary: string
  notes: string
  hasErrors: boolean
  hasImportedTransactions: boolean
  requiresFollowUp: boolean
  searchableText: string
  cells: StatementImportCell[]
}

export type StatementImportDetail = StatementImportRow & {
  statementFile: {
    id: string
    filename: string
    url: string
    mimeType: string
    filesize: number
    alt: string
  } | null
  bankLedgerAccountLabel: string
  bankAccountType: string
  currency: string
  metadata: Record<string, unknown> | null
  createdAt: string | null
  updatedAt: string | null
  usageSummary: {
    canEdit: boolean
    canDelete: boolean
    canRetry: boolean
  }
}

export type StatementImportMutationBody = {
  importBatchNumber?: string | null
  bankAccount?: number | string | null
  statementFile?: number | string | null
  statementDateFrom?: string | null
  statementDateTo?: string | null
  sourceFormat?: string | null
  importStatus?: string | null
  totalLines?: number
  importedLines?: number
  failedLines?: number
  duplicateLines?: number
  importedTransactionCount?: number
  parseErrorSummary?: string | null
  notes?: string | null
  metadata?: Record<string, unknown> | null
}

type StatementImportPersistedMutationBody = StatementImportMutationBody

const normalizeOptionalString = (value: unknown) => {
  if (value === undefined) return undefined
  if (value === null) return null
  const normalized = String(value).trim()
  return normalized || null
}

const normalizeNonNegativeNumber = (value: unknown) => {
  if (value === undefined) return undefined
  if (value === null || value === '') return 0
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error('Numeric import counts must be zero or greater.')
  }
  return parsed
}

const normalizeRelationshipId = (value: unknown) => {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  const normalized = String(value).trim()
  if (!normalized || normalized === 'null' || normalized === 'undefined') return null
  return parseNumberParam(normalized)
}

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

const formatDate = (value: string | null | undefined) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const formatDateRange = (fromValue: string | null | undefined, toValue: string | null | undefined) => {
  const fromLabel = formatDate(fromValue)
  const toLabel = formatDate(toValue)
  if (fromLabel === '-' && toLabel === '-') return '-'
  if (fromLabel !== '-' && toLabel !== '-') return `${fromLabel} to ${toLabel}`
  return fromLabel !== '-' ? fromLabel : toLabel
}

const formatRelativeAge = (value: string | null | undefined) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  const diffMs = Math.max(0, Date.now() - date.getTime())
  const totalMinutes = Math.floor(diffMs / 60000)
  if (totalMinutes < 60) return `${totalMinutes} min`
  const totalHours = Math.floor(totalMinutes / 60)
  if (totalHours < 24) return `${totalHours} hr`
  const totalDays = Math.floor(totalHours / 24)
  return `${totalDays} day`
}

const getStatusTone = (status: string | null | undefined): StatusTone => {
  switch (String(status || '')) {
    case 'imported':
      return 'green'
    case 'partial_import':
      return 'amber'
    case 'parse_error':
      return 'red'
    case 'reupload_required':
      return 'amber'
    default:
      return 'blue'
  }
}

const formatUserLabel = (value: RelatedUser) => {
  if (typeof value === 'object' && value) {
    const firstName = String(value.firstName || '').trim()
    const lastName = String(value.lastName || '').trim()
    const name = [firstName, lastName].filter(Boolean).join(' ').trim()
    return name || String(value.email || '').trim() || '-'
  }
  return '-'
}

const formatBankAccountLabel = (bankAccount: RelatedBankAccount) => {
  if (typeof bankAccount === 'object' && bankAccount) {
    const suffix = bankAccount.accountNumberMasked ? ` (${bankAccount.accountNumberMasked})` : ''
    return `${bankAccount.accountName || bankAccount.bankName || 'Unnamed bank account'}${suffix}`
  }

  return ''
}

const formatLedgerAccountLabel = (bankAccount: RelatedBankAccount) => {
  if (typeof bankAccount === 'object' && bankAccount?.ledgerAccount) {
    const code = String(bankAccount.ledgerAccount.code || '').trim()
    const name = String(bankAccount.ledgerAccount.name || '').trim()
    if (code && name) return `${code} - ${name}`
    return code || name || ''
  }

  return ''
}

const formatMediaFilename = (statementFile: RelatedMedia) => {
  if (typeof statementFile === 'object' && statementFile) {
    return String(statementFile.filename || '').trim() || 'Unnamed file'
  }
  return 'No file'
}

const formatMediaUrl = (statementFile: RelatedMedia) => {
  if (typeof statementFile === 'object' && statementFile) {
    return String(statementFile.url || '').trim()
  }
  return ''
}

const isRetryableStatus = (status: string) => ['parse_error', 'reupload_required'].includes(status)

export const buildStatementImportRow = (statementImport: StatementImportDoc): StatementImportRow => {
  const id = String(statementImport.id)
  const importBatchNumber = String(statementImport.importBatchNumber || '')
  const bankAccountLabel = formatBankAccountLabel(statementImport.bankAccount)
  const sourceFormat = String(statementImport.sourceFormat || 'csv')
  const importStatus = String(statementImport.importStatus || 'queued')
  const statementFilename = formatMediaFilename(statementImport.statementFile)
  const statementFileUrl = formatMediaUrl(statementImport.statementFile)
  const totalLines = Number(statementImport.totalLines || 0)
  const importedLines = Number(statementImport.importedLines || 0)
  const failedLines = Number(statementImport.failedLines || 0)
  const duplicateLines = Number(statementImport.duplicateLines || 0)
  const importedTransactionCount = Number(statementImport.importedTransactionCount || 0)
  const parseErrorSummary = String(statementImport.parseErrorSummary || '')
  const notes = String(statementImport.notes || '')
  const hasErrors = failedLines > 0 || Boolean(parseErrorSummary)
  const hasImportedTransactions = importedTransactionCount > 0 || importedLines > 0
  const requiresFollowUp = isRetryableStatus(importStatus) || hasErrors

  return {
    id,
    importBatchNumber,
    bankAccountId: String(getRelationshipId(statementImport.bankAccount) || ''),
    bankAccountLabel,
    sourceFormat,
    sourceFormatLabel: sourceFormatLabelMap.get(sourceFormat) || 'Other',
    importStatus,
    importStatusLabel: importStatusLabelMap.get(importStatus) || 'Queued',
    importStatusTone: getStatusTone(importStatus),
    statementFileId: String(getRelationshipId(statementImport.statementFile) || ''),
    statementFilename,
    statementFileUrl,
    statementDateFrom: statementImport.statementDateFrom || null,
    statementDateTo: statementImport.statementDateTo || null,
    statementDateRangeLabel: formatDateRange(statementImport.statementDateFrom, statementImport.statementDateTo),
    uploadedAt: statementImport.createdAt || null,
    uploadedAtLabel: formatDateTime(statementImport.createdAt),
    uploadedByLabel: formatUserLabel(statementImport.uploadedBy),
    importedAt: statementImport.importedAt || null,
    importedAtLabel: formatDateTime(statementImport.importedAt),
    importedByLabel: formatUserLabel(statementImport.importedBy),
    totalLines,
    importedLines,
    failedLines,
    duplicateLines,
    importedTransactionCount,
    parseErrorSummary,
    notes,
    hasErrors,
    hasImportedTransactions,
    requiresFollowUp,
    searchableText: buildSearchableText([
      importBatchNumber,
      bankAccountLabel,
      statementFilename,
      statementImport.createdAt,
      statementImport.importedAt,
      parseErrorSummary,
      notes,
      statementImport.uploadedBy && formatUserLabel(statementImport.uploadedBy),
    ]),
    cells: [
      statementImport.createdAt ? formatDateTime(statementImport.createdAt) : '-',
      { text: statementFilename, emphasis: true },
      bankAccountLabel || '-',
      `${totalLines} lines`,
      formatUserLabel(statementImport.uploadedBy),
      { text: importStatusLabelMap.get(importStatus) || 'Queued', tone: getStatusTone(importStatus) },
    ],
  }
}

export const matchesStatementImportFilters = (
  row: StatementImportRow,
  filters: {
    statuses: string[]
    bankAccounts: string[]
    coverageStates: string[]
    quickFilters: string[]
  },
) => {
  const quickPredicates = filters.quickFilters.map((quickFilter) => {
    const [group, value] = quickFilter.split(':')
    if (group === 'status') return row.importStatus === value
    if (group === 'coverage' && value === 'with_errors') return row.hasErrors
    if (group === 'coverage' && value === 'with_imported_transactions') return row.hasImportedTransactions
    return false
  })

  const predicates = [
    ...filters.statuses.map((status) => row.importStatus === status),
    ...filters.bankAccounts.map((bankAccountId) => row.bankAccountId === bankAccountId),
    ...filters.coverageStates.map((coverageState) =>
      coverageState === 'with_errors'
        ? row.hasErrors
        : coverageState === 'with_imported_transactions'
          ? row.hasImportedTransactions
          : coverageState === 'requires_follow_up'
            ? row.requiresFollowUp
            : false,
    ),
    ...quickPredicates,
  ]

  if (predicates.length === 0) return true
  return predicates.some(Boolean)
}

const isToday = (value: string | null | undefined) => {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export const buildStatementImportMetrics = (rows: StatementImportRow[]) => {
  const pendingRows = rows.filter((row) => ['queued', 'reupload_required'].includes(row.importStatus))
  const failedRows = rows.filter((row) => ['parse_error', 'reupload_required'].includes(row.importStatus))
  const oldestPending = pendingRows
    .map((row) => row.uploadedAt)
    .filter((value): value is string => Boolean(value))
    .sort()[0]

  return [
    {
      id: 'statement-imports-queue',
      label: 'Files In Queue',
      value: pendingRows.length,
      change: pendingRows.length > 0 ? `${pendingRows.length} still waiting action` : 'No queued files right now',
      trend: 'neutral' as const,
    },
    {
      id: 'statement-imports-imported',
      label: 'Imported Today',
      value: rows.filter((row) => ['imported', 'partial_import'].includes(row.importStatus) && isToday(row.importedAt || row.uploadedAt)).length,
      change: `${rows.reduce((total, row) => total + row.importedLines, 0)} imported lines in filtered view`,
      trend: 'up' as const,
    },
    {
      id: 'statement-imports-failed',
      label: 'Failed Imports',
      value: failedRows.length,
      change: failedRows.length > 0 ? 'Needs review or re-upload' : 'No failed imports in filtered view',
      trend: failedRows.length > 0 ? ('down' as const) : ('up' as const),
    },
    {
      id: 'statement-imports-oldest',
      label: 'Oldest Pending File',
      value: oldestPending ? formatRelativeAge(oldestPending) : '-',
      change: oldestPending ? `Uploaded ${formatDateTime(oldestPending)}` : 'No pending imports',
      trend: oldestPending ? ('neutral' as const) : ('up' as const),
    },
  ]
}

export const buildStatementImportReferenceData = async (payload: Payload) => {
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
      isActive: bankAccount.isActive !== false,
    })),
    sourceFormats: sourceFormatOptions.map((option) => ({ label: option.label, value: option.value })),
    importStatuses: importStatusOptions.map((option) => ({ label: option.label, value: option.value })),
  }
}

export const buildStatementImportDetailResponse = async (
  _payload: Payload,
  statementImport: StatementImportDoc,
): Promise<StatementImportDetail> => {
  const row = buildStatementImportRow(statementImport)
  const bankAccountCurrency =
    typeof statementImport.bankAccount === 'object' && statementImport.bankAccount
      ? String(statementImport.bankAccount.currencyReference?.code || 'PHP')
      : 'PHP'

  return {
    ...row,
    statementFile:
      typeof statementImport.statementFile === 'object' && statementImport.statementFile
        ? {
            id: String(statementImport.statementFile.id || ''),
            filename: String(statementImport.statementFile.filename || ''),
            url: String(statementImport.statementFile.url || ''),
            mimeType: String(statementImport.statementFile.mimeType || ''),
            filesize: Number(statementImport.statementFile.filesize || 0),
            alt: String(statementImport.statementFile.alt || ''),
          }
        : null,
    bankLedgerAccountLabel: formatLedgerAccountLabel(statementImport.bankAccount) || '-',
    bankAccountType:
      typeof statementImport.bankAccount === 'object' && statementImport.bankAccount
        ? String(statementImport.bankAccount.accountType || '')
        : '',
    currency: bankAccountCurrency,
    metadata: statementImport.metadata || null,
    createdAt: statementImport.createdAt || null,
    updatedAt: statementImport.updatedAt || null,
    usageSummary: {
      canEdit: true,
      canDelete: true,
      canRetry: isRetryableStatus(row.importStatus),
    },
  }
}

export const normalizeStatementImportMutationBody = (
  body: Record<string, unknown>,
): StatementImportMutationBody => ({
  importBatchNumber: normalizeOptionalString(body.importBatchNumber),
  bankAccount: normalizeRelationshipId(body.bankAccount),
  statementFile: normalizeRelationshipId(body.statementFile),
  statementDateFrom: normalizeOptionalString(body.statementDateFrom),
  statementDateTo: normalizeOptionalString(body.statementDateTo),
  sourceFormat: normalizeOptionalString(body.sourceFormat),
  importStatus: normalizeOptionalString(body.importStatus),
  totalLines: normalizeNonNegativeNumber(body.totalLines),
  importedLines: normalizeNonNegativeNumber(body.importedLines),
  failedLines: normalizeNonNegativeNumber(body.failedLines),
  duplicateLines: normalizeNonNegativeNumber(body.duplicateLines),
  importedTransactionCount: normalizeNonNegativeNumber(body.importedTransactionCount),
  parseErrorSummary: normalizeOptionalString(body.parseErrorSummary),
  notes: normalizeOptionalString(body.notes),
  metadata:
    body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)
      ? (body.metadata as Record<string, unknown>)
      : body.metadata === null
        ? null
        : undefined,
})

export const buildStatementImportPersistenceData = (
  body: StatementImportMutationBody,
): StatementImportPersistedMutationBody => ({
  importBatchNumber: body.importBatchNumber,
  bankAccount: body.bankAccount,
  statementFile: body.statementFile,
  statementDateFrom: body.statementDateFrom,
  statementDateTo: body.statementDateTo,
  sourceFormat: body.sourceFormat,
  importStatus: body.importStatus,
  totalLines: body.totalLines,
  importedLines: body.importedLines,
  failedLines: body.failedLines,
  duplicateLines: body.duplicateLines,
  importedTransactionCount: body.importedTransactionCount,
  parseErrorSummary: body.parseErrorSummary,
  notes: body.notes,
  metadata: body.metadata,
})

export const assertStatementImportMutationPayload = async (
  payload: Payload,
  body: StatementImportMutationBody,
) => {
  const bankAccountId = body.bankAccount
  const statementFileId = body.statementFile
  const importStatus = String(body.importStatus || 'queued')
  const sourceFormat = String(body.sourceFormat || 'csv')

  if (!bankAccountId) {
    throw new AccountingApiError('Bank account is required.', 400)
  }

  if (!statementFileId) {
    throw new AccountingApiError('Statement file is required.', 400)
  }

  if (!importStatusOptions.some((option) => option.value === importStatus)) {
    throw new AccountingApiError('Import status is invalid.', 400)
  }

  if (!sourceFormatOptions.some((option) => option.value === sourceFormat)) {
    throw new AccountingApiError('Source format is invalid.', 400)
  }

  const [bankAccount, statementFile] = await Promise.all([
    payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
      id: bankAccountId,
      depth: 0,
      overrideAccess: true,
    }) as Promise<any>,
    payload.findByID({
      collection: 'media',
      id: statementFileId,
      depth: 0,
      overrideAccess: true,
    }) as Promise<any>,
  ])

  if (!bankAccount) {
    throw new AccountingApiError('Selected bank account could not be found.', 404)
  }

  if (!['bank', 'cash_on_hand', 'undeposited_funds'].includes(String(bankAccount.accountType || ''))) {
    throw new AccountingApiError('Statement imports must link to a banking or cash account.', 400)
  }

  if (!statementFile) {
    throw new AccountingApiError('Selected statement file could not be found.', 404)
  }

  if (body.statementDateFrom && body.statementDateTo) {
    const from = new Date(body.statementDateFrom)
    const to = new Date(body.statementDateTo)
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new AccountingApiError('Statement period dates are invalid.', 400)
    }
    if (from.getTime() > to.getTime()) {
      throw new AccountingApiError('Statement period start cannot be after the end date.', 400)
    }
  }
}
