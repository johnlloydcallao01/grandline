import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  LMS_RECOGNITION_METHOD_OPTIONS,
} from '../constants/accounting'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'

export const AccountingCourseFeeProfiles: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.courseFeeProfiles,
  dbName: 'acct_course_fee_profiles',
  admin: {
    useAsTitle: 'course',
    defaultColumns: ['course', 'defaultRecognitionMethod', 'certificateFee', 'retakeFee'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'LMS pricing overlays and account mappings for course monetization.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'course', type: 'relationship', relationTo: 'courses', required: true, unique: true, index: true },
    { name: 'certificateFee', type: 'number', min: 0, defaultValue: 0 },
    { name: 'retakeFee', type: 'number', min: 0, defaultValue: 0 },
    { name: 'reassessmentFee', type: 'number', min: 0, defaultValue: 0 },
    { name: 'renewalFee', type: 'number', min: 0, defaultValue: 0 },
    { name: 'latePaymentFee', type: 'number', min: 0, defaultValue: 0 },
    { name: 'manualAdjustmentAllowed', type: 'checkbox', defaultValue: true },
    { name: 'defaultRecognitionMethod', type: 'select', defaultValue: 'on_activation', options: [...LMS_RECOGNITION_METHOD_OPTIONS] },
    { name: 'courseRevenueAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts },
    { name: 'deferredRevenueAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts },
    { name: 'certificateRevenueAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts },
    { name: 'discountContraRevenueAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts },
    { name: 'instructorExpenseAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts },
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
  },
}
