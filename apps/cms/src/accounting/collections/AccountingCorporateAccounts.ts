import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  LMS_SPONSOR_STATUS_OPTIONS,
} from '../constants/accounting'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'

export const AccountingCorporateAccounts: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.corporateAccounts,
  dbName: 'acct_corporate_accounts',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['accountCode', 'name', 'customer', 'creditTerms', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'B2B training customers and negotiated payer records for corporate enrollments.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'accountCode', type: 'text', required: true, unique: true, index: true },
    { name: 'name', type: 'text', required: true, index: true },
    { name: 'customer', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.customers, required: true, index: true },
    { name: 'billingContact', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'phone', type: 'text' },
    { name: 'creditTerms', type: 'text' },
    { name: 'paymentTerms', type: 'text' },
    { name: 'negotiatedPricingPolicy', type: 'json' },
    { name: 'status', type: 'select', required: true, defaultValue: 'active', options: [...LMS_SPONSOR_STATUS_OPTIONS], index: true },
    { name: 'notes', type: 'textarea' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, originalDoc }) => {
        if (!data) return data
        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
  },
}
