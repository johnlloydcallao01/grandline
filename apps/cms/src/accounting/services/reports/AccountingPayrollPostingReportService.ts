import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { findAllDocs } from '../../utils/findAllDocs'
import { normalizeAmount, roundCurrency } from '../../utils/amounts'

export class AccountingPayrollPostingReportService {
  static async getPayrollPostingReport(payload: Payload, payrollRunId?: number | string) {
    const runs = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollRuns,
      depth: 1,
      where: payrollRunId
        ? {
            id: {
              equals: payrollRunId,
            },
          }
        : undefined,
    })

    return Promise.all(
      runs.map(async (run) => {
        const entries = await findAllDocs<any>({
          payload,
          collection: ACCOUNTING_COLLECTION_SLUGS.payrollEntries,
          depth: 1,
          where: {
            payrollRun: {
              equals: run.id,
            },
          },
        })

        const grossAmount = roundCurrency(
          entries.reduce((sum, entry) => sum + normalizeAmount(entry.grossAmount), 0),
        )
        const deductionAmount = roundCurrency(
          entries.reduce((sum, entry) => sum + normalizeAmount(entry.deductionAmount), 0),
        )
        const netAmount = roundCurrency(
          entries.reduce((sum, entry) => sum + normalizeAmount(entry.netAmount), 0),
        )

        return {
          payrollRunId: run.id,
          payrollCode: run.payrollCode,
          status: run.status,
          paymentDate: run.paymentDate,
          postedJournalEntryId: run.postedJournalEntry?.id || run.postedJournalEntry || null,
          grossAmount,
          deductionAmount,
          netAmount,
          entryCount: entries.length,
        }
      }),
    )
  }
}
