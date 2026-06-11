import type { Payload } from 'payload'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_GLOBAL_SLUGS,
  ACCOUNTING_HOOK_CONTEXT,
  DEFAULT_ACCOUNTING_SETTINGS,
} from '../../constants/accounting'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount, roundCurrency, sumAmounts } from '../../utils/amounts'

type JournalLineLike = {
  id?: number | string
  account?: number | string | { id?: number | string | null } | null
  debit?: number | null
  credit?: number | null
}

type JournalAccountValidationOptions = {
  sourceType?: string | null
}

export class AccountingJournalService {
  static async getSettings(payload: Payload) {
    try {
      return await payload.findGlobal({
        slug: ACCOUNTING_GLOBAL_SLUGS.settings,
        overrideAccess: true,
      })
    } catch (_error) {
      return DEFAULT_ACCOUNTING_SETTINGS
    }
  }

  static async generateEntryNumber(payload: Payload): Promise<string> {
    const settings = await this.getSettings(payload)
    const prefix = String(settings?.journalNumberPrefix || DEFAULT_ACCOUNTING_SETTINGS.journalNumberPrefix)
      .trim()
      .toUpperCase()

    const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14)
    const randomSuffix = Math.floor(Math.random() * 9000 + 1000)

    return `${prefix}-${stamp}-${randomSuffix}`
  }

  static async getJournalLines(payload: Payload, journalEntryId: number | string) {
    const lines = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines,
      depth: 2,
      limit: 500,
      overrideAccess: true,
      sort: 'lineNumber',
      where: {
        journalEntry: {
          equals: journalEntryId,
        },
      },
    })

    return lines.docs
  }

  static async getNextLineNumber(payload: Payload, journalEntryId: number | string) {
    const result = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines,
      depth: 0,
      limit: 1,
      overrideAccess: true,
      sort: '-lineNumber',
      where: {
        journalEntry: {
          equals: journalEntryId,
        },
      },
    })

    const highestLine = Number(result.docs[0]?.lineNumber || 0)
    return highestLine + 1
  }

  static calculateTotals(lines: JournalLineLike[]) {
    const totalDebit = sumAmounts(lines.map((line) => line.debit))
    const totalCredit = sumAmounts(lines.map((line) => line.credit))
    const isBalanced = totalDebit > 0 && roundCurrency(totalDebit - totalCredit) === 0

    return {
      totalDebit,
      totalCredit,
      isBalanced,
    }
  }

  static validateLine(line: JournalLineLike) {
    const debit = normalizeAmount(line.debit)
    const credit = normalizeAmount(line.credit)
    const accountId = getRelationshipId(line.account)

    if (!accountId) {
      throw new Error('Each journal entry line must reference an account.')
    }

    if ((debit > 0 && credit > 0) || (debit <= 0 && credit <= 0)) {
      throw new Error('Each journal line must have exactly one positive debit or credit amount.')
    }
  }

  static async validateAccountForSourceType(
    payload: Payload,
    accountValue: JournalLineLike['account'],
    options: JournalAccountValidationOptions = {}
  ) {
    const accountId = getRelationshipId(accountValue)

    if (!accountId) {
      throw new Error('Each journal entry line must reference an account.')
    }

    let account: Record<string, unknown> | null = null
    try {
      const found = await payload.findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
        id: accountId,
        depth: 0,
        overrideAccess: true,
      })
      account = found ? (found as unknown as Record<string, unknown>) : null
    } catch {
      throw new Error(`Account with ID ${accountId} not found.`)
    }

    if (!account) {
      throw new Error('The referenced account does not exist.')
    }

    if (!account.isActive) {
      throw new Error('Inactive accounts cannot be used on journal lines.')
    }

    const sourceType = String(options.sourceType || 'manual')
    const isManualLikeSource =
      sourceType === 'manual' || sourceType === 'opening_balance' || sourceType === 'adjustment'

    if (isManualLikeSource && account.allowManualEntries === false) {
      throw new Error('This account is not allowed for manual accounting entries.')
    }

    if (isManualLikeSource && account.isControlAccount) {
      throw new Error('Control accounts cannot be posted to directly through manual accounting entries.')
    }

    return account
  }

  static validateLines(lines: JournalLineLike[]) {
    if (!lines.length) {
      throw new Error('A journal entry must contain at least one line before it can be posted.')
    }

    lines.forEach((line) => this.validateLine(line))

    const { isBalanced } = this.calculateTotals(lines)

    if (!isBalanced) {
      throw new Error('Journal entry totals must be balanced before posting.')
    }
  }

  static async validateLinesForEntry(
    payload: Payload,
    lines: JournalLineLike[],
    options: JournalAccountValidationOptions = {}
  ) {
    this.validateLines(lines)

    for (const line of lines) {
      await this.validateAccountForSourceType(payload, line.account, options)
    }
  }

  static async assertEntryIsMutable(payload: Payload, journalEntryId: number | string) {
    let entry: Record<string, unknown> | null = null
    try {
      const found = await payload.findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
        id: journalEntryId,
        depth: 0,
        overrideAccess: true,
      })
      entry = found ? (found as unknown as Record<string, unknown>) : null
    } catch {
      throw new Error(`Journal entry with ID ${journalEntryId} not found.`)
    }

    if (!entry) {
      throw new Error(`Journal entry with ID ${journalEntryId} not found.`)
    }

    if (['posted', 'reversed', 'voided'].includes(String(entry.status || ''))) {
      throw new Error('Posted, reversed, or voided journal entries cannot be edited directly.')
    }

    return entry
  }

  static async synchronizeJournalTotals(payload: Payload, journalEntryId: number | string) {
    const lines = await this.getJournalLines(payload, journalEntryId)
    const { totalDebit, totalCredit, isBalanced } = this.calculateTotals(lines)

    await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
      id: journalEntryId,
      overrideAccess: true,
      context: {
        [ACCOUNTING_HOOK_CONTEXT.skipJournalTotalsSync]: true,
        [ACCOUNTING_HOOK_CONTEXT.skipPostedImmutability]: true,
      },
      data: {
        totalDebit,
        totalCredit,
        isBalanced,
      },
    })

    return {
      totalDebit,
      totalCredit,
      isBalanced,
    }
  }

  static async validateReversalEntry(
    payload: Payload,
    reversalOfId: number | string,
    reversalLines: JournalLineLike[]
  ) {
    const sourceEntry = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
      id: reversalOfId,
      depth: 0,
      overrideAccess: true,
    })

    if (!sourceEntry) {
      throw new Error('The journal entry being reversed could not be found.')
    }

    if (!['posted', 'reversed'].includes(String(sourceEntry.status || ''))) {
      throw new Error('Only posted journal entries can be reversed.')
    }

    if (sourceEntry.reversalEntry) {
      throw new Error('This journal entry already has a recorded reversal.')
    }

    const sourceLines = await this.getJournalLines(payload, reversalOfId)

    if (sourceLines.length !== reversalLines.length) {
      throw new Error('Reversal entries must contain the same number of lines as the source journal.')
    }

    const sourceSignatures = sourceLines
      .map((line) => {
        this.validateLine(line)

        return [
          String(getRelationshipId(line.account)),
          normalizeAmount(line.credit).toFixed(2),
          normalizeAmount(line.debit).toFixed(2),
        ].join('|')
      })
      .sort()

    const reversalSignatures = reversalLines
      .map((line) => {
        this.validateLine(line)

        return [
          String(getRelationshipId(line.account)),
          normalizeAmount(line.debit).toFixed(2),
          normalizeAmount(line.credit).toFixed(2),
        ].join('|')
      })
      .sort()

    if (JSON.stringify(sourceSignatures) !== JSON.stringify(reversalSignatures)) {
      throw new Error(
        'Reversal journal lines must exactly mirror the original entry with debit and credit amounts swapped.'
      )
    }
  }
}
