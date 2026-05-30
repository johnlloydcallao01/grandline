import { APIError, type CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_HOOK_CONTEXT,
  DOCUMENT_STATUS_OPTIONS,
  POSTING_STATUS_OPTIONS,
} from '../constants/accounting'
import { AccountingBillService } from '../services/bills/AccountingBillService'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'

export const AccountingBills: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.bills,
  admin: {
    useAsTitle: 'billNumber',
    defaultColumns: ['billNumber', 'vendor', 'billDate', 'dueDate', 'status', 'total', 'balanceDue'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Accounts payable source documents that post through the accounting engine.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'billNumber', type: 'text', required: true, unique: true, index: true },
    { name: 'vendor', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.vendors, required: true, index: true },
    { name: 'billDate', type: 'date', required: true, defaultValue: () => new Date().toISOString() },
    { name: 'postingDate', type: 'date', required: true, defaultValue: () => new Date().toISOString() },
    { name: 'dueDate', type: 'date', required: true },
    { name: 'fiscalYear', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.fiscalYears, admin: { readOnly: true } },
    { name: 'period', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.periods, admin: { readOnly: true } },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...DOCUMENT_STATUS_OPTIONS], index: true },
    { name: 'postingStatus', type: 'select', required: true, defaultValue: 'unposted', options: [...POSTING_STATUS_OPTIONS], admin: { readOnly: true } },
    { name: 'currency', type: 'text', required: true, defaultValue: 'PHP' },
    { name: 'exchangeRate', type: 'number', required: true, defaultValue: 1, min: 0.000001 },
    { name: 'subtotal', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'taxTotal', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'total', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'balanceDue', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'referenceNumber', type: 'text' },
    { name: 'memo', type: 'textarea' },
    { name: 'postedJournalEntry', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.journalEntries, admin: { readOnly: true } },
    { name: 'payableAccountOverride', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts },
    { name: 'notes', type: 'textarea' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation, originalDoc, context }) => {
        if (!data) return data
        if (
          originalDoc &&
          ['posted', 'partially_paid', 'paid', 'voided'].includes(String(originalDoc.status || '')) &&
          !context?.[ACCOUNTING_HOOK_CONTEXT.skipBillTotalsSync] &&
          !context?.[ACCOUNTING_HOOK_CONTEXT.skipBillBalanceSync]
        ) {
          throw new APIError('Posted or settled bills cannot be edited directly.', 400)
        }
        if (operation === 'create' && !data.billNumber) {
          data.billNumber = await AccountingBillService.generateBillNumber(req.payload)
        }
        AccountingBillService.normalizeHeader(data)
        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        const bill = await req.payload.findByID({
          collection: ACCOUNTING_COLLECTION_SLUGS.bills,
          id,
          depth: 0,
          overrideAccess: true,
        })
        if (['posted', 'partially_paid', 'paid', 'voided'].includes(String(bill?.status || ''))) {
          throw new APIError('Posted or settled bills cannot be deleted.', 400)
        }
      },
    ],
  },
}
