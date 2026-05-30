import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import { ACCOUNTING_ADMIN_GROUP, ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_TIMESHEET_STATUS_OPTIONS } from '../constants/accounting'
import { buildAuditedHooks, buildCreatedUpdatedByFields } from '../utils/phase4-collections'

export const AccountingTimesheets: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.timesheets,
  dbName: 'acct_timesheets',
  admin: {
    useAsTitle: 'periodStart',
    defaultColumns: ['user', 'periodStart', 'periodEnd', 'status', 'totalHours'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Approval-ready containers for time entries used in Phase 4 payroll and profitability workflows.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'periodStart', type: 'date', required: true, index: true },
    { name: 'periodEnd', type: 'date', required: true, index: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...ACCOUNTING_TIMESHEET_STATUS_OPTIONS] },
    { name: 'totalHours', type: 'number', min: 0, defaultValue: 0, admin: { readOnly: true } },
    { name: 'approvedBy', type: 'relationship', relationTo: 'users' },
    { name: 'approvedAt', type: 'date' },
    { name: 'notes', type: 'textarea' },
    ...buildCreatedUpdatedByFields(),
  ],
  hooks: buildAuditedHooks('timesheet'),
}
