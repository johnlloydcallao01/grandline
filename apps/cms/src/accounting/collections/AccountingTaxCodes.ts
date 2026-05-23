import { APIError, type CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  TAX_CALCULATION_METHOD_OPTIONS,
  TAX_SCOPE_OPTIONS,
} from '../constants/accounting'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'

export const AccountingTaxCodes: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'name', 'scope', 'rate', 'isActive'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Reusable accounting tax metadata for future commercial documents.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'scope',
      type: 'select',
      required: true,
      defaultValue: 'both',
      options: [...TAX_SCOPE_OPTIONS],
    },
    {
      name: 'rate',
      type: 'number',
      required: true,
      min: 0,
      max: 100,
      defaultValue: 0,
    },
    {
      name: 'calculationMethod',
      type: 'select',
      required: true,
      defaultValue: 'exclusive',
      options: [...TAX_CALCULATION_METHOD_OPTIONS],
    },
    {
      name: 'purchaseAccount',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
    },
    {
      name: 'salesAccount',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, originalDoc }) => {
        if (!data) {
          return data
        }

        data.code = String(data.code || '').trim().toUpperCase()
        data.name = String(data.name || '').trim()

        applyCreatedAndUpdatedBy({ data, originalDoc, req })

        if (Number(data.rate) < 0 || Number(data.rate) > 100) {
          throw new APIError('Tax rates must stay between 0 and 100.', 400)
        }

        return data
      },
    ],
  },
}
