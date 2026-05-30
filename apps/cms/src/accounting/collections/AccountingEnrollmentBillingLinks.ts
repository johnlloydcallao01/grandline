import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  LMS_BILLING_STATUS_OPTIONS,
} from '../constants/accounting'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'

export const AccountingEnrollmentBillingLinks: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
  dbName: 'acct_enrollment_billing_links',
  admin: {
    useAsTitle: 'sourceReference',
    defaultColumns: ['enrollment', 'invoice', 'customer', 'billingStatus', 'finalChargeSnapshot'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Bridge records linking LMS enrollments to Phase 2 commercial accounting documents.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'enrollment', type: 'relationship', relationTo: 'course-enrollments', required: true, unique: true, index: true },
    { name: 'course', type: 'relationship', relationTo: 'courses', required: true, index: true },
    { name: 'trainee', type: 'relationship', relationTo: 'trainees', required: true, index: true },
    { name: 'user', type: 'relationship', relationTo: 'users', index: true },
    { name: 'invoice', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.invoices, index: true },
    { name: 'customer', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.customers, index: true },
    { name: 'billingStatus', type: 'select', required: true, defaultValue: 'not_started', options: [...LMS_BILLING_STATUS_OPTIONS], index: true },
    { name: 'sourceType', type: 'text', required: true, defaultValue: 'enrollment' },
    { name: 'sourceReference', type: 'text', required: true, index: true },
    { name: 'listPriceSnapshot', type: 'number', min: 0, defaultValue: 0 },
    { name: 'salePriceSnapshot', type: 'number', min: 0, defaultValue: 0 },
    { name: 'couponDiscountSnapshot', type: 'number', min: 0, defaultValue: 0 },
    { name: 'scholarshipDiscountSnapshot', type: 'number', min: 0, defaultValue: 0 },
    { name: 'corporateCoverageSnapshot', type: 'number', min: 0, defaultValue: 0 },
    { name: 'adjustmentsNetSnapshot', type: 'number', defaultValue: 0 },
    { name: 'finalChargeSnapshot', type: 'number', min: 0, defaultValue: 0 },
    { name: 'recognizedRevenueSnapshot', type: 'number', min: 0, defaultValue: 0 },
    { name: 'currency', type: 'text', required: true, defaultValue: 'PHP' },
    { name: 'linkedAt', type: 'date', defaultValue: () => new Date().toISOString() },
    { name: 'metadata', type: 'json' },
    { name: 'notes', type: 'textarea' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, originalDoc }) => {
        if (!data) return data
        if (!data.linkedAt) {
          data.linkedAt = originalDoc?.linkedAt || new Date().toISOString()
        }
        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
  },
}
