import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS, JOURNAL_SOURCE_TYPE_OPTIONS, JOURNAL_STATUS_OPTIONS } from '../../constants/accounting'
import { findAllDocs } from '../../utils/findAllDocs'

type UserRef = { id: number | string } | number | string | null
type FiscalYearRef = { id: number | string; code?: string | null; name?: string | null } | number | string | null
type PeriodRef = { id: number | string; label?: string | null; periodNumber?: number | null } | number | string | null

type JournalEntryDoc = {
  id: number | string
  entryNumber?: string | null
  entryDate?: string | null
  postingDate?: string | null
  sourceType?: string | null
  sourceReference?: string | null
  memo?: string | null
  referenceNumber?: string | null
  status?: string | null
  postingStatus?: string | null
  totalDebit?: number | null
  totalCredit?: number | null
  isBalanced?: boolean | null
  fiscalYear?: FiscalYearRef
  period?: PeriodRef
  notes?: string | null
  createdBy?: UserRef
  updatedBy?: UserRef
  createdAt?: string | null
  updatedAt?: string | null
}

export type JournalEntriesRegisterQuery = {
  search?: string
  statuses?: string[]
  sourceTypes?: string[]
  isUnbalanced?: boolean
  page?: number
  limit?: number
}

export type JournalEntriesRegisterRow = {
  id: number | string
  entryNumber: string | null
  entryDate: string | null
  postingDate: string | null
  sourceType: string | null
  sourceTypeLabel: string | null
  sourceReference: string | null
  memo: string | null
  referenceNumber: string | null
  status: string | null
  statusLabel: string | null
  postingStatus: string | null
  postingStatusLabel: string | null
  totalDebit: number | null
  totalCredit: number | null
  isBalanced: boolean | null
  fiscalYearId: number | string | null
  fiscalYearCode: string | null
  periodId: number | string | null
  periodLabel: string | null
  createdBy: string | null
  updatedBy: string | null
  createdAt: string | null
  updatedAt: string | null
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>
}

type RegisterMetric = {
  id: string
  label: string
  value: number
  change: string
  trend: 'up' | 'down' | 'neutral'
}

type RegisterFilterOptions = {
  statuses: Array<{ label: string; value: string }>
  sourceTypes: Array<{ label: string; value: string }>
  quickFilters: Array<{ label: string; value: string }>
}

type RegisterPagination = {
  page: number
  limit: number
  totalDocs: number
  totalPages: number
  hasPrevPage: boolean
  hasNextPage: boolean
}

export type JournalEntriesRegisterResult = {
  rows: JournalEntriesRegisterRow[]
  metrics: RegisterMetric[]
  filterOptions: RegisterFilterOptions
  appliedFilters: { search: string; statuses: string[]; sourceTypes: string[]; isUnbalanced: boolean }
  pagination: RegisterPagination
  totals: { totalEntries: number; filteredEntries: number; draftEntries: number; postedEntries: number; unbalancedEntries: number }
}

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

const statusLabelMap = new Map<string, string>(
  JOURNAL_STATUS_OPTIONS.map((o) => [o.value, o.label]),
)

const sourceTypeLabelMap = new Map<string, string>(
  JOURNAL_SOURCE_TYPE_OPTIONS.map((o) => [o.value, o.label]),
)

const normalizeText = (value?: string | null) => String(value || '').trim()
const normalizeSearch = (value?: string | null) => normalizeText(value).toLowerCase()

const sanitizePage = (page?: number) => {
  if (!Number.isFinite(page)) return 1
  return Math.max(1, Math.trunc(page || 1))
}

const sanitizeLimit = (limit?: number) => {
  if (!Number.isFinite(limit)) return DEFAULT_LIMIT
  return Math.min(MAX_LIMIT, Math.max(1, Math.trunc(limit || DEFAULT_LIMIT)))
}

const resolveUser = (user: UserRef | undefined): string | null => {
  if (typeof user === 'object' && user !== null) {
    const u = user as Record<string, unknown>
    const firstName = typeof u.firstName === 'string' ? u.firstName.trim() : ''
    const lastName = typeof u.lastName === 'string' ? u.lastName.trim() : ''
    const middleName = typeof u.middleName === 'string' ? u.middleName.trim() : ''
    const parts = [firstName, middleName, lastName].filter(Boolean)
    return parts.length > 0 ? parts.join(' ') : String(u.id)
  }
  return user ? String(user) : null
}

const resolveFiscalYear = (fy: FiscalYearRef | undefined): { id: number | string | null; code: string | null } => {
  if (typeof fy === 'object' && fy !== null) {
    return { id: fy.id ?? null, code: fy.code || fy.name || null }
  }
  return { id: fy ?? null, code: null }
}

const resolvePeriod = (p: PeriodRef | undefined): { id: number | string | null; label: string | null } => {
  if (typeof p === 'object' && p !== null) {
    return { id: p.id ?? null, label: p.label || p.periodNumber != null ? `Period ${p.periodNumber}` : null }
  }
  return { id: p ?? null, label: null }
}

const mapJournalEntryRow = (doc: JournalEntryDoc): JournalEntriesRegisterRow => {
  const status = doc.status || null
  const statusLabel = status ? statusLabelMap.get(status) || status : null
  const sourceType = doc.sourceType || null
  const sourceTypeLabel = sourceType ? sourceTypeLabelMap.get(sourceType) || sourceType : null
  const postingStatus = doc.postingStatus || null
  const postingStatusLabel = postingStatus ? postingStatusLabelMap.get(postingStatus) || postingStatus : null
  const fy = resolveFiscalYear(doc.fiscalYear)
  const per = resolvePeriod(doc.period)
  return {
    id: doc.id,
    entryNumber: doc.entryNumber || null,
    entryDate: doc.entryDate || null,
    postingDate: doc.postingDate || null,
    sourceType,
    sourceTypeLabel,
    sourceReference: doc.sourceReference || null,
    memo: doc.memo || null,
    referenceNumber: doc.referenceNumber || null,
    status,
    statusLabel,
    postingStatus,
    postingStatusLabel,
    totalDebit: doc.totalDebit ?? null,
    totalCredit: doc.totalCredit ?? null,
    isBalanced: doc.isBalanced ?? null,
    fiscalYearId: fy.id,
    fiscalYearCode: fy.code,
    periodId: per.id,
    periodLabel: per.label,
    createdBy: resolveUser(doc.createdBy),
    updatedBy: resolveUser(doc.updatedBy),
    createdAt: doc.createdAt || null,
    updatedAt: doc.updatedAt || null,
    cells: [
      { text: doc.entryNumber || '-', emphasis: true },
      doc.postingDate ? new Date(doc.postingDate).toLocaleDateString() : '-',
      sourceTypeLabel || '-',
      doc.memo || '-',
      doc.totalDebit != null ? `PHP ${Number(doc.totalDebit).toLocaleString()}` : 'PHP 0',
      doc.totalCredit != null ? `PHP ${Number(doc.totalCredit).toLocaleString()}` : 'PHP 0',
      doc.isBalanced ? 'Yes' : 'No',
      {
        text: statusLabel || '-',
        tone: status === 'draft' ? 'amber' as const : status === 'posted' ? 'green' as const : status === 'reversed' ? 'gray' as const : 'gray' as const,
      },
    ],
  }
}

const postingStatusLabelMap = new Map<string, string>([
  ['unposted', 'Unposted'],
  ['posted', 'Posted'],
  ['reversed', 'Reversed'],
  ['voided', 'Voided'],
])

const matchesSearch = (row: JournalEntriesRegisterRow, search: string) => {
  if (!search) return true
  return [row.entryNumber, row.sourceReference, row.memo, row.referenceNumber, row.sourceTypeLabel, row.statusLabel, row.fiscalYearCode]
    .some((v) => normalizeSearch(v).includes(search))
}

const matchesStatuses = (row: JournalEntriesRegisterRow, statuses: string[]) => {
  if (!statuses.length) return true
  return Boolean(row.status && statuses.includes(row.status))
}

const matchesSourceTypes = (row: JournalEntriesRegisterRow, sourceTypes: string[]) => {
  if (!sourceTypes.length) return true
  return Boolean(row.sourceType && sourceTypes.includes(row.sourceType))
}

const sortEntries = (docs: JournalEntryDoc[]) =>
  [...docs].sort((a, b) => {
    const cmp = String(b.entryDate || '').localeCompare(String(a.entryDate || ''));
    if (cmp !== 0) return cmp;
    return String(b.entryNumber || '').localeCompare(String(a.entryNumber || ''))
  })

const buildMetrics = (rows: JournalEntriesRegisterRow[]): RegisterMetric[] => {
  const draft = rows.filter((r) => r.status === 'draft').length
  const posted = rows.filter((r) => r.status === 'posted').length
  const unbalanced = rows.filter((r) => r.isBalanced === false).length
  return [
    { id: 'draft-entries', label: 'Draft Entries', value: draft, change: 'Unposted journal headers still mutable', trend: draft > 0 ? 'up' as const : 'neutral' as const },
    { id: 'posted-entries', label: 'Posted Entries', value: posted, change: 'Committed to ledger', trend: posted > 0 ? 'up' as const : 'neutral' as const },
    { id: 'unbalanced-entries', label: 'Unbalanced Entries', value: unbalanced, change: 'Headers failing debit-credit balance', trend: unbalanced > 0 ? 'down' as const : 'neutral' as const },
    { id: 'total-entries', label: 'Total Entries', value: rows.length, change: 'Journal entry records on file', trend: 'neutral' as const },
  ]
}

const buildFilterOptions = (): RegisterFilterOptions => ({
  statuses: JOURNAL_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
  sourceTypes: JOURNAL_SOURCE_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
  quickFilters: [
    { label: 'Draft', value: 'status:draft' },
    { label: 'Posted', value: 'status:posted' },
    { label: 'Manual', value: 'sourceType:manual' },
    { label: 'Unbalanced', value: 'isUnbalanced:true' },
  ],
})

export class AccountingJournalEntriesRegisterService {
  static async getJournalEntriesRegister(
    payload: Payload,
    query: JournalEntriesRegisterQuery = {},
  ): Promise<JournalEntriesRegisterResult> {
    const search = normalizeSearch(query.search)
    const statuses = Array.isArray(query.statuses) ? query.statuses : []
    const sourceTypes = Array.isArray(query.sourceTypes) ? query.sourceTypes : []
    const isUnbalanced = Boolean(query.isUnbalanced)
    const limit = sanitizeLimit(query.limit)
    const requestedPage = sanitizePage(query.page)

    const docs = await findAllDocs<JournalEntryDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
      depth: 1,
      sort: '-entryDate',
    })

    const sorted = sortEntries(docs)
    let allRows = sorted.map(mapJournalEntryRow)

    const filtered = allRows.filter(
      (row) => matchesSearch(row, search) && matchesStatuses(row, statuses) && matchesSourceTypes(row, sourceTypes) && (isUnbalanced ? row.isBalanced === false : true),
    )

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const page = Math.min(requestedPage, totalPages)
    const startIndex = (page - 1) * limit
    const rows = filtered.slice(startIndex, startIndex + limit)

    return {
      rows,
      metrics: buildMetrics(allRows),
      filterOptions: buildFilterOptions(),
      appliedFilters: { search: normalizeText(query.search), statuses, sourceTypes, isUnbalanced },
      pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
      totals: {
        totalEntries: allRows.length,
        filteredEntries: totalDocs,
        draftEntries: allRows.filter((r) => r.status === 'draft').length,
        postedEntries: allRows.filter((r) => r.status === 'posted').length,
        unbalancedEntries: allRows.filter((r) => r.isBalanced === false).length,
      },
    }
  }
}
