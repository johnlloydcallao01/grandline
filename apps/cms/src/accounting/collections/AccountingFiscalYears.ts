import { APIError, type CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  FISCAL_YEAR_CLOSE_MODE_OPTIONS,
  FISCAL_YEAR_STATUS_OPTIONS,
} from '../constants/accounting'
import { applyCreatedAndUpdatedBy } from '../utils/accounting-audit'

export const AccountingFiscalYears: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['code', 'name', 'startDate', 'endDate', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Accounting fiscal year definitions and close state.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
    },
    {
      name: 'endDate',
      type: 'date',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [...FISCAL_YEAR_STATUS_OPTIONS],
    },
    {
      name: 'closeMode',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: [...FISCAL_YEAR_CLOSE_MODE_OPTIONS],
    },
    {
      name: 'lockedFromDate',
      type: 'date',
    },
    {
      name: 'closedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'closedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'notes',
      type: 'textarea',
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc, operation }) => {
        if (!data) {
          return data
        }

        data.code = String(data.code || '').trim().toUpperCase()
        data.name = String(data.name || '').trim()

        applyCreatedAndUpdatedBy({ data, originalDoc, req })

        const startDate = data.startDate ? new Date(String(data.startDate)) : null
        const endDate = data.endDate ? new Date(String(data.endDate)) : null

        if (!startDate || !endDate || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
          throw new APIError('Fiscal year start and end dates are required.', 400)
        }

        if (startDate > endDate) {
          throw new APIError('Fiscal year start date cannot be after the end date.', 400)
        }

        const overlap = await req.payload.find({
          collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
          depth: 0,
          limit: 1,
          overrideAccess: true,
          where: {
            and: [
              {
                startDate: {
                  less_than_equal: endDate.toISOString(),
                },
              },
              {
                endDate: {
                  greater_than_equal: startDate.toISOString(),
                },
              },
              ...(operation === 'update' && originalDoc?.id
                ? [
                    {
                      id: {
                        not_equals: originalDoc.id,
                      },
                    },
                  ]
                : []),
            ],
          },
        })

        if (overlap.totalDocs > 0) {
          throw new APIError('Fiscal year date ranges cannot overlap.', 400)
        }

        if (data.status === 'closed' && !originalDoc?.closedAt) {
          data.closedAt = new Date().toISOString()
          data.closedBy = req.user?.id || null
        }

        return data
      },
    ],
  },
}
