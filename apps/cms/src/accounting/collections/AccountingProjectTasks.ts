import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import { ACCOUNTING_ADMIN_GROUP, ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_PROJECT_TASK_STATUS_OPTIONS } from '../constants/accounting'
import { buildAuditedHooks, buildCreatedUpdatedByFields } from '../utils/phase4-collections'

export const AccountingProjectTasks: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.projectTasks,
  dbName: 'acct_project_tasks',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['taskCode', 'name', 'project', 'status', 'assignedTo'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Trackable operational work units for project costing and profitability.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'project', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.projects, required: true, index: true },
    { name: 'taskCode', type: 'text', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...ACCOUNTING_PROJECT_TASK_STATUS_OPTIONS] },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users', index: true },
    { name: 'billable', type: 'checkbox', defaultValue: true },
    { name: 'startDate', type: 'date' },
    { name: 'dueDate', type: 'date' },
    { name: 'notes', type: 'textarea' },
    ...buildCreatedUpdatedByFields(),
  ],
  hooks: buildAuditedHooks('project_task'),
}
