import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_DIMENSION_STATUS_OPTIONS } from '../../constants/accounting'
import { findAllDocs } from '../../utils/findAllDocs'

type BranchDoc = {
  id: number | string
  branchCode?: unknown
  name?: unknown
  status?: unknown
  address?: unknown
  notes?: unknown
  createdBy?: Record<string, unknown> | number | string | null
  updatedBy?: Record<string, unknown> | number | string | null
  createdAt?: unknown
  updatedAt?: unknown
}

export type AccountingBranchesRegisterQuery = {
  search?: string
  statuses?: string[]
  addressFilter?: string
  quickFilters?: string[]
  page?: number
  limit?: number
}

export type AccountingBranchesRegisterRow = {
  id: number | string
  branchCode: string | null
  name: string | null
  status: string | null
  statusLabel: string | null
  address: string | null
  createdBy: string | null
  updatedBy: string | null
  createdAt: string | null
  updatedAt: string | null
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>
}

type BranchesRegisterMetric = {
  id: string
  label: string
  value: number
  change: string
  trend: 'up' | 'down' | 'neutral'
}

type BranchesRegisterFilterOptions = {
  statuses: Array<{ label: string; value: string }>
  quickFilters: Array<{ label: string; value: string }>
}

type BranchesRegisterPagination = {
  page: number
  limit: number
  totalDocs: number
  totalPages: number
  hasPrevPage: boolean
  hasNextPage: boolean
}

export type AccountingBranchesRegisterResult = {
  rows: AccountingBranchesRegisterRow[]
  metrics: BranchesRegisterMetric[]
  filterOptions: BranchesRegisterFilterOptions
  appliedFilters: { search: string; statuses: string[]; addressFilter: string; quickFilters: string[] }
  pagination: BranchesRegisterPagination
  totals: { totalBranches: number; filteredBranches: number; activeBranches: number; inactiveBranches: number; withAddress: number }
}

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

const statusLabelMap = new Map<string, string>(
  ACCOUNTING_DIMENSION_STATUS_OPTIONS.map((o) => [o.value, o.label]),
)

const normalizeText = (value?: string | null) => String(value || '').trim()
const normalizeSearch = (value?: string | null) => normalizeText(value).toLowerCase()
const normalizeOptionalText = (value: unknown) => {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  return normalized || null
}

const sanitizePage = (page?: number) => {
  if (!Number.isFinite(page)) return 1
  return Math.max(1, Math.trunc(page || 1))
}

const sanitizeLimit = (limit?: number) => {
  if (!Number.isFinite(limit)) return DEFAULT_LIMIT
  return Math.min(MAX_LIMIT, Math.max(1, Math.trunc(limit || DEFAULT_LIMIT)))
}

const resolveUser = (user: BranchDoc['createdBy']): string | null => {
  if (typeof user === 'object' && user !== null) {
    const firstName = typeof user.firstName === 'string' ? user.firstName.trim() : ''
    const lastName = typeof user.lastName === 'string' ? user.lastName.trim() : ''
    const middleName = typeof user.middleName === 'string' ? user.middleName.trim() : ''
    const parts = [firstName, middleName, lastName].filter(Boolean)
    return parts.length > 0 ? parts.join(' ') : (user.id != null ? String(user.id) : null)
  }
  return user ? String(user) : null
}

const mapBranchRow = (doc: BranchDoc): AccountingBranchesRegisterRow => {
  const branchCode = normalizeOptionalText(doc.branchCode)
  const name = normalizeOptionalText(doc.name)
  const status = normalizeOptionalText(doc.status)
  const statusLabel = status ? statusLabelMap.get(status) || status : null
  const address = normalizeOptionalText(doc.address)
  const createdBy = resolveUser(doc.createdBy)
  const updatedBy = resolveUser(doc.updatedBy)
  return {
    id: doc.id,
    branchCode,
    name,
    status,
    statusLabel,
    address,
    createdBy,
    updatedBy,
    createdAt: normalizeOptionalText(doc.createdAt),
    updatedAt: normalizeOptionalText(doc.updatedAt),
    cells: [
      { text: branchCode || '-', emphasis: true },
      name || '-',
      address || '-',
      createdBy || '-',
      updatedBy || '-',
      { text: statusLabel || '-', tone: status === 'active' ? 'green' as const : status === 'archived' ? 'gray' as const : 'amber' as const },
    ],
  }
}

const matchesSearch = (row: AccountingBranchesRegisterRow, search: string) => {
  if (!search) return true
  const haystacks = [row.branchCode, row.name, row.statusLabel, row.address]
  return haystacks.some((v) => normalizeSearch(v).includes(search))
}

const matchesStatuses = (row: AccountingBranchesRegisterRow, statuses: string[]) => {
  if (!statuses.length) return true
  return Boolean(row.status && statuses.includes(row.status))
}

const matchesAddressFilter = (row: AccountingBranchesRegisterRow, addressFilter: string) => {
  if (!addressFilter) return true
  if (addressFilter === 'hasAddress') return Boolean(row.address)
  return true
}

const sortBranches = (docs: BranchDoc[]) =>
  [...docs].sort((a, b) =>
    normalizeText(normalizeOptionalText(a.branchCode)).localeCompare(
      normalizeText(normalizeOptionalText(b.branchCode)),
      undefined,
      { numeric: true, sensitivity: 'base' },
    ),
  )

const buildMetrics = (rows: AccountingBranchesRegisterRow[]): BranchesRegisterMetric[] => {
  const active = rows.filter((r) => r.status === 'active').length
  const inactive = rows.filter((r) => r.status === 'inactive').length
  const withAddress = rows.filter((r) => r.address).length
  return [
    { id: 'active-branches', label: 'Active Branches', value: active, change: 'Branches available in finance selectors', trend: 'up' },
    { id: 'inactive-branches', label: 'Inactive Branches', value: inactive, change: 'Retained for historical reporting', trend: 'down' },
    { id: 'with-address', label: 'With Address', value: withAddress, change: 'Branches carrying full address data', trend: 'neutral' },
    { id: 'total-branches', label: 'Total Branches', value: rows.length, change: 'Branch master records on file', trend: 'neutral' },
  ]
}

const buildFilterOptions = (): BranchesRegisterFilterOptions => ({
  statuses: ACCOUNTING_DIMENSION_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
  quickFilters: [
    { label: 'Active', value: 'status:active' },
    { label: 'Inactive', value: 'status:inactive' },
    { label: 'With Address', value: 'hasAddress' },
  ],
})

export class AccountingBranchesRegisterService {
  static async getBranchesRegister(
    payload: Payload,
    query: AccountingBranchesRegisterQuery = {},
  ): Promise<AccountingBranchesRegisterResult> {
    const search = normalizeSearch(query.search)
    const statuses = Array.isArray(query.statuses) ? query.statuses : []
    const addressFilter = query.addressFilter || ''
    const quickFilters = Array.isArray(query.quickFilters)
      ? query.quickFilters.map((value) => normalizeText(value)).filter(Boolean)
      : []
    const limit = sanitizeLimit(query.limit)
    const requestedPage = sanitizePage(query.page)

    const docs = await findAllDocs<BranchDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.branches,
      depth: 0,
      sort: 'branchCode',
    })

    const sorted = sortBranches(docs)
    const allRows = sorted.map(mapBranchRow)

    let filtered = allRows.filter((row) => matchesSearch(row, search) && matchesStatuses(row, statuses) && matchesAddressFilter(row, addressFilter))

    if (quickFilters.length > 0) {
      filtered = filtered.filter((row) =>
        quickFilters.some((filterValue) => {
          if (filterValue.startsWith('status:')) {
            return Boolean(row.status && normalizeText(row.status) === normalizeText(filterValue.replace('status:', '')))
          }

          if (filterValue === 'hasAddress') {
            return Boolean(row.address)
          }

          return false
        }),
      )
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const page = Math.min(requestedPage, totalPages)
    const startIndex = (page - 1) * limit
    const rows = filtered.slice(startIndex, startIndex + limit)

    return {
      rows,
      metrics: buildMetrics(allRows),
      filterOptions: buildFilterOptions(),
      appliedFilters: { search: normalizeText(query.search), statuses, addressFilter, quickFilters },
      pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
      totals: {
        totalBranches: allRows.length,
        filteredBranches: totalDocs,
        activeBranches: allRows.filter((r) => r.status === 'active').length,
        inactiveBranches: allRows.filter((r) => r.status === 'inactive').length,
        withAddress: allRows.filter((r) => r.address).length,
      },
    }
  }
}
