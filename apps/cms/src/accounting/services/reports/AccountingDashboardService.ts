import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import type {
  AccountingDashboardData,
  AccountingDashboardPaymentRow,
  AccountingRegisterRow,
} from '../../types/accounting'
import { findAllDocs } from '../../utils/findAllDocs'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount } from '../../utils/amounts'
import { AccountingAgingReportService } from './AccountingAgingReportService'
import { AccountingBankingService } from '../banking/AccountingBankingService'
import { AccountingExpenseReportService } from './AccountingExpenseReportService'
import { AccountingSalesReportService } from './AccountingSalesReportService'

const sortByNewestDate = <
  T extends {
    documentDate?: string | null
    postingDate?: string | null
  },
>(
  rows: T[],
) =>
  [...rows].sort((left, right) => {
    const leftTime = new Date(left.documentDate || left.postingDate || 0).getTime()
    const rightTime = new Date(right.documentDate || right.postingDate || 0).getTime()
    return rightTime - leftTime
  })

export class AccountingDashboardService {
  static async getDashboard(payload: Payload): Promise<AccountingDashboardData> {
    const [receivables, payables, recentInvoices, recentBills, receipts, disbursements, bankAccounts] =
      await Promise.all([
        AccountingAgingReportService.getAccountsReceivableAging(payload),
        AccountingAgingReportService.getAccountsPayableAging(payload),
        AccountingSalesReportService.getInvoiceRegister(payload),
        AccountingExpenseReportService.getBillRegister(payload),
        AccountingSalesReportService.getPaymentsReceivedRegister(payload),
        AccountingExpenseReportService.getPaymentsMadeRegister(payload),
        findAllDocs<any>({
          payload,
          collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
          depth: 0,
          where: {
            isActive: {
              equals: true,
            },
          },
          sort: 'accountName',
        }),
      ])

    const totalReceivables = normalizeAmount(
      receivables.reduce((total, row) => total + normalizeAmount(row.balanceDue), 0),
    )
    const totalPayables = normalizeAmount(
      payables.reduce((total, row) => total + normalizeAmount(row.balanceDue), 0),
    )
    const overdueInvoiceCount = receivables.filter((row) => row.daysOverdue > 0).length
    const overdueBillCount = payables.filter((row) => row.daysOverdue > 0).length

    const cashBalances = await Promise.all(
      bankAccounts.map(async (bankAccount) => ({
        bankAccountId: bankAccount.id,
        amount: normalizeAmount(
          await AccountingBankingService.calculateBookClosingBalance(payload, bankAccount.id),
        ),
      })),
    )

    const totalCashAndBank = normalizeAmount(
      cashBalances.reduce((total, row) => total + normalizeAmount(row.amount), 0),
    )

    const recentPayments = sortByNewestDate<AccountingDashboardPaymentRow>([
      ...receipts.map((row) => this.mapDashboardPaymentRow('payment_received', row)),
      ...disbursements.map((row) => this.mapDashboardPaymentRow('payment_made', row)),
    ]).slice(0, 10)

    return {
      summary: {
        totalReceivables,
        totalPayables,
        overdueInvoiceCount,
        overdueBillCount,
        totalCashAndBank,
      },
      recentInvoices: sortByNewestDate<AccountingRegisterRow>(recentInvoices).slice(0, 10),
      recentBills: sortByNewestDate<AccountingRegisterRow>(recentBills).slice(0, 10),
      recentPayments,
    }
  }

  private static mapDashboardPaymentRow(
    entityType: 'payment_received' | 'payment_made',
    row: AccountingRegisterRow,
  ): AccountingDashboardPaymentRow {
    return {
      entityType,
      documentId: row.documentId,
      documentNumber: row.documentNumber || null,
      documentDate: row.documentDate || row.postingDate || null,
      partyId: getRelationshipId(row.partyId),
      partyCode: row.partyCode || null,
      partyName: row.partyName || null,
      currency: row.currency || null,
      total: normalizeAmount(row.total),
    }
  }
}
