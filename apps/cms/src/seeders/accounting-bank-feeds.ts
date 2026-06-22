import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type BankAccountDoc = {
  id: number | string
  accountName?: string | null
  bankName?: string | null
  accountNumberMasked?: string | null
  accountType?: string | null
  isActive?: boolean | null
  currencyReference?: number | string | { id?: number | string | null } | null
  ledgerAccount?: number | string | { id?: number | string | null } | null
}

type UserDoc = {
  id: number | string
}

type BankFeedTemplate = {
  seedKey: string
  feedReference: string
  connectorType: 'direct_api' | 'treasury_hub' | 'csv_bridge' | 'plaid' | 'manual_sync' | 'other'
  connectorName: string
  providerReference: string
  externalAccountId: string
  connectionStatus: 'connected' | 'sync_delayed' | 'action_required' | 'disconnected'
  healthStatus: 'healthy' | 'monitor' | 'warning' | 'critical'
  syncFrequency: 'hourly' | 'daily' | 'manual'
  lastSyncAt: string | null
  lastSuccessfulSyncAt: string | null
  lastAttemptedSyncAt: string | null
  nextScheduledSyncAt: string | null
  lastImportedRowCount: number
  lastImportedTransactionCount: number
  feedRuleSetName: string
  feedRuleCount: number
  autoPostRuleCount: number
  manualReviewRuleCount: number
  lastRuleChangeAt: string | null
  syncDelayMinutes: number
  averageSyncLatencySeconds: number
  tokenExpiresAt: string | null
  needsReconnection: boolean
  disconnectReason: string | null
  lastErrorSummary: string | null
  notes: string
}

const connectorTypes: BankFeedTemplate['connectorType'][] = [
  'direct_api',
  'treasury_hub',
  'csv_bridge',
  'plaid',
  'manual_sync',
  'other',
]

const statuses: BankFeedTemplate['connectionStatus'][] = [
  'connected',
  'sync_delayed',
  'action_required',
  'disconnected',
]

const healthStates: BankFeedTemplate['healthStatus'][] = [
  'healthy',
  'monitor',
  'warning',
  'critical',
]

const syncFrequencies: BankFeedTemplate['syncFrequency'][] = ['hourly', 'daily', 'manual']

const connectorLabels: Record<BankFeedTemplate['connectorType'], string> = {
  direct_api: 'Direct API',
  treasury_hub: 'Treasury Hub',
  csv_bridge: 'CSV Bridge',
  plaid: 'Plaid',
  manual_sync: 'Manual Sync',
  other: 'Other Connector',
}

const ruleThemes = [
  'Collections + Refund Rules',
  'Payroll Settlement Rules',
  'Treasury Transfer Rules',
  'Daily Disbursement Review',
  'Collections Fallback Review',
  'Reserve Account Sweep Rules',
  'Manual Exception Handling',
  'Corporate Billing Intake Rules',
] as const

const buildTemplates = (): BankFeedTemplate[] =>
  Array.from({ length: 20 }, (_, index) => {
    const sequence = index + 1
    const connectorType = connectorTypes[index % connectorTypes.length]
    const connectionStatus = statuses[index % statuses.length]
    const healthStatus =
      connectionStatus === 'connected'
        ? healthStates[index % 2]
        : connectionStatus === 'sync_delayed'
          ? 'warning'
          : connectionStatus === 'action_required'
            ? 'critical'
            : 'monitor'
    const syncFrequency = syncFrequencies[index % syncFrequencies.length]
    const day = String((index % 20) + 1).padStart(2, '0')
    const hour = String(8 + (index % 10)).padStart(2, '0')
    const minute = String((index * 7) % 60).padStart(2, '0')
    const baseTimestamp = `2026-06-${day}T${hour}:${minute}:00.000Z`
    const hasSuccessfulSync = connectionStatus === 'connected' || connectionStatus === 'sync_delayed'
    const lastImportedRowCount = connectionStatus === 'disconnected' ? 0 : 45 + index * 6
    const lastImportedTransactionCount =
      connectionStatus === 'disconnected' ? 0 : Math.max(lastImportedRowCount - ((index % 5) + 2), 0)
    const feedRuleCount = 3 + (index % 6)
    const autoPostRuleCount = Math.max(feedRuleCount - 2, 0)
    const manualReviewRuleCount = Math.max(feedRuleCount - autoPostRuleCount, 0)
    const syncDelayMinutes =
      connectionStatus === 'sync_delayed' ? 25 + index * 2 : connectionStatus === 'action_required' ? 90 + index : 0
    const averageSyncLatencySeconds =
      connectionStatus === 'connected' ? 12 + (index % 11) : connectionStatus === 'sync_delayed' ? 60 + index * 3 : 0
    const needsReconnection = connectionStatus === 'action_required'
    const disconnectReason =
      connectionStatus === 'disconnected'
        ? 'Connector access was revoked and the feed is no longer available.'
        : connectionStatus === 'action_required'
          ? 'Reconnect required because the provider token expired.'
          : null
    const lastErrorSummary =
      connectionStatus === 'sync_delayed'
        ? 'Provider sync queue is delayed beyond the normal service-level window.'
        : connectionStatus === 'action_required'
          ? 'Authentication failed during the latest sync attempt because the token must be renewed.'
          : connectionStatus === 'disconnected'
            ? 'Bank feed was disconnected after repeated authorization failures.'
            : null

    return {
      seedKey: `bank-feed-sample-${String(sequence).padStart(3, '0')}`,
      feedReference: `BFD-SAMPLE-202606-${String(sequence).padStart(3, '0')}`,
      connectorType,
      connectorName:
        connectorType === 'other'
          ? `${connectorLabels[connectorType]} ${sequence}`
          : `${connectorLabels[connectorType]} via Banking Ops`,
      providerReference: `PROVIDER-${String(sequence).padStart(4, '0')}`,
      externalAccountId: `EXT-ACCT-${String(sequence).padStart(5, '0')}`,
      connectionStatus,
      healthStatus,
      syncFrequency,
      lastSyncAt: hasSuccessfulSync ? baseTimestamp : null,
      lastSuccessfulSyncAt: hasSuccessfulSync ? baseTimestamp : null,
      lastAttemptedSyncAt: baseTimestamp,
      nextScheduledSyncAt:
        syncFrequency === 'manual'
          ? null
          : `2026-06-${String((index % 20) + 2).padStart(2, '0')}T${hour}:${minute}:00.000Z`,
      lastImportedRowCount,
      lastImportedTransactionCount,
      feedRuleSetName: ruleThemes[index % ruleThemes.length],
      feedRuleCount,
      autoPostRuleCount,
      manualReviewRuleCount,
      lastRuleChangeAt: `2026-06-${String((index % 20) + 1).padStart(2, '0')}T06:${minute}:00.000Z`,
      syncDelayMinutes,
      averageSyncLatencySeconds,
      tokenExpiresAt:
        connectionStatus === 'action_required'
          ? `2026-06-${String((index % 20) + 1).padStart(2, '0')}T05:${minute}:00.000Z`
          : `2026-07-${String((index % 20) + 1).padStart(2, '0')}T05:${minute}:00.000Z`,
      needsReconnection,
      disconnectReason,
      lastErrorSummary,
      notes: `Seeded sample bank feed ${String(sequence).padStart(3, '0')} for the bank-feeds tab using ${ruleThemes[index % ruleThemes.length]}.`,
    }
  })

const getRelationshipId = (
  value: number | string | { id?: number | string | null } | null | undefined,
) => {
  if (!value) return null
  if (typeof value === 'object') return value.id ?? null
  return value
}

async function seedAccountingBankFeeds() {
  const payload = await getPayload({ config })

  const [adminUsers, bankAccounts] = await Promise.all([
    payload.find({
      collection: 'users',
      where: { role: { equals: 'admin' } } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts as any,
      where: {
        and: [
          { isActive: { not_equals: false } },
          {
            or: [
              { accountType: { equals: 'bank' } },
              { accountType: { equals: 'cash_on_hand' } },
              { accountType: { equals: 'undeposited_funds' } },
            ],
          },
        ],
      } as never,
      limit: 200,
      depth: 0,
      sort: 'accountName',
      overrideAccess: true,
    }),
  ])

  const adminId = (adminUsers.docs[0] as UserDoc | undefined)?.id ?? null
  const availableBankAccounts = bankAccounts.docs as BankAccountDoc[]
  const templates = buildTemplates()

  if (availableBankAccounts.length === 0) {
    throw new Error('No active bank, cash-on-hand, or undeposited-funds accounts were found. Seed bank accounts first, then rerun this seeder.')
  }

  const existingFeeds = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.bankFeeds as any,
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })

  const existingFeedReferences = new Set(
    existingFeeds.docs
      .map((doc) => String((doc as { feedReference?: string | null }).feedReference || '').trim())
      .filter(Boolean),
  )

  const usedBankAccountIds = new Set(
    existingFeeds.docs
      .map((doc) => {
        const bankAccount = (doc as { bankAccount?: string | number | { id?: string | number | null } | null }).bankAccount
        if (typeof bankAccount === 'object' && bankAccount) return String(bankAccount.id || '')
        return String(bankAccount || '')
      })
      .filter(Boolean),
  )

  const templatesToCreate = templates.filter((template) => !existingFeedReferences.has(template.feedReference))
  const seedBankAccounts = availableBankAccounts.filter((bankAccount) => !usedBankAccountIds.has(String(bankAccount.id)))

  if (templatesToCreate.length > 0 && seedBankAccounts.length < templatesToCreate.length) {
    const templateBankAccount = availableBankAccounts[0]
    const currencyReferenceId = getRelationshipId(templateBankAccount?.currencyReference)
    const ledgerAccountId = getRelationshipId(templateBankAccount?.ledgerAccount)

    if (!templateBankAccount || !currencyReferenceId || !ledgerAccountId) {
      throw new Error('Unable to create supplemental sample bank accounts because no template bank account with currency and ledger account references was found.')
    }

    const supplementalCount = templatesToCreate.length - seedBankAccounts.length

    for (let index = 0; index < supplementalCount; index += 1) {
      const sequence = index + 1
      const createdBankAccount = (await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts as any,
        data: {
          accountName: `Sample Feed Bank Account ${String(sequence).padStart(3, '0')}`,
          accountNumberMasked: `****${String(7000 + sequence).slice(-4)}`,
          bankName: 'Sample Feed Banking Partner',
          branchName: 'Seeded Banking Operations Branch',
          accountType: 'bank',
          currencyReference: currencyReferenceId,
          ledgerAccount: ledgerAccountId,
          isActive: true,
          notes: 'Auto-created by the bank-feeds seeder so sample feed records can be attached to unique bank accounts.',
          createdBy: adminId,
          updatedBy: adminId,
        },
        depth: 0,
        overrideAccess: true,
      })) as BankAccountDoc

      seedBankAccounts.push(createdBankAccount)
      console.log(`Created supplemental bank account ${createdBankAccount.accountName || createdBankAccount.id} for bank-feed seeding`)
    }
  }

  let createdCount = 0
  let skippedCount = 0

  for (let index = 0; index < templates.length; index += 1) {
    const template = templates[index]
    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankFeeds as any,
      where: {
        or: [
          {
            feedReference: {
              equals: template.feedReference,
            },
          },
          {
            notes: {
              equals: template.notes,
            },
          },
        ],
      } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.docs[0]) {
      skippedCount += 1
      console.log(
        `Skipped bank feed ${template.feedReference} (already exists)`,
      )
      continue
    }

    const bankAccount = seedBankAccounts[createdCount]
    if (!bankAccount) {
      throw new Error('No available bank account remained while creating sample bank-feed records.')
    }

    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankFeeds as any,
      data: {
        feedReference: template.feedReference,
        bankAccount: bankAccount.id,
        connectorType: template.connectorType,
        connectorName: template.connectorName,
        providerReference: template.providerReference,
        externalAccountId: template.externalAccountId,
        connectionStatus: template.connectionStatus,
        healthStatus: template.healthStatus,
        syncFrequency: template.syncFrequency,
        lastSyncAt: template.lastSyncAt,
        lastSuccessfulSyncAt: template.lastSuccessfulSyncAt,
        lastAttemptedSyncAt: template.lastAttemptedSyncAt,
        nextScheduledSyncAt: template.nextScheduledSyncAt,
        lastImportedRowCount: template.lastImportedRowCount,
        lastImportedTransactionCount: template.lastImportedTransactionCount,
        feedRuleSetName: template.feedRuleSetName,
        feedRuleCount: template.feedRuleCount,
        autoPostRuleCount: template.autoPostRuleCount,
        manualReviewRuleCount: template.manualReviewRuleCount,
        lastRuleChangeAt: template.lastRuleChangeAt,
        syncDelayMinutes: template.syncDelayMinutes,
        averageSyncLatencySeconds: template.averageSyncLatencySeconds,
        tokenExpiresAt: template.tokenExpiresAt,
        needsReconnection: template.needsReconnection,
        disconnectReason: template.disconnectReason,
        lastErrorSummary: template.lastErrorSummary,
        notes: template.notes,
        metadata: {
          seedKey: template.seedKey,
          seededFor: 'bank-operations-bank-feeds',
          seededBankAccountName: bankAccount.accountName || bankAccount.bankName || null,
          seededBankAccountType: bankAccount.accountType || null,
        },
        createdBy: adminId,
        updatedBy: adminId,
      },
      depth: 0,
      overrideAccess: true,
    })

    createdCount += 1
    console.log(
      `Created bank feed ${template.feedReference} using ${template.connectorName} on ${bankAccount.accountName || bankAccount.bankName || bankAccount.id}`,
    )
  }

  const total = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.bankFeeds as any,
    overrideAccess: true,
  })

  console.log(
    `Done. Bank feeds created: ${createdCount}, skipped: ${skippedCount}, total now: ${total.totalDocs}`,
  )
}

seedAccountingBankFeeds()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed accounting bank feeds:', error)
    process.exit(1)
  })
