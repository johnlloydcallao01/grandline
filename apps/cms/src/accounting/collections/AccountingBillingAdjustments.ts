import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  LMS_ADJUSTMENT_DIRECTION_OPTIONS,
  LMS_ADJUSTMENT_TYPE_OPTIONS,
} from '../constants/accounting'
import { AccountingLmsBridgeSyncService } from '../services/enrollment-billing/AccountingLmsBridgeSyncService'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'

export const AccountingBillingAdjustments: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.billingAdjustments,
  dbName: 'acct_billing_adjustments',
  admin: {
    useAsTitle: 'adjustmentType',
    defaultColumns: ['enrollmentBillingLink', 'adjustmentType', 'direction', 'amount', 'appliedAt'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Manual LMS billing adjustments layered on top of course pricing snapshots.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'enrollmentBillingLink', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks, required: true, index: true },
    { name: 'adjustmentType', type: 'select', required: true, options: [...LMS_ADJUSTMENT_TYPE_OPTIONS] },
    { name: 'reason', type: 'textarea' },
    { name: 'amount', type: 'number', required: true, min: 0 },
    { name: 'direction', type: 'select', required: true, defaultValue: 'increase', options: [...LMS_ADJUSTMENT_DIRECTION_OPTIONS] },
    { name: 'approvedBy', type: 'relationship', relationTo: 'users' },
    { name: 'appliedAt', type: 'date', defaultValue: () => new Date().toISOString() },
    { name: 'notes', type: 'textarea' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, originalDoc }) => {
        if (!data) return data
        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        await AccountingLmsBridgeSyncService.syncEnrollmentArtifactsForBillingLink({
          payload: req.payload,
          billingLinkId: doc.enrollmentBillingLink,
          userId: req.user?.id,
          createZeroValueInvoice: false,
          autoPost: false,
          recognitionTrigger: 'schedule_only',
        })
        return doc
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await AccountingLmsBridgeSyncService.syncEnrollmentArtifactsForBillingLink({
          payload: req.payload,
          billingLinkId: doc.enrollmentBillingLink,
          userId: req.user?.id,
          createZeroValueInvoice: false,
          autoPost: false,
          recognitionTrigger: 'schedule_only',
        })
        return doc
      },
    ],
  },
}
