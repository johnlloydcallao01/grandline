import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS,
  ACCOUNTING_APPROVAL_REQUEST_STATUS_OPTIONS,
  ACCOUNTING_COLLECTION_SLUGS,
} from '../constants/accounting'
import { buildAuditedHooks, buildCreatedUpdatedByFields } from '../utils/phase4-collections'

export const AccountingApprovalRequests: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.approvalRequests,
  dbName: 'acct_approval_requests',
  admin: {
    useAsTitle: 'entityId',
    defaultColumns: ['entityType', 'entityId', 'status', 'requestedBy', 'currentApprover'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Approval instances connected to sensitive finance actions.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'workflow', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.approvalWorkflows, required: true, index: true },
    { name: 'entityType', type: 'select', required: true, options: [...ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS] },
    { name: 'entityId', type: 'text', required: true, index: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'pending', options: [...ACCOUNTING_APPROVAL_REQUEST_STATUS_OPTIONS] },
    { name: 'requestedBy', type: 'relationship', relationTo: 'users' },
    { name: 'currentApprover', type: 'relationship', relationTo: 'users' },
    { name: 'requestedAt', type: 'date', required: true, defaultValue: () => new Date().toISOString() },
    { name: 'resolvedAt', type: 'date' },
    { name: 'resolutionNotes', type: 'textarea' },
    {
      name: 'approvalTrail',
      type: 'array',
      fields: [
        { name: 'stepNumber', type: 'number' },
        { name: 'approver', type: 'relationship', relationTo: 'users' },
        { name: 'decision', type: 'text' },
        { name: 'notes', type: 'textarea' },
        { name: 'actedAt', type: 'date' },
      ],
    },
    ...buildCreatedUpdatedByFields(),
  ],
  hooks: buildAuditedHooks('approval_request'),
}
