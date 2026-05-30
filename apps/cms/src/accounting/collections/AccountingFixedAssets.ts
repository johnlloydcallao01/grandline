import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_DEPRECIATION_METHOD_OPTIONS,
  ACCOUNTING_FIXED_ASSET_CATEGORY_OPTIONS,
  ACCOUNTING_FIXED_ASSET_STATUS_OPTIONS,
} from '../constants/accounting'
import { AccountingFixedAssetService } from '../services/assets/AccountingFixedAssetService'
import { buildAuditedHooks, buildCreatedUpdatedByFields, buildDimensionFields } from '../utils/phase4-collections'

const auditedHooks = buildAuditedHooks('fixed_asset') ?? {}

export const AccountingFixedAssets: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.fixedAssets,
  dbName: 'acct_fixed_assets',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['assetCode', 'name', 'assetCategory', 'cost', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Fixed asset register for lifecycle tracking and depreciation posting.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'assetCode', type: 'text', required: true, unique: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'assetCategory', type: 'select', required: true, defaultValue: 'equipment', options: [...ACCOUNTING_FIXED_ASSET_CATEGORY_OPTIONS] },
    { name: 'purchaseDate', type: 'date', required: true },
    { name: 'inServiceDate', type: 'date' },
    { name: 'cost', type: 'number', required: true, min: 0 },
    { name: 'salvageValue', type: 'number', min: 0, defaultValue: 0 },
    { name: 'usefulLifeMonths', type: 'number', required: true, min: 1 },
    { name: 'depreciationMethod', type: 'select', required: true, defaultValue: 'straight_line', options: [...ACCOUNTING_DEPRECIATION_METHOD_OPTIONS] },
    { name: 'expenseAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, required: true },
    { name: 'assetAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, required: true },
    { name: 'accumulatedDepreciationAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, required: true },
    ...buildDimensionFields({ branch: true, department: true, location: true }),
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...ACCOUNTING_FIXED_ASSET_STATUS_OPTIONS] },
    { name: 'supportingDocument', type: 'relationship', relationTo: 'media' },
    { name: 'notes', type: 'textarea' },
    ...buildCreatedUpdatedByFields(),
  ],
  hooks: {
    ...auditedHooks,
    beforeChange: [
      ...(auditedHooks.beforeChange || []),
      async ({ data, operation, req }) => {
        if (!data) return data
        if (operation === 'create' && !data.assetCode) {
          data.assetCode = await AccountingFixedAssetService.generateAssetCode(req.payload)
        }
        return data
      },
    ],
  },
}
