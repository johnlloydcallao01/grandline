import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_DIMENSION_STATUS_OPTIONS } from '../../constants/accounting'
import { findAllDocs } from '../../utils/findAllDocs'

type BranchRef = { id: number | string; branchCode?: string | null; name?: string | null } | number | string | null
type UserRef = { id: number | string } | number | string | null

type DepartmentDoc = {
  id: number | string
  departmentCode?: string | null
  name?: string | null
  status?: string | null
  branch?: BranchRef
  notes?: string | null
  createdBy?: UserRef
  updatedBy?: UserRef
  createdAt?: string | null
  updatedAt?: string | null
}

export type AccountingDepartmentsRegisterQuery = {
  search?: string
  statuses?: string[]
  branchIds?: (number | string)[]
  branchFilters?: string[]
  page?: number
  limit?: number
}

export type AccountingDepartmentsRegisterRow = {
  id: number | string
  departmentCode: string | null
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

export type AccountingDepartmentsRegisterResult = {
  rows: AccountingDepartmentsRegisterRow[]
  metrics: RegisterMetric[]
  filterOptions: RegisterFilterOptions
  appliedFilters: { search: string; statuses: string[]; branchIds: (number | string)[]; branchFilters: string[] }
  pagination: RegisterPagination
  totals: { totalDepartments: number; filteredDepartments: number; activeDepartments: number; inactiveDepartments: number; branchLinked: number }
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

const mapDepartmentRow = (doc: DepartmentDoc): AccountingDepartmentsRegisterRow => {
  const status = doc.status || null
  const statusLabel = status ? statusLabelMap.get(status) || status : null
  const branch = resolveBranch(doc.branch)
  return {
    id: doc.id,
    departmentCode: doc.departmentCode || null,
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
      { text: doc.departmentCode || '-', emphasis: true },
      doc.name || '-',
      branch.code || branch.name || '-',
      resolveUser(doc.createdBy) || '-',
      resolveUser(doc.updatedBy) || '-',
      { text: statusLabel || '-', tone: status === 'active' ? 'green' as const : status === 'archived' ? 'gray' as const : 'amber' as const },
    ],
  }
}

const matchesSearch = (row: AccountingDepartmentsRegisterRow, search: string) => {
  if (!search) return true
  return [row.departmentCode, row.name, row.branchCode, row.branchName, row.statusLabel]
    .some((v) => normalizeSearch(v).includes(search))
}

const matchesStatuses = (row: AccountingDepartmentsRegisterRow, statuses: string[]) => {
  if (!statuses.length) return true
  return Boolean(row.status && statuses.includes(row.status))
}

const matchesBranchIds = (row: AccountingDepartmentsRegisterRow, branchIds: (number | string)[]) => {
  if (!branchIds.length) return true
  return row.branchId !== null && branchIds.some((id) => String(id) === String(row.branchId))
}

const matchesBranchFilter = (row: AccountingDepartmentsRegisterRow, branchFilters: string[]) => {
  if (!branchFilters.length) return true
  const hasByBranch = branchFilters.includes('byBranch')
  const hasWithoutBranch = branchFilters.includes('withoutBranch')
  if (hasByBranch && hasWithoutBranch) return true
  if (hasByBranch) return row.branchId !== null
  if (hasWithoutBranch) return row.branchId === null
  return true
}

const sortDepartments = (docs: DepartmentDoc[]) =>
  [...docs].sort((a, b) => normalizeText(a.departmentCode).localeCompare(normalizeText(b.departmentCode), undefined, { numeric: true, sensitivity: 'base' }))

const buildMetrics = (rows: AccountingDepartmentsRegisterRow[]): RegisterMetric[] => {
  const active = rows.filter((r) => r.status === 'active').length
  const inactive = rows.filter((r) => r.status === 'inactive').length
  const branchLinked = rows.filter((r) => r.branchId !== null).length
  return [
    { id: 'active-departments', label: 'Active Departments', value: active, change: 'Departments available for segmentation', trend: 'up' },
    { id: 'branch-linked', label: 'Branch Linked', value: branchLinked, change: 'Departments tied to a branch', trend: 'up' },
    { id: 'inactive-departments', label: 'Inactive Departments', value: inactive, change: 'Retained for historical analysis', trend: 'down' },
    { id: 'total-departments', label: 'Total Departments', value: rows.length, change: 'Department records on file', trend: 'neutral' },
  ]
}

const buildFilterOptions = (allRows: AccountingDepartmentsRegisterRow[]): RegisterFilterOptions => {
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

export class AccountingDepartmentsRegisterService {
  static async getDepartmentsRegister(
    payload: Payload,
    query: AccountingDepartmentsRegisterQuery = {},
  ): Promise<AccountingDepartmentsRegisterResult> {
    const search = normalizeSearch(query.search)
    const statuses = Array.isArray(query.statuses) ? query.statuses : []
    const branchIds = Array.isArray(query.branchIds) ? query.branchIds : []
    const branchFilters = Array.isArray(query.branchFilters) ? query.branchFilters : []
    const limit = sanitizeLimit(query.limit)
    const requestedPage = sanitizePage(query.page)

    const docs = await findAllDocs<DepartmentDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.departments,
      depth: 1,
      sort: 'departmentCode',
    })

    const sorted = sortDepartments(docs)
    const allRows = sorted.map(mapDepartmentRow)

    const filtered = allRows.filter(
      (row) => matchesSearch(row, search) && matchesStatuses(row, statuses) && matchesBranchIds(row, branchIds) && matchesBranchFilter(row, branchFilters),
    )

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const page = Math.min(requestedPage, totalPages)
    const startIndex = (page - 1) * limit
    const rows = filtered.slice(startIndex, startIndex + limit)

    return {
      rows,
      metrics: buildMetrics(allRows),
      filterOptions: buildFilterOptions(allRows),
      appliedFilters: { search: normalizeText(query.search), statuses, branchIds, branchFilters },
      pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
      totals: {
        totalDepartments: allRows.length,
        filteredDepartments: totalDocs,
        activeDepartments: allRows.filter((r) => r.status === 'active').length,
        inactiveDepartments: allRows.filter((r) => r.status === 'inactive').length,
        branchLinked: allRows.filter((r) => r.branchId !== null).length,
      },
    }
  }
}
