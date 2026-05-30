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

export const AccountingTransfers: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.transfers,
  admin: {
    useAsTitle: 'transferNumber',
    defaultColumns: ['transferNumber', 'transferDate', 'fromBankAccount', 'toBankAccount', 'amount', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Internal bank or cash transfers that post through the accounting engine.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'transferNumber', type: 'text', required: true, unique: true, index: true },
    { name: 'transferDate', type: 'date', required: true, defaultValue: () => new Date().toISOString() },
    { name: 'fromBankAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.bankAccounts, required: true },
    { name: 'toBankAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.bankAccounts, required: true },
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
          throw new APIError('Posted or voided transfers cannot be edited directly.', 400)
        }
        if (operation === 'create' && !data.transferNumber) {
          data.transferNumber = await AccountingCommercialService.generateDocumentNumber(req.payload, 'transferNumberPrefix')
        }
        data.transferNumber = normalizeCode(data.transferNumber)
        data.notes = normalizeOptionalText(data.notes)
        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        const transfer = await req.payload.findByID({
          collection: ACCOUNTING_COLLECTION_SLUGS.transfers,
          id,
          depth: 0,
          overrideAccess: true,
        })
        if (isTerminalSimplePostingStatus(String(transfer?.status || ''))) {
          throw new APIError('Posted or voided transfers cannot be deleted.', 400)
        }
      },
    ],
  },
}
