import type { Payload } from 'payload'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  PERIOD_STATUS_OPTIONS,
} from '../../constants/accounting'
import type { AccountingPeriodStatus } from '../../types/accounting'
import { findAllDocs } from '../../utils/findAllDocs'

type PeriodRegisterDoc = {
  id: number | string
  fiscalYear?:
    | { id: number | string; code?: string | null; name?: string | null }
    | number
    | string
    | null
  periodNumber?: number | null
  label?: string | null
  startDate?: string | null
  endDate?: string | null
  status?: string | null
  lockedFromDate?: string | null
  closedAt?: string | null
  closedBy?: { id: number | string; name?: string | null } | number | string | null
  notes?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type AccountingPeriodsRegisterQuery = {
  search?: string
  statuses?: AccountingPeriodStatus[]
  fiscalYearId?: string
  page?: number
  limit?: number
}

export type AccountingPeriodsRegisterRow = {
  id: number | string
  label: string | null
  periodNumber: number | null
  fiscalYearId: number | string | null
  fiscalYearCode: string | null
  fiscalYearName: string | null
  startDate: string | null
  endDate: string | null
  dateRange: string | null
  status: AccountingPeriodStatus | null
  statusLabel: string | null
  lockedFromDate: string | null
  closedAt: string | null
  closedByName: string | null
  notes: string | null
  createdAt: string | null
  updatedAt: string | null
}

type PeriodsRegisterMetric = {
  id: string
  label: string
  value: number
  change: string
  trend: 'up' | 'down' | 'neutral'
}

type PeriodsRegisterFilterOption = {
  label: string
  value: string
}

type PeriodsRegisterFilterOptions = {
  statuses: PeriodsRegisterFilterOption[]
  fiscalYears: PeriodsRegisterFilterOption[]
  quickFilters: PeriodsRegisterFilterOption[]
}

type PeriodsRegisterPagination = {
  page: number
  limit: number
  totalDocs: number
  totalPages: number
  hasPrevPage: boolean
  hasNextPage: boolean
}

export type AccountingPeriodsRegisterResult = {
  rows: AccountingPeriodsRegisterRow[]
  metrics: PeriodsRegisterMetric[]
  filterOptions: PeriodsRegisterFilterOptions
  appliedFilters: {
    search: string
    statuses: AccountingPeriodStatus[]
    fiscalYearId: string
  }
  pagination: PeriodsRegisterPagination
  totals: {
    totalPeriods: number
    filteredPeriods: number
    openPeriods: number
    closedPeriods: number
    softLockedPeriods: number
    draftPeriods: number
  }
}

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

const statusLabelMap = new Map<AccountingPeriodStatus, string>(
  PERIOD_STATUS_OPTIONS.map((option) => [option.value, option.label]),
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

const resolveFiscalYear = (
  fiscalYear: PeriodRegisterDoc['fiscalYear'],
): { id: number | string | null; code: string | null; name: string | null } => {
  if (typeof fiscalYear === 'object' && fiscalYear !== null) {
    return {
      id: fiscalYear.id ?? null,
      code: fiscalYear.code || null,
      name: fiscalYear.name || null,
    }
  }

  return { id: fiscalYear ?? null, code: null, name: null }
}

const mapPeriodRow = (period: PeriodRegisterDoc): AccountingPeriodsRegisterRow => {
  const fy = resolveFiscalYear(period.fiscalYear)
  const closedByObj =
    typeof period.closedBy === 'object' && period.closedBy !== null
      ? period.closedBy
      : null

  return {
    id: period.id,
    label: period.label || null,
    periodNumber: period.periodNumber ?? null,
    fiscalYearId: fy.id,
    fiscalYearCode: fy.code,
    fiscalYearName: fy.name,
    startDate: period.startDate || null,
    endDate: period.endDate || null,
    dateRange: formatDateRange(period.startDate, period.endDate),
    status: (period.status as AccountingPeriodStatus) || null,
    statusLabel: period.status ? statusLabelMap.get(period.status as AccountingPeriodStatus) || period.status : null,
    lockedFromDate: period.lockedFromDate || null,
    closedAt: period.closedAt || null,
    closedByName: closedByObj?.name || null,
    notes: period.notes || null,
    createdAt: period.createdAt || null,
    updatedAt: period.updatedAt || null,
  }
}

const matchesSearch = (row: AccountingPeriodsRegisterRow, search: string) => {
  if (!search) {
    return true
  }

  const haystacks = [
    row.label,
    row.fiscalYearCode,
    row.fiscalYearName,
    row.dateRange,
    row.statusLabel,
    row.periodNumber?.toString(),
  ]

  return haystacks.some((value) => normalizeSearch(value).includes(search))
}

const matchesStatuses = (
  row: AccountingPeriodsRegisterRow,
  statuses: AccountingPeriodStatus[],
) => {
  if (!statuses.length) {
    return true
  }

  return Boolean(row.status && statuses.includes(row.status))
}

const matchesFiscalYear = (
  row: AccountingPeriodsRegisterRow,
  fiscalYearId: string,
) => {
  if (!fiscalYearId) {
    return true
  }

  return String(row.fiscalYearId) === fiscalYearId
}

const sortPeriods = (docs: PeriodRegisterDoc[]) =>
  [...docs].sort((left, right) => {
    const leftFy = resolveFiscalYear(left.fiscalYear)
    const rightFy = resolveFiscalYear(right.fiscalYear)
    const leftFyCode = normalizeText(leftFy.code)
    const rightFyCode = normalizeText(rightFy.code)

    if (leftFyCode !== rightFyCode) {
      return leftFyCode.localeCompare(rightFyCode, undefined, {
        numeric: true,
        sensitivity: 'base',
      })
    }

    const leftNum = left.periodNumber ?? 0
    const rightNum = right.periodNumber ?? 0

    return leftNum - rightNum
  })

const buildMetrics = (
  rows: AccountingPeriodsRegisterRow[],
): PeriodsRegisterMetric[] => {
  const totalPeriods = rows.length
  const openPeriods = rows.filter((row) => row.status === 'open').length
  const closedPeriods = rows.filter((row) => row.status === 'closed').length
  const softLockedPeriods = rows.filter((row) => row.status === 'soft_locked').length

  return [
    {
      id: 'total-periods',
      label: 'Total Periods',
      value: totalPeriods,
      change: 'Periods on record',
      trend: 'neutral',
    },
    {
      id: 'open-periods',
      label: 'Open',
      value: openPeriods,
      change: 'Periods available for posting',
      trend: 'up',
    },
    {
      id: 'closed-periods',
      label: 'Closed',
      value: closedPeriods,
      change: 'Periods finalized',
      trend: 'down',
    },
    {
      id: 'soft-locked-periods',
      label: 'Soft Locked',
      value: softLockedPeriods,
      change: 'Periods with restricted posting',
      trend: 'neutral',
    },
  ]
}

export class AccountingPeriodsRegisterService {
  static async getPeriodsRegister(
    payload: Payload,
    query: AccountingPeriodsRegisterQuery = {},
  ): Promise<AccountingPeriodsRegisterResult> {
    const normalizedSearch = normalizeSearch(query.search)
    const statuses = Array.isArray(query.statuses) ? query.statuses : []
    const fiscalYearId = String(query.fiscalYearId || '').trim()
    const limit = sanitizeLimit(query.limit)
    const requestedPage = sanitizePage(query.page)

    const periodDocs = await findAllDocs<PeriodRegisterDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.periods,
      depth: 1,
      sort: 'periodNumber',
    })

    const sortedDocs = sortPeriods(periodDocs)
    const allRows = sortedDocs.map(mapPeriodRow)

    const filteredRows = allRows.filter((row) => {
      return (
        matchesSearch(row, normalizedSearch) &&
        matchesStatuses(row, statuses) &&
        matchesFiscalYear(row, fiscalYearId)
      )
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const page = Math.min(requestedPage, totalPages)
    const startIndex = (page - 1) * limit
    const rows = filteredRows.slice(startIndex, startIndex + limit)

    const fiscalYearDocs = await findAllDocs<{
      id: number | string
      code?: string | null
      name?: string | null
    }>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
      depth: 0,
      sort: 'code',
    })

    return {
      rows,
      metrics: buildMetrics(allRows),
      filterOptions: {
        statuses: PERIOD_STATUS_OPTIONS.map((option) => ({
          label: option.label,
          value: option.value,
        })),
        fiscalYears: fiscalYearDocs.map((fy) => ({
          label: `${fy.code || ''} — ${fy.name || ''}`,
          value: String(fy.id),
        })),
        quickFilters: [
          { label: 'Draft', value: 'status:draft' },
          { label: 'Open', value: 'status:open' },
          { label: 'Soft Locked', value: 'status:soft_locked' },
          { label: 'Closed', value: 'status:closed' },
        ],
      },
      appliedFilters: {
        search: normalizeText(query.search),
        statuses,
        fiscalYearId,
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
        totalPeriods: allRows.length,
        filteredPeriods: totalDocs,
        openPeriods: allRows.filter((r) => r.status === 'open').length,
        closedPeriods: allRows.filter((r) => r.status === 'closed').length,
        softLockedPeriods: allRows.filter((r) => r.status === 'soft_locked').length,
        draftPeriods: allRows.filter((r) => r.status === 'draft').length,
      },
    }
  }
}
