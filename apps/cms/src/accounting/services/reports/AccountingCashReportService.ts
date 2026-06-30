import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import type { AccountingCashActivityRow } from '../../types/accounting'
import { findAllDocs } from '../../utils/findAllDocs'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount } from '../../utils/amounts'

export class AccountingCashReportService {
  static async getCashActivity(payload: Payload) {
    const [paymentsReceived, paymentsMade, deposits, transfers, expenses] = await Promise.all([
      findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
        depth: 1,
        where: { status: { equals: 'posted' } },
      }),
      findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade,
        depth: 1,
        where: { status: { equals: 'posted' } },
      }),
      findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.deposits,
        depth: 1,
        where: { status: { equals: 'posted' } },
      }),
      findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.transfers,
        depth: 1,
        where: { status: { equals: 'posted' } },
      }),
      findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
        depth: 1,
        where: { status: { equals: 'posted' } },
      }),
    ])

    const rows: AccountingCashActivityRow[] = [
      ...paymentsReceived.map((payment) => ({
        entityType: 'payment_received' as const,
        entityId: payment.id,
        documentNumber: payment.receiptNumber || null,
        activityDate: payment.paymentDate || payment.postingDate || null,
        bankAccountId: getRelationshipId(payment.depositAccount),
        bankAccountName:
          typeof payment.depositAccount === 'object' && payment.depositAccount ? payment.depositAccount.accountName || null : null,
        direction: 'inflow' as const,
        amount: normalizeAmount(payment.amountReceived),
        status: payment.status || null,
        memo: payment.notes || null,
      })),
      ...paymentsMade.map((payment) => ({
        entityType: 'payment_made' as const,
        entityId: payment.id,
        documentNumber: payment.paymentNumber || null,
        activityDate: payment.paymentDate || payment.postingDate || null,
        bankAccountId: getRelationshipId(payment.bankAccount),
        bankAccountName: typeof payment.bankAccount === 'object' && payment.bankAccount ? payment.bankAccount.accountName || null : null,
        direction: 'outflow' as const,
        amount: normalizeAmount(payment.amountPaid),
        status: payment.status || null,
        memo: payment.notes || null,
      })),
      ...expenses.map((expense) => ({
        entityType: 'expense' as const,
        entityId: expense.id,
        documentNumber: expense.expenseNumber || null,
        activityDate: expense.expenseDate || expense.postingDate || null,
        bankAccountId: getRelationshipId(expense.bankAccount),
        bankAccountName: typeof expense.bankAccount === 'object' && expense.bankAccount ? expense.bankAccount.accountName || null : null,
        direction: 'outflow' as const,
        amount: normalizeAmount(expense.total),
        status: expense.status || null,
        memo: expense.notes || null,
      })),
      ...deposits.map((deposit) => ({
        entityType: 'deposit' as const,
        entityId: deposit.id,
        documentNumber: deposit.depositNumber || null,
        activityDate: deposit.depositDate || null,
        bankAccountId: getRelationshipId(deposit.bankAccount),
        bankAccountName: typeof deposit.bankAccount === 'object' && deposit.bankAccount ? deposit.bankAccount.accountName || null : null,
        direction: 'inflow' as const,
        amount: normalizeAmount(deposit.amount),
        status: deposit.status || null,
        memo: deposit.notes || null,
      })),
      ...transfers.map((transfer) => ({
        entityType: 'transfer' as const,
        entityId: transfer.id,
        documentNumber: transfer.transferNumber || null,
        activityDate: transfer.transferDate || null,
        bankAccountId: getRelationshipId(transfer.toBankAccount),
        bankAccountName:
          typeof transfer.toBankAccount === 'object' && transfer.toBankAccount ? transfer.toBankAccount.accountName || null : null,
        direction: 'transfer' as const,
        amount: normalizeAmount(transfer.amount),
        status: transfer.status || null,
        memo: transfer.notes || null,
      })),
    ]

    return rows.sort(
      (left, right) => new Date(right.activityDate || 0).getTime() - new Date(left.activityDate || 0).getTime(),
    )
  }
}
