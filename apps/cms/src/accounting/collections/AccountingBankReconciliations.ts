import { APIError, type CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  BANK_RECONCILIATION_STATUS_OPTIONS,
} from '../constants/accounting'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'
import { isLockedReconciliationStatus } from '../utils/commercial'

export const AccountingBankReconciliations: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.bankReconciliations,
  admin: {
    useAsTitle: 'statementEndDate',
    defaultColumns: ['bankAccount', 'statementEndDate', 'statementClosingBalance', 'bookClosingBalance', 'differenceAmount', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Bank reconciliation headers comparing statement balances to posted book activity.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'bankAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.bankAccounts, required: true, index: true },
    { name: 'statementStartDate', type: 'date', required: true },
    { name: 'statementEndDate', type: 'date', required: true, index: true },
    { name: 'statementClosingBalance', type: 'number', required: true },
    { name: 'bookClosingBalance', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'differenceAmount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...BANK_RECONCILIATION_STATUS_OPTIONS], index: true },
    { name: 'completedAt', type: 'date', admin: { readOnly: true } },
    { name: 'completedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
    { name: 'notes', type: 'textarea' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, originalDoc }) => {
        if (!data) return data
        if (originalDoc && isLockedReconciliationStatus(String(originalDoc.status || ''))) {
          throw new APIError('Completed or locked bank reconciliations cannot be edited directly.', 400)
        }
        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        const reconciliation = await req.payload.findByID({
          collection: ACCOUNTING_COLLECTION_SLUGS.bankReconciliations,
          id,
          depth: 0,
          overrideAccess: true,
        })
        if (isLockedReconciliationStatus(String(reconciliation?.status || ''))) {
          throw new APIError('Completed or locked bank reconciliations cannot be deleted.', 400)
        }
      },
    ],
  },
}
