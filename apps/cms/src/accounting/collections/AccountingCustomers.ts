import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_PARTY_STATUS_OPTIONS,
  CUSTOMER_TYPE_OPTIONS,
} from '../constants/accounting'
import { AccountingCustomerService } from '../services/customers/AccountingCustomerService'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'

export const AccountingCustomers: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.customers,
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['customerCode', 'displayName', 'customerType', 'status', 'currency'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Customer master data for receivables and commercial accounting.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'customerCode', type: 'text', required: true, unique: true, index: true },
    { name: 'displayName', type: 'text', required: true, index: true },
    { name: 'legalName', type: 'text' },
    { name: 'customerType', type: 'select', required: true, defaultValue: 'individual', options: [...CUSTOMER_TYPE_OPTIONS] },
    { name: 'email', type: 'email' },
    { name: 'phone', type: 'text' },
    { name: 'billingAddress', type: 'textarea' },
    { name: 'shippingAddress', type: 'textarea' },
    { name: 'taxId', type: 'text' },
    { name: 'taxProfile', type: 'json' },
    { name: 'currency', type: 'text', required: true, defaultValue: 'PHP' },
    { name: 'paymentTerms', type: 'text' },
    { name: 'creditLimit', type: 'number', min: 0, defaultValue: 0 },
    { name: 'status', type: 'select', required: true, defaultValue: 'active', options: [...ACCOUNTING_PARTY_STATUS_OPTIONS], index: true },
    { name: 'notes', type: 'textarea' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (!data) return data
        if (operation === 'create' && !data.customerCode) {
          data.customerCode = await AccountingCustomerService.generateCustomerCode(req.payload)
        }
        AccountingCustomerService.normalizeData(data)
        applyCreatedAndUpdatedBy({ data, req })
        return data
      },
    ],
  },
}
