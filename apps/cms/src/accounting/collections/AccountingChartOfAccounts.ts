import { APIError, type CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNT_SUB_TYPE_OPTIONS,
  ACCOUNT_TYPE_OPTIONS,
  NORMAL_BALANCE_OPTIONS,
} from '../constants/accounting'
import { applyCreatedAndUpdatedBy, getRelationshipId } from '../utils/accounting-audit'

const inferNormalBalance = (accountType?: string | null) =>
  accountType === 'liability' || accountType === 'equity' || accountType === 'revenue'
    ? 'credit'
    : 'debit'

export const AccountingChartOfAccounts: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['code', 'name', 'accountType', 'parentAccount', 'isActive'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Accounting chart of accounts and account hierarchy.',
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
      name: 'accountType',
      type: 'select',
      required: true,
      index: true,
      options: [...ACCOUNT_TYPE_OPTIONS],
    },
    {
      name: 'accountSubType',
      type: 'select',
      options: [...ACCOUNT_SUB_TYPE_OPTIONS],
    },
    {
      name: 'normalBalance',
      type: 'select',
      required: true,
      options: [...NORMAL_BALANCE_OPTIONS],
      defaultValue: 'debit',
    },
    {
      name: 'parentAccount',
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
      name: 'allowManualEntries',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'isControlAccount',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'isRetainedEarnings',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'isSuspenseAccount',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
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
      async ({ data, req, originalDoc }) => {
        if (!data) {
          return data
        }

        data.code = String(data.code || '').trim().toUpperCase()
        data.name = String(data.name || '').trim()
        data.normalBalance = data.normalBalance || inferNormalBalance(String(data.accountType || ''))

        applyCreatedAndUpdatedBy({ data, originalDoc, req })

        if (data.isRetainedEarnings && data.isSuspenseAccount) {
          throw new APIError('An account cannot be both retained earnings and a suspense account.', 400)
        }

        const parentId = getRelationshipId(data.parentAccount ?? originalDoc?.parentAccount)
        const selfId = originalDoc?.id ? String(originalDoc.id) : null

        if (parentId && selfId && String(parentId) === selfId) {
          throw new APIError('An account cannot be its own parent.', 400)
        }

        if (parentId) {
          let currentParentId: number | string | null = parentId
          let traversalCount = 0

          while (currentParentId && traversalCount < 50) {
            if (selfId && String(currentParentId) === selfId) {
              throw new APIError('The selected parent account would create a cycle.', 400)
            }

            const parentAccount = await req.payload.findByID({
              collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
              id: currentParentId,
              depth: 0,
              overrideAccess: true,
            })

            currentParentId = getRelationshipId(parentAccount?.parentAccount)
            traversalCount += 1
          }
        }

        return data
      },
    ],
  },
}
