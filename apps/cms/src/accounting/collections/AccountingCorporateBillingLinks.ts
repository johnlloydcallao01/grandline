import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  LMS_COVERAGE_TYPE_OPTIONS,
  LMS_SPONSOR_STATUS_OPTIONS,
} from '../constants/accounting'
import { AccountingLmsBridgeSyncService } from '../services/enrollment-billing/AccountingLmsBridgeSyncService'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'

export const AccountingCorporateBillingLinks: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.corporateBillingLinks,
  dbName: 'acct_corporate_billing_links',
  admin: {
    useAsTitle: 'coverageType',
    defaultColumns: ['corporateAccount', 'enrollmentBillingLink', 'invoice', 'coveredAmount', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Corporate payer linkage between enrollments, customers, and commercial invoices.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'corporateAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.corporateAccounts, required: true, index: true },
    { name: 'enrollmentBillingLink', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks, required: true, index: true },
    { name: 'invoice', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.invoices, index: true },
    { name: 'coverageType', type: 'select', required: true, defaultValue: 'full_company_pay', options: [...LMS_COVERAGE_TYPE_OPTIONS] },
    { name: 'coveredAmount', type: 'number', min: 0, defaultValue: 0 },
    { name: 'traineeShareAmount', type: 'number', min: 0, defaultValue: 0 },
    { name: 'status', type: 'select', required: true, defaultValue: 'active', options: [...LMS_SPONSOR_STATUS_OPTIONS], index: true },
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
