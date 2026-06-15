import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_FINANCE_AUDIT_ACTION_OPTIONS } from '../../constants/accounting'
import { findAllDocs } from '../../utils/findAllDocs'

type AuditTone = 'amber' | 'blue' | 'gray' | 'green' | 'red'

type AuditLogDoc = {
  id: number | string
  entityType?: string | null
  entityId?: string | null
  actionType?: string | null
  performedBy?: { id?: number | string; name?: string | null; email?: string | null } | number | string | null
  performedAt?: string | null
  createdAt?: string | null
  beforeData?: unknown
  afterData?: unknown
  reason?: string | null
  metadata?: Record<string, unknown> | unknown[] | string | number | boolean | null
}

export type BeforeAfterHistoryRow = {
  id: string
  performedAt: string | null
  performedAtLabel: string
  entityType: string
  entityId: string
  actionType: string
  actionLabel: string
  actionTone: AuditTone
  performedBy: string
  beforeSummary: string
  afterSummary: string
  reason: string
  snapshotType: string
  snapshotTypeLabel: string
  changedFieldCount: number
  metadata: unknown
  beforeData: unknown
  afterData: unknown
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>
}

export type BeforeAfterHistoryResult = {
  rows: BeforeAfterHistoryRow[]
  metrics: Array<{
    label: string
    value: number | string
    change: string
    trend: 'up' | 'down' | 'neutral'
  }>
  filterOptions: {
    actionTypes: Array<{ label: string; value: string }>
    snapshotTypes: Array<{ label: string; value: string }>
    quickFilters: Array<{ label: string; value: string }>
  }
  appliedFilters: {
    search: string
    actionTypes: string[]
    snapshotTypes: string[]
    quickFilters: string[]
  }
  pagination: {
    page: number
    limit: number
    totalDocs: number
    totalPages: number
    hasPrevPage: boolean
    hasNextPage: boolean
  }
  totals: {
    totalRows: number
    filteredRows: number
  }
}

type PreparedSnapshotEvent = Omit<BeforeAfterHistoryRow, 'cells'> & {
  searchableText: string
}

const actionLabelMap = new Map<string, string>(
  ACCOUNTING_FINANCE_AUDIT_ACTION_OPTIONS.map((option) => [option.value, option.label]),
)

const ACTION_TONES: Record<string, AuditTone> = {
  created: 'green',
  updated: 'blue',
  submitted: 'blue',
  approved: 'green',
  posted: 'green',
  reversed: 'amber',
  voided: 'red',
  exported: 'gray',
}

const SENSITIVE_FIELD_KEYWORDS = ['amount', 'balance', 'rate', 'account', 'status', 'tax', 'bank', 'approval']

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

const normalizeSearch = (value: unknown) => String(value ?? '').toLowerCase().trim()

const buildSearchableText = (parts: Array<unknown>) =>
  parts
    .map((part) => normalizeSearch(part))
    .filter(Boolean)
    .join(' ')

const resolveUserLabel = (
  user: { name?: string | null; email?: string | null } | number | string | null | undefined,
) => {
  if (!user) return 'System'
  if (typeof user === 'string' || typeof user === 'number') return String(user)
  return user.name || user.email || 'System'
}

const formatActionLabel = (actionType: string | null | undefined) => {
  if (!actionType) return 'Unknown'
  return actionLabelMap.get(actionType) || actionType.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

const asRecord = (value: unknown) =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null

const summarizeValue = (value: unknown) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return `${value.length} item(s)`
  if (typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>)
    return keys.length > 0 ? keys.slice(0, 2).join(', ') : 'Structured payload'
  }
  return String(value)
}

const diffFieldKeys = (beforeData: unknown, afterData: unknown) => {
  const beforeRecord = asRecord(beforeData)
  const afterRecord = asRecord(afterData)

  if (!beforeRecord && !afterRecord) return [] as string[]

  const keys = new Set<string>([
    ...Object.keys(beforeRecord || {}),
    ...Object.keys(afterRecord || {}),
  ])

  return Array.from(keys).filter((key) => {
    const beforeValue = beforeRecord?.[key]
    const afterValue = afterRecord?.[key]
    return JSON.stringify(beforeValue ?? null) !== JSON.stringify(afterValue ?? null)
  })
}

const summarizeSnapshot = (value: unknown) => {
  const record = asRecord(value)
  if (!record) return summarizeValue(value)

  const keys = Object.keys(record)
  if (keys.length === 0) return 'No fields'

  return keys
    .slice(0, 2)
    .map((key) => `${key}=${summarizeValue(record[key])}`)
    .join(', ')
}

const deriveSnapshotType = (beforeData: unknown, afterData: unknown) => {
  const hasBefore = beforeData !== null && beforeData !== undefined
  const hasAfter = afterData !== null && afterData !== undefined

  if (hasBefore && hasAfter) return 'Before + After'
  if (hasBefore) return 'Before Only'
  if (hasAfter) return 'After Only'
  return 'No Snapshot'
}

const isSensitiveSnapshot = (actionType: string, changedFields: string[]) =>
  actionType === 'voided' ||
  actionType === 'reversed' ||
  changedFields.some((field) => SENSITIVE_FIELD_KEYWORDS.some((keyword) => normalizeSearch(field).includes(keyword)))

export class AccountingBeforeAfterHistoryService {
  static async getBeforeAfterHistory(
    payload: Payload,
    query: {
      search?: string
      actionTypes?: string[]
      snapshotTypes?: string[]
      quickFilters?: string[]
      page?: number
      limit?: number
    } = {},
  ): Promise<BeforeAfterHistoryResult> {
    const page = Math.max(1, query.page || 1)
    const limit = Math.min(100, Math.max(1, query.limit || 10))

    const auditLogs = await findAllDocs<AuditLogDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.auditLogs,
      depth: 1,
    })

    const preparedEvents: PreparedSnapshotEvent[] = auditLogs
      .filter((log) => {
        const hasBefore = log.beforeData !== null && log.beforeData !== undefined
        const hasAfter = log.afterData !== null && log.afterData !== undefined
        return hasBefore || hasAfter
      })
      .map((log) => {
        const actionType = String(log.actionType || 'updated')
        const changedFields = diffFieldKeys(log.beforeData, log.afterData)
        const snapshotTypeLabel = deriveSnapshotType(log.beforeData, log.afterData)
        const beforeSummary = summarizeSnapshot(log.beforeData)
        const afterSummary = summarizeSnapshot(log.afterData)
        const reason = log.reason || 'No reason recorded.'

        return {
          id: String(log.id),
          performedAt: log.performedAt || log.createdAt || null,
          performedAtLabel: formatDateTime(log.performedAt || log.createdAt || null),
          entityType: String(log.entityType || 'unknown'),
          entityId: String(log.entityId || 'Unknown'),
          actionType,
          actionLabel: formatActionLabel(log.actionType),
          actionTone: ACTION_TONES[actionType] || 'gray',
          performedBy: resolveUserLabel(log.performedBy),
          beforeSummary,
          afterSummary,
          reason,
          snapshotType: snapshotTypeLabel,
          snapshotTypeLabel,
          changedFieldCount: changedFields.length,
          metadata: log.metadata ?? null,
          beforeData: log.beforeData ?? null,
          afterData: log.afterData ?? null,
          searchableText: buildSearchableText([
            log.entityType,
            log.entityId,
            actionType,
            reason,
            beforeSummary,
            afterSummary,
            snapshotTypeLabel,
            changedFields.join(' '),
          ]),
        }
      })
      .sort((left, right) => {
        const leftDate = left.performedAt ? new Date(left.performedAt).getTime() : 0
        const rightDate = right.performedAt ? new Date(right.performedAt).getTime() : 0
        return rightDate - leftDate
      })

    let filteredEvents = preparedEvents

    if (query.search?.trim()) {
      const search = normalizeSearch(query.search)
      filteredEvents = filteredEvents.filter((event) => event.searchableText.includes(search))
    }

    if (query.actionTypes && query.actionTypes.length > 0) {
      const selected = new Set(query.actionTypes.map((value) => normalizeSearch(value)))
      filteredEvents = filteredEvents.filter((event) => selected.has(normalizeSearch(event.actionLabel)))
    }

    if (query.snapshotTypes && query.snapshotTypes.length > 0) {
      const selected = new Set(query.snapshotTypes.map((value) => normalizeSearch(value)))
      filteredEvents = filteredEvents.filter((event) => selected.has(normalizeSearch(event.snapshotTypeLabel)))
    }

    if (query.quickFilters && query.quickFilters.length > 0) {
      const selectedQuickFilters = query.quickFilters
        .map((value) => String(value || '').trim())
        .filter(Boolean)

      filteredEvents = filteredEvents.filter((event) =>
        selectedQuickFilters.some((filterValue) => {
          if (filterValue.startsWith('actionType:')) {
            return normalizeSearch(event.actionLabel) === normalizeSearch(filterValue.replace('actionType:', ''))
          }

          if (filterValue.startsWith('snapshotType:')) {
            return (
              normalizeSearch(event.snapshotTypeLabel) ===
              normalizeSearch(filterValue.replace('snapshotType:', ''))
            )
          }

          return false
        }),
      )
    }

    const totalDocs = filteredEvents.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const pagedEvents = filteredEvents.slice((page - 1) * limit, page * limit)

    const allActionTypes = Array.from(new Set(preparedEvents.map((event) => event.actionLabel))).sort((a, b) =>
      a.localeCompare(b),
    )
    const allSnapshotTypes = Array.from(new Set(preparedEvents.map((event) => event.snapshotTypeLabel))).sort((a, b) =>
      a.localeCompare(b),
    )

    const fieldChangesLogged = filteredEvents.reduce((total, event) => total + event.changedFieldCount, 0)
    const recordsWithReasons = filteredEvents.filter((event) => event.reason && event.reason !== 'No reason recorded.').length
    const sensitiveUpdates = filteredEvents.filter((event) =>
      isSensitiveSnapshot(event.actionType, diffFieldKeys(event.beforeData, event.afterData)),
    ).length

    return {
      rows: pagedEvents.map((event) => ({
        ...event,
        cells: [
          event.performedAtLabel,
          { text: event.entityId, emphasis: true },
          { text: event.actionLabel, tone: event.actionTone },
          event.beforeSummary,
          event.afterSummary,
          event.reason,
        ],
      })),
      metrics: [
        {
          label: 'Snapshot Events',
          value: totalDocs,
          change: 'Audit logs carrying before/after payloads matching current filters',
          trend: totalDocs > 0 ? 'up' : 'neutral',
        },
        {
          label: 'Field Changes Logged',
          value: fieldChangesLogged,
          change: 'Tracked through beforeData and afterData in the visible history',
          trend: fieldChangesLogged > 0 ? 'up' : 'neutral',
        },
        {
          label: 'Records With Reasons',
          value: recordsWithReasons,
          change: 'Snapshot events with explicit change reasons captured',
          trend: recordsWithReasons > 0 ? 'neutral' : 'down',
        },
        {
          label: 'Sensitive Updates',
          value: sensitiveUpdates,
          change: 'High-review snapshot events in the filtered results',
          trend: sensitiveUpdates > 0 ? 'down' : 'neutral',
        },
      ],
      filterOptions: {
        actionTypes: allActionTypes.map((label) => ({ label, value: label })),
        snapshotTypes: allSnapshotTypes.map((label) => ({ label, value: label })),
        quickFilters: [
          { label: 'With Before Data', value: 'snapshotType:Before Only' },
          { label: 'With After Data', value: 'snapshotType:After Only' },
          { label: 'Before + After', value: 'snapshotType:Before + After' },
          { label: 'Voided', value: 'actionType:Voided' },
        ],
      },
      appliedFilters: {
        search: query.search || '',
        actionTypes: query.actionTypes || [],
        snapshotTypes: query.snapshotTypes || [],
        quickFilters: query.quickFilters || [],
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
        totalRows: preparedEvents.length,
        filteredRows: totalDocs,
      },
    }
  }
}
