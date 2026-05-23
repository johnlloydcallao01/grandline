import { APIError, type CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  PERIOD_STATUS_OPTIONS,
} from '../constants/accounting'
import { applyCreatedAndUpdatedBy, getRelationshipId } from '../utils/accounting-audit'

export const AccountingPeriods: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.periods,
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'fiscalYear', 'periodNumber', 'startDate', 'endDate', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Accounting posting periods under a fiscal year.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'fiscalYear',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
      required: true,
      index: true,
    },
    {
      name: 'periodNumber',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'label',
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
      options: [...PERIOD_STATUS_OPTIONS],
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

        data.label = String(data.label || '').trim()

        applyCreatedAndUpdatedBy({ data, originalDoc, req })

        const startDate = data.startDate ? new Date(String(data.startDate)) : null
        const endDate = data.endDate ? new Date(String(data.endDate)) : null
        const fiscalYearId = getRelationshipId(data.fiscalYear ?? originalDoc?.fiscalYear)

        if (!fiscalYearId) {
          throw new APIError('An accounting period must belong to a fiscal year.', 400)
        }

        if (!startDate || !endDate || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
          throw new APIError('Accounting period start and end dates are required.', 400)
        }

        if (startDate > endDate) {
          throw new APIError('Accounting period start date cannot be after the end date.', 400)
        }

        const fiscalYear = await req.payload.findByID({
          collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
          id: fiscalYearId,
          depth: 0,
          overrideAccess: true,
        })

        const fiscalYearStart = fiscalYear?.startDate ? new Date(String(fiscalYear.startDate)) : null
        const fiscalYearEnd = fiscalYear?.endDate ? new Date(String(fiscalYear.endDate)) : null

        if (!fiscalYearStart || !fiscalYearEnd) {
          throw new APIError('The selected fiscal year is missing a valid date range.', 400)
        }

        if (startDate < fiscalYearStart || endDate > fiscalYearEnd) {
          throw new APIError('Accounting periods must stay within the parent fiscal year date range.', 400)
        }

        const overlap = await req.payload.find({
          collection: ACCOUNTING_COLLECTION_SLUGS.periods,
          depth: 0,
          limit: 1,
          overrideAccess: true,
          where: {
            and: [
              {
                fiscalYear: {
                  equals: fiscalYearId,
                },
              },
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
          throw new APIError('Accounting period date ranges cannot overlap within the same fiscal year.', 400)
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
