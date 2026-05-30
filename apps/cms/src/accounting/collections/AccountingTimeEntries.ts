import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_TIME_ENTRY_SOURCE_TYPE_OPTIONS,
  ACCOUNTING_TIME_ENTRY_STATUS_OPTIONS,
} from '../constants/accounting'
import { AccountingTimeTrackingService } from '../services/time/AccountingTimeTrackingService'
import { buildAuditedHooks, buildCreatedUpdatedByFields } from '../utils/phase4-collections'

const auditedHooks = buildAuditedHooks('time_entry') ?? {}

export const AccountingTimeEntries: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.timeEntries,
  dbName: 'acct_time_entries',
  admin: {
    useAsTitle: 'entryDate',
    defaultColumns: ['entryDate', 'user', 'project', 'hours', 'billable', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Billable and non-billable time used for approvals, payroll support, and profitability.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'entryDate', type: 'date', required: true, index: true },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'timesheet', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.timesheets, index: true },
    { name: 'project', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.projects, index: true },
    { name: 'projectTask', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.projectTasks, index: true },
    { name: 'course', type: 'relationship', relationTo: 'courses', index: true },
    { name: 'instructor', type: 'relationship', relationTo: 'instructors', index: true },
    { name: 'hours', type: 'number', min: 0, defaultValue: 0 },
    { name: 'minutes', type: 'number', min: 0, max: 59, defaultValue: 0 },
    { name: 'billable', type: 'checkbox', defaultValue: true },
    { name: 'billingRate', type: 'number', min: 0, defaultValue: 0 },
    { name: 'costRate', type: 'number', min: 0, defaultValue: 0 },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...ACCOUNTING_TIME_ENTRY_STATUS_OPTIONS] },
    { name: 'sourceType', type: 'select', required: true, defaultValue: 'manual', options: [...ACCOUNTING_TIME_ENTRY_SOURCE_TYPE_OPTIONS] },
    { name: 'startedAt', type: 'date' },
    { name: 'endedAt', type: 'date' },
    { name: 'approvedBy', type: 'relationship', relationTo: 'users' },
    { name: 'approvedAt', type: 'date' },
    { name: 'notes', type: 'textarea' },
    ...buildCreatedUpdatedByFields(),
  ],
  hooks: {
    ...auditedHooks,
    afterChange: [
      ...(auditedHooks.afterChange || []),
      async ({ doc, previousDoc, req }) => {
        const timesheetId = doc.timesheet || previousDoc?.timesheet
        if (timesheetId) {
          await AccountingTimeTrackingService.syncTimesheetTotalHours(req.payload, timesheetId)
        }
        return doc
      },
    ],
    afterDelete: [
      ...(auditedHooks.afterDelete || []),
      async ({ doc, req }) => {
        if (doc?.timesheet) {
          await AccountingTimeTrackingService.syncTimesheetTotalHours(req.payload, doc.timesheet)
        }
        return doc
      },
    ],
  },
}
