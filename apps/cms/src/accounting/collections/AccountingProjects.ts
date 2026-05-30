import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_PROJECT_STATUS_OPTIONS,
  ACCOUNTING_PROJECT_TYPE_OPTIONS,
} from '../constants/accounting'
import { buildAuditedHooks, buildCreatedUpdatedByFields, buildDimensionFields } from '../utils/phase4-collections'

export const AccountingProjects: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.projects,
  dbName: 'acct_projects',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['projectCode', 'name', 'status', 'customer', 'managerUser'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Optional finance overlays for project profitability and operational tracking.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'projectCode', type: 'text', required: true, unique: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...ACCOUNTING_PROJECT_STATUS_OPTIONS] },
    { name: 'customer', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.customers, index: true },
    { name: 'managerUser', type: 'relationship', relationTo: 'users', index: true },
    { name: 'projectType', type: 'select', required: true, defaultValue: 'internal', options: [...ACCOUNTING_PROJECT_TYPE_OPTIONS] },
    { name: 'course', type: 'relationship', relationTo: 'courses', index: true },
    { name: 'startDate', type: 'date' },
    { name: 'endDate', type: 'date' },
    ...buildDimensionFields({ branch: true, department: true, location: true }),
    { name: 'budgetAmount', type: 'number', min: 0, defaultValue: 0 },
    { name: 'notes', type: 'textarea' },
    ...buildCreatedUpdatedByFields(),
  ],
  hooks: buildAuditedHooks('project'),
}
