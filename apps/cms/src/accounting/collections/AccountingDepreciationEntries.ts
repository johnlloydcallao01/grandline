import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import { ACCOUNTING_ADMIN_GROUP, ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_DEPRECIATION_ENTRY_STATUS_OPTIONS } from '../constants/accounting'
import { buildAuditedHooks, buildCreatedUpdatedByFields } from '../utils/phase4-collections'

export const AccountingDepreciationEntries: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.depreciationEntries,
  dbName: 'acct_depr_entries',
  admin: {
    useAsTitle: 'depreciationDate',
    defaultColumns: ['fixedAsset', 'period', 'depreciationDate', 'amount', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Scheduled or posted depreciation rows linked to assets and journal entries.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'fixedAsset', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.fixedAssets, required: true, index: true },
    { name: 'fiscalYear', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.fiscalYears, required: true, index: true },
    { name: 'period', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.periods, required: true, index: true },
    { name: 'depreciationDate', type: 'date', required: true, index: true },
    { name: 'amount', type: 'number', required: true, min: 0 },
    { name: 'status', type: 'select', required: true, defaultValue: 'scheduled', options: [...ACCOUNTING_DEPRECIATION_ENTRY_STATUS_OPTIONS] },
    { name: 'postedJournalEntry', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.journalEntries },
    { name: 'notes', type: 'textarea' },
    ...buildCreatedUpdatedByFields(),
  ],
  hooks: buildAuditedHooks('depreciation_entry'),
}
