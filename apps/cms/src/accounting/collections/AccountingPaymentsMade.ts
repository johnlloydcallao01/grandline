import { APIError, type CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  PAYMENT_METHOD_OPTIONS,
  SIMPLE_POSTING_STATUS_OPTIONS,
} from '../constants/accounting'
import { AccountingPaymentMadeService } from '../services/payments/AccountingPaymentMadeService'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'
import { isTerminalSimplePostingStatus } from '../utils/commercial'

export const AccountingPaymentsMade: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.paymentsMade,
  admin: {
    useAsTitle: 'paymentNumber',
    defaultColumns: ['paymentNumber', 'vendor', 'paymentDate', 'amountPaid', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Vendor and payable disbursements with controlled bill allocation support.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'paymentNumber', type: 'text', required: true, unique: true, index: true },
    { name: 'vendor', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.vendors, required: true, index: true },
    { name: 'paymentDate', type: 'date', required: true, defaultValue: () => new Date().toISOString() },
    { name: 'postingDate', type: 'date', required: true, defaultValue: () => new Date().toISOString() },
    { name: 'fiscalYear', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.fiscalYears, admin: { readOnly: true } },
    { name: 'period', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.periods, admin: { readOnly: true } },
    { name: 'paymentMethod', type: 'select', required: true, defaultValue: 'bank_transfer', options: [...PAYMENT_METHOD_OPTIONS] },
    { name: 'bankAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.bankAccounts, required: true },
    { name: 'amountPaid', type: 'number', required: true, min: 0.01 },
    { name: 'currency', type: 'text', required: true, defaultValue: 'PHP' },
    { name: 'exchangeRate', type: 'number', required: true, defaultValue: 1, min: 0.000001 },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...SIMPLE_POSTING_STATUS_OPTIONS], index: true },
    {
      name: 'applications',
      type: 'array',
      fields: [
        { name: 'bill', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.bills, required: true },
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
          throw new APIError('Posted or voided payment disbursements cannot be edited directly.', 400)
        }
        if (operation === 'create' && !data.paymentNumber) {
          data.paymentNumber = await AccountingPaymentMadeService.generatePaymentNumber(req.payload)
        }
        AccountingPaymentMadeService.normalizeHeader(data)
        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        const payment = await req.payload.findByID({
          collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade,
          id,
          depth: 0,
          overrideAccess: true,
        })
        if (isTerminalSimplePostingStatus(String(payment?.status || ''))) {
          throw new APIError('Posted or voided payment disbursements cannot be deleted.', 400)
        }
      },
    ],
  },
}
