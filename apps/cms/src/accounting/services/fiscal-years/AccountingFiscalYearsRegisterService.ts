import type { Payload } from 'payload'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  FISCAL_YEAR_CLOSE_MODE_OPTIONS,
  FISCAL_YEAR_STATUS_OPTIONS,
} from '../../constants/accounting'
import type {
  AccountingFiscalYearCloseMode,
  AccountingFiscalYearStatus,
} from '../../types/accounting'
import { findAllDocs } from '../../utils/findAllDocs'

type FiscalYearRegisterDoc = {
  id: number | string
  code?: string | null
  name?: string | null
  startDate?: string | null
  endDate?: string | null
  status?: AccountingFiscalYearStatus | null
  closeMode?: AccountingFiscalYearCloseMode | null
  lockedFromDate?: string | null
  closedAt?: string | null
  closedBy?: { id: number | string; name?: string | null } | number | string | null
  notes?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type AccountingFiscalYearsRegisterQuery = {
  search?: string
  statuses?: AccountingFiscalYearStatus[]
  closeModes?: AccountingFiscalYearCloseMode[]
  quickFilters?: string[]
  page?: number
  limit?: number
}

export type AccountingFiscalYearsRegisterRow = {
  id: number | string
  code: string | null
  name: string | null
  startDate: string | null
  endDate: string | null
  dateRange: string | null
  status: AccountingFiscalYearStatus | null
  statusLabel: string | null
  closeMode: AccountingFiscalYearCloseMode | null
  closeModeLabel: string | null
  lockedFromDate: string | null
  closedAt: string | null
  closedByName: string | null
  periodCount: number
  notes: string | null
  createdAt: string | null
  updatedAt: string | null
}

type FiscalYearsRegisterMetric = {
  id: string
  label: string
  value: number
  change: string
  trend: 'up' | 'down' | 'neutral'
}

type FiscalYearsRegisterFilterOption = {
  label: string
  value: string
}

type FiscalYearsRegisterFilterOptions = {
  statuses: FiscalYearsRegisterFilterOption[]
  closeModes: FiscalYearsRegisterFilterOption[]
  quickFilters: FiscalYearsRegisterFilterOption[]
}

type FiscalYearsRegisterPagination = {
  page: number
  limit: number
  totalDocs: number
  totalPages: number
  hasPrevPage: boolean
  hasNextPage: boolean
}

export type AccountingFiscalYearsRegisterResult = {
  rows: AccountingFiscalYearsRegisterRow[]
  metrics: FiscalYearsRegisterMetric[]
  filterOptions: FiscalYearsRegisterFilterOptions
  appliedFilters: {
    search: string
    statuses: AccountingFiscalYearStatus[]
    closeModes: AccountingFiscalYearCloseMode[]
    quickFilters: string[]
  }
  pagination: FiscalYearsRegisterPagination
  totals: {
    totalYears: number
    filteredYears: number
    configuredYears: number
    closedYears: number
    openYears: number
    lockedFromDates: number
  }
}

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

const statusLabelMap = new Map<AccountingFiscalYearStatus, string>(
  FISCAL_YEAR_STATUS_OPTIONS.map((option) => [option.value, option.label]),
)

const closeModeLabelMap = new Map<AccountingFiscalYearCloseMode, string>(
  FISCAL_YEAR_CLOSE_MODE_OPTIONS.map((option) => [option.value, option.label]),
)

const normalizeText = (value?: string | null) => String(value || '').trim()

const normalizeSearch = (value?: string | null) => normalizeText(value).toLowerCase()

const sanitizePage = (page?: number) => {
  if (!Number.isFinite(page)) {
    return 1
  }

  return Math.max(1, Math.trunc(page || 1))
}

const sanitizeLimit = (limit?: number) => {
  if (!Number.isFinite(limit)) {
    return DEFAULT_LIMIT
  }

  return Math.min(MAX_LIMIT, Math.max(1, Math.trunc(limit || DEFAULT_LIMIT)))
}

const formatDateRange = (startDate?: string | null, endDate?: string | null) => {
  const start = startDate ? new Date(startDate).toISOString().slice(0, 10) : null
  const end = endDate ? new Date(endDate).toISOString().slice(0, 10) : null

  if (start && end) {
    return `${start} to ${end}`
  }

  return start || end || null
}

const mapFiscalYearRow = (
  fiscalYear: FiscalYearRegisterDoc,
  periodCountMap: Map<string, number>,
): AccountingFiscalYearsRegisterRow => {
  const closedByObj =
    typeof fiscalYear.closedBy === 'object' && fiscalYear.closedBy !== null
      ? fiscalYear.closedBy
      : null

  return {
    id: fiscalYear.id,
    code: fiscalYear.code || null,
    name: fiscalYear.name || null,
    startDate: fiscalYear.startDate || null,
    endDate: fiscalYear.endDate || null,
    dateRange: formatDateRange(fiscalYear.startDate, fiscalYear.endDate),
    status: fiscalYear.status || null,
    statusLabel: fiscalYear.status ? statusLabelMap.get(fiscalYear.status) || fiscalYear.status : null,
    closeMode: fiscalYear.closeMode || null,
    closeModeLabel: fiscalYear.closeMode ? closeModeLabelMap.get(fiscalYear.closeMode) || fiscalYear.closeMode : null,
    lockedFromDate: fiscalYear.lockedFromDate || null,
    closedAt: fiscalYear.closedAt || null,
    closedByName: closedByObj?.name || null,
    periodCount: periodCountMap.get(String(fiscalYear.id)) || 0,
    notes: fiscalYear.notes || null,
    createdAt: fiscalYear.createdAt || null,
    updatedAt: fiscalYear.updatedAt || null,
  }
}

const matchesSearch = (row: AccountingFiscalYearsRegisterRow, search: string) => {
  if (!search) {
    return true
  }

  const haystacks = [
    row.code,
    row.name,
    row.dateRange,
    row.statusLabel,
    row.closeModeLabel,
  ]

  return haystacks.some((value) => normalizeSearch(value).includes(search))
}

const matchesStatuses = (
  row: AccountingFiscalYearsRegisterRow,
  statuses: AccountingFiscalYearStatus[],
) => {
  if (!statuses.length) {
    return true
  }

  return Boolean(row.status && statuses.includes(row.status))
}

const matchesCloseModes = (
  row: AccountingFiscalYearsRegisterRow,
  closeModes: AccountingFiscalYearCloseMode[],
) => {
  if (!closeModes.length) {
    return true
  }

  return Boolean(row.closeMode && closeModes.includes(row.closeMode))
}

const matchesQuickFilters = (
  row: AccountingFiscalYearsRegisterRow,
  quickFilters: string[],
) => {
  if (!quickFilters.length) {
    return true
  }

  return quickFilters.some((filterValue) => {
    if (filterValue.startsWith('status:')) {
      return Boolean(row.status && row.status === filterValue.replace('status:', ''))
    }

    if (filterValue.startsWith('closeMode:')) {
      return Boolean(row.closeMode && row.closeMode === filterValue.replace('closeMode:', ''))
    }

    return false
  })
}

const sortFiscalYears = (docs: FiscalYearRegisterDoc[]) =>
  [...docs].sort((left, right) => {
    const leftCode = normalizeText(left.code)
    const rightCode = normalizeText(right.code)

    if (leftCode !== rightCode) {
      return leftCode.localeCompare(rightCode, undefined, { numeric: true, sensitivity: 'base' })
    }

    return normalizeText(left.name).localeCompare(normalizeText(right.name), undefined, {
      sensitivity: 'base',
    })
  })

const buildMetrics = (
  rows: AccountingFiscalYearsRegisterRow[],
): FiscalYearsRegisterMetric[] => {
  const totalYears = rows.length
  const openYears = rows.filter((row) => row.status === 'open').length
  const closedYears = rows.filter((row) => row.status === 'closed').length
  const lockedFromDates = rows.filter((row) => row.lockedFromDate).length

  return [
    {
      id: 'configured-years',
      label: 'Configured Years',
      value: totalYears,
      change: 'Fiscal years on record',
      trend: 'neutral',
    },
    {
      id: 'closed-years',
      label: 'Closed Years',
      value: closedYears,
      change: 'Years with close date captured',
      trend: 'neutral',
    },
    {
      id: 'open-years',
      label: 'Open Years',
      value: openYears,
      change: 'Years available for active posting windows',
      trend: 'up',
    },
    {
      id: 'locked-from-dates',
      label: 'Locked From Dates',
      value: lockedFromDates,
      change: 'Years enforcing posting lock dates',
      trend: 'up',
    },
  ]
}

const buildFilterOptions = (): FiscalYearsRegisterFilterOptions => ({
  statuses: FISCAL_YEAR_STATUS_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
  })),
  closeModes: FISCAL_YEAR_CLOSE_MODE_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
  })),
  quickFilters: [
    { label: 'Draft', value: 'status:draft' },
    { label: 'Open', value: 'status:open' },
    { label: 'Closed', value: 'status:closed' },
    { label: 'Manual Close', value: 'closeMode:manual' },
  ],
})

const buildPeriodCountMap = async (
  payload: Payload,
  fiscalYearIds: Set<string>,
): Promise<Map<string, number>> => {
  const periodDocs = await findAllDocs<{
    id: number | string
    fiscalYear?: { id: number | string } | number | string | null
  }>({
    payload,
    collection: ACCOUNTING_COLLECTION_SLUGS.periods,
    depth: 0,
  })

  const periodCountMap = new Map<string, number>()

  const fyIdArray = Array.from(fiscalYearIds)

  for (const fyId of fyIdArray) {
    periodCountMap.set(fyId, 0)
  }

  for (const period of periodDocs) {
    const fyRelId =
      typeof period.fiscalYear === 'object' && period.fiscalYear !== null
        ? String(period.fiscalYear.id)
        : String(period.fiscalYear ?? '')

    if (fiscalYearIds.has(fyRelId)) {
      periodCountMap.set(fyRelId, (periodCountMap.get(fyRelId) || 0) + 1)
    }
  }

  return periodCountMap
}

export class AccountingFiscalYearsRegisterService {
  static async getFiscalYearsRegister(
    payload: Payload,
    query: AccountingFiscalYearsRegisterQuery = {},
  ): Promise<AccountingFiscalYearsRegisterResult> {
    const normalizedSearch = normalizeSearch(query.search)
    const statuses = Array.isArray(query.statuses) ? query.statuses : []
    const closeModes = Array.isArray(query.closeModes) ? query.closeModes : []
    const quickFilters = Array.isArray(query.quickFilters) ? query.quickFilters.map((value) => normalizeText(value)).filter(Boolean) : []
    const limit = sanitizeLimit(query.limit)
    const requestedPage = sanitizePage(query.page)

    const fiscalYearDocs = await findAllDocs<FiscalYearRegisterDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
      depth: 1,
      sort: 'code',
    })

    const sortedDocs = sortFiscalYears(fiscalYearDocs)
    const fiscalYearIds = new Set(sortedDocs.map((doc) => String(doc.id)))
    const periodCountMap = await buildPeriodCountMap(payload, fiscalYearIds)
    const allRows = sortedDocs.map((doc) => mapFiscalYearRow(doc, periodCountMap))

    const filteredRows = allRows.filter((row) => {
      return (
        matchesSearch(row, normalizedSearch) &&
        matchesStatuses(row, statuses) &&
        matchesCloseModes(row, closeModes) &&
        matchesQuickFilters(row, quickFilters)
      )
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const page = Math.min(requestedPage, totalPages)
    const startIndex = (page - 1) * limit
    const rows = filteredRows.slice(startIndex, startIndex + limit)

    return {
      rows,
      metrics: buildMetrics(allRows),
      filterOptions: buildFilterOptions(),
      appliedFilters: {
        search: normalizeText(query.search),
        statuses,
        closeModes,
        quickFilters,
      },
      pagination: {
        page,
        limit,
        totalDocs,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
      totals: {
        totalYears: allRows.length,
        filteredYears: totalDocs,
        configuredYears: allRows.length,
        closedYears: allRows.filter((r) => r.status === 'closed').length,
        openYears: allRows.filter((r) => r.status === 'open').length,
        lockedFromDates: allRows.filter((r) => r.lockedFromDate).length,
      },
    }
  }
}
