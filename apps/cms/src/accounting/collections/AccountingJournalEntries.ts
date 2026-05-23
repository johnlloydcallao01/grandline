import { APIError, type CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_HOOK_CONTEXT,
  JOURNAL_SOURCE_TYPE_OPTIONS,
  JOURNAL_STATUS_OPTIONS,
  POSTING_STATUS_OPTIONS,
} from '../constants/accounting'
import { AccountingJournalService } from '../services/journals/AccountingJournalService'
import { AccountingPostingService } from '../services/posting/AccountingPostingService'
import { applyCreatedAndUpdatedBy, getRelationshipId, getRequestUserId } from '../utils/accounting-audit'

export const AccountingJournalEntries: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
  admin: {
    useAsTitle: 'entryNumber',
    defaultColumns: ['entryNumber', 'postingDate', 'status', 'totalDebit', 'totalCredit', 'isBalanced'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Manual, opening, adjustment, and reversal journal entry headers.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'entryNumber',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'entryDate',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'postingDate',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'fiscalYear',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'period',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.periods,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'sourceType',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: [...JOURNAL_SOURCE_TYPE_OPTIONS],
    },
    {
      name: 'sourceReference',
      type: 'text',
    },
    {
      name: 'memo',
      type: 'textarea',
    },
    {
      name: 'referenceNumber',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [...JOURNAL_STATUS_OPTIONS],
    },
    {
      name: 'postingStatus',
      type: 'select',
      required: true,
      defaultValue: 'unposted',
      options: [...POSTING_STATUS_OPTIONS],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'totalDebit',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'totalCredit',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'isBalanced',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'reversalOf',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
    },
    {
      name: 'reversalEntry',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'reversedByUser',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'reversedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'postedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'postedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'approvedBy',
      type: 'relationship',
      relationTo: 'users',
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
      async ({ data, req, originalDoc, operation, context }) => {
        if (!data) {
          return data
        }

        if (
          originalDoc &&
          ['posted', 'reversed', 'voided'].includes(String(originalDoc.status || '')) &&
          !context?.[ACCOUNTING_HOOK_CONTEXT.skipPostedImmutability]
        ) {
          throw new APIError('Posted, reversed, or voided journal entries cannot be edited directly.', 400)
        }

        applyCreatedAndUpdatedBy({ data, originalDoc, req })

        if (operation === 'create' && !data.entryNumber) {
          data.entryNumber = await AccountingJournalService.generateEntryNumber(req.payload)
        }

        if (data.entryNumber) {
          data.entryNumber = String(data.entryNumber).trim().toUpperCase()
        }

        if (!data.entryDate) {
          data.entryDate = originalDoc?.entryDate || new Date().toISOString()
        }

        if (!data.postingDate) {
          data.postingDate = data.entryDate || originalDoc?.postingDate || new Date().toISOString()
        }

        const preparedData = await AccountingPostingService.prepareForPersistence({
          payload: req.payload,
          data,
          originalDoc,
          userId: getRequestUserId(req),
          context,
        })

        return preparedData
      },
    ],
    afterChange: [
      async ({ doc, req, context }) => {
        if (
          context?.[ACCOUNTING_HOOK_CONTEXT.skipReversalSync] ||
          doc.sourceType !== 'reversal' ||
          doc.status !== 'posted'
        ) {
          return doc
        }

        const sourceEntryId = getRelationshipId(doc.reversalOf)

        if (!sourceEntryId) {
          return doc
        }

        const sourceEntry = await req.payload.findByID({
          collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
          id: sourceEntryId,
          depth: 0,
          overrideAccess: true,
        })

        if (String(sourceEntry?.reversalEntry || '') === String(doc.id)) {
          return doc
        }

        await req.payload.update({
          collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
          id: sourceEntryId,
          overrideAccess: true,
          context: {
            [ACCOUNTING_HOOK_CONTEXT.skipPostedImmutability]: true,
            [ACCOUNTING_HOOK_CONTEXT.skipReversalSync]: true,
          },
          data: {
            status: 'reversed',
            postingStatus: 'reversed',
            reversalEntry: doc.id,
            reversedByUser: req.user?.id || null,
            reversedAt: new Date().toISOString(),
            updatedBy: req.user?.id || sourceEntry?.updatedBy || null,
          },
        })

        return doc
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        const journalEntry = await req.payload.findByID({
          collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
          id,
          depth: 0,
          overrideAccess: true,
        })

        if (['posted', 'reversed', 'voided'].includes(String(journalEntry?.status || ''))) {
          throw new APIError('Posted, reversed, or voided journal entries cannot be deleted.', 400)
        }

        if (!req.user || req.user.role !== 'admin') {
          throw new APIError('Only administrators can delete journal entries.', 403)
        }
      },
    ],
  },
}
