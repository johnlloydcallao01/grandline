import { APIError, type CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  LMS_RECEIPT_STATUS_OPTIONS,
} from '../constants/accounting'
import { AccountingReceiptService } from '../services/receipts/AccountingReceiptService'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'

export const AccountingReceipts: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.receipts,
  dbName: 'acct_receipts',
  admin: {
    useAsTitle: 'receiptNumber',
    defaultColumns: ['receiptNumber', 'paymentReceived', 'customer', 'receiptDate', 'amount', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Official receipt register for LMS-linked customer payments and proof of payment.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'receiptNumber', type: 'text', required: true, unique: true, index: true },
    { name: 'paymentReceived', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived, required: true, index: true },
    { name: 'enrollmentBillingLink', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks, index: true },
    { name: 'customer', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.customers, required: true, index: true },
    { name: 'receiptDate', type: 'date', required: true, defaultValue: () => new Date().toISOString() },
    { name: 'amount', type: 'number', required: true, min: 0 },
    { name: 'currency', type: 'text', required: true, defaultValue: 'PHP' },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...LMS_RECEIPT_STATUS_OPTIONS], index: true },
    { name: 'proofDocument', type: 'upload', relationTo: 'media' },
    { name: 'issuedBy', type: 'relationship', relationTo: 'users' },
    { name: 'voidedAt', type: 'date', admin: { readOnly: true } },
    { name: 'voidedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
    { name: 'notes', type: 'textarea' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc, operation }) => {
        if (!data) return data
        if (originalDoc && ['issued', 'voided'].includes(String(originalDoc.status || ''))) {
          throw new APIError('Issued or voided receipts cannot be edited directly.', 400)
        }
        if (operation === 'create' && !data.receiptNumber) {
          data.receiptNumber = await AccountingReceiptService.generateReceiptNumber(req.payload)
        }
        AccountingReceiptService.normalizeReceipt(data)
        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
  },
}
