import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import { ACCOUNTING_ADMIN_GROUP, ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS, ACCOUNTING_COLLECTION_SLUGS } from '../constants/accounting'
import { buildAuditedHooks, buildCreatedUpdatedByFields } from '../utils/phase4-collections'

export const AccountingApprovalWorkflows: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.approvalWorkflows,
  dbName: 'acct_approval_workflows',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['workflowCode', 'name', 'entityType', 'isActive'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Reusable approval chains for finance-sensitive workflows.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'workflowCode', type: 'text', required: true, unique: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'entityType', type: 'select', required: true, options: [...ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS] },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
    {
      name: 'steps',
      type: 'array',
      fields: [
        { name: 'stepNumber', type: 'number', required: true, min: 1 },
        { name: 'label', type: 'text' },
        { name: 'approverUser', type: 'relationship', relationTo: 'users' },
        { name: 'approverRole', type: 'text' },
      ],
    },
    { name: 'notes', type: 'textarea' },
    ...buildCreatedUpdatedByFields(),
  ],
  hooks: buildAuditedHooks('approval_workflow'),
}
