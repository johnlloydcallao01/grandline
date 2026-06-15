import type { Payload } from 'payload'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_ENTITY_TYPE_OPTIONS,
  ACCOUNTING_FINANCE_AUDIT_ACTION_OPTIONS,
} from '../../constants/accounting'
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

export type FinanceAuditLogRow = {
  id: string
  performedAt: string | null
  performedAtLabel: string
  entityType: string
  entityTypeLabel: string
  entityId: string
  actionType: string
  actionLabel: string
  actionTone: AuditTone
  performedBy: string
  reason: string
  metadataSummary: string
  beforeData: unknown
  afterData: unknown
  metadata: unknown
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>
}

export type FinanceAuditLogResult = {
  rows: FinanceAuditLogRow[]
  metrics: Array<{
    label: string
    value: number | string
    change: string
    trend: 'up' | 'down' | 'neutral'
  }>
  filterOptions: {
    actionTypes: Array<{ label: string; value: string }>
    entityTypes: Array<{ label: string; value: string }>
    quickFilters: Array<{ label: string; value: string }>
  }
  appliedFilters: {
    search: string
    actionTypes: string[]
    entityTypes: string[]
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

type PreparedEvent = Omit<FinanceAuditLogRow, 'cells'> & {
  searchableText: string
}

const entityTypeLabelMap = new Map<string, string>(
  ACCOUNTING_ENTITY_TYPE_OPTIONS.map((option) => [option.value, option.label]),
)
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

const formatEntityTypeLabel = (entityType: string | null | undefined) => {
  if (!entityType) return 'Unknown'
  return entityTypeLabelMap.get(entityType) || entityType.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

const createJsonSummary = (value: unknown) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return `${value.length} item(s)`
  if (typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>)
    return keys.length > 0 ? keys.slice(0, 3).join(', ') : 'Structured payload'
  }
  return String(value)
}

export class AccountingFinanceAuditLogService {
  static async getFinanceAuditLog(
    payload: Payload,
    query: {
      search?: string
      actionTypes?: string[]
      entityTypes?: string[]
      quickFilters?: string[]
      page?: number
      limit?: number
    } = {},
  ): Promise<FinanceAuditLogResult> {
    const page = Math.max(1, query.page || 1)
    const limit = Math.min(100, Math.max(1, query.limit || 10))

    const auditLogs = await findAllDocs<AuditLogDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.auditLogs,
      depth: 1,
    })

    const preparedEvents: PreparedEvent[] = auditLogs
      .map((log) => {
        const actionType = String(log.actionType || 'updated')
        const entityType = String(log.entityType || 'audit_log')
        const entityId = String(log.entityId || 'Unknown')
        const actionLabel = formatActionLabel(log.actionType)
        const entityTypeLabel = formatEntityTypeLabel(log.entityType)
        const performedBy = resolveUserLabel(log.performedBy)
        const performedAt = log.performedAt || log.createdAt || null
        const metadataSummary = createJsonSummary(log.metadata)
        const reason = log.reason || 'No reason recorded.'

        return {
          id: String(log.id),
          performedAt,
          performedAtLabel: formatDateTime(performedAt),
          entityType,
          entityTypeLabel,
          entityId,
          actionType,
          actionLabel,
          actionTone: ACTION_TONES[actionType] || 'gray',
          performedBy,
          reason,
          metadataSummary,
          beforeData: log.beforeData ?? null,
          afterData: log.afterData ?? null,
          metadata: log.metadata ?? null,
          searchableText: buildSearchableText([
            entityType,
            entityTypeLabel,
            entityId,
            actionType,
            actionLabel,
            performedBy,
            reason,
            metadataSummary,
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

    if (query.entityTypes && query.entityTypes.length > 0) {
      const selected = new Set(query.entityTypes.map((value) => normalizeSearch(value)))
      filteredEvents = filteredEvents.filter((event) => selected.has(normalizeSearch(event.entityTypeLabel)))
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

          if (filterValue.startsWith('entityType:')) {
            return normalizeSearch(event.entityTypeLabel) === normalizeSearch(filterValue.replace('entityType:', ''))
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
    const allEntityTypes = Array.from(new Set(preparedEvents.map((event) => event.entityTypeLabel))).sort((a, b) =>
      a.localeCompare(b),
    )

    const postingActions = filteredEvents.filter((event) => event.actionType === 'posted').length
    const approvalActions = filteredEvents.filter(
      (event) => event.actionType === 'submitted' || event.actionType === 'approved',
    ).length
    const voidAndReverseActions = filteredEvents.filter(
      (event) => event.actionType === 'voided' || event.actionType === 'reversed',
    ).length
    const actorCount = new Set(filteredEvents.map((event) => event.performedBy).filter((value) => value !== 'System')).size

    return {
      rows: pagedEvents.map((event) => ({
        ...event,
        cells: [
          event.performedAtLabel,
          event.entityTypeLabel,
          { text: event.entityId, emphasis: true },
          { text: event.actionLabel, tone: event.actionTone },
          event.performedBy,
          event.reason || '-',
        ],
      })),
      metrics: [
        {
          label: 'Audit Events',
          value: totalDocs,
          change: 'Finance audit entries matching the current filters',
          trend: totalDocs > 0 ? 'up' : 'neutral',
        },
        {
          label: 'Posting Actions',
          value: postingActions,
          change: 'Posted finance actions currently visible in the register',
          trend: postingActions > 0 ? 'up' : 'neutral',
        },
        {
          label: 'Approval Actions',
          value: approvalActions,
          change: 'Submitted and approved workflow history across finance entities',
          trend: approvalActions > 0 ? 'up' : 'neutral',
        },
        {
          label: 'Void / Reverse',
          value: voidAndReverseActions,
          change: `${actorCount} identified actors across the filtered history`,
          trend: voidAndReverseActions > 0 ? 'down' : 'neutral',
        },
      ],
      filterOptions: {
        actionTypes: allActionTypes.map((label) => ({ label, value: label })),
        entityTypes: allEntityTypes.map((label) => ({ label, value: label })),
        quickFilters: [
          { label: 'Posted', value: 'actionType:Posted' },
          { label: 'Approved', value: 'actionType:Approved' },
          { label: 'Submitted', value: 'actionType:Submitted' },
          { label: 'Voided', value: 'actionType:Voided' },
          { label: 'Exported', value: 'actionType:Exported' },
        ],
      },
      appliedFilters: {
        search: query.search || '',
        actionTypes: query.actionTypes || [],
        entityTypes: query.entityTypes || [],
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
