import { APIError, type Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount } from '../../utils/amounts'
import { AccountingJournalService } from './AccountingJournalService'

type JournalLineInput = {
  account: number | string
  description?: string | null
  debit?: number | null
  credit?: number | null
  taxCode?: number | string | null
  referenceEntityType?: string | null
  referenceEntityId?: string | null
  lineMeta?: Record<string, unknown> | null
}

type CreateStructuredJournalArgs = {
  payload: Payload
  userId?: number | string | null
  sourceType: 'manual' | 'opening_balance' | 'adjustment' | 'reversal' | 'system'
  entryDate?: string | null
  postingDate?: string | null
  memo?: string | null
  referenceNumber?: string | null
  sourceReference?: string | null
  reversalOf?: number | string | null
  autoPost?: boolean
  lines: JournalLineInput[]
}

type CreateReversalArgs = {
  payload: Payload
  journalEntryId: number | string
  userId?: number | string | null
  postingDate?: string | null
  entryDate?: string | null
  memo?: string | null
  referenceNumber?: string | null
}

export class AccountingManualWorkflowService {
  static normalizeRelationshipId(value: unknown, fieldName: string) {
    const relationshipId = getRelationshipId(value)

    if (relationshipId === null) {
      return undefined
    }

    const numericId = Number(relationshipId)

    if (!Number.isFinite(numericId)) {
      throw new APIError(`${fieldName} must resolve to a numeric relationship id.`, 400)
    }

    return numericId
  }

  static async createStructuredJournal({
    payload,
    userId,
    sourceType,
    entryDate,
    postingDate,
    memo,
    referenceNumber,
    sourceReference,
    reversalOf,
    autoPost = false,
    lines,
  }: CreateStructuredJournalArgs) {
    if (!Array.isArray(lines) || lines.length === 0) {
      throw new APIError('At least one journal line is required.', 400)
    }

    const entry = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
      draft: false,
      overrideAccess: true,
      data: {
        entryNumber: await AccountingJournalService.generateEntryNumber(payload),
        sourceType,
        status: 'draft',
        postingStatus: 'unposted',
        entryDate: entryDate || postingDate || new Date().toISOString(),
        postingDate: postingDate || entryDate || new Date().toISOString(),
        memo: memo || undefined,
        referenceNumber: referenceNumber || undefined,
        sourceReference: sourceReference || undefined,
        reversalOf: this.normalizeRelationshipId(reversalOf, 'reversalOf'),
        createdBy: this.normalizeRelationshipId(userId, 'createdBy'),
        updatedBy: this.normalizeRelationshipId(userId, 'updatedBy'),
      },
    })

    for (const line of lines) {
      AccountingJournalService.validateLine(line)
      await AccountingJournalService.validateAccountForSourceType(payload, line.account, {
        sourceType,
      })
      const lineNumber = await AccountingJournalService.getNextLineNumber(payload, entry.id)
      const accountId = this.normalizeRelationshipId(line.account, 'account')

      if (!accountId) {
        throw new APIError('account is required on every journal line.', 400)
      }

      await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines,
        draft: false,
        overrideAccess: true,
        data: {
          journalEntry: entry.id,
          lineNumber,
          account: accountId,
          description: line.description || undefined,
          debit: normalizeAmount(line.debit),
          credit: normalizeAmount(line.credit),
          taxCode: this.normalizeRelationshipId(line.taxCode, 'taxCode'),
          referenceEntityType: line.referenceEntityType || undefined,
          referenceEntityId: line.referenceEntityId || undefined,
          lineMeta: line.lineMeta || undefined,
          createdBy: this.normalizeRelationshipId(userId, 'createdBy'),
          updatedBy: this.normalizeRelationshipId(userId, 'updatedBy'),
        },
      })
    }

    if (!autoPost) {
      return payload.findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
        id: entry.id,
        depth: 2,
        overrideAccess: true,
      })
    }

    return this.postJournalEntry({
      payload,
      journalEntryId: entry.id,
      userId,
    })
  }

  static async postJournalEntry({
    payload,
    journalEntryId,
    userId,
  }: {
    payload: Payload
    journalEntryId: number | string
    userId?: number | string | null
  }) {
    const journalEntry = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
      id: journalEntryId,
      depth: 0,
      overrideAccess: true,
    })

    if (!journalEntry) {
      throw new APIError('Journal entry not found.', 404)
    }

    if (journalEntry.status === 'posted') {
      return payload.findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
        id: journalEntryId,
        depth: 2,
        overrideAccess: true,
      })
    }

    return payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
      id: journalEntryId,
      overrideAccess: true,
      data: {
        status: 'posted',
        updatedBy: this.normalizeRelationshipId(userId || journalEntry.updatedBy, 'updatedBy'),
      },
      depth: 2,
    })
  }

  static async createReversalEntry({
    payload,
    journalEntryId,
    userId,
    postingDate,
    entryDate,
    memo,
    referenceNumber,
  }: CreateReversalArgs) {
    const sourceEntry = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
      id: journalEntryId,
      depth: 0,
      overrideAccess: true,
    })

    if (!sourceEntry) {
      throw new APIError('The journal entry to reverse was not found.', 404)
    }

    if (sourceEntry.status !== 'posted') {
      throw new APIError('Only posted journal entries can be reversed.', 400)
    }

    if (sourceEntry.reversalEntry) {
      throw new APIError('This journal entry already has a reversal entry.', 400)
    }

    const sourceLines = await AccountingJournalService.getJournalLines(payload, journalEntryId)

    if (!sourceLines.length) {
      throw new APIError('The journal entry to reverse has no lines.', 400)
    }

    const reversalMemo =
      memo ||
      `Reversal of ${sourceEntry.entryNumber || `journal ${String(sourceEntry.id)}`}${
        sourceEntry.memo ? `: ${sourceEntry.memo}` : ''
      }`

    return this.createStructuredJournal({
      payload,
      userId,
      sourceType: 'reversal',
      entryDate: entryDate || postingDate || new Date().toISOString(),
      postingDate: postingDate || entryDate || new Date().toISOString(),
      memo: reversalMemo,
      referenceNumber: referenceNumber || sourceEntry.referenceNumber || undefined,
      sourceReference: sourceEntry.entryNumber || String(sourceEntry.id),
      reversalOf: sourceEntry.id,
      autoPost: true,
      lines: sourceLines.map((line) => ({
        account: this.normalizeRelationshipId(line.account, 'account') as number,
        description: line.description || undefined,
        debit: normalizeAmount(line.credit),
        credit: normalizeAmount(line.debit),
        taxCode: this.normalizeRelationshipId(line.taxCode, 'taxCode'),
        referenceEntityType: line.referenceEntityType || undefined,
        referenceEntityId: line.referenceEntityId || undefined,
        lineMeta: (line.lineMeta as Record<string, unknown> | null | undefined) || undefined,
      })),
    })
  }
}
