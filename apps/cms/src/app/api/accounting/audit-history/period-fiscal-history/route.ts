import { NextRequest, NextResponse } from 'next/server'
import {
    ACCOUNTING_COLLECTION_SLUGS,
    FISCAL_YEAR_CLOSE_MODE_OPTIONS,
    FISCAL_YEAR_STATUS_OPTIONS,
    PERIOD_STATUS_OPTIONS,
} from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { buildUserDisplayName } from '@/accounting/utils/lms'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

type HistoryCell =
    | string
    | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' }

type ControlHistoryRow = {
    id: string
    sourceId: string
    controlType: 'fiscal_year' | 'period'
    controlTypeLabel: string
    controlLabel: string
    fiscalYearLabel: string
    rangeLabel: string
    status: string
    statusLabel: string
    statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
    lockedFromDate: string | null
    lockedFromLabel: string
    closedAt: string | null
    closedAtLabel: string
    closedBy: string
    closeMode: string | null
    closeModeLabel: string
    notes: string
    cells: HistoryCell[]
    searchableText: string
}

type FiscalYearDoc = {
    id: number | string
    code?: string | null
    name?: string | null
    startDate?: string | null
    endDate?: string | null
    status?: string | null
    closeMode?: string | null
    lockedFromDate?: string | null
    closedAt?: string | null
    closedBy?: Record<string, unknown> | number | string | null
    notes?: string | null
}

type PeriodDoc = {
    id: number | string
    label?: string | null
    periodNumber?: number | null
    fiscalYear?: {
        id?: number | string
        code?: string | null
        name?: string | null
    } | number | string | null
    startDate?: string | null
    endDate?: string | null
    status?: string | null
    lockedFromDate?: string | null
    closedAt?: string | null
    closedBy?: Record<string, unknown> | number | string | null
    notes?: string | null
}

const fiscalYearStatusLabels = new Map<string, string>(FISCAL_YEAR_STATUS_OPTIONS.map((option) => [option.value, option.label]))
const periodStatusLabels = new Map<string, string>(PERIOD_STATUS_OPTIONS.map((option) => [option.value, option.label]))
const closeModeLabels = new Map<string, string>(FISCAL_YEAR_CLOSE_MODE_OPTIONS.map((option) => [option.value, option.label]))

const parseIntegerParam = (value: string | null, fallback: number) => {
    if (!value) return fallback
    const parsedValue = Number(value)
    return Number.isFinite(parsedValue) ? parsedValue : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
    Array.from(
        new Set(
            searchParams
                .getAll(key)
                .flatMap((value) => String(value || '').split(','))
                .map((value) => value.trim())
                .filter(Boolean),
        ),
    )

const normalizeSearch = (value: unknown) => String(value ?? '').toLowerCase().trim()

const buildSearchableText = (parts: Array<unknown>) =>
    parts
        .map((part) => normalizeSearch(part))
        .filter(Boolean)
        .join(' ')

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

const formatDateTime = (value: string | null | undefined) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'

    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)
}

const getStatusTone = (status: string | null | undefined): 'amber' | 'blue' | 'gray' | 'green' | 'red' => {
    switch (String(status || '')) {
        case 'closed':
            return 'green'
        case 'open':
            return 'blue'
        case 'soft_locked':
            return 'amber'
        default:
            return 'gray'
    }
}

const getRelationshipLabel = (user: Record<string, unknown> | number | string | null | undefined) => {
    if (!user) return '-'
    if (typeof user === 'number' || typeof user === 'string') return String(user)
    return buildUserDisplayName(user)
}

const parseQuickFilterGroups = (quickFilters: string[]) => {
    const groups = {
        status: new Set<string>(),
        controlType: new Set<string>(),
        locked: new Set<string>(),
    }

    for (const quickFilter of quickFilters) {
        const [group, value] = quickFilter.split(':')
        if (group === 'status' && value) groups.status.add(value)
        if (group === 'controlType' && value) groups.controlType.add(value)
        if (group === 'locked' && value) groups.locked.add(value)
    }

    return groups
}

const getRangeLabel = (startDate: string | null | undefined, endDate: string | null | undefined) =>
    `${formatDate(startDate)} to ${formatDate(endDate)}`

const mapFiscalYearRow = (doc: FiscalYearDoc): ControlHistoryRow => {
    const status = String(doc.status || '')
    const closeMode = doc.closeMode ? String(doc.closeMode) : null
    const statusLabel = fiscalYearStatusLabels.get(status) || 'Unknown'
    const closeModeLabel = closeMode ? closeModeLabels.get(closeMode) || closeMode : '-'
    const controlLabel = String(doc.code || doc.name || `Fiscal Year ${doc.id}`)
    const closedBy = getRelationshipLabel(doc.closedBy)

    return {
        id: `fiscal-year-${doc.id}`,
        sourceId: String(doc.id),
        controlType: 'fiscal_year',
        controlTypeLabel: 'Fiscal Year',
        controlLabel,
        fiscalYearLabel: controlLabel,
        rangeLabel: getRangeLabel(doc.startDate, doc.endDate),
        status,
        statusLabel,
        statusTone: getStatusTone(status),
        lockedFromDate: doc.lockedFromDate || null,
        lockedFromLabel: formatDate(doc.lockedFromDate),
        closedAt: doc.closedAt || null,
        closedAtLabel: formatDateTime(doc.closedAt),
        closedBy,
        closeMode,
        closeModeLabel,
        notes: String(doc.notes || ''),
        cells: [
            { text: controlLabel, emphasis: true },
            getRangeLabel(doc.startDate, doc.endDate),
            { text: statusLabel, tone: getStatusTone(status) },
            formatDate(doc.lockedFromDate),
            formatDateTime(doc.closedAt),
            closedBy,
        ],
        searchableText: buildSearchableText([
            controlLabel,
            doc.name,
            statusLabel,
            closeModeLabel,
            formatDate(doc.lockedFromDate),
            formatDateTime(doc.closedAt),
            closedBy,
            doc.notes,
        ]),
    }
}

const mapPeriodRow = (doc: PeriodDoc): ControlHistoryRow => {
    const fiscalYear =
        doc.fiscalYear && typeof doc.fiscalYear === 'object' ? doc.fiscalYear : null
    const fiscalYearLabel = String(fiscalYear?.code || fiscalYear?.name || '-')
    const status = String(doc.status || '')
    const statusLabel = periodStatusLabels.get(status) || 'Unknown'
    const controlLabel = String(doc.label || (doc.periodNumber ? `Period ${doc.periodNumber}` : `Period ${doc.id}`))
    const closedBy = getRelationshipLabel(doc.closedBy)

    return {
        id: `period-${doc.id}`,
        sourceId: String(doc.id),
        controlType: 'period',
        controlTypeLabel: 'Period',
        controlLabel,
        fiscalYearLabel,
        rangeLabel: getRangeLabel(doc.startDate, doc.endDate),
        status,
        statusLabel,
        statusTone: getStatusTone(status),
        lockedFromDate: doc.lockedFromDate || null,
        lockedFromLabel: formatDate(doc.lockedFromDate),
        closedAt: doc.closedAt || null,
        closedAtLabel: formatDateTime(doc.closedAt),
        closedBy,
        closeMode: null,
        closeModeLabel: '-',
        notes: String(doc.notes || ''),
        cells: [
            { text: controlLabel, emphasis: true },
            getRangeLabel(doc.startDate, doc.endDate),
            { text: statusLabel, tone: getStatusTone(status) },
            formatDate(doc.lockedFromDate),
            formatDateTime(doc.closedAt),
            closedBy,
        ],
        searchableText: buildSearchableText([
            controlLabel,
            fiscalYearLabel,
            statusLabel,
            formatDate(doc.lockedFromDate),
            formatDateTime(doc.closedAt),
            closedBy,
            doc.notes,
        ]),
    }
}

export async function GET(request: NextRequest) {
    try {
        const { payload } = await requireAccountingAdmin(request)
        const { searchParams } = new URL(request.url)

        const search = searchParams.get('search') || ''
        const statuses = parseListParam(searchParams, 'status')
        const controlTypes = parseListParam(searchParams, 'controlType')
        const closeModes = parseListParam(searchParams, 'closeMode')
        const quickFilters = parseListParam(searchParams, 'quickFilter')
        const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
        const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

        const [fiscalYears, periods] = await Promise.all([
            findAllDocs<FiscalYearDoc>({
                payload,
                collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
                depth: 1,
                sort: '-startDate',
            }),
            findAllDocs<PeriodDoc>({
                payload,
                collection: ACCOUNTING_COLLECTION_SLUGS.periods,
                depth: 1,
                sort: '-startDate',
            }),
        ])

        const allRows = [
            ...fiscalYears.map(mapFiscalYearRow),
            ...periods.map(mapPeriodRow),
        ].sort((left, right) => {
            const leftDate = new Date(left.closedAt || left.lockedFromDate || '').getTime()
            const rightDate = new Date(right.closedAt || right.lockedFromDate || '').getTime()
            return (Number.isFinite(rightDate) ? rightDate : 0) - (Number.isFinite(leftDate) ? leftDate : 0)
        })

        const normalizedSearch = normalizeSearch(search)
        const quickFilterGroups = parseQuickFilterGroups(quickFilters)

        const filteredRows = allRows.filter((row) => {
            if (normalizedSearch && !row.searchableText.includes(normalizedSearch)) return false
            if (statuses.length > 0 && !statuses.includes(row.status)) return false
            if (controlTypes.length > 0 && !controlTypes.includes(row.controlType)) return false
            if (closeModes.length > 0 && !(row.controlType === 'fiscal_year' && row.closeMode && closeModes.includes(row.closeMode))) {
                return false
            }
            if (quickFilterGroups.status.size > 0 && !quickFilterGroups.status.has(row.status)) return false
            if (quickFilterGroups.controlType.size > 0 && !quickFilterGroups.controlType.has(row.controlType)) return false
            if (quickFilterGroups.locked.size > 0) {
                const lockedState = row.lockedFromDate ? 'set' : 'unset'
                if (!quickFilterGroups.locked.has(lockedState)) return false
            }
            return true
        })

        const totalDocs = filteredRows.length
        const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
        const paginatedRows = filteredRows.slice((page - 1) * limit, page * limit)

        const closedControls = filteredRows.filter((row) => row.status === 'closed').length
        const openControls = filteredRows.filter((row) => row.status === 'open').length
        const fiscalYearCount = filteredRows.filter((row) => row.controlType === 'fiscal_year').length
        const lockedControls = filteredRows.filter((row) => row.lockedFromDate).length

        return NextResponse.json({
            section: {
                id: 'period-fiscal-history',
                label: 'Period & Fiscal History',
                description:
                    'Review fiscal-year and accounting-period control history using status, close dates, lock dates, and responsible users.',
                searchPlaceholder: 'Search fiscal year, period label, status, close mode, closed by, or lock date',
                filters: {
                    statuses: [
                        ...FISCAL_YEAR_STATUS_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
                        ...PERIOD_STATUS_OPTIONS
                            .filter((option) => option.value === 'soft_locked')
                            .map((option) => ({ label: option.label, value: option.value })),
                    ],
                    controlTypes: [
                        { label: 'Fiscal Year', value: 'fiscal_year' },
                        { label: 'Period', value: 'period' },
                    ],
                    closeModes: FISCAL_YEAR_CLOSE_MODE_OPTIONS.map((option) => ({
                        label: option.label,
                        value: option.value,
                    })),
                    quickFilters: [
                        { label: 'Closed', value: 'status:closed' },
                        { label: 'Open', value: 'status:open' },
                        { label: 'Fiscal Years', value: 'controlType:fiscal_year' },
                        { label: 'Periods', value: 'controlType:period' },
                        { label: 'Locked From Set', value: 'locked:set' },
                    ],
                },
                metrics: [
                    {
                        id: 'closed-controls',
                        label: 'Closed Controls',
                        value: closedControls,
                        change: 'Fiscal years or periods already closed',
                        trend: 'up',
                    },
                    {
                        id: 'Open-controls',
                        label: 'Open Controls',
                        value: openControls,
                        change: 'Still available for posting activity',
                        trend: 'neutral',
                    },
                    {
                        id: 'fiscal-year-count',
                        label: 'Fiscal Years',
                        value: fiscalYearCount,
                        change: 'Filtered year-level control records',
                        trend: 'neutral',
                    },
                    {
                        id: 'locked-controls',
                        label: 'Locked From Dates',
                        value: lockedControls,
                        change: 'Controls enforcing a lock date',
                        trend: 'up',
                    },
                ],
                table: {
                    title: 'Period & Fiscal Control History',
                    description:
                        'Control history for fiscal years and accounting periods using close status, lock dates, and recorded operators.',
                    columns: ['Control', 'Range', 'Status', 'Locked From', 'Closed At', 'Closed By'],
                    rows: paginatedRows.map(({ searchableText: _searchableText, ...row }) => row),
                },
            },
            appliedFilters: {
                search,
                statuses,
                controlTypes,
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
                totalRows: allRows.length,
                filteredRows: totalDocs,
                fiscalYears: fiscalYears.length,
                periods: periods.length,
            },
        })
    } catch (error) {
        return handleAccountingApiError(error)
    }
}
