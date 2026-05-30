import type { CollectionConfig, Field } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../constants/accounting'
import { AccountingAuditService } from '../services/audit/AccountingAuditService'
import { applyCreatedAndUpdatedBy } from './accounting-audit'

export const buildCreatedUpdatedByFields = (): Field[] => [
  {
    name: 'createdBy',
    type: 'relationship',
    relationTo: 'users',
    admin: { readOnly: true, position: 'sidebar' },
  },
  {
    name: 'updatedBy',
    type: 'relationship',
    relationTo: 'users',
    admin: { readOnly: true, position: 'sidebar' },
  },
]

export const buildDimensionFields = ({
  branch = false,
  department = false,
  location = false,
}: {
  branch?: boolean
  department?: boolean
  location?: boolean
} = {}): Field[] => {
  const fields: Field[] = []

  if (branch) {
    fields.push({
      name: 'branch',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.branches,
      index: true,
    })
  }

  if (department) {
    fields.push({
      name: 'department',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.departments,
      index: true,
    })
  }

  if (location) {
    fields.push({
      name: 'location',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.locations,
      index: true,
    })
  }

  return fields
}

export const buildAuditedHooks = (entityType: string): CollectionConfig['hooks'] => ({
  beforeChange: [
    ({ data, req, originalDoc }) => {
      if (!data) return data
      applyCreatedAndUpdatedBy({ data, req, originalDoc })
      return data
    },
  ],
  afterChange: [
    async ({ doc, previousDoc, req, operation }) => {
      await AccountingAuditService.logAction({
        payload: req.payload,
        entityType,
        entityId: doc.id,
        actionType: operation === 'create' ? 'created' : 'updated',
        performedBy: req.user?.id,
        beforeData: operation === 'create' ? undefined : previousDoc,
        afterData: doc,
      })
      return doc
    },
  ],
  afterDelete: [
    async ({ doc, req }) => {
      await AccountingAuditService.logAction({
        payload: req.payload,
        entityType,
        entityId: doc.id,
        actionType: 'voided',
        performedBy: req.user?.id,
        beforeData: doc,
      })
      return doc
    },
  ],
})
