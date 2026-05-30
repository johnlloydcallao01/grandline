import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  BANK_TRANSACTION_MATCH_STATUS_OPTIONS,
  ACCOUNTING_ENTITY_TYPE_OPTIONS,
} from '../constants/accounting'
import { AccountingBankingService } from '../services/banking/AccountingBankingService'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'

export const AccountingBankTransactions: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.bankTransactions,
  admin: {
    useAsTitle: 'description',
    defaultColumns: ['bankAccount', 'transactionDate', 'description', 'amountIn', 'amountOut', 'matchStatus'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Statement-side or imported bank activity used for reconciliation.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'bankAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.bankAccounts, required: true, index: true },
    { name: 'transactionDate', type: 'date', required: true, index: true },
    { name: 'valueDate', type: 'date' },
    { name: 'description', type: 'text', required: true },
    { name: 'referenceNumber', type: 'text' },
    { name: 'amountIn', type: 'number', min: 0, defaultValue: 0 },
    { name: 'amountOut', type: 'number', min: 0, defaultValue: 0 },
    { name: 'runningBalance', type: 'number' },
    { name: 'matchStatus', type: 'select', required: true, defaultValue: 'unmatched', options: [...BANK_TRANSACTION_MATCH_STATUS_OPTIONS], index: true },
    { name: 'matchedEntityType', type: 'select', options: [...ACCOUNTING_ENTITY_TYPE_OPTIONS] },
    { name: 'matchedEntityId', type: 'text' },
    { name: 'metadata', type: 'json' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, originalDoc }) => {
        if (!data) return data
        AccountingBankingService.normalizeBankTransaction(data)
        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
  },
}
