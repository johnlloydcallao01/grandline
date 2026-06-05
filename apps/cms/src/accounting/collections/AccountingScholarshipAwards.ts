import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  LMS_SCHOLARSHIP_AWARD_TYPE_OPTIONS,
  LMS_SPONSOR_STATUS_OPTIONS,
} from '../constants/accounting'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'

export const AccountingScholarshipAwards: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.scholarshipAwards,
  dbName: 'acct_scholarship_awards',
  admin: {
    useAsTitle: 'awardType',
    defaultColumns: ['enrollmentBillingLink', 'scholarshipSponsor', 'awardType', 'awardAmount', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Coverage awards applied to LMS enrollments by scholarship and sponsor programs.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'enrollmentBillingLink', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks, required: true, index: true },
    { name: 'scholarshipSponsor', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.scholarshipSponsors, required: true, index: true },
    { name: 'trainee', type: 'relationship', relationTo: 'trainees', required: true, index: true },
    { name: 'awardType', type: 'select', required: true, defaultValue: 'partial', options: [...LMS_SCHOLARSHIP_AWARD_TYPE_OPTIONS] },
    { name: 'awardAmount', type: 'number', min: 0, defaultValue: 0 },
    { name: 'awardPercent', type: 'number', min: 0, max: 100 },
    { name: 'traineeShareAmount', type: 'number', min: 0, defaultValue: 0 },
    { name: 'effectiveDate', type: 'date', required: true, defaultValue: () => new Date().toISOString() },
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
  },
}
