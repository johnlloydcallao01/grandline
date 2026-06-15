import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS, JOURNAL_STATUS_OPTIONS } from '../../constants/accounting'
import { findAllDocs } from '../../utils/findAllDocs'

type UserRef = { id: number | string } | number | string | null

type OpeningBalDoc = {
  id: number | string
  entryNumber?: string | null
  entryDate?: string | null
  postingDate?: string | null
  sourceType?: string | null
  sourceReference?: string | null
  memo?: string | null
  status?: string | null
  totalDebit?: number | null
  totalCredit?: number | null
  isBalanced?: boolean | null
  createdBy?: UserRef
  createdAt?: string | null
  updatedAt?: string | null
}

export type OpeningBalanceJournalsQuery = {
  search?: string
  statuses?: string[]
  balancedFilters?: string[]
  quickFilters?: string[]
  page?: number
  limit?: number
}

export type OpeningBalanceJournalsRow = {
  id: number | string
  entryNumber: string | null
  postingDate: string | null
  sourceReference: string | null
  memo: string | null
  status: string | null
  statusLabel: string | null
  totalDebit: number | null
  isBalanced: boolean | null
  createdBy: string | null
  createdAt: string | null
  updatedAt: string | null
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>
}

type Metric = { id: string; label: string; value: number; change: string; trend: 'up' | 'down' | 'neutral' }
type FilterOptions = { statuses: Array<{ label: string; value: string }>; quickFilters: Array<{ label: string; value: string }> }
type Pagination = { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean }

export type OpeningBalanceJournalsResult = {
  rows: OpeningBalanceJournalsRow[]
  metrics: Metric[]
  filterOptions: FilterOptions
  appliedFilters: { search: string; statuses: string[]; balancedFilters: string[]; quickFilters: string[] }
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

const mapRow = (doc: OpeningBalDoc): OpeningBalanceJournalsRow => {
  const status = doc.status || null
  const statusLabel = status ? statusLabelMap.get(status) || status : null
  return {
    id: doc.id, entryNumber: doc.entryNumber || null, postingDate: doc.postingDate || null,
    sourceReference: doc.sourceReference || null, memo: doc.memo || null,
    status, statusLabel, totalDebit: doc.totalDebit ?? null, isBalanced: doc.isBalanced ?? null,
    createdBy: resolveUser(doc.createdBy), createdAt: doc.createdAt || null, updatedAt: doc.updatedAt || null,
    cells: [
      { text: doc.entryNumber || '-', emphasis: true },
      doc.postingDate ? new Date(doc.postingDate).toLocaleDateString() : '-',
      doc.sourceReference || '-',
      doc.totalDebit != null ? `PHP ${Number(doc.totalDebit).toLocaleString()}` : 'PHP 0',
      doc.isBalanced ? 'Yes' : 'No',
      { text: statusLabel || '-', tone: status === 'draft' ? 'amber' as const : status === 'posted' ? 'green' as const : 'gray' as const },
    ],
  }
}

const matchesSearch = (row: OpeningBalanceJournalsRow, search: string) => {
  if (!search) return true
  return [row.entryNumber, row.sourceReference, row.memo, row.statusLabel].some((v) => normalizeSearch(v).includes(search))
}

const matchesStatuses = (row: OpeningBalanceJournalsRow, statuses: string[]) => {
  if (!statuses.length) return true
  return Boolean(row.status && statuses.includes(row.status))
}

const matchesBalanced = (row: OpeningBalanceJournalsRow, balancedFilters: string[]) => {
  if (!balancedFilters.length) return true
  const wantsBalanced = balancedFilters.includes('balanced')
  const wantsUnbalanced = balancedFilters.includes('unbalanced')
  if (wantsBalanced && wantsUnbalanced) return true
  if (wantsBalanced) return row.isBalanced === true
  if (wantsUnbalanced) return row.isBalanced === false
  return true
}

const sortEntries = (docs: OpeningBalDoc[]) => [...docs].sort((a, b) => String(b.entryDate || '').localeCompare(String(a.entryDate || '')))

const buildMetrics = (rows: OpeningBalanceJournalsRow[]): Metric[] => {
  const total = rows.length; const posted = rows.filter((r) => r.status === 'posted').length
  const draft = rows.filter((r) => r.status === 'draft').length; const balanced = rows.filter((r) => r.isBalanced === true).length
  return [
    { id: 'opening-entries', label: 'Opening Entries', value: total, change: 'Entries tagged as opening balances', trend: total > 0 ? 'up' as const : 'neutral' as const },
    { id: 'posted-opening', label: 'Posted Opening Entries', value: posted, change: 'Committed to the opening ledger position', trend: posted > 0 ? 'up' as const : 'neutral' as const },
    { id: 'draft-opening', label: 'Draft Opening Entries', value: draft, change: 'Still under validation before posting', trend: draft > 0 ? 'up' as const : 'neutral' as const },
    { id: 'balanced-opening', label: 'Balanced Opening Entries', value: balanced, change: 'Entries that pass debit-credit balance', trend: balanced > 0 ? 'up' as const : 'neutral' as const },
  ]
}

const buildFilterOptions = (): FilterOptions => ({
  statuses: JOURNAL_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
  quickFilters: [
    { label: 'Posted', value: 'status:posted' },
    { label: 'Draft', value: 'status:draft' },
    { label: 'Balanced', value: 'balanced:true' },
    { label: 'Unbalanced', value: 'balanced:false' },
  ],
})

export class AccountingOpeningBalanceJournalsService {
  static async getRegister(payload: Payload, query: OpeningBalanceJournalsQuery = {}): Promise<OpeningBalanceJournalsResult> {
    const search = normalizeSearch(query.search)
    const statuses = Array.isArray(query.statuses) ? query.statuses : []
    const balancedFilters = Array.isArray(query.balancedFilters) ? query.balancedFilters : []
    const quickFilters = Array.isArray(query.quickFilters) ? query.quickFilters.map((value) => normalizeText(value)).filter(Boolean) : []
    const limit = sanitizeLimit(query.limit); const requestedPage = sanitizePage(query.page)

    const allDocs = await findAllDocs<OpeningBalDoc>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries, depth: 1, sort: '-entryDate' })
    const openingDocs = allDocs.filter((d) => d.sourceType === 'opening_balance')
    const sorted = sortEntries(openingDocs)
    const allRows = sorted.map(mapRow)

    let filtered = allRows.filter((row) => matchesSearch(row, search) && matchesStatuses(row, statuses) && matchesBalanced(row, balancedFilters))

    if (quickFilters.length > 0) {
      filtered = filtered.filter((row) =>
        quickFilters.some((filterValue) => {
          if (filterValue.startsWith('status:')) {
            return Boolean(row.status && normalizeText(row.status) === normalizeText(filterValue.replace('status:', '')))
          }

          if (filterValue === 'balanced:true') {
            return row.isBalanced === true
          }

          if (filterValue === 'balanced:false') {
            return row.isBalanced === false
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
      appliedFilters: { search: normalizeText(query.search), statuses, balancedFilters, quickFilters },
      pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
      totals: { totalEntries: allRows.length, filteredEntries: totalDocs, postedEntries: allRows.filter((r) => r.status === 'posted').length, draftEntries: allRows.filter((r) => r.status === 'draft').length, balancedEntries: allRows.filter((r) => r.isBalanced === true).length },
    }
  }
}
