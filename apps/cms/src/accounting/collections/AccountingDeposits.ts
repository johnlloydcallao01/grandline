import { APIError, type CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  SIMPLE_POSTING_STATUS_OPTIONS,
} from '../constants/accounting'
import { AccountingCommercialService } from '../services/AccountingCommercialService'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'
import {
  isTerminalSimplePostingStatus,
  normalizeCode,
  normalizeOptionalText,
} from '../utils/commercial'

export const AccountingDeposits: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.deposits,
  admin: {
    useAsTitle: 'depositNumber',
    defaultColumns: ['depositNumber', 'depositDate', 'bankAccount', 'amount', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Formal deposits that move funds into a bank account from undeposited or source accounts.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'depositNumber', type: 'text', required: true, unique: true, index: true },
    { name: 'depositDate', type: 'date', required: true, defaultValue: () => new Date().toISOString() },
    { name: 'bankAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.bankAccounts, required: true },
    { name: 'sourceAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, required: true },
    { name: 'amount', type: 'number', required: true, min: 0.01 },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...SIMPLE_POSTING_STATUS_OPTIONS], index: true },
    { name: 'postedJournalEntry', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.journalEntries, admin: { readOnly: true } },
    { name: 'notes', type: 'textarea' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc, operation }) => {
        if (!data) return data
        if (originalDoc && isTerminalSimplePostingStatus(String(originalDoc.status || ''))) {
          throw new APIError('Posted or voided deposits cannot be edited directly.', 400)
        }
        if (operation === 'create' && !data.depositNumber) {
          data.depositNumber = await AccountingCommercialService.generateDocumentNumber(req.payload, 'depositNumberPrefix')
        }
        data.depositNumber = normalizeCode(data.depositNumber)
        data.notes = normalizeOptionalText(data.notes)
        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        const deposit = await req.payload.findByID({
          collection: ACCOUNTING_COLLECTION_SLUGS.deposits,
          id,
          depth: 0,
          overrideAccess: true,
        })
        if (isTerminalSimplePostingStatus(String(deposit?.status || ''))) {
          throw new APIError('Posted or voided deposits cannot be deleted.', 400)
        }
      },
    ],
  },
}
