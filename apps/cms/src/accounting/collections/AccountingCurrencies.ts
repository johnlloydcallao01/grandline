import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import { ACCOUNTING_ADMIN_GROUP, ACCOUNTING_COLLECTION_SLUGS } from '../constants/accounting'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'
import { normalizeCode, normalizeOptionalText, normalizeText } from '../utils/commercial'

export const AccountingCurrencies: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.currencies,
  dbName: 'acct_currencies',
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'name', 'symbol', 'isBaseCurrency', 'isActive'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Currency master records used by accounting customers and commercial documents.',
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
    { name: 'symbol', type: 'text' },
    { name: 'isBaseCurrency', type: 'checkbox', defaultValue: false, index: true },
    { name: 'isActive', type: 'checkbox', defaultValue: true, index: true },
    { name: 'notes', type: 'textarea' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, originalDoc }) => {
        if (!data) return data
        data.code = normalizeCode(data.code)
        data.name = normalizeText(data.name)
        data.symbol = normalizeOptionalText(data.symbol)
        data.notes = normalizeOptionalText(data.notes)
        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
  },
}
