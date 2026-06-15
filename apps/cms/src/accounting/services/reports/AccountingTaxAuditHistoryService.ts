import type { Payload } from 'payload'
import {
  ACCOUNTING_ENTITY_TYPE_OPTIONS,
  ACCOUNTING_FINANCE_AUDIT_ACTION_OPTIONS,
  ACCOUNTING_COLLECTION_SLUGS,
  TAX_CALCULATION_METHOD_OPTIONS,
  TAX_SCOPE_OPTIONS,
} from '../../constants/accounting'
import { findAllDocs } from '../../utils/findAllDocs'

type AuditTone = 'amber' | 'blue' | 'gray' | 'green' | 'red'

type TaxCodeDoc = {
  id: number | string
  code?: string | null
  name?: string | null
  scope?: string | null
  rate?: number | null
  calculationMethod?: string | null
  isActive?: boolean | null
  description?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  createdBy?: { id?: number | string; name?: string | null; email?: string | null } | number | string | null
  updatedBy?: { id?: number | string; name?: string | null; email?: string | null } | number | string | null
}

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

export type TaxAuditHistoryRow = {
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
  source: string
  sourceLabel: string
  metadataSummary: string
  beforeData: unknown
  afterData: unknown
  metadata: unknown
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>
}

export type TaxAuditHistoryResult = {
  rows: TaxAuditHistoryRow[]
  metrics: Array<{
    label: string
    value: number | string
    change: string
    trend: 'up' | 'down' | 'neutral'
  }>
  filterOptions: {
    actionTypes: Array<{ label: string; value: string }>
    sources: Array<{ label: string; value: string }>
    quickFilters: Array<{ label: string; value: string }>
  }
  appliedFilters: {
    search: string
    actionTypes: string[]
    sources: string[]
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

type AggregatedAuditEvent = Omit<TaxAuditHistoryRow, 'cells'> & {
  searchableText: string
}

const scopeLabelMap = new Map<string, string>(TAX_SCOPE_OPTIONS.map((option) => [option.value, option.label]))
const methodLabelMap = new Map<string, string>(TAX_CALCULATION_METHOD_OPTIONS.map((option) => [option.value, option.label]))
const entityTypeLabelMap = new Map<string, string>(ACCOUNTING_ENTITY_TYPE_OPTIONS.map((option) => [option.value, option.label]))
const actionLabelMap = new Map<string, string>(ACCOUNTING_FINANCE_AUDIT_ACTION_OPTIONS.map((option) => [option.value, option.label]))

const SOURCE_LABELS = {
  tax_code_governance: 'Tax Code Governance',
  tax_export_activity: 'Tax Export Activity',
} as const

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

const buildTaxCodeReason = (doc: TaxCodeDoc, eventType: 'created' | 'updated') => {
  const scopeLabel = doc.scope ? scopeLabelMap.get(doc.scope) || doc.scope : 'No scope'
  const rateLabel = typeof doc.rate === 'number' ? `${doc.rate}%` : 'No rate'
  const methodLabel = doc.calculationMethod ? methodLabelMap.get(doc.calculationMethod) || doc.calculationMethod : 'No method'
  const statusLabel = doc.isActive === false ? 'Inactive' : 'Active'

  if (eventType === 'created') {
    return `Tax code ${doc.code || doc.id} created with ${scopeLabel} scope, ${rateLabel} rate, ${methodLabel} method, and ${statusLabel} status.`
  }

  return `Tax code ${doc.code || doc.id} updated. Current control state is ${scopeLabel} scope, ${rateLabel} rate, ${methodLabel} method, and ${statusLabel} status.`
}

const createTaxCodeMetadata = (doc: TaxCodeDoc, eventType: 'created' | 'updated' | 'voided') => ({
  domain: 'tax-code',
  eventSource: 'tax-code-record',
  eventType,
  taxCodeId: String(doc.id),
  taxCodeCode: doc.code || null,
  taxCodeName: doc.name || null,
  scope: doc.scope || null,
  scopeLabel: doc.scope ? scopeLabelMap.get(doc.scope) || doc.scope : null,
  rate: doc.rate ?? null,
  calculationMethod: doc.calculationMethod || null,
  calculationMethodLabel: doc.calculationMethod ? methodLabelMap.get(doc.calculationMethod) || doc.calculationMethod : null,
  isActive: doc.isActive !== false,
  description: doc.description || null,
})

const buildSearchableText = (parts: Array<unknown>) => parts.map((part) => normalizeSearch(part)).join(' ')

const isTaxExportAuditLog = (log: AuditLogDoc) => {
  const metadata = typeof log.metadata === 'object' && log.metadata !== null && !Array.isArray(log.metadata)
    ? (log.metadata as Record<string, unknown>)
    : null
  const reportType = normalizeSearch(metadata?.reportType)
  const eventSource = normalizeSearch(metadata?.eventSource)
  const domain = normalizeSearch(metadata?.domain)

  return reportType.includes('tax') || eventSource === 'tax-summary-export' || domain === 'tax-report'
}

const isTaxCodeAuditLog = (log: AuditLogDoc) => {
  const metadata = typeof log.metadata === 'object' && log.metadata !== null && !Array.isArray(log.metadata)
    ? (log.metadata as Record<string, unknown>)
    : null
  return normalizeSearch(metadata?.domain) === 'tax-code' || normalizeSearch(metadata?.eventSource) === 'tax-code-record'
}

export class AccountingTaxAuditHistoryService {
  static async getAuditHistory(
    payload: Payload,
    query: {
      search?: string
      actionTypes?: string[]
      sources?: string[]
      quickFilters?: string[]
      page?: number
      limit?: number
    } = {},
  ): Promise<TaxAuditHistoryResult> {
    const page = Math.max(1, query.page || 1)
    const limit = Math.min(100, Math.max(1, query.limit || 10))

    const [taxCodes, auditLogs] = await Promise.all([
      findAllDocs<TaxCodeDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
        depth: 1,
      }),
      findAllDocs<AuditLogDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.auditLogs,
        depth: 1,
      }),
    ])

    const events: AggregatedAuditEvent[] = []

    for (const doc of taxCodes) {
      if (doc.createdAt) {
        const metadata = createTaxCodeMetadata(doc, 'created')
        events.push({
          id: `tax-code-created-${doc.id}`,
          performedAt: doc.createdAt,
          performedAtLabel: formatDateTime(doc.createdAt),
          entityType: 'tax_code',
          entityTypeLabel: 'Tax Code',
          entityId: doc.code || String(doc.id),
          actionType: 'created',
          actionLabel: 'Created',
          actionTone: ACTION_TONES.created,
          performedBy: resolveUserLabel(doc.createdBy),
          reason: buildTaxCodeReason(doc, 'created'),
          source: 'tax_code_governance',
          sourceLabel: SOURCE_LABELS.tax_code_governance,
          metadataSummary: createJsonSummary(metadata),
          beforeData: null,
          afterData: metadata,
          metadata,
          searchableText: buildSearchableText([
            doc.code,
            doc.name,
            'created',
            SOURCE_LABELS.tax_code_governance,
            resolveUserLabel(doc.createdBy),
            metadata.scopeLabel,
            metadata.calculationMethodLabel,
          ]),
        })
      }

      if (doc.updatedAt && doc.updatedAt !== doc.createdAt) {
        const metadata = createTaxCodeMetadata(doc, 'updated')
        events.push({
          id: `tax-code-updated-${doc.id}-${doc.updatedAt}`,
          performedAt: doc.updatedAt,
          performedAtLabel: formatDateTime(doc.updatedAt),
          entityType: 'tax_code',
          entityTypeLabel: 'Tax Code',
          entityId: doc.code || String(doc.id),
          actionType: 'updated',
          actionLabel: 'Updated',
          actionTone: ACTION_TONES.updated,
          performedBy: resolveUserLabel(doc.updatedBy),
          reason: buildTaxCodeReason(doc, 'updated'),
          source: 'tax_code_governance',
          sourceLabel: SOURCE_LABELS.tax_code_governance,
          metadataSummary: createJsonSummary(metadata),
          beforeData: null,
          afterData: metadata,
          metadata,
          searchableText: buildSearchableText([
            doc.code,
            doc.name,
            'updated',
            SOURCE_LABELS.tax_code_governance,
            resolveUserLabel(doc.updatedBy),
            metadata.scopeLabel,
            metadata.calculationMethodLabel,
          ]),
        })
      }
    }

    for (const log of auditLogs) {
      if (!isTaxCodeAuditLog(log) && !isTaxExportAuditLog(log)) {
        continue
      }

      const isExport = isTaxExportAuditLog(log)
      const metadata = log.metadata ?? null
      const actionType = log.actionType || (isExport ? 'exported' : 'updated')
      const actionLabel = formatActionLabel(actionType)
      const entityTypeLabel = isTaxCodeAuditLog(log) ? 'Tax Code' : formatEntityTypeLabel(log.entityType)
      const entityId = String(log.entityId || 'Unknown')
      const performedBy = resolveUserLabel(log.performedBy)
      const reason = log.reason || (isExport ? 'Tax report export recorded in audit history.' : 'Tax control change recorded in audit history.')
      const source = isExport ? 'tax_export_activity' : 'tax_code_governance'
      const sourceLabel = isExport ? SOURCE_LABELS.tax_export_activity : SOURCE_LABELS.tax_code_governance

      events.push({
        id: `audit-log-${log.id}`,
        performedAt: log.performedAt || log.createdAt || null,
        performedAtLabel: formatDateTime(log.performedAt || log.createdAt || null),
        entityType: String(log.entityType || 'audit_log'),
        entityTypeLabel,
        entityId,
        actionType,
        actionLabel,
        actionTone: ACTION_TONES[actionType] || 'gray',
        performedBy,
        reason,
        source,
        sourceLabel,
        metadataSummary: createJsonSummary(metadata),
        beforeData: log.beforeData ?? null,
        afterData: log.afterData ?? null,
        metadata,
        searchableText: buildSearchableText([
          entityTypeLabel,
          entityId,
          actionLabel,
          performedBy,
          reason,
          sourceLabel,
          createJsonSummary(metadata),
        ]),
      })
    }

    events.sort((a, b) => {
      const left = a.performedAt ? new Date(a.performedAt).getTime() : 0
      const right = b.performedAt ? new Date(b.performedAt).getTime() : 0
      return right - left
    })

    const allActionTypes = Array.from(new Set(events.map((event) => event.actionLabel))).sort((a, b) => a.localeCompare(b))
    const allSources = Array.from(new Set(events.map((event) => event.sourceLabel))).sort((a, b) => a.localeCompare(b))

    let filteredEvents = events

    if (query.search?.trim()) {
      const search = normalizeSearch(query.search)
      filteredEvents = filteredEvents.filter((event) => event.searchableText.includes(search))
    }

    if (query.actionTypes && query.actionTypes.length > 0) {
      const selected = new Set(query.actionTypes.map((value) => normalizeSearch(value)))
      filteredEvents = filteredEvents.filter((event) => selected.has(normalizeSearch(event.actionLabel)))
    }

    if (query.sources && query.sources.length > 0) {
      const selected = new Set(query.sources.map((value) => normalizeSearch(value)))
      filteredEvents = filteredEvents.filter((event) => selected.has(normalizeSearch(event.sourceLabel)))
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

          if (filterValue.startsWith('source:')) {
            return normalizeSearch(event.sourceLabel) === normalizeSearch(filterValue.replace('source:', ''))
          }

          return false
        }),
      )
    }

    const totalDocs = filteredEvents.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const pagedEvents = filteredEvents.slice((page - 1) * limit, page * limit)

    const taxCodeEvents = filteredEvents.filter((event) => event.source === 'tax_code_governance').length
    const exportEvents = filteredEvents.filter((event) => event.source === 'tax_export_activity').length
    const actors = new Set(filteredEvents.map((event) => event.performedBy).filter((value) => value && value !== 'System')).size
    const controlChanges = filteredEvents.filter((event) => event.actionType === 'created' || event.actionType === 'updated' || event.actionType === 'voided').length

    return {
      rows: pagedEvents.map((event) => ({
        ...event,
        cells: [
          event.performedAtLabel,
          event.entityTypeLabel,
          { text: event.entityId || '-', emphasis: true },
          { text: event.actionLabel, tone: event.actionTone },
          event.performedBy,
          event.reason || '-',
        ],
      })),
      metrics: [
        {
          label: 'Audit Events',
          value: totalDocs,
          change: 'Tax governance and export history matching current filters',
          trend: totalDocs > 0 ? 'up' : 'neutral',
        },
        {
          label: 'Tax Code Events',
          value: taxCodeEvents,
          change: 'Governance create, update, and retirement activity',
          trend: taxCodeEvents > 0 ? 'up' : 'neutral',
        },
        {
          label: 'Export Events',
          value: exportEvents,
          change: 'Tax summary and related outbound audit entries',
          trend: exportEvents > 0 ? 'up' : 'neutral',
        },
        {
          label: 'Actors Logged',
          value: actors,
          change: `${controlChanges} control changes captured in visible history`,
          trend: actors > 0 ? 'neutral' : 'down',
        },
      ],
      filterOptions: {
        actionTypes: allActionTypes.map((label) => ({ label, value: label })),
        sources: allSources.map((label) => ({ label, value: label })),
        quickFilters: [
          { label: 'Created', value: 'actionType:Created' },
          { label: 'Updated', value: 'actionType:Updated' },
          { label: 'Exported', value: 'actionType:Exported' },
          { label: SOURCE_LABELS.tax_code_governance, value: `source:${SOURCE_LABELS.tax_code_governance}` },
          { label: SOURCE_LABELS.tax_export_activity, value: `source:${SOURCE_LABELS.tax_export_activity}` },
        ],
      },
      appliedFilters: {
        search: query.search || '',
        actionTypes: query.actionTypes || [],
        sources: query.sources || [],
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
        totalRows: events.length,
        filteredRows: totalDocs,
      },
    }
  }
}
