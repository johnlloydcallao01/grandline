import { APIError, type CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  LMS_REFUND_STATUS_OPTIONS,
  LMS_REFUND_TYPE_OPTIONS,
} from '../constants/accounting'
import { AccountingLmsRefundService } from '../services/refunds/AccountingLmsRefundService'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'

export const AccountingRefunds: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.refunds,
  dbName: 'acct_refunds',
  admin: {
    useAsTitle: 'refundNumber',
    defaultColumns: ['refundNumber', 'enrollmentBillingLink', 'approvedAmount', 'refundType', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'LMS refund workflow records linked to invoices, payments, and credit notes.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'refundNumber', type: 'text', required: true, unique: true, index: true },
    { name: 'enrollmentBillingLink', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks, index: true },
    { name: 'invoice', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.invoices, index: true },
    { name: 'paymentReceived', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived, index: true },
    { name: 'creditNote', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.creditNotes, index: true, admin: { readOnly: true } },
    { name: 'refundDate', type: 'date', required: true, defaultValue: () => new Date().toISOString() },
    { name: 'refundReason', type: 'textarea' },
    { name: 'refundType', type: 'select', required: true, defaultValue: 'partial', options: [...LMS_REFUND_TYPE_OPTIONS] },
    { name: 'requestedAmount', type: 'number', required: true, min: 0 },
    { name: 'approvedAmount', type: 'number', min: 0 },
    { name: 'currency', type: 'text', required: true, defaultValue: 'PHP' },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...LMS_REFUND_STATUS_OPTIONS], index: true },
    { name: 'processedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
    { name: 'proofDocument', type: 'upload', relationTo: 'media' },
    { name: 'notes', type: 'textarea' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc, operation }) => {
        if (!data) return data
        if (originalDoc && ['processed', 'voided'].includes(String(originalDoc.status || ''))) {
          throw new APIError('Processed or voided refunds cannot be edited directly.', 400)
        }
        if (operation === 'create' && !data.refundNumber) {
          data.refundNumber = await AccountingLmsRefundService.generateRefundNumber(req.payload)
        }
        AccountingLmsRefundService.normalizeRefund(data)
        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
  },
}
