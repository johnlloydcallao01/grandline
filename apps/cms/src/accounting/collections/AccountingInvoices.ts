import { APIError, type CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_HOOK_CONTEXT,
  DOCUMENT_STATUS_OPTIONS,
  POSTING_STATUS_OPTIONS,
} from '../constants/accounting'
import { AccountingInvoiceService } from '../services/invoices/AccountingInvoiceService'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'

export const AccountingInvoices: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.invoices,
  admin: {
    useAsTitle: 'invoiceNumber',
    defaultColumns: ['invoiceNumber', 'customer', 'invoiceDate', 'dueDate', 'status', 'total', 'balanceDue'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Accounts receivable source documents that post through the accounting engine.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'invoiceNumber', type: 'text', required: true, unique: true, index: true },
    { name: 'customer', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.customers, required: true, index: true },
    { name: 'invoiceDate', type: 'date', required: true, defaultValue: () => new Date().toISOString() },
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
    { name: 'discountTotal', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'total', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'balanceDue', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'referenceNumber', type: 'text' },
    { name: 'memo', type: 'textarea' },
    { name: 'sourceType', type: 'text', defaultValue: 'commercial_invoice' },
    { name: 'sourceReference', type: 'text' },
    { name: 'receivableAccountOverride', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts },
    { name: 'postedJournalEntry', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.journalEntries, admin: { readOnly: true } },
    { name: 'voidedAt', type: 'date', admin: { readOnly: true } },
    { name: 'voidedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
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
          !context?.[ACCOUNTING_HOOK_CONTEXT.skipInvoiceTotalsSync] &&
          !context?.[ACCOUNTING_HOOK_CONTEXT.skipInvoiceBalanceSync]
        ) {
          throw new APIError('Posted or settled invoices cannot be edited directly.', 400)
        }
        if (operation === 'create' && !data.invoiceNumber) {
          data.invoiceNumber = await AccountingInvoiceService.generateInvoiceNumber(req.payload)
        }
        AccountingInvoiceService.normalizeHeader(data)
        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        const invoice = await req.payload.findByID({
          collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
          id,
          depth: 0,
          overrideAccess: true,
        })
        if (['posted', 'partially_paid', 'paid', 'voided'].includes(String(invoice?.status || ''))) {
          throw new APIError('Posted or settled invoices cannot be deleted.', 400)
        }
      },
    ],
  },
}
