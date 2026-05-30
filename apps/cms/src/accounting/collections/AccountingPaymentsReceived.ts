import { APIError, type CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  PAYMENT_METHOD_OPTIONS,
  SIMPLE_POSTING_STATUS_OPTIONS,
} from '../constants/accounting'
import { AccountingPaymentReceivedService } from '../services/payments/AccountingPaymentReceivedService'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'
import { isTerminalSimplePostingStatus } from '../utils/commercial'

export const AccountingPaymentsReceived: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
  admin: {
    useAsTitle: 'receiptNumber',
    defaultColumns: ['receiptNumber', 'customer', 'paymentDate', 'amountReceived', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Customer receipts with controlled invoice allocation support.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'receiptNumber', type: 'text', required: true, unique: true, index: true },
    { name: 'customer', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.customers, required: true, index: true },
    { name: 'paymentDate', type: 'date', required: true, defaultValue: () => new Date().toISOString() },
    { name: 'postingDate', type: 'date', required: true, defaultValue: () => new Date().toISOString() },
    { name: 'fiscalYear', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.fiscalYears, admin: { readOnly: true } },
    { name: 'period', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.periods, admin: { readOnly: true } },
    { name: 'paymentMethod', type: 'select', required: true, defaultValue: 'bank_transfer', options: [...PAYMENT_METHOD_OPTIONS] },
    { name: 'depositAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.bankAccounts },
    { name: 'undepositedFundsAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts },
    { name: 'amountReceived', type: 'number', required: true, min: 0.01 },
    { name: 'currency', type: 'text', required: true, defaultValue: 'PHP' },
    { name: 'exchangeRate', type: 'number', required: true, defaultValue: 1, min: 0.000001 },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...SIMPLE_POSTING_STATUS_OPTIONS], index: true },
    {
      name: 'applications',
      type: 'array',
      fields: [
        { name: 'invoice', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.invoices, required: true },
        { name: 'amountApplied', type: 'number', required: true, min: 0.01 },
      ],
    },
    { name: 'postedJournalEntry', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.journalEntries, admin: { readOnly: true } },
    { name: 'referenceNumber', type: 'text' },
    { name: 'notes', type: 'textarea' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc, operation }) => {
        if (!data) return data
        if (originalDoc && isTerminalSimplePostingStatus(String(originalDoc.status || ''))) {
          throw new APIError('Posted or voided payment receipts cannot be edited directly.', 400)
        }
        if (operation === 'create' && !data.receiptNumber) {
          data.receiptNumber = await AccountingPaymentReceivedService.generateReceiptNumber(req.payload)
        }
        AccountingPaymentReceivedService.normalizeHeader(data)
        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        const payment = await req.payload.findByID({
          collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
          id,
          depth: 0,
          overrideAccess: true,
        })
        if (isTerminalSimplePostingStatus(String(payment?.status || ''))) {
          throw new APIError('Posted or voided payment receipts cannot be deleted.', 400)
        }
      },
    ],
  },
}
