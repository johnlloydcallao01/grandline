import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import type { AccountingRegisterRow } from '../../types/accounting'
import { findAllDocs } from '../../utils/findAllDocs'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount } from '../../utils/amounts'

export class AccountingSalesReportService {
  static async getInvoiceRegister(payload: Payload) {
    const invoices = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
      depth: 1,
      where: {
        status: {
          in: ['posted', 'partially_paid', 'paid'],
        },
      },
      sort: '-invoiceDate',
    })

    return invoices.map<AccountingRegisterRow>((invoice) => {
      const customer = typeof invoice.customer === 'object' ? invoice.customer : null

      return {
        documentId: invoice.id,
        documentNumber: invoice.invoiceNumber || null,
        postingDate: invoice.postingDate || null,
        documentDate: invoice.invoiceDate || null,
        dueDate: invoice.dueDate || null,
        partyId: getRelationshipId(invoice.customer),
        partyCode: customer?.customerCode || null,
        partyName: customer?.displayName || null,
        status: invoice.status || null,
        currency: invoice.currency || null,
        total: normalizeAmount(invoice.total),
        balanceDue: normalizeAmount(invoice.balanceDue),
        postedJournalEntryId: getRelationshipId(invoice.postedJournalEntry),
      }
    })
  }

  static async getPaymentsReceivedRegister(payload: Payload) {
    const receipts = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
      depth: 1,
      where: {
        status: {
          equals: 'posted',
        },
      },
      sort: '-paymentDate',
    })

    return receipts.map<AccountingRegisterRow>((receipt) => {
      const customer = typeof receipt.customer === 'object' ? receipt.customer : null

      return {
        documentId: receipt.id,
        documentNumber: receipt.receiptNumber || null,
        postingDate: receipt.postingDate || null,
        documentDate: receipt.paymentDate || null,
        partyId: getRelationshipId(receipt.customer),
        partyCode: customer?.customerCode || null,
        partyName: customer?.displayName || null,
        status: receipt.status || null,
        currency: receipt.currency || null,
        total: normalizeAmount(receipt.amountReceived),
        postedJournalEntryId: getRelationshipId(receipt.postedJournalEntry),
      }
    })
  }
}
