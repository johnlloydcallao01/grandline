import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_PARTY_STATUS_OPTIONS,
  VENDOR_TYPE_OPTIONS,
} from '../constants/accounting'
import { AccountingVendorService } from '../services/vendors/AccountingVendorService'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'

export const AccountingVendors: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.vendors,
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['vendorCode', 'displayName', 'vendorType', 'status', 'currencyReference'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Vendor master data for payables and direct expenses.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'vendorCode', type: 'text', required: true, unique: true, index: true },
    { name: 'displayName', type: 'text', required: true, index: true },
    { name: 'legalName', type: 'text' },
    { name: 'vendorType', type: 'select', required: true, defaultValue: 'supplier', options: [...VENDOR_TYPE_OPTIONS] },
    { name: 'email', type: 'email' },
    { name: 'phone', type: 'text' },
    { name: 'billingAddress', type: 'textarea' },
    { name: 'taxId', type: 'text' },
    { name: 'taxProfile', type: 'json' },
    {
      name: 'currencyReference',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.currencies,
      index: true,
      required: true,
    },
    {
      name: 'paymentTermReference',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.paymentTerms,
      index: true,
      required: true,
    },
    { name: 'status', type: 'select', required: true, defaultValue: 'active', options: [...ACCOUNTING_PARTY_STATUS_OPTIONS], index: true },
    { name: 'notes', type: 'textarea' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (!data) return data
        if (operation === 'create' && !data.vendorCode) {
          data.vendorCode = await AccountingVendorService.generateVendorCode(req.payload)
        }
        AccountingVendorService.normalizeData(data)
        await AccountingVendorService.validateLookupReferences(req.payload, data)
        applyCreatedAndUpdatedBy({ data, req })
        return data
      },
    ],
  },
}
