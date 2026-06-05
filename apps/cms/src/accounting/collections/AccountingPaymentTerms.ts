import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import { ACCOUNTING_ADMIN_GROUP, ACCOUNTING_COLLECTION_SLUGS } from '../constants/accounting'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'
import { normalizeCode, normalizeOptionalText, normalizeText } from '../utils/commercial'

export const AccountingPaymentTerms: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.paymentTerms,
  dbName: 'acct_payment_terms',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['code', 'name', 'dueInDays', 'isActive'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Payment term master records used by customer and vendor commercial profiles.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'code', type: 'text', required: true, unique: true, index: true },
    { name: 'name', type: 'text', required: true, index: true },
    { name: 'dueInDays', type: 'number', min: 0, defaultValue: 0 },
    { name: 'description', type: 'textarea' },
    { name: 'isActive', type: 'checkbox', defaultValue: true, index: true },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, originalDoc }) => {
        if (!data) return data
        data.code = normalizeCode(data.code)
        data.name = normalizeText(data.name)
        data.description = normalizeOptionalText(data.description)
        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
  },
}
