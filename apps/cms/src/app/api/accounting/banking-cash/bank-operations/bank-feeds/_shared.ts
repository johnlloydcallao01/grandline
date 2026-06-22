import type { Payload } from 'payload'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  BANK_FEED_CONNECTION_STATUS_OPTIONS,
  BANK_FEED_CONNECTOR_TYPE_OPTIONS,
  BANK_FEED_HEALTH_STATUS_OPTIONS,
  BANK_FEED_SYNC_FREQUENCY_OPTIONS,
} from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { parseNumberParam, AccountingApiError } from '../../../_utils/auth'

type StatusTone = 'amber' | 'blue' | 'gray' | 'green' | 'red'

export type BankFeedCell =
  | string
  | {
    text: string
    tone?: StatusTone
    emphasis?: boolean
    align?: 'left' | 'right' | 'center'
  }

export type BankFeedDoc = {
  id: number | string
  feedReference?: string | null
  bankAccount?:
  | {
    id?: number | string
    accountName?: string | null
    bankName?: string | null
    accountNumberMasked?: string | null
    accountType?: string | null
    currencyReference?: {
      code?: string | null
      name?: string | null
    } | null
    ledgerAccount?: {
      id?: number | string
      code?: string | null
      name?: string | null
    } | null
  }
  | number
  | string
  | null
  connectorType?: string | null
  connectorName?: string | null
  providerReference?: string | null
  externalAccountId?: string | null
  connectionStatus?: string | null
  healthStatus?: string | null
  syncFrequency?: string | null
  lastSyncAt?: string | null
  lastSuccessfulSyncAt?: string | null
  lastAttemptedSyncAt?: string | null
  nextScheduledSyncAt?: string | null
  lastImportedRowCount?: number | null
  lastImportedTransactionCount?: number | null
  feedRuleSetName?: string | null
  feedRuleCount?: number | null
  autoPostRuleCount?: number | null
  manualReviewRuleCount?: number | null
  lastRuleChangeAt?: string | null
  syncDelayMinutes?: number | null
  averageSyncLatencySeconds?: number | null
  tokenExpiresAt?: string | null
  needsReconnection?: boolean | null
  disconnectReason?: string | null
  lastErrorSummary?: string | null
  notes?: string | null
  metadata?: Record<string, unknown> | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type BankFeedRow = {
  id: string
  feedReference: string
  bankAccountId: string
  bankAccountLabel: string
  bankAccountType: string
  currency: string
  connectorType: string
  connectorTypeLabel: string
  connectorName: string
  providerReference: string
  externalAccountId: string
  connectionStatus: string
  connectionStatusLabel: string
  connectionStatusTone: StatusTone
  healthStatus: string
  healthStatusLabel: string
  healthStatusTone: StatusTone
  syncFrequency: string
  syncFrequencyLabel: string
  lastSyncAt: string | null
  lastSyncAtLabel: string
  lastSuccessfulSyncAt: string | null
  lastSuccessfulSyncAtLabel: string
  lastAttemptedSyncAt: string | null
  lastAttemptedSyncAtLabel: string
  nextScheduledSyncAt: string | null
  nextScheduledSyncAtLabel: string
  lastImportedRowCount: number
  lastImportedTransactionCount: number
  feedRuleSetName: string
  feedRuleCount: number
  autoPostRuleCount: number
  manualReviewRuleCount: number
  lastRuleChangeAt: string | null
  lastRuleChangeAtLabel: string
  syncDelayMinutes: number
  averageSyncLatencySeconds: number
  tokenExpiresAt: string | null
  tokenExpiresAtLabel: string
  needsReconnection: boolean
  disconnectReason: string
  lastErrorSummary: string
  notes: string
  requiresAttention: boolean
  hasRecentRuleChange: boolean
  isHealthy: boolean
  isDisconnected: boolean
  isSyncDelayed: boolean
  searchableText: string
  cells: BankFeedCell[]
}

export type BankFeedDetail = BankFeedRow & {
  bankLedgerAccountLabel: string
  metadata: Record<string, unknown> | null
  createdAt: string | null
  updatedAt: string | null
  usageSummary: {
    canEdit: boolean
    canDelete: boolean
    canSync: boolean
    deleteBlockedReason: string | null
  }
}

export type BankFeedMutationBody = {
  feedReference?: string | null
  bankAccount?: string | number | null
  connectorType?: string | null
  connectorName?: string | null
  providerReference?: string | null
  externalAccountId?: string | number | null
  connectionStatus?: string | null
  healthStatus?: string | null
  syncFrequency?: string | null
  lastSyncAt?: string | null
  lastSuccessfulSyncAt?: string | null
  lastAttemptedSyncAt?: string | null
  nextScheduledSyncAt?: string | null
  lastImportedRowCount?: number | null
  lastImportedTransactionCount?: number | null
  feedRuleSetName?: string | null
  feedRuleCount?: number | null
  autoPostRuleCount?: number | null
  manualReviewRuleCount?: number | null
  lastRuleChangeAt?: string | null
  syncDelayMinutes?: number | null
  averageSyncLatencySeconds?: number | null
  tokenExpiresAt?: string | null
  needsReconnection?: boolean | null
  disconnectReason?: string | null
  lastErrorSummary?: string | null
  notes?: string | null
  metadata?: Record<string, unknown> | null
}

type BankFeedPersistedMutationBody = {
  feedReference?: string | null
  bankAccount?: string | number | null
  connectorType?: string | null
  connectorName?: string | null
  providerReference?: string | null
  externalAccountId?: string | null
  connectionStatus?: string | null
  healthStatus?: string | null
  syncFrequency?: string | null
  lastSyncAt?: string | null
  lastSuccessfulSyncAt?: string | null
  lastAttemptedSyncAt?: string | null
  nextScheduledSyncAt?: string | null
  lastImportedRowCount?: number
  lastImportedTransactionCount?: number
  feedRuleSetName?: string | null
  feedRuleCount?: number
  autoPostRuleCount?: number
  manualReviewRuleCount?: number
  lastRuleChangeAt?: string | null
  syncDelayMinutes?: number
  averageSyncLatencySeconds?: number
  tokenExpiresAt?: string | null
  needsReconnection?: boolean
  disconnectReason?: string | null
  lastErrorSummary?: string | null
  notes?: string | null
  metadata?: Record<string, unknown> | null
}

const connectorTypeLabelMap = new Map<string, string>(
  BANK_FEED_CONNECTOR_TYPE_OPTIONS.map((option) => [String(option.value), option.label]),
)
const connectionStatusLabelMap = new Map<string, string>(
  BANK_FEED_CONNECTION_STATUS_OPTIONS.map((option) => [String(option.value), option.label]),
)
const healthStatusLabelMap = new Map<string, string>(
  BANK_FEED_HEALTH_STATUS_OPTIONS.map((option) => [String(option.value), option.label]),
)
const syncFrequencyLabelMap = new Map<string, string>(
  BANK_FEED_SYNC_FREQUENCY_OPTIONS.map((option) => [String(option.value), option.label]),
)

export const parseIntegerParam = (value: string | null | undefined, fallback: number) => {
  const parsedValue = Number.parseInt(String(value ?? ''), 10)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

export const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
  Array.from(
    new Set(
      searchParams
        .getAll(key)
        .flatMap((value) => String(value || '').split(','))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  )

export const normalizeSearch = (value: unknown) => String(value ?? '').toLowerCase().trim()

const normalizeOptionalString = (value: unknown) => {
  if (value === undefined) return undefined
  if (value === null) return null
  const normalized = String(value).trim()
  return normalized || null
}

const normalizeRelationshipId = (value: unknown) => {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  const normalized = String(value).trim()
  if (!normalized || normalized === 'null' || normalized === 'undefined') return null
  return parseNumberParam(normalized)
}

const normalizeDateValue = (value: unknown) => {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

const normalizeNumber = (value: unknown, fallback = 0) => {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return parsed
}

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
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const getConnectionStatusTone = (status: string | null | undefined): StatusTone => {
  switch (String(status || '')) {
    case 'connected':
      return 'green'
    case 'sync_delayed':
      return 'amber'
    case 'action_required':
      return 'red'
    case 'disconnected':
      return 'gray'
    default:
      return 'blue'
  }
}

const getHealthStatusTone = (status: string | null | undefined): StatusTone => {
  switch (String(status || '')) {
    case 'healthy':
      return 'green'
    case 'monitor':
      return 'blue'
    case 'warning':
      return 'amber'
    case 'critical':
      return 'red'
    default:
      return 'gray'
  }
}

const formatBankAccountLabel = (bankAccount: BankFeedDoc['bankAccount']) => {
  if (typeof bankAccount === 'object' && bankAccount) {
    const suffix = bankAccount.accountNumberMasked ? ` (${bankAccount.accountNumberMasked})` : ''
    return `${bankAccount.accountName || 'Unnamed bank account'}${suffix}`
  }

  return ''
}

const formatLedgerAccountLabel = (bankAccount: BankFeedDoc['bankAccount']) => {
  if (typeof bankAccount === 'object' && bankAccount?.ledgerAccount) {
    const code = String(bankAccount.ledgerAccount.code || '').trim()
    const name = String(bankAccount.ledgerAccount.name || '').trim()
    if (code && name) return `${code} - ${name}`
    return code || name || ''
  }

  return ''
}

const isRecentDate = (value: string | null | undefined, days = 7) => {
  if (!value) return false
  const timestamp = new Date(value).getTime()
  if (!Number.isFinite(timestamp)) return false
  return Date.now() - timestamp <= days * 24 * 60 * 60 * 1000
}

export const buildBankFeedRow = (feed: BankFeedDoc): BankFeedRow => {
  const id = String(feed.id)
  const feedReference = String(feed.feedReference || '')
  const connectorType = String(feed.connectorType || 'direct_api')
  const connectionStatus = String(feed.connectionStatus || 'connected')
  const healthStatus = String(feed.healthStatus || 'healthy')
  const syncFrequency = String(feed.syncFrequency || 'hourly')
  const bankAccountLabel = formatBankAccountLabel(feed.bankAccount)
  const bankAccountType =
    typeof feed.bankAccount === 'object' && feed.bankAccount ? String(feed.bankAccount.accountType || '') : ''
  const currency =
    typeof feed.bankAccount === 'object' && feed.bankAccount
      ? String(feed.bankAccount.currencyReference?.code || 'PHP')
      : 'PHP'
  const lastImportedRowCount = Number(feed.lastImportedRowCount || 0)
  const lastImportedTransactionCount = Number(feed.lastImportedTransactionCount || 0)
  const feedRuleCount = Number(feed.feedRuleCount || 0)
  const autoPostRuleCount = Number(feed.autoPostRuleCount || 0)
  const manualReviewRuleCount = Number(feed.manualReviewRuleCount || 0)
  const syncDelayMinutes = Number(feed.syncDelayMinutes || 0)
  const averageSyncLatencySeconds = Number(feed.averageSyncLatencySeconds || 0)
  const needsReconnection = Boolean(feed.needsReconnection)
  const hasRecentRuleChange = isRecentDate(feed.lastRuleChangeAt)
  const isHealthy = connectionStatus === 'connected' && healthStatus === 'healthy' && !needsReconnection
  const isDisconnected = connectionStatus === 'disconnected'
  const isSyncDelayed = connectionStatus === 'sync_delayed' || syncDelayMinutes > 0
  const requiresAttention = !isHealthy || isSyncDelayed

  return {
    id,
    feedReference,
    bankAccountId: String(getRelationshipId(feed.bankAccount) || ''),
    bankAccountLabel,
    bankAccountType,
    currency,
    connectorType,
    connectorTypeLabel: connectorTypeLabelMap.get(connectorType) || 'Unknown',
    connectorName: String(feed.connectorName || ''),
    providerReference: String(feed.providerReference || ''),
    externalAccountId: String(feed.externalAccountId || ''),
    connectionStatus,
    connectionStatusLabel: connectionStatusLabelMap.get(connectionStatus) || 'Unknown',
    connectionStatusTone: getConnectionStatusTone(connectionStatus),
    healthStatus,
    healthStatusLabel: healthStatusLabelMap.get(healthStatus) || 'Unknown',
    healthStatusTone: getHealthStatusTone(healthStatus),
    syncFrequency,
    syncFrequencyLabel: syncFrequencyLabelMap.get(syncFrequency) || 'Unknown',
    lastSyncAt: feed.lastSyncAt || null,
    lastSyncAtLabel: formatDate(feed.lastSyncAt),
    lastSuccessfulSyncAt: feed.lastSuccessfulSyncAt || null,
    lastSuccessfulSyncAtLabel: formatDate(feed.lastSuccessfulSyncAt),
    lastAttemptedSyncAt: feed.lastAttemptedSyncAt || null,
    lastAttemptedSyncAtLabel: formatDate(feed.lastAttemptedSyncAt),
    nextScheduledSyncAt: feed.nextScheduledSyncAt || null,
    nextScheduledSyncAtLabel: formatDate(feed.nextScheduledSyncAt),
    lastImportedRowCount,
    lastImportedTransactionCount,
    feedRuleSetName: String(feed.feedRuleSetName || ''),
    feedRuleCount,
    autoPostRuleCount,
    manualReviewRuleCount,
    lastRuleChangeAt: feed.lastRuleChangeAt || null,
    lastRuleChangeAtLabel: formatDate(feed.lastRuleChangeAt),
    syncDelayMinutes,
    averageSyncLatencySeconds,
    tokenExpiresAt: feed.tokenExpiresAt || null,
    tokenExpiresAtLabel: formatDate(feed.tokenExpiresAt),
    needsReconnection,
    disconnectReason: String(feed.disconnectReason || ''),
    lastErrorSummary: String(feed.lastErrorSummary || ''),
    notes: String(feed.notes || ''),
    requiresAttention,
    hasRecentRuleChange,
    isHealthy,
    isDisconnected,
    isSyncDelayed,
    searchableText: buildSearchableText([
      feedReference,
      bankAccountLabel,
      bankAccountType,
      feed.connectorName,
      connectorTypeLabelMap.get(connectorType),
      feed.providerReference,
      feed.externalAccountId,
      connectionStatusLabelMap.get(connectionStatus),
      healthStatusLabelMap.get(healthStatus),
      feed.feedRuleSetName,
      feed.lastErrorSummary,
      feed.disconnectReason,
      feed.notes,
      JSON.stringify(feed.metadata || {}),
    ]),
    cells: [
      { text: bankAccountLabel || '-', emphasis: true },
      String(feed.connectorName || '-'),
      feed.lastSyncAt ? formatDate(feed.lastSyncAt) : '-',
      { text: String(lastImportedRowCount), align: 'right' },
      String(feed.feedRuleSetName || '-'),
      { text: healthStatusLabelMap.get(healthStatus) || 'Unknown', tone: getHealthStatusTone(healthStatus) },
    ],
  }
}

export const matchesBankFeedFilters = (
  row: BankFeedRow,
  filters: {
    statuses: string[]
    connectors: string[]
    healthStates: string[]
    quickFilters: string[]
  },
) => {
  const quickPredicates = filters.quickFilters.map((quickFilter) => {
    switch (quickFilter) {
      case 'health:healthy':
        return row.isHealthy
      case 'coverage:sync_delay':
        return row.isSyncDelayed
      case 'coverage:rule_changes':
        return row.hasRecentRuleChange
      case 'status:disconnected':
        return row.isDisconnected
      default:
        return false
    }
  })

  const predicates = [
    ...filters.statuses.map((status) => row.connectionStatus === status),
    ...filters.connectors.map((connector) => row.connectorType === connector),
    ...filters.healthStates.map((healthState) => row.healthStatus === healthState),
    ...quickPredicates,
  ]

  if (predicates.length === 0) return true
  return predicates.some(Boolean)
}

export const buildBankFeedMetrics = (rows: BankFeedRow[]) => {
  const connected = rows.filter((row) => row.connectionStatus === 'connected').length
  const healthy = rows.filter((row) => row.isHealthy).length
  const rulesActive = rows.reduce((total, row) => total + row.feedRuleCount, 0)
  const disconnected = rows.filter((row) => row.isDisconnected).length
  const delayed = rows.filter((row) => row.isSyncDelayed).length
  const averageLatency = rows.length
    ? Math.round(rows.reduce((total, row) => total + row.averageSyncLatencySeconds, 0) / rows.length)
    : 0

  return [
    {
      id: 'connected-accounts',
      label: 'Connected Accounts',
      value: connected,
      change: `${healthy} healthy / ${Math.max(rows.length - healthy, 0)} needing attention`,
      trend: healthy >= Math.max(rows.length - healthy, 0) ? ('up' as const) : ('down' as const),
    },
    {
      id: 'last-sync-latency',
      label: 'Average Sync Latency',
      value: `${averageLatency}s`,
      change: delayed > 0 ? `${delayed} delayed feed${delayed === 1 ? '' : 's'}` : 'No current sync delays',
      trend: delayed > 0 ? ('down' as const) : ('up' as const),
    },
    {
      id: 'feed-rules-active',
      label: 'Feed Rules Active',
      value: rulesActive,
      change: `${rows.filter((row) => row.hasRecentRuleChange).length} recent rule change${rows.filter((row) => row.hasRecentRuleChange).length === 1 ? '' : 's'}`,
      trend: 'neutral' as const,
    },
    {
      id: 'disconnected-feeds',
      label: 'Disconnected Feeds',
      value: disconnected,
      change: disconnected > 0 ? 'Reconnect or replace these feed connections' : 'No disconnected feeds',
      trend: disconnected > 0 ? ('down' as const) : ('up' as const),
    },
  ]
}

export const buildBankFeedReferenceData = async (payload: Payload) => {
  const bankAccounts = await findAllDocs<{
    id: number | string
    accountName?: string | null
    bankName?: string | null
    accountNumberMasked?: string | null
    accountType?: string | null
    isActive?: boolean | null
  }>({
    payload,
    collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
    depth: 0,
    sort: 'accountName',
  })

  return {
    bankAccounts: bankAccounts.map((bankAccount) => ({
      id: bankAccount.id,
      accountName: bankAccount.accountName || null,
      bankName: bankAccount.bankName || null,
      accountNumberMasked: bankAccount.accountNumberMasked || null,
      accountType: bankAccount.accountType || null,
      isActive: bankAccount.isActive !== false,
    })),
    connectorTypes: BANK_FEED_CONNECTOR_TYPE_OPTIONS.map((option) => ({ label: option.label, value: String(option.value) })),
    connectionStatuses: BANK_FEED_CONNECTION_STATUS_OPTIONS.map((option) => ({
      label: option.label,
      value: String(option.value),
    })),
    healthStatuses: BANK_FEED_HEALTH_STATUS_OPTIONS.map((option) => ({ label: option.label, value: String(option.value) })),
    syncFrequencies: BANK_FEED_SYNC_FREQUENCY_OPTIONS.map((option) => ({ label: option.label, value: String(option.value) })),
  }
}

export const buildBankFeedDetailResponse = async (payload: Payload, feed: BankFeedDoc): Promise<BankFeedDetail> => {
  const row = buildBankFeedRow(feed)
  const bankLedgerAccountLabel = formatLedgerAccountLabel(feed.bankAccount)
  const canDelete = row.isDisconnected

  return {
    ...row,
    bankLedgerAccountLabel,
    metadata: feed.metadata || null,
    createdAt: feed.createdAt || null,
    updatedAt: feed.updatedAt || null,
    usageSummary: {
      canEdit: true,
      canDelete,
      canSync: !row.isDisconnected && !row.needsReconnection,
      deleteBlockedReason: canDelete ? null : 'Disconnect the bank feed before deleting the connection record.',
    },
  }
}

export const normalizeBankFeedMutationBody = (value: Record<string, unknown>): BankFeedMutationBody => ({
  feedReference: normalizeOptionalString(value.feedReference),
  bankAccount: normalizeRelationshipId(value.bankAccount),
  connectorType: normalizeOptionalString(value.connectorType),
  connectorName: normalizeOptionalString(value.connectorName),
  providerReference: normalizeOptionalString(value.providerReference),
  externalAccountId: normalizeOptionalString(value.externalAccountId),
  connectionStatus: normalizeOptionalString(value.connectionStatus),
  healthStatus: normalizeOptionalString(value.healthStatus),
  syncFrequency: normalizeOptionalString(value.syncFrequency),
  lastSyncAt: normalizeDateValue(value.lastSyncAt),
  lastSuccessfulSyncAt: normalizeDateValue(value.lastSuccessfulSyncAt),
  lastAttemptedSyncAt: normalizeDateValue(value.lastAttemptedSyncAt),
  nextScheduledSyncAt: normalizeDateValue(value.nextScheduledSyncAt),
  lastImportedRowCount: normalizeNumber(value.lastImportedRowCount, 0),
  lastImportedTransactionCount: normalizeNumber(value.lastImportedTransactionCount, 0),
  feedRuleSetName: normalizeOptionalString(value.feedRuleSetName),
  feedRuleCount: normalizeNumber(value.feedRuleCount, 0),
  autoPostRuleCount: normalizeNumber(value.autoPostRuleCount, 0),
  manualReviewRuleCount: normalizeNumber(value.manualReviewRuleCount, 0),
  lastRuleChangeAt: normalizeDateValue(value.lastRuleChangeAt),
  syncDelayMinutes: normalizeNumber(value.syncDelayMinutes, 0),
  averageSyncLatencySeconds: normalizeNumber(value.averageSyncLatencySeconds, 0),
  tokenExpiresAt: normalizeDateValue(value.tokenExpiresAt),
  needsReconnection:
    value.needsReconnection === undefined ? undefined : Boolean(value.needsReconnection),
  disconnectReason: normalizeOptionalString(value.disconnectReason),
  lastErrorSummary: normalizeOptionalString(value.lastErrorSummary),
  notes: normalizeOptionalString(value.notes),
  metadata:
    value.metadata && typeof value.metadata === 'object' && !Array.isArray(value.metadata)
      ? (value.metadata as Record<string, unknown>)
      : value.metadata === null
        ? null
        : undefined,
})

export const buildBankFeedPersistenceData = (
  body: BankFeedMutationBody,
): BankFeedPersistedMutationBody => ({
  feedReference: body.feedReference,
  bankAccount: body.bankAccount,
  connectorType: body.connectorType,
  connectorName: body.connectorName,
  providerReference: body.providerReference,
  externalAccountId:
    body.externalAccountId === null
      ? null
      : body.externalAccountId === undefined
        ? undefined
        : String(body.externalAccountId),
  connectionStatus: body.connectionStatus,
  healthStatus: body.healthStatus,
  syncFrequency: body.syncFrequency,
  lastSyncAt: body.lastSyncAt,
  lastSuccessfulSyncAt: body.lastSuccessfulSyncAt,
  lastAttemptedSyncAt: body.lastAttemptedSyncAt,
  nextScheduledSyncAt: body.nextScheduledSyncAt,
  lastImportedRowCount: body.lastImportedRowCount === null ? 0 : body.lastImportedRowCount,
  lastImportedTransactionCount:
    body.lastImportedTransactionCount === null ? 0 : body.lastImportedTransactionCount,
  feedRuleSetName: body.feedRuleSetName,
  feedRuleCount: body.feedRuleCount === null ? 0 : body.feedRuleCount,
  autoPostRuleCount: body.autoPostRuleCount === null ? 0 : body.autoPostRuleCount,
  manualReviewRuleCount: body.manualReviewRuleCount === null ? 0 : body.manualReviewRuleCount,
  lastRuleChangeAt: body.lastRuleChangeAt,
  syncDelayMinutes: body.syncDelayMinutes === null ? 0 : body.syncDelayMinutes,
  averageSyncLatencySeconds:
    body.averageSyncLatencySeconds === null ? 0 : body.averageSyncLatencySeconds,
  tokenExpiresAt: body.tokenExpiresAt,
  needsReconnection: Boolean(body.needsReconnection),
  disconnectReason: body.disconnectReason,
  lastErrorSummary: body.lastErrorSummary,
  notes: body.notes,
  metadata: body.metadata,
})

export const assertBankFeedMutationPayload = async (
  payload: Payload,
  body: BankFeedMutationBody,
  currentId?: string | number | null,
) => {
  const bankAccountId = body.bankAccount
  const connectorType = String(body.connectorType || '')
  const connectionStatus = String(body.connectionStatus || '')
  const healthStatus = String(body.healthStatus || '')
  const syncFrequency = String(body.syncFrequency || '')
  const connectorName = String(body.connectorName || '').trim()

  if (!bankAccountId) {
    throw new AccountingApiError('Bank account is required.', 400)
  }

  if (!connectorName) {
    throw new AccountingApiError('Connector name is required.', 400)
  }

  if (!BANK_FEED_CONNECTOR_TYPE_OPTIONS.some((option) => option.value === connectorType)) {
    throw new AccountingApiError('Connector type is invalid.', 400)
  }

  if (!BANK_FEED_CONNECTION_STATUS_OPTIONS.some((option) => option.value === connectionStatus)) {
    throw new AccountingApiError('Connection status is invalid.', 400)
  }

  if (!BANK_FEED_HEALTH_STATUS_OPTIONS.some((option) => option.value === healthStatus)) {
    throw new AccountingApiError('Health status is invalid.', 400)
  }

  if (!BANK_FEED_SYNC_FREQUENCY_OPTIONS.some((option) => option.value === syncFrequency)) {
    throw new AccountingApiError('Sync frequency is invalid.', 400)
  }

  const bankAccount = await payload.findByID({
    collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
    id: bankAccountId,
    depth: 0,
    overrideAccess: true,
  }).catch(() => null)

  if (!bankAccount) {
    throw new AccountingApiError('Selected bank account does not exist.', 400)
  }

  const duplicates = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.bankFeeds,
    where: {
      bankAccount: {
        equals: bankAccountId,
      },
    } as never,
    limit: 20,
    depth: 0,
    overrideAccess: true,
  })

  const conflictingDoc = duplicates.docs.find((doc) => String((doc as { id: string | number }).id) !== String(currentId || ''))
  if (conflictingDoc) {
    throw new AccountingApiError('A bank feed already exists for the selected bank account. Edit the existing feed instead of creating another one.', 400)
  }
}
