import type { Payload } from 'payload'
import {
  ACCOUNTING_COLLECTION_SLUGS,
} from '../../constants/accounting'
import type { AccountingAgingBucketRow } from '../../types/accounting'
import { findAllDocs } from '../../utils/findAllDocs'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount } from '../../utils/amounts'

const buildAgingBuckets = (balanceDue: number, dueDate?: string | null) => {
  const today = new Date()
  const due = dueDate ? new Date(dueDate) : today
  const daysOverdue = Math.max(
    0,
    Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)),
  )

  return {
    currentAmount: daysOverdue === 0 ? balanceDue : 0,
    bucket1to30: daysOverdue >= 1 && daysOverdue <= 30 ? balanceDue : 0,
    bucket31to60: daysOverdue >= 31 && daysOverdue <= 60 ? balanceDue : 0,
    bucket61to90: daysOverdue >= 61 && daysOverdue <= 90 ? balanceDue : 0,
    bucketOver90: daysOverdue > 90 ? balanceDue : 0,
    daysOverdue,
  }
}

export class AccountingAgingReportService {
  static async getAccountsReceivableAging(payload: Payload) {
    const invoices = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
      depth: 1,
      where: {
        status: {
          in: ['posted', 'partially_paid'],
        },
      },
      sort: 'dueDate',
    })

    return invoices
      .filter((invoice) => normalizeAmount(invoice.balanceDue) > 0)
      .map<AccountingAgingBucketRow>((invoice) => {
        const balanceDue = normalizeAmount(invoice.balanceDue)
        const buckets = buildAgingBuckets(balanceDue, invoice.dueDate)
        const customer = typeof invoice.customer === 'object' ? invoice.customer : null

        return {
          entityId: getRelationshipId(invoice.customer) || invoice.id,
          entityCode: customer?.customerCode || null,
          entityName: customer?.displayName || null,
          documentId: invoice.id,
          documentNumber: invoice.invoiceNumber || null,
          documentDate: invoice.invoiceDate || null,
          dueDate: invoice.dueDate || null,
          currency: invoice.currency || null,
          total: normalizeAmount(invoice.total),
          balanceDue,
          ...buckets,
        }
      })
  }

  static async getAccountsPayableAging(payload: Payload) {
    const bills = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.bills,
      depth: 1,
      where: {
        status: {
          in: ['posted', 'partially_paid'],
        },
      },
      sort: 'dueDate',
    })

    return bills
      .filter((bill) => normalizeAmount(bill.balanceDue) > 0)
      .map<AccountingAgingBucketRow>((bill) => {
        const balanceDue = normalizeAmount(bill.balanceDue)
        const buckets = buildAgingBuckets(balanceDue, bill.dueDate)
        const vendor = typeof bill.vendor === 'object' ? bill.vendor : null

        return {
          entityId: getRelationshipId(bill.vendor) || bill.id,
          entityCode: vendor?.vendorCode || null,
          entityName: vendor?.displayName || null,
          documentId: bill.id,
          documentNumber: bill.billNumber || null,
          documentDate: bill.billDate || null,
          dueDate: bill.dueDate || null,
          currency: bill.currency || null,
          total: normalizeAmount(bill.total),
          balanceDue,
          ...buckets,
        }
      })
  }
}
