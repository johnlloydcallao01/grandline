import type { Payload, Where } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import type { AccountingTrialBalanceRow } from '../../types/accounting'
import { getRelationshipId } from '../../utils/accounting-audit'
import { findAllDocs } from '../../utils/findAllDocs'
import { normalizeAmount, roundCurrency } from '../../utils/amounts'

type TrialBalanceArgs = {
  fromDate?: string | null
  toDate?: string | null
  fiscalYearId?: number | string | null
  periodId?: number | string | null
  includeZeroBalances?: boolean
}

export class AccountingTrialBalanceService {
  static async getTrialBalance(payload: Payload, args: TrialBalanceArgs = {}) {
    const journalWhere: Where[] = [
      {
        status: {
          in: ['posted', 'reversed'],
        },
      },
    ]

    if (args.fromDate) {
      journalWhere.push({
        postingDate: {
          greater_than_equal: new Date(args.fromDate).toISOString(),
        },
      })
    }

    if (args.toDate) {
      journalWhere.push({
        postingDate: {
          less_than_equal: new Date(args.toDate).toISOString(),
        },
      })
    }

    if (args.fiscalYearId) {
      journalWhere.push({
        fiscalYear: {
          equals: args.fiscalYearId,
        },
      })
    }

    if (args.periodId) {
      journalWhere.push({
        period: {
          equals: args.periodId,
        },
      })
    }

    const journals = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
      depth: 0,
      where: {
        and: journalWhere,
      },
      sort: 'postingDate',
      pageSize: 200,
    })

    if (!journals.length) {
      return []
    }

    const lines = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines,
      depth: 2,
      where: {
        journalEntry: {
          in: journals.map((journal) => journal.id),
        },
      },
      pageSize: 500,
    })

    const accountMap = new Map<number | string, AccountingTrialBalanceRow>()

    for (const line of lines) {
      const account = typeof line.account === 'object' ? line.account : null
      const accountId = getRelationshipId(line.account)

      if (!account || !accountId) {
        continue
      }

      const current = accountMap.get(accountId) || {
        accountId,
        accountCode: account.code || null,
        accountName: account.name || null,
        accountType: account.accountType || null,
        normalBalance: account.normalBalance || 'debit',
        totalDebit: 0,
        totalCredit: 0,
        closingBalance: 0,
      }

      current.totalDebit = roundCurrency(current.totalDebit + normalizeAmount(line.debit))
      current.totalCredit = roundCurrency(current.totalCredit + normalizeAmount(line.credit))
      current.closingBalance =
        current.normalBalance === 'credit'
          ? roundCurrency(current.totalCredit - current.totalDebit)
          : roundCurrency(current.totalDebit - current.totalCredit)

      accountMap.set(accountId, current)
    }

    return Array.from(accountMap.values())
      .filter((row) => args.includeZeroBalances || row.totalDebit !== 0 || row.totalCredit !== 0)
      .sort((left, right) => String(left.accountCode || '').localeCompare(String(right.accountCode || '')))
  }
}
