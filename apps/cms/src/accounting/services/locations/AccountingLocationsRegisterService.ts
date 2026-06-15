import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_DIMENSION_STATUS_OPTIONS } from '../../constants/accounting'
import { findAllDocs } from '../../utils/findAllDocs'

type BranchRef = { id: number | string; branchCode?: string | null; name?: string | null } | number | string | null
type UserRef = { id: number | string } | number | string | null

type LocationDoc = {
  id: number | string
  locationCode?: string | null
  name?: string | null
  status?: string | null
  branch?: BranchRef
  notes?: string | null
  createdBy?: UserRef
  updatedBy?: UserRef
  createdAt?: string | null
  updatedAt?: string | null
}

export type AccountingLocationsRegisterQuery = {
  search?: string
  statuses?: string[]
  branchIds?: (number | string)[]
  branchFilters?: string[]
  quickFilters?: string[]
  page?: number
  limit?: number
}

export type AccountingLocationsRegisterRow = {
  id: number | string
  locationCode: string | null
  name: string | null
  status: string | null
  statusLabel: string | null
  branchId: number | string | null
  branchCode: string | null
  branchName: string | null
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
  branches: Array<{ label: string; value: string }>
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

export type AccountingLocationsRegisterResult = {
  rows: AccountingLocationsRegisterRow[]
  metrics: RegisterMetric[]
  filterOptions: RegisterFilterOptions
  appliedFilters: { search: string; statuses: string[]; branchIds: (number | string)[]; branchFilters: string[]; quickFilters: string[] }
  pagination: RegisterPagination
  totals: { totalLocations: number; filteredLocations: number; activeLocations: number; inactiveLocations: number; branchLinked: number }
}

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

const statusLabelMap = new Map<string, string>(
  ACCOUNTING_DIMENSION_STATUS_OPTIONS.map((o) => [o.value, o.label]),
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

const resolveBranch = (branch: BranchRef | undefined): { id: number | string | null; code: string | null; name: string | null } => {
  if (typeof branch === 'object' && branch !== null) {
    return { id: branch.id ?? null, code: branch.branchCode || null, name: branch.name || null }
  }
  return { id: (branch ?? null) as number | string | null, code: null, name: null }
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

const mapLocationRow = (doc: LocationDoc): AccountingLocationsRegisterRow => {
  const status = doc.status || null
  const statusLabel = status ? statusLabelMap.get(status) || status : null
  const branch = resolveBranch(doc.branch)
  return {
    id: doc.id,
    locationCode: doc.locationCode || null,
    name: doc.name || null,
    status,
    statusLabel,
    branchId: branch.id,
    branchCode: branch.code,
    branchName: branch.name,
    createdBy: resolveUser(doc.createdBy),
    updatedBy: resolveUser(doc.updatedBy),
    createdAt: doc.createdAt || null,
    updatedAt: doc.updatedAt || null,
    cells: [
      { text: doc.locationCode || '-', emphasis: true },
      doc.name || '-',
      branch.code || branch.name || '-',
      resolveUser(doc.createdBy) || '-',
      resolveUser(doc.updatedBy) || '-',
      { text: statusLabel || '-', tone: status === 'active' ? 'green' as const : status === 'archived' ? 'gray' as const : 'amber' as const },
    ],
  }
}

const matchesSearch = (row: AccountingLocationsRegisterRow, search: string) => {
  if (!search) return true
  return [row.locationCode, row.name, row.branchCode, row.branchName, row.statusLabel]
    .some((v) => normalizeSearch(v).includes(search))
}

const matchesStatuses = (row: AccountingLocationsRegisterRow, statuses: string[]) => {
  if (!statuses.length) return true
  return Boolean(row.status && statuses.includes(row.status))
}

const matchesBranchIds = (row: AccountingLocationsRegisterRow, branchIds: (number | string)[]) => {
  if (!branchIds.length) return true
  return row.branchId !== null && branchIds.some((id) => String(id) === String(row.branchId))
}

const matchesBranchFilter = (row: AccountingLocationsRegisterRow, branchFilters: string[]) => {
  if (!branchFilters.length) return true
  const hasByBranch = branchFilters.includes('byBranch')
  const hasWithoutBranch = branchFilters.includes('withoutBranch')
  if (hasByBranch && hasWithoutBranch) return true
  if (hasByBranch) return row.branchId !== null
  if (hasWithoutBranch) return row.branchId === null
  return true
}

const sortLocations = (docs: LocationDoc[]) =>
  [...docs].sort((a, b) => normalizeText(a.locationCode).localeCompare(normalizeText(b.locationCode), undefined, { numeric: true, sensitivity: 'base' }))

const buildMetrics = (rows: AccountingLocationsRegisterRow[]): RegisterMetric[] => {
  const active = rows.filter((r) => r.status === 'active').length
  const inactive = rows.filter((r) => r.status === 'inactive').length
  const branchLinked = rows.filter((r) => r.branchId !== null).length
  return [
    { id: 'active-locations', label: 'Active Locations', value: active, change: 'Locations available for operational reporting', trend: 'up' },
    { id: 'branch-linked', label: 'Branch Linked', value: branchLinked, change: 'Locations associated with a branch', trend: 'up' },
    { id: 'inactive-locations', label: 'Inactive Locations', value: inactive, change: 'Retained for historical reference', trend: 'down' },
    { id: 'total-locations', label: 'Total Locations', value: rows.length, change: 'Location master records on file', trend: 'neutral' },
  ]
}

const buildFilterOptions = (allRows: AccountingLocationsRegisterRow[]): RegisterFilterOptions => {
  const branchOptions = allRows
    .filter((r) => r.branchId !== null && r.branchCode)
    .reduce<Map<string, { label: string; value: string }>>((acc, r) => {
      if (r.branchId && r.branchCode && !acc.has(String(r.branchId))) {
        acc.set(String(r.branchId), { label: `${r.branchCode} - ${r.branchName || ''}`, value: String(r.branchId) })
      }
      return acc
    }, new Map())
  return {
    statuses: ACCOUNTING_DIMENSION_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
    branches: Array.from(branchOptions.values()),
    quickFilters: [
      { label: 'Active', value: 'status:active' },
      { label: 'By Branch', value: 'byBranch' },
      { label: 'Without Branch', value: 'withoutBranch' },
      { label: 'Inactive', value: 'status:inactive' },
    ],
  }
}

export class AccountingLocationsRegisterService {
  static async getLocationsRegister(
    payload: Payload,
    query: AccountingLocationsRegisterQuery = {},
  ): Promise<AccountingLocationsRegisterResult> {
    const search = normalizeSearch(query.search)
    const statuses = Array.isArray(query.statuses) ? query.statuses : []
    const branchIds = Array.isArray(query.branchIds) ? query.branchIds : []
    const branchFilters = Array.isArray(query.branchFilters) ? query.branchFilters : []
    const quickFilters = Array.isArray(query.quickFilters)
      ? query.quickFilters.map((value) => normalizeText(value)).filter(Boolean)
      : []
    const limit = sanitizeLimit(query.limit)
    const requestedPage = sanitizePage(query.page)

    const docs = await findAllDocs<LocationDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.locations,
      depth: 1,
      sort: 'locationCode',
    })

    const sorted = sortLocations(docs)
    const allRows = sorted.map(mapLocationRow)

    let filtered = allRows.filter(
      (row) => matchesSearch(row, search) && matchesStatuses(row, statuses) && matchesBranchIds(row, branchIds) && matchesBranchFilter(row, branchFilters),
    )

    if (quickFilters.length > 0) {
      filtered = filtered.filter((row) =>
        quickFilters.some((filterValue) => {
          if (filterValue.startsWith('status:')) {
            return Boolean(row.status && normalizeText(row.status) === normalizeText(filterValue.replace('status:', '')))
          }

          if (filterValue === 'byBranch') {
            return row.branchId !== null
          }

          if (filterValue === 'withoutBranch') {
            return row.branchId === null
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
      filterOptions: buildFilterOptions(allRows),
      appliedFilters: { search: normalizeText(query.search), statuses, branchIds, branchFilters, quickFilters },
      pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
      totals: {
        totalLocations: allRows.length,
        filteredLocations: totalDocs,
        activeLocations: allRows.filter((r) => r.status === 'active').length,
        inactiveLocations: allRows.filter((r) => r.status === 'inactive').length,
        branchLinked: allRows.filter((r) => r.branchId !== null).length,
      },
    }
  }
}
