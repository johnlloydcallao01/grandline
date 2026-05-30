import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  LMS_ALLOCATION_TYPE_OPTIONS,
} from '../constants/accounting'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'

export const AccountingPaymentAllocations: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.paymentAllocations,
  dbName: 'acct_payment_allocations',
  admin: {
    useAsTitle: 'allocationType',
    defaultColumns: ['paymentReceived', 'invoice', 'enrollmentBillingLink', 'allocatedAmount', 'allocationType'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Normalized LMS payment allocations that mirror invoice settlement against enrollments.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'paymentReceived', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived, required: true, index: true },
    { name: 'invoice', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.invoices, index: true },
    { name: 'enrollmentBillingLink', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks, index: true },
    { name: 'allocationDate', type: 'date', required: true, defaultValue: () => new Date().toISOString() },
    { name: 'allocatedAmount', type: 'number', required: true, min: 0.01 },
    { name: 'allocationType', type: 'select', required: true, defaultValue: 'invoice_settlement', options: [...LMS_ALLOCATION_TYPE_OPTIONS] },
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
