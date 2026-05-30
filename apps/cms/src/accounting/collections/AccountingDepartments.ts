import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import { ACCOUNTING_ADMIN_GROUP, ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_DIMENSION_STATUS_OPTIONS } from '../constants/accounting'
import { buildAuditedHooks, buildCreatedUpdatedByFields } from '../utils/phase4-collections'

export const AccountingDepartments: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.departments,
  dbName: 'acct_departments',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['departmentCode', 'name', 'branch', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Departments for budgeting, project analysis, and payroll segmentation.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'departmentCode', type: 'text', required: true, unique: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'active', options: [...ACCOUNTING_DIMENSION_STATUS_OPTIONS] },
    { name: 'branch', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.branches, index: true },
    { name: 'notes', type: 'textarea' },
    ...buildCreatedUpdatedByFields(),
  ],
  hooks: buildAuditedHooks('department'),
}
