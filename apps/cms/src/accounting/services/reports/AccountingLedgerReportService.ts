import type { Payload, Where } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import type { AccountingLedgerRow } from '../../types/accounting'
import { getRelationshipId } from '../../utils/accounting-audit'
import { findAllDocs } from '../../utils/findAllDocs'
import { normalizeAmount, roundCurrency } from '../../utils/amounts'

type GeneralLedgerArgs = {
  accountId?: number | string | null
  fromDate?: string | null
  toDate?: string | null
  fiscalYearId?: number | string | null
  periodId?: number | string | null
}

export class AccountingLedgerReportService {
  static async getGeneralLedger(payload: Payload, args: GeneralLedgerArgs = {}) {
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

    const lineWhere: Where[] = [
      {
        journalEntry: {
          in: journals.map((journal) => journal.id),
        },
      },
    ]

    if (args.accountId) {
      lineWhere.push({
        account: {
          equals: args.accountId,
        },
      })
    }

    const lines = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines,
      depth: 2,
      where: {
        and: lineWhere,
      },
      sort: 'lineNumber',
      pageSize: 200,
    })

    const rows: AccountingLedgerRow[] = lines
      .map((line) => {
        const journal = typeof line.journalEntry === 'object' ? line.journalEntry : null
        const account = typeof line.account === 'object' ? line.account : null
        const debit = normalizeAmount(line.debit)
        const credit = normalizeAmount(line.credit)
        const normalBalance = account?.normalBalance || 'debit'

        return {
          journalEntryId: getRelationshipId(line.journalEntry) || line.id,
          journalEntryNumber: journal?.entryNumber || null,
          journalStatus: journal?.status || null,
          postingDate: journal?.postingDate || null,
          entryDate: journal?.entryDate || null,
          memo: journal?.memo || null,
          lineId: line.id,
          lineNumber: line.lineNumber || null,
          accountId: getRelationshipId(line.account) || line.id,
          accountCode: account?.code || null,
          accountName: account?.name || null,
          normalBalance,
          description: line.description || null,
          debit,
          credit,
          runningBalance: null,
        }
      })
      .sort((left, right) => {
        const leftDate = new Date(left.postingDate || 0).getTime()
        const rightDate = new Date(right.postingDate || 0).getTime()

        if (leftDate !== rightDate) {
          return leftDate - rightDate
        }

        return Number(left.lineNumber || 0) - Number(right.lineNumber || 0)
      })

    if (args.accountId) {
      let runningBalance = 0

      for (const row of rows) {
        runningBalance =
          row.normalBalance === 'credit'
            ? roundCurrency(runningBalance + row.credit - row.debit)
            : roundCurrency(runningBalance + row.debit - row.credit)

        row.runningBalance = runningBalance
      }
    }

    return rows
  }
}
