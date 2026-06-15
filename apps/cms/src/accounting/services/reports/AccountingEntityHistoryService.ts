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

export type EntityHistoryRow = {
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
  sourceField: string
  sourceFieldSummary: string
  reason: string
  metadataSummary: string
  metadata: unknown
  beforeData: unknown
  afterData: unknown
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>
}

export type EntityHistoryResult = {
  rows: EntityHistoryRow[]
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

type PreparedEntityEvent = Omit<EntityHistoryRow, 'cells'> & {
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

const BANKING_ENTITY_TYPES = new Set(['bank_transaction', 'bank_reconciliation', 'deposit', 'transfer'])

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

const asRecord = (value: unknown) =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null

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

const summarizeSourceField = (log: AuditLogDoc) => {
  const metadata = asRecord(log.metadata)
  const explicitField =
    metadata?.sourceField ||
    metadata?.changedField ||
    metadata?.fieldName ||
    metadata?.field ||
    metadata?.targetEntityType

  if (typeof explicitField === 'string' && explicitField.trim()) {
    return explicitField.trim()
  }

  const changedFields = diffFieldKeys(log.beforeData, log.afterData)
  if (changedFields.length > 0) {
    return changedFields.slice(0, 3).join(', ')
  }

  if (metadata?.targetEntityType && metadata?.targetEntityId) {
    return 'targetEntity'
  }

  if (metadata) {
    const metadataKeys = Object.keys(metadata)
    if (metadataKeys.length > 0) {
      return metadataKeys.slice(0, 3).join(', ')
    }
  }

  return 'systemFields'
}

export class AccountingEntityHistoryService {
  static async getEntityHistory(
    payload: Payload,
    query: {
      search?: string
      actionTypes?: string[]
      entityTypes?: string[]
      quickFilters?: string[]
      page?: number
      limit?: number
    } = {},
  ): Promise<EntityHistoryResult> {
    const page = Math.max(1, query.page || 1)
    const limit = Math.min(100, Math.max(1, query.limit || 10))

    const auditLogs = await findAllDocs<AuditLogDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.auditLogs,
      depth: 1,
    })

    const preparedEvents: PreparedEntityEvent[] = auditLogs
      .filter((log) => normalizeSearch(log.entityType) !== 'audit_log')
      .map((log) => {
        const actionType = String(log.actionType || 'updated')
        const entityType = String(log.entityType || 'unknown')
        const entityId = String(log.entityId || 'Unknown')
        const actionLabel = formatActionLabel(log.actionType)
        const entityTypeLabel = formatEntityTypeLabel(log.entityType)
        const performedBy = resolveUserLabel(log.performedBy)
        const performedAt = log.performedAt || log.createdAt || null
        const sourceFieldSummary = summarizeSourceField(log)
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
          sourceField: sourceFieldSummary,
          sourceFieldSummary,
          reason,
          metadataSummary,
          metadata: log.metadata ?? null,
          beforeData: log.beforeData ?? null,
          afterData: log.afterData ?? null,
          searchableText: buildSearchableText([
            entityType,
            entityTypeLabel,
            entityId,
            actionType,
            actionLabel,
            performedBy,
            sourceFieldSummary,
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

    const entitiesTouched = new Set(filteredEvents.map((event) => `${event.entityType}:${event.entityId}`)).size
    const invoiceHistoryEvents = filteredEvents.filter((event) => event.entityType === 'invoice').length
    const bankingHistoryEvents = filteredEvents.filter((event) => BANKING_ENTITY_TYPES.has(event.entityType)).length
    const voidedRecords = filteredEvents.filter((event) => event.actionType === 'voided').length

    return {
      rows: pagedEvents.map((event) => ({
        ...event,
        cells: [
          event.performedAtLabel,
          event.entityTypeLabel,
          { text: event.entityId, emphasis: true },
          { text: event.actionLabel, tone: event.actionTone },
          event.performedBy,
          event.sourceFieldSummary || '-',
        ],
      })),
      metrics: [
        {
          label: 'Entities Touched',
          value: entitiesTouched,
          change: 'Distinct accounting records with visible audit activity',
          trend: entitiesTouched > 0 ? 'up' : 'neutral',
        },
        {
          label: 'Invoice History Events',
          value: invoiceHistoryEvents,
          change: 'Invoice entity history captured in the current results',
          trend: invoiceHistoryEvents > 0 ? 'up' : 'neutral',
        },
        {
          label: 'Banking History Events',
          value: bankingHistoryEvents,
          change: 'Banking, transfer, deposit, and reconciliation activity',
          trend: bankingHistoryEvents > 0 ? 'neutral' : 'down',
        },
        {
          label: 'Voided Records',
          value: voidedRecords,
          change: 'Records with void activity in the filtered entity history',
          trend: voidedRecords > 0 ? 'down' : 'neutral',
        },
      ],
      filterOptions: {
        actionTypes: allActionTypes.map((label) => ({ label, value: label })),
        entityTypes: allEntityTypes.map((label) => ({ label, value: label })),
        quickFilters: [
          { label: 'Invoice', value: 'entityType:Invoice' },
          { label: 'Bill', value: 'entityType:Bill' },
          { label: 'Payment Made', value: 'entityType:Payment Made' },
          { label: 'Bank Reconciliation', value: 'entityType:Bank Reconciliation' },
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
