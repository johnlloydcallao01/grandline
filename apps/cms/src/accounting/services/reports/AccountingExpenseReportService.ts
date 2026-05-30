import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import type { AccountingRegisterRow } from '../../types/accounting'
import { findAllDocs } from '../../utils/findAllDocs'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount } from '../../utils/amounts'

export class AccountingExpenseReportService {
  static async getBillRegister(payload: Payload) {
    const bills = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.bills,
      depth: 1,
      where: {
        status: {
          in: ['posted', 'partially_paid', 'paid'],
        },
      },
      sort: '-billDate',
    })

    return bills.map<AccountingRegisterRow>((bill) => {
      const vendor = typeof bill.vendor === 'object' ? bill.vendor : null

      return {
        documentId: bill.id,
        documentNumber: bill.billNumber || null,
        postingDate: bill.postingDate || null,
        documentDate: bill.billDate || null,
        dueDate: bill.dueDate || null,
        partyId: getRelationshipId(bill.vendor),
        partyCode: vendor?.vendorCode || null,
        partyName: vendor?.displayName || null,
        status: bill.status || null,
        currency: bill.currency || null,
        total: normalizeAmount(bill.total),
        balanceDue: normalizeAmount(bill.balanceDue),
        postedJournalEntryId: getRelationshipId(bill.postedJournalEntry),
      }
    })
  }

  static async getPaymentsMadeRegister(payload: Payload) {
    const disbursements = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade,
      depth: 1,
      where: {
        status: {
          equals: 'posted',
        },
      },
      sort: '-paymentDate',
    })

    return disbursements.map<AccountingRegisterRow>((payment) => {
      const vendor = typeof payment.vendor === 'object' ? payment.vendor : null

      return {
        documentId: payment.id,
        documentNumber: payment.paymentNumber || null,
        postingDate: payment.postingDate || null,
        documentDate: payment.paymentDate || null,
        partyId: getRelationshipId(payment.vendor),
        partyCode: vendor?.vendorCode || null,
        partyName: vendor?.displayName || null,
        status: payment.status || null,
        currency: payment.currency || null,
        total: normalizeAmount(payment.amountPaid),
        postedJournalEntryId: getRelationshipId(payment.postedJournalEntry),
      }
    })
  }

  static async getExpenseRegister(payload: Payload) {
    const expenses = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
      depth: 1,
      where: {
        status: {
          equals: 'posted',
        },
      },
      sort: '-expenseDate',
    })

    return expenses.map<AccountingRegisterRow>((expense) => {
      const vendor = typeof expense.vendor === 'object' ? expense.vendor : null

      return {
        documentId: expense.id,
        documentNumber: expense.expenseNumber || null,
        postingDate: expense.postingDate || null,
        documentDate: expense.expenseDate || null,
        partyId: getRelationshipId(expense.vendor),
        partyCode: vendor?.vendorCode || null,
        partyName: vendor?.displayName || null,
        status: expense.status || null,
        currency: expense.currency || null,
        total: normalizeAmount(expense.total),
        postedJournalEntryId: getRelationshipId(expense.postedJournalEntry),
      }
    })
  }
}
