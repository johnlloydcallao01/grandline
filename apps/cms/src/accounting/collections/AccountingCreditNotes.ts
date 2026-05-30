import { APIError, type CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  DOCUMENT_STATUS_OPTIONS,
} from '../constants/accounting'
import { AccountingCreditNoteService } from '../services/invoices/AccountingCreditNoteService'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'
import { isTerminalDocumentStatus } from '../utils/commercial'

export const AccountingCreditNotes: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.creditNotes,
  admin: {
    useAsTitle: 'creditNoteNumber',
    defaultColumns: ['creditNoteNumber', 'customer', 'creditDate', 'total', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Customer credit notes that reduce receivables through posted accounting entries.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'creditNoteNumber', type: 'text', required: true, unique: true, index: true },
    { name: 'customer', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.customers, required: true, index: true },
    { name: 'creditDate', type: 'date', required: true, defaultValue: () => new Date().toISOString() },
    { name: 'postingDate', type: 'date', required: true, defaultValue: () => new Date().toISOString() },
    { name: 'fiscalYear', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.fiscalYears },
    { name: 'period', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.periods },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...DOCUMENT_STATUS_OPTIONS], index: true },
    { name: 'currency', type: 'text', required: true, defaultValue: 'PHP' },
    { name: 'subtotal', type: 'number', required: true, min: 0, defaultValue: 0 },
    { name: 'taxTotal', type: 'number', defaultValue: 0 },
    { name: 'total', type: 'number', required: true, min: 0, defaultValue: 0 },
    { name: 'appliedAmount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'remainingAmount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'sourceInvoice', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.invoices },
    {
      name: 'applications',
      type: 'array',
      fields: [
        { name: 'invoice', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.invoices, required: true },
        { name: 'amountApplied', type: 'number', required: true, min: 0.01 },
      ],
    },
    { name: 'adjustmentAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, required: true },
    { name: 'postedJournalEntry', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.journalEntries, admin: { readOnly: true } },
    { name: 'reason', type: 'textarea' },
    { name: 'notes', type: 'textarea' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc, operation }) => {
        if (!data) return data
        if (originalDoc && isTerminalDocumentStatus(String(originalDoc.status || ''))) {
          throw new APIError('Posted, settled, or voided credit notes cannot be edited directly.', 400)
        }
        if (operation === 'create' && !data.creditNoteNumber) {
          data.creditNoteNumber = await AccountingCreditNoteService.generateCreditNoteNumber(req.payload)
        }
        AccountingCreditNoteService.normalizeHeader(data)
        data.remainingAmount = data.total ?? originalDoc?.total ?? 0
        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        const creditNote = await req.payload.findByID({
          collection: ACCOUNTING_COLLECTION_SLUGS.creditNotes,
          id,
          depth: 0,
          overrideAccess: true,
        })
        if (isTerminalDocumentStatus(String(creditNote?.status || ''))) {
          throw new APIError('Posted, settled, or voided credit notes cannot be deleted.', 400)
        }
      },
    ],
  },
}
