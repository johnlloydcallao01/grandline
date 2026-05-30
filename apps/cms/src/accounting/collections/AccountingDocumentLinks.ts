import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_DOCUMENT_CATEGORY_OPTIONS,
  ACCOUNTING_ENTITY_TYPE_OPTIONS,
} from '../constants/accounting'
import { applyCreatedAndUpdatedBy, getRequestUserId } from '../utils/accounting-audit'
import { normalizeOptionalText } from '../utils/commercial'

export const AccountingDocumentLinks: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.documentLinks,
  admin: {
    useAsTitle: 'entityId',
    defaultColumns: ['entityType', 'entityId', 'documentCategory', 'documentDate', 'isPrimary'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Accounting-specific metadata that links transactions to uploaded media documents.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'media', type: 'relationship', relationTo: 'media', required: true, index: true },
    { name: 'entityType', type: 'select', required: true, options: [...ACCOUNTING_ENTITY_TYPE_OPTIONS], index: true },
    { name: 'entityId', type: 'text', required: true, index: true },
    { name: 'documentCategory', type: 'select', required: true, defaultValue: 'other', options: [...ACCOUNTING_DOCUMENT_CATEGORY_OPTIONS] },
    { name: 'documentDate', type: 'date' },
    { name: 'uploadedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
    { name: 'notes', type: 'textarea' },
    { name: 'isPrimary', type: 'checkbox', defaultValue: false },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        if (!data) return data
        data.entityId = String(data.entityId || '').trim()
        data.notes = normalizeOptionalText(data.notes)
        data.uploadedBy = data.uploadedBy || getRequestUserId(req)
        applyCreatedAndUpdatedBy({ data, req })
        return data
      },
    ],
  },
}
