import { APIError, type CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_HOOK_CONTEXT,
} from '../constants/accounting'
import { AccountingJournalService } from '../services/journals/AccountingJournalService'
import { applyCreatedAndUpdatedBy, getRelationshipId } from '../utils/accounting-audit'

export const AccountingJournalEntryLines: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines,
  admin: {
    useAsTitle: 'description',
    defaultColumns: ['journalEntry', 'lineNumber', 'account', 'debit', 'credit'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Debit and credit lines for accounting journal entries.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'journalEntry',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
      required: true,
      index: true,
    },
    {
      name: 'lineNumber',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'account',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      required: true,
      index: true,
    },
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'debit',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'credit',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'taxCode',
      type: 'relationship',
      relationTo: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
    },
    {
      name: 'referenceEntityType',
      type: 'text',
    },
    {
      name: 'referenceEntityId',
      type: 'text',
    },
    {
      name: 'lineMeta',
      type: 'json',
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

        const journalEntryId = getRelationshipId(data.journalEntry ?? originalDoc?.journalEntry)

        if (!journalEntryId) {
          throw new APIError('Journal entry lines must belong to a journal entry.', 400)
        }

        if (operation === 'update' && originalDoc?.journalEntry) {
          const originalJournalEntryId = getRelationshipId(originalDoc.journalEntry)

          if (journalEntryId && originalJournalEntryId && String(journalEntryId) !== String(originalJournalEntryId)) {
            throw new APIError('Journal entry lines cannot be moved to another journal entry.', 400)
          }
        }

        await AccountingJournalService.assertEntryIsMutable(req.payload, journalEntryId)

        applyCreatedAndUpdatedBy({ data, originalDoc, req })

        if (operation === 'create' && !data.lineNumber) {
          data.lineNumber = await AccountingJournalService.getNextLineNumber(req.payload, journalEntryId)
        }

        AccountingJournalService.validateLine(data)

        const journalEntry = await req.payload.findByID({
          collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
          id: journalEntryId,
          depth: 0,
          overrideAccess: true,
        })

        await AccountingJournalService.validateAccountForSourceType(req.payload, data.account, {
          sourceType: String(journalEntry?.sourceType || 'manual'),
        })

        return data
      },
    ],
    afterChange: [
      async ({ doc, req, context }) => {
        if (context?.[ACCOUNTING_HOOK_CONTEXT.skipJournalTotalsSync]) {
          return doc
        }

        const journalEntryId = getRelationshipId(doc.journalEntry)

        if (journalEntryId) {
          await AccountingJournalService.synchronizeJournalTotals(req.payload, journalEntryId)
        }

        return doc
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        const line = await req.payload.findByID({
          collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines,
          id,
          depth: 0,
          overrideAccess: true,
        })

        const journalEntryId = getRelationshipId(line?.journalEntry)

        if (journalEntryId) {
          await AccountingJournalService.assertEntryIsMutable(req.payload, journalEntryId)
        }
      },
    ],
    afterDelete: [
      async ({ doc, req, context }) => {
        if (context?.[ACCOUNTING_HOOK_CONTEXT.skipJournalTotalsSync]) {
          return doc
        }

        const journalEntryId = getRelationshipId(doc?.journalEntry)

        if (journalEntryId) {
          await AccountingJournalService.synchronizeJournalTotals(req.payload, journalEntryId)
        }

        return doc
      },
    ],
  },
}
