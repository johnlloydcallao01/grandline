import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS, JOURNAL_STATUS_OPTIONS } from '../../constants/accounting'
import { findAllDocs } from '../../utils/findAllDocs'

type UserRef = { id: number | string } | number | string | null
type JournalRef = { id: number | string; entryNumber?: string | null } | number | string | null

type ReversalDoc = {
  id: number | string
  entryNumber?: string | null
  entryDate?: string | null
  postingDate?: string | null
  sourceType?: string | null
  reversalOf?: JournalRef
  memo?: string | null
  status?: string | null
  isBalanced?: boolean | null
  createdBy?: UserRef
  createdAt?: string | null
  updatedAt?: string | null
}

export type ReversalJournalsQuery = {
  search?: string
  statuses?: string[]
  quickFilters?: string[]
  page?: number
  limit?: number
}

export type ReversalJournalsRow = {
  id: number | string
  entryNumber: string | null
  originalEntry: string | null
  postingDate: string | null
  memo: string | null
  status: string | null
  statusLabel: string | null
  isBalanced: boolean | null
  createdBy: string | null
  createdAt: string | null
  updatedAt: string | null
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>
}

type Metric = { id: string; label: string; value: number; change: string; trend: 'up' | 'down' | 'neutral' }
type FilterOptions = { statuses: Array<{ label: string; value: string }>; quickFilters: Array<{ label: string; value: string }> }
type Pagination = { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean }

export type ReversalJournalsResult = {
  rows: ReversalJournalsRow[]
  metrics: Metric[]
  filterOptions: FilterOptions
  appliedFilters: { search: string; statuses: string[]; quickFilters: string[] }
  pagination: Pagination
  totals: { totalEntries: number; filteredEntries: number; postedEntries: number; draftEntries: number; balancedEntries: number }
}

const DEFAULT_LIMIT = 10; const MAX_LIMIT = 100
const statusLabelMap = new Map<string, string>(JOURNAL_STATUS_OPTIONS.map((o) => [o.value, o.label]))
const normalizeText = (value?: string | null) => String(value || '').trim()
const normalizeSearch = (value?: string | null) => normalizeText(value).toLowerCase()
const sanitizePage = (page?: number) => { if (!Number.isFinite(page)) return 1; return Math.max(1, Math.trunc(page || 1)) }
const sanitizeLimit = (limit?: number) => { if (!Number.isFinite(limit)) return DEFAULT_LIMIT; return Math.min(MAX_LIMIT, Math.max(1, Math.trunc(limit || DEFAULT_LIMIT))) }

const resolveUser = (user: UserRef | undefined): string | null => {
  if (typeof user === 'object' && user !== null) {
    const u = user as Record<string, unknown>
    const parts = [String(u.firstName || '').trim(), String(u.middleName || '').trim(), String(u.lastName || '').trim()].filter(Boolean)
    return parts.length > 0 ? parts.join(' ') : String(u.id)
  }
  return user ? String(user) : null
}

const resolveJournalRef = (journal: JournalRef | undefined): string | null => {
  if (typeof journal === 'object' && journal !== null) {
    return journal.entryNumber || String(journal.id)
  }
  return journal ? String(journal) : null
}

const mapRow = (doc: ReversalDoc): ReversalJournalsRow => {
  const status = doc.status || null
  const statusLabel = status ? statusLabelMap.get(status) || status : null
  const createdBy = resolveUser(doc.createdBy)
  const originalEntry = resolveJournalRef(doc.reversalOf)
  return {
    id: doc.id, entryNumber: doc.entryNumber || null, originalEntry, postingDate: doc.postingDate || null,
    memo: doc.memo || null,
    status, statusLabel, isBalanced: doc.isBalanced ?? null,
    createdBy, createdAt: doc.createdAt || null, updatedAt: doc.updatedAt || null,
    cells: [
      { text: doc.entryNumber || '-', emphasis: true },
      originalEntry || '-',
      doc.postingDate ? new Date(doc.postingDate).toLocaleDateString() : '-',
      doc.memo || '-',
      createdBy || '-',
      { text: statusLabel || '-', tone: status === 'draft' ? 'amber' as const : status === 'posted' ? 'green' as const : 'gray' as const },
    ],
  }
}

const matchesSearch = (row: ReversalJournalsRow, search: string) => {
  if (!search) return true
  return [row.entryNumber, row.originalEntry, row.memo, row.createdBy, row.statusLabel].some((v) => normalizeSearch(v).includes(search))
}

const matchesStatuses = (row: ReversalJournalsRow, statuses: string[]) => {
  if (!statuses.length) return true
  return Boolean(row.status && statuses.includes(row.status))
}

const sortEntries = (docs: ReversalDoc[]) => [...docs].sort((a, b) => String(b.entryDate || '').localeCompare(String(a.entryDate || '')))

const buildMetrics = (rows: ReversalJournalsRow[]): Metric[] => {
  const total = rows.length; const posted = rows.filter((r) => r.status === 'posted').length
  const draft = rows.filter((r) => r.status === 'draft').length
  const balanced = rows.filter((r) => r.isBalanced === true).length
  return [
    { id: 'reversal-entries', label: 'Reversal Entries', value: total, change: 'Total reversed entries', trend: total > 0 ? 'up' as const : 'neutral' as const },
    { id: 'posted-reversal', label: 'Posted Reversals', value: posted, change: 'Committed to the ledger', trend: posted > 0 ? 'up' as const : 'neutral' as const },
    { id: 'draft-reversal', label: 'Draft Reversals', value: draft, change: 'Still under validation before posting', trend: draft > 0 ? 'up' as const : 'neutral' as const },
    { id: 'balanced-reversal', label: 'Balanced Reversals', value: balanced, change: 'Entries that pass debit-credit balance', trend: balanced > 0 ? 'up' as const : 'neutral' as const },
  ]
}

const buildFilterOptions = (): FilterOptions => ({
  statuses: JOURNAL_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
  quickFilters: [
    { label: 'Posted', value: 'status:posted' },
    { label: 'Draft', value: 'status:draft' },
  ],
})

export class AccountingReversalJournalsService {
  static async getRegister(payload: Payload, query: ReversalJournalsQuery = {}): Promise<ReversalJournalsResult> {
    const search = normalizeSearch(query.search)
    const statuses = Array.isArray(query.statuses) ? query.statuses : []
    const quickFilters = Array.isArray(query.quickFilters) ? query.quickFilters.map((value) => normalizeText(value)).filter(Boolean) : []
    const limit = sanitizeLimit(query.limit); const requestedPage = sanitizePage(query.page)

    const allDocs = await findAllDocs<ReversalDoc>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries, depth: 1, sort: '-entryDate' })
    const reversalDocs = allDocs.filter((d) => d.sourceType === 'reversal')
    const sorted = sortEntries(reversalDocs)
    const allRows = sorted.map(mapRow)

    let filtered = allRows.filter((row) => matchesSearch(row, search) && matchesStatuses(row, statuses))

    if (quickFilters.length > 0) {
      filtered = filtered.filter((row) =>
        quickFilters.some((filterValue) => {
          if (filterValue.startsWith('status:')) {
            return Boolean(row.status && normalizeText(row.status) === normalizeText(filterValue.replace('status:', '')))
          }

          return false
        }),
      )
    }

    const totalDocs = filtered.length; const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const page = Math.min(requestedPage, totalPages)
    const rows = filtered.slice((page - 1) * limit, (page - 1) * limit + limit)

    return {
      rows, metrics: buildMetrics(allRows), filterOptions: buildFilterOptions(),
      appliedFilters: { search: normalizeText(query.search), statuses, quickFilters },
      pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
      totals: { totalEntries: allRows.length, filteredEntries: totalDocs, postedEntries: allRows.filter((r) => r.status === 'posted').length, draftEntries: allRows.filter((r) => r.status === 'draft').length, balancedEntries: allRows.filter((r) => r.isBalanced === true).length },
    }
  }
}
