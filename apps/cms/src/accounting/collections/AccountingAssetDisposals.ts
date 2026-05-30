import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_ASSET_DISPOSAL_STATUS_OPTIONS,
  ACCOUNTING_ASSET_DISPOSAL_TYPE_OPTIONS,
  ACCOUNTING_COLLECTION_SLUGS,
} from '../constants/accounting'
import { buildAuditedHooks, buildCreatedUpdatedByFields } from '../utils/phase4-collections'

export const AccountingAssetDisposals: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.assetDisposals,
  dbName: 'acct_asset_disposals',
  admin: {
    useAsTitle: 'disposalDate',
    defaultColumns: ['fixedAsset', 'disposalDate', 'disposalType', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Disposal, sale, transfer, or write-off records for fixed assets.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'fixedAsset', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.fixedAssets, required: true, index: true },
    { name: 'disposalDate', type: 'date', required: true, index: true },
    { name: 'disposalType', type: 'select', required: true, defaultValue: 'sale', options: [...ACCOUNTING_ASSET_DISPOSAL_TYPE_OPTIONS] },
    { name: 'proceedsAmount', type: 'number', min: 0, defaultValue: 0 },
    { name: 'bookValueAtDisposal', type: 'number', min: 0, defaultValue: 0 },
    { name: 'gainOrLossAmount', type: 'number', defaultValue: 0 },
    { name: 'proceedsAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts },
    { name: 'gainAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts },
    { name: 'lossAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...ACCOUNTING_ASSET_DISPOSAL_STATUS_OPTIONS] },
    { name: 'postedJournalEntry', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.journalEntries },
    { name: 'notes', type: 'textarea' },
    ...buildCreatedUpdatedByFields(),
  ],
  hooks: buildAuditedHooks('asset_disposal'),
}
