import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  BANK_FEED_CONNECTION_STATUS_OPTIONS,
  BANK_FEED_CONNECTOR_TYPE_OPTIONS,
  BANK_FEED_HEALTH_STATUS_OPTIONS,
  BANK_FEED_SYNC_FREQUENCY_OPTIONS,
} from '../constants/accounting'
import { applyCreatedAndUpdatedBy, getRequestUserId } from '../utils/accounting-audit'
import { normalizeOptionalText } from '../utils/commercial'

const normalizeNonNegativeNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return parsed
}

const normalizeNullableDate = (value: unknown) => {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

const generateFeedReference = () => {
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14)
  const suffix = Math.floor(100 + Math.random() * 900)
  return `BFD-${stamp}-${suffix}`
}

export const AccountingBankFeeds: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.bankFeeds,
  admin: {
    useAsTitle: 'feedReference',
    defaultColumns: ['feedReference', 'bankAccount', 'connectorName', 'connectionStatus', 'healthStatus'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Connected bank feed records, sync health, reconnect issues, and rule coverage for banking operations.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'feedReference', type: 'text', required: true, index: true },
    { name: 'bankAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.bankAccounts, required: true, index: true },
    { name: 'connectorType', type: 'select', required: true, defaultValue: 'direct_api', options: [...BANK_FEED_CONNECTOR_TYPE_OPTIONS], index: true },
    { name: 'connectorName', type: 'text', required: true },
    { name: 'providerReference', type: 'text' },
    { name: 'externalAccountId', type: 'text' },
    { name: 'connectionStatus', type: 'select', required: true, defaultValue: 'connected', options: [...BANK_FEED_CONNECTION_STATUS_OPTIONS], index: true },
    { name: 'healthStatus', type: 'select', required: true, defaultValue: 'healthy', options: [...BANK_FEED_HEALTH_STATUS_OPTIONS], index: true },
    { name: 'syncFrequency', type: 'select', required: true, defaultValue: 'hourly', options: [...BANK_FEED_SYNC_FREQUENCY_OPTIONS], index: true },
    { name: 'lastSyncAt', type: 'date', index: true },
    { name: 'lastSuccessfulSyncAt', type: 'date' },
    { name: 'lastAttemptedSyncAt', type: 'date' },
    { name: 'nextScheduledSyncAt', type: 'date' },
    { name: 'lastImportedRowCount', type: 'number', min: 0, defaultValue: 0 },
    { name: 'lastImportedTransactionCount', type: 'number', min: 0, defaultValue: 0 },
    { name: 'feedRuleSetName', type: 'text' },
    { name: 'feedRuleCount', type: 'number', min: 0, defaultValue: 0 },
    { name: 'autoPostRuleCount', type: 'number', min: 0, defaultValue: 0 },
    { name: 'manualReviewRuleCount', type: 'number', min: 0, defaultValue: 0 },
    { name: 'lastRuleChangeAt', type: 'date' },
    { name: 'syncDelayMinutes', type: 'number', min: 0, defaultValue: 0 },
    { name: 'averageSyncLatencySeconds', type: 'number', min: 0, defaultValue: 0 },
    { name: 'tokenExpiresAt', type: 'date' },
    { name: 'needsReconnection', type: 'checkbox', defaultValue: false, index: true },
    { name: 'disconnectReason', type: 'textarea' },
    { name: 'lastErrorSummary', type: 'textarea' },
    { name: 'notes', type: 'textarea' },
    { name: 'metadata', type: 'json' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, originalDoc }) => {
        if (!data) return data

        data.feedReference = String(data.feedReference || originalDoc?.feedReference || generateFeedReference()).trim()
        data.connectorName = String(data.connectorName || originalDoc?.connectorName || '').trim()
        data.connectorType = String(data.connectorType || originalDoc?.connectorType || 'direct_api').trim() || 'direct_api'
        data.connectionStatus =
          String(data.connectionStatus || originalDoc?.connectionStatus || 'connected').trim() || 'connected'
        data.healthStatus = String(data.healthStatus || originalDoc?.healthStatus || 'healthy').trim() || 'healthy'
        data.syncFrequency = String(data.syncFrequency || originalDoc?.syncFrequency || 'hourly').trim() || 'hourly'
        data.providerReference = normalizeOptionalText(data.providerReference)
        data.externalAccountId = normalizeOptionalText(data.externalAccountId)
        data.feedRuleSetName = normalizeOptionalText(data.feedRuleSetName)
        data.disconnectReason = normalizeOptionalText(data.disconnectReason)
        data.lastErrorSummary = normalizeOptionalText(data.lastErrorSummary)
        data.notes = normalizeOptionalText(data.notes)
        data.lastImportedRowCount = normalizeNonNegativeNumber(data.lastImportedRowCount, normalizeNonNegativeNumber(originalDoc?.lastImportedRowCount))
        data.lastImportedTransactionCount = normalizeNonNegativeNumber(
          data.lastImportedTransactionCount,
          normalizeNonNegativeNumber(originalDoc?.lastImportedTransactionCount),
        )
        data.feedRuleCount = normalizeNonNegativeNumber(data.feedRuleCount, normalizeNonNegativeNumber(originalDoc?.feedRuleCount))
        data.autoPostRuleCount = normalizeNonNegativeNumber(
          data.autoPostRuleCount,
          normalizeNonNegativeNumber(originalDoc?.autoPostRuleCount),
        )
        data.manualReviewRuleCount = normalizeNonNegativeNumber(
          data.manualReviewRuleCount,
          normalizeNonNegativeNumber(originalDoc?.manualReviewRuleCount),
        )
        data.syncDelayMinutes = normalizeNonNegativeNumber(
          data.syncDelayMinutes,
          normalizeNonNegativeNumber(originalDoc?.syncDelayMinutes),
        )
        data.averageSyncLatencySeconds = normalizeNonNegativeNumber(
          data.averageSyncLatencySeconds,
          normalizeNonNegativeNumber(originalDoc?.averageSyncLatencySeconds),
        )
        data.lastSyncAt = normalizeNullableDate(data.lastSyncAt ?? originalDoc?.lastSyncAt)
        data.lastSuccessfulSyncAt = normalizeNullableDate(data.lastSuccessfulSyncAt ?? originalDoc?.lastSuccessfulSyncAt)
        data.lastAttemptedSyncAt = normalizeNullableDate(data.lastAttemptedSyncAt ?? originalDoc?.lastAttemptedSyncAt)
        data.nextScheduledSyncAt = normalizeNullableDate(data.nextScheduledSyncAt ?? originalDoc?.nextScheduledSyncAt)
        data.lastRuleChangeAt = normalizeNullableDate(data.lastRuleChangeAt ?? originalDoc?.lastRuleChangeAt)
        data.tokenExpiresAt = normalizeNullableDate(data.tokenExpiresAt ?? originalDoc?.tokenExpiresAt)
        data.needsReconnection = Boolean(data.needsReconnection ?? originalDoc?.needsReconnection)

        if (data.connectionStatus === 'disconnected' && !data.disconnectReason) {
          data.disconnectReason = 'Disconnected from bank feed.'
        }

        if (data.connectionStatus === 'connected' && data.needsReconnection) {
          data.connectionStatus = 'action_required'
        }

        if (data.connectionStatus === 'connected' && data.healthStatus === 'critical') {
          data.healthStatus = 'warning'
        }

        if (!originalDoc?.createdBy) {
          data.createdBy = data.createdBy || getRequestUserId(req)
        }

        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
  },
}
