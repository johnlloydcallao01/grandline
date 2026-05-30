import { APIError, type CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  LMS_RECOGNITION_METHOD_OPTIONS,
  LMS_RECOGNITION_STATUS_OPTIONS,
} from '../constants/accounting'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'

export const AccountingRevenueRecognitionSchedules: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.revenueRecognitionSchedules,
  dbName: 'acct_rev_rec_schedules',
  admin: {
    useAsTitle: 'recognitionMethod',
    defaultColumns: ['invoice', 'enrollmentBillingLink', 'recognitionMethod', 'totalDeferredAmount', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Deferred revenue and recognition schedules linked to enrollment billing and posted invoices.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'invoice', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.invoices, required: true, index: true },
    { name: 'enrollmentBillingLink', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks, required: true, index: true },
    { name: 'recognitionMethod', type: 'select', required: true, defaultValue: 'on_activation', options: [...LMS_RECOGNITION_METHOD_OPTIONS] },
    { name: 'startDate', type: 'date', required: true },
    { name: 'endDate', type: 'date', required: true },
    { name: 'totalDeferredAmount', type: 'number', required: true, min: 0 },
    { name: 'recognizedAmount', type: 'number', required: true, min: 0, defaultValue: 0 },
    { name: 'remainingDeferredAmount', type: 'number', required: true, min: 0, defaultValue: 0 },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...LMS_RECOGNITION_STATUS_OPTIONS], index: true },
    { name: 'scheduleData', type: 'json' },
    { name: 'lastRecognitionAt', type: 'date' },
    { name: 'notes', type: 'textarea' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, originalDoc }) => {
        if (!data) return data
        if (
          data.startDate &&
          data.endDate &&
          new Date(String(data.startDate)).getTime() > new Date(String(data.endDate)).getTime()
        ) {
          throw new APIError('Revenue recognition schedule start date cannot be after the end date.', 400)
        }
        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
  },
}
