import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  LMS_PAYOUT_STATUS_OPTIONS,
} from '../constants/accounting'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'

export const AccountingInstructorPayouts: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.instructorPayouts,
  dbName: 'acct_instructor_payouts',
  admin: {
    useAsTitle: 'sourceReference',
    defaultColumns: ['instructor', 'course', 'periodStart', 'periodEnd', 'approvedAmount', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Calculated or approved instructor payout obligations derived from LMS monetization.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'instructor', type: 'relationship', relationTo: 'instructors', required: true, index: true },
    { name: 'course', type: 'relationship', relationTo: 'courses', required: true, index: true },
    { name: 'periodStart', type: 'date', required: true },
    { name: 'periodEnd', type: 'date', required: true },
    { name: 'sourceType', type: 'text', required: true, defaultValue: 'course_activity' },
    { name: 'sourceReference', type: 'text', required: true, index: true },
    { name: 'calculatedAmount', type: 'number', required: true, min: 0, defaultValue: 0 },
    { name: 'approvedAmount', type: 'number', min: 0 },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...LMS_PAYOUT_STATUS_OPTIONS], index: true },
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
