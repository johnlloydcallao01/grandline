import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  LMS_SPONSOR_STATUS_OPTIONS,
} from '../constants/accounting'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'

export const AccountingScholarshipSponsors: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.scholarshipSponsors,
  dbName: 'acct_scholarship_sponsors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['sponsorCode', 'name', 'defaultCustomer', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Scholarship, grant, and sponsorship master records mapped to accounting customers.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'sponsorCode', type: 'text', required: true, unique: true, index: true },
    { name: 'name', type: 'text', required: true, index: true },
    { name: 'contactName', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'phone', type: 'text' },
    { name: 'billingAddress', type: 'textarea' },
    { name: 'defaultCustomer', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.customers },
    { name: 'status', type: 'select', required: true, defaultValue: 'active', options: [...LMS_SPONSOR_STATUS_OPTIONS], index: true },
    { name: 'notes', type: 'textarea' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, originalDoc }) => {
        if (!data) return data
        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
  },
}
