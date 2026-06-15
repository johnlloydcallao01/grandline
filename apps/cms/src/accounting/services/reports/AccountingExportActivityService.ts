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

export type ExportActivityRow = {
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
  metadataSummary: string
  exportCategory: string
  exportCategoryLabel: string
  format: string
  formatLabel: string
  reason: string
  metadata: unknown
  beforeData: unknown
  afterData: unknown
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>
}

export type ExportActivityResult = {
  rows: ExportActivityRow[]
  metrics: Array<{
    label: string
    value: number | string
    change: string
    trend: 'up' | 'down' | 'neutral'
  }>
  filterOptions: {
    categories: Array<{ label: string; value: string }>
    entityTypes: Array<{ label: string; value: string }>
    quickFilters: Array<{ label: string; value: string }>
  }
  appliedFilters: {
    search: string
    categories: string[]
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

type PreparedExportEvent = Omit<ExportActivityRow, 'cells'> & {
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
  exported: 'blue',
}

const EXPORT_CATEGORY_LABELS: Record<string, string> = {
  register: 'Register',
  report: 'Report',
  snapshot: 'Snapshot',
  other: 'Other',
}

const FORMAT_LABELS: Record<string, string> = {
  csv: 'CSV',
  pdf: 'PDF',
  xlsx: 'XLSX',
  excel: 'Excel',
  json: 'JSON',
  package: 'Package',
  other: 'Other',
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

const readMetadataRecord = (value: AuditLogDoc['metadata']) =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null

const deriveExportCategory = (log: AuditLogDoc) => {
  const metadata = readMetadataRecord(log.metadata)
  const reportType = normalizeSearch(metadata?.reportType)
  const eventSource = normalizeSearch(metadata?.eventSource)
  const reason = normalizeSearch(log.reason)
  const entityId = normalizeSearch(log.entityId)

  if (
    reportType.includes('snapshot') ||
    eventSource.includes('snapshot') ||
    reason.includes('snapshot') ||
    entityId.includes('snapshot')
  ) {
    return 'snapshot'
  }

  if (
    reportType.includes('register') ||
    eventSource.includes('register') ||
    reason.includes('register') ||
    entityId.includes('register')
  ) {
    return 'register'
  }

  if (reportType || eventSource || reason.includes('report')) {
    return 'report'
  }

  return 'other'
}

const deriveFormat = (log: AuditLogDoc) => {
  const metadata = readMetadataRecord(log.metadata)
  const format = normalizeSearch(
    metadata?.format || metadata?.fileFormat || metadata?.exportFormat || metadata?.extension,
  )

  if (format.includes('xlsx') || format.includes('excel')) return 'xlsx'
  if (format.includes('pdf')) return 'pdf'
  if (format.includes('csv')) return 'csv'
  if (format.includes('json')) return 'json'
  if (format.includes('package') || format.includes('zip')) return 'package'
  return format || 'other'
}

export class AccountingExportActivityService {
  static async getExportActivity(
    payload: Payload,
    query: {
      search?: string
      categories?: string[]
      entityTypes?: string[]
      quickFilters?: string[]
      page?: number
      limit?: number
    } = {},
  ): Promise<ExportActivityResult> {
    const page = Math.max(1, query.page || 1)
    const limit = Math.min(100, Math.max(1, query.limit || 10))

    const auditLogs = await findAllDocs<AuditLogDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.auditLogs,
      depth: 1,
      where: {
        actionType: {
          equals: 'exported',
        },
      },
    })

    const preparedEvents: PreparedExportEvent[] = auditLogs
      .map((log) => {
        const actionType = String(log.actionType || 'exported')
        const entityType = String(log.entityType || 'audit_log')
        const entityId = String(log.entityId || 'Unknown')
        const actionLabel = formatActionLabel(log.actionType)
        const entityTypeLabel = formatEntityTypeLabel(log.entityType)
        const performedBy = resolveUserLabel(log.performedBy)
        const performedAt = log.performedAt || log.createdAt || null
        const exportCategory = deriveExportCategory(log)
        const format = deriveFormat(log)
        const metadataSummary = createJsonSummary(log.metadata)

        return {
          id: String(log.id),
          performedAt,
          performedAtLabel: formatDateTime(performedAt),
          entityType,
          entityTypeLabel,
          entityId,
          actionType,
          actionLabel,
          actionTone: ACTION_TONES[actionType] || 'blue',
          performedBy,
          metadataSummary,
          exportCategory,
          exportCategoryLabel: EXPORT_CATEGORY_LABELS[exportCategory] || EXPORT_CATEGORY_LABELS.other,
          format,
          formatLabel: FORMAT_LABELS[format] || format.toUpperCase(),
          reason: log.reason || 'No reason recorded.',
          metadata: log.metadata ?? null,
          beforeData: log.beforeData ?? null,
          afterData: log.afterData ?? null,
          searchableText: buildSearchableText([
            entityType,
            entityTypeLabel,
            entityId,
            actionLabel,
            performedBy,
            log.reason,
            metadataSummary,
            EXPORT_CATEGORY_LABELS[exportCategory],
            FORMAT_LABELS[format] || format,
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

    if (query.categories && query.categories.length > 0) {
      const selected = new Set(query.categories.map((value) => normalizeSearch(value)))
      filteredEvents = filteredEvents.filter((event) => selected.has(normalizeSearch(event.exportCategoryLabel)))
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
          if (filterValue.startsWith('category:')) {
            return normalizeSearch(event.exportCategoryLabel) === normalizeSearch(filterValue.replace('category:', ''))
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

    const allCategories = Array.from(new Set(preparedEvents.map((event) => event.exportCategoryLabel))).sort((a, b) =>
      a.localeCompare(b),
    )
    const allEntityTypes = Array.from(new Set(preparedEvents.map((event) => event.entityTypeLabel))).sort((a, b) =>
      a.localeCompare(b),
    )

    const registerExports = filteredEvents.filter((event) => event.exportCategory === 'register').length
    const reportExports = filteredEvents.filter((event) => event.exportCategory === 'report').length
    const snapshotExports = filteredEvents.filter((event) => event.exportCategory === 'snapshot').length
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
          event.metadataSummary,
        ],
      })),
      metrics: [
        {
          label: 'Export Events',
          value: totalDocs,
          change: 'Exported audit-log entries matching the current filters',
          trend: totalDocs > 0 ? 'up' : 'neutral',
        },
        {
          label: 'Register Exports',
          value: registerExports,
          change: 'Register downloads visible in the export audit trail',
          trend: registerExports > 0 ? 'up' : 'neutral',
        },
        {
          label: 'Report Exports',
          value: reportExports,
          change: 'Report-generation export history in the filtered results',
          trend: reportExports > 0 ? 'up' : 'neutral',
        },
        {
          label: 'Export Actors',
          value: actorCount,
          change: `${snapshotExports} snapshot exports captured in the visible history`,
          trend: actorCount > 0 ? 'neutral' : 'down',
        },
      ],
      filterOptions: {
        categories: allCategories.map((label) => ({ label, value: label })),
        entityTypes: allEntityTypes.map((label) => ({ label, value: label })),
        quickFilters: [
          { label: 'Reports', value: 'category:Report' },
          { label: 'Registers', value: 'category:Register' },
          { label: 'Snapshots', value: 'category:Snapshot' },
        ],
      },
      appliedFilters: {
        search: query.search || '',
        categories: query.categories || [],
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
