import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_ENTITY_TYPE_OPTIONS,
  ACCOUNTING_FINANCE_AUDIT_ACTION_OPTIONS,
} from '../constants/accounting'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'

export const AccountingAuditLogs: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.auditLogs,
  dbName: 'acct_audit_logs',
  admin: {
    useAsTitle: 'entityId',
    defaultColumns: ['entityType', 'entityId', 'actionType', 'performedBy', 'performedAt'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Dedicated finance audit trail for approvals, postings, reversals, and exports.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'entityType', type: 'select', required: true, options: [...ACCOUNTING_ENTITY_TYPE_OPTIONS] },
    { name: 'entityId', type: 'text', required: true, index: true },
    { name: 'actionType', type: 'select', required: true, options: [...ACCOUNTING_FINANCE_AUDIT_ACTION_OPTIONS] },
    { name: 'performedBy', type: 'relationship', relationTo: 'users' },
    { name: 'performedAt', type: 'date', required: true, defaultValue: () => new Date().toISOString(), index: true },
    { name: 'beforeData', type: 'json' },
    { name: 'afterData', type: 'json' },
    { name: 'reason', type: 'textarea' },
    { name: 'metadata', type: 'json' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, originalDoc }) => {
        if (!data) return data
        applyCreatedAndUpdatedBy({ data, req, originalDoc })
        return data
      },
    ],
  },
}
