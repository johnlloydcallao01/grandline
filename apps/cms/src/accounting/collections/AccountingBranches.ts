import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import { ACCOUNTING_ADMIN_GROUP, ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_DIMENSION_STATUS_OPTIONS } from '../constants/accounting'
import { buildAuditedHooks, buildCreatedUpdatedByFields } from '../utils/phase4-collections'

export const AccountingBranches: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.branches,
  dbName: 'acct_branches',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['branchCode', 'name', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Finance-safe branch master data for Phase 4 operational reporting.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'branchCode', type: 'text', required: true, unique: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'active', options: [...ACCOUNTING_DIMENSION_STATUS_OPTIONS] },
    { name: 'address', type: 'textarea' },
    { name: 'notes', type: 'textarea' },
    ...buildCreatedUpdatedByFields(),
  ],
  hooks: buildAuditedHooks('branch'),
}
