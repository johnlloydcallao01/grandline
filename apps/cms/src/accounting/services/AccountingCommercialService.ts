import type { Payload } from 'payload'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_GLOBAL_SLUGS,
  DEFAULT_ACCOUNTING_SETTINGS,
} from '../constants/accounting'
import { getRelationshipId } from '../utils/accounting-audit'
import { normalizeAmount } from '../utils/amounts'
import { buildPrefixedDocumentNumber } from '../utils/commercial'

type NumberSettingKey =
  | 'customerNumberPrefix'
  | 'vendorNumberPrefix'
  | 'invoiceNumberPrefix'
  | 'billNumberPrefix'
  | 'paymentReceivedNumberPrefix'
  | 'paymentMadeNumberPrefix'
  | 'officialReceiptNumberPrefix'
  | 'creditNoteNumberPrefix'
  | 'vendorCreditNumberPrefix'
  | 'refundNumberPrefix'
  | 'depositNumberPrefix'
  | 'transferNumberPrefix'

type AccountSettingKey =
  | 'defaultReceivableAccount'
  | 'defaultPayableAccount'
  | 'defaultUndepositedFundsAccount'
  | 'defaultOutputTaxAccount'
  | 'defaultInputTaxAccount'

export class AccountingCommercialService {
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

  static async generateDocumentNumber(payload: Payload, settingKey: NumberSettingKey) {
    const settings = await this.getSettings(payload)
    const prefix = String(settings?.[settingKey] || DEFAULT_ACCOUNTING_SETTINGS[settingKey] || 'DOC')
    return buildPrefixedDocumentNumber(prefix)
  }

  static async getDefaultAccountId(payload: Payload, settingKey: AccountSettingKey) {
    const settings = await this.getSettings(payload)
    const accountId = getRelationshipId(settings?.[settingKey])

    if (!accountId) {
      throw new Error(`Accounting setting "${settingKey}" must be configured before posting this document.`)
    }

    return accountId
  }

  static resolveNumericRelationshipId(value: unknown, fieldName: string) {
    const relationshipId = getRelationshipId(value)

    if (relationshipId === null) {
      return undefined
    }

    const numericId = Number(relationshipId)

    if (!Number.isFinite(numericId)) {
      throw new Error(`${fieldName} must resolve to a numeric relationship id.`)
    }

    return numericId
  }

  static assertMutableStatus(status: unknown, label: string) {
    if (['posted', 'partially_paid', 'paid', 'voided'].includes(String(status || ''))) {
      throw new Error(`${label} cannot be edited directly after it has been posted or settled.`)
    }
  }

  static async resolveTaxCode(payload: Payload, taxCodeValue: unknown) {
    const taxCodeId = getRelationshipId(taxCodeValue)

    if (!taxCodeId) {
      return null
    }

    return payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
      id: taxCodeId,
      depth: 0,
      overrideAccess: true,
    })
  }

  static getAppliedAmountFromArray(
    rows: Array<{ amountApplied?: number | null } | null | undefined> | null | undefined
  ) {
    return normalizeAmount(
      (rows || []).reduce((total, row) => total + normalizeAmount(row?.amountApplied), 0)
    )
  }

  static async validateInvoiceApplications(
    payload: Payload,
    applications: Array<{ invoice?: unknown; amountApplied?: number | null } | null | undefined>,
    customer?: unknown,
  ) {
    const customerId = getRelationshipId(customer)
    const invoiceAllocations = new Map<string, number>()

    for (const application of applications || []) {
      const invoiceId = getRelationshipId(application?.invoice)
      const amountApplied = normalizeAmount(application?.amountApplied)

      if (!invoiceId) {
        throw new Error('Every payment application must reference an invoice.')
      }

      if (amountApplied <= 0) {
        throw new Error('Every payment application amount must be greater than zero.')
      }

      const invoice = await payload.findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
        id: invoiceId,
        depth: 0,
        overrideAccess: true,
      })

      if (!invoice) {
        throw new Error(`Invoice ${invoiceId} was not found.`)
      }

      if (!['posted', 'partially_paid'].includes(String(invoice.status || ''))) {
        throw new Error('Payments can only be allocated to posted or partially paid invoices.')
      }

      if (customerId && getRelationshipId(invoice.customer) !== customerId) {
        throw new Error('Payments received can only be applied to invoices for the selected customer.')
      }

      const nextAppliedAmount = normalizeAmount(invoiceAllocations.get(String(invoiceId))) + amountApplied

      if (nextAppliedAmount > normalizeAmount(invoice.balanceDue)) {
        throw new Error(`Allocation exceeds the remaining balance for invoice ${invoice.invoiceNumber || invoiceId}.`)
      }

      invoiceAllocations.set(String(invoiceId), nextAppliedAmount)
    }
  }

  static async validateBillApplications(
    payload: Payload,
    applications: Array<{ bill?: unknown; amountApplied?: number | null } | null | undefined>,
    vendor?: unknown,
  ) {
    const vendorId = getRelationshipId(vendor)
    const billAllocations = new Map<string, number>()

    for (const application of applications || []) {
      const billId = getRelationshipId(application?.bill)
      const amountApplied = normalizeAmount(application?.amountApplied)

      if (!billId) {
        throw new Error('Every payment application must reference a bill.')
      }

      if (amountApplied <= 0) {
        throw new Error('Every payment application amount must be greater than zero.')
      }

      const bill = await payload.findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.bills,
        id: billId,
        depth: 0,
        overrideAccess: true,
      })

      if (!bill) {
        throw new Error(`Bill ${billId} was not found.`)
      }

      if (!['posted', 'partially_paid'].includes(String(bill.status || ''))) {
        throw new Error('Payments can only be allocated to posted or partially paid bills.')
      }

      if (vendorId && getRelationshipId(bill.vendor) !== vendorId) {
        throw new Error('Payments made can only be applied to bills for the selected vendor.')
      }

      const nextAppliedAmount = normalizeAmount(billAllocations.get(String(billId))) + amountApplied

      if (nextAppliedAmount > normalizeAmount(bill.balanceDue)) {
        throw new Error(`Allocation exceeds the remaining balance for bill ${bill.billNumber || billId}.`)
      }

      billAllocations.set(String(billId), nextAppliedAmount)
    }
  }

  static async validateCreditNoteApplications(
    payload: Payload,
    applications: Array<{ invoice?: unknown; amountApplied?: number | null } | null | undefined>,
    customer?: unknown,
  ) {
    const customerId = getRelationshipId(customer)
    const invoiceAllocations = new Map<string, number>()

    for (const application of applications || []) {
      const invoiceId = getRelationshipId(application?.invoice)
      const amountApplied = normalizeAmount(application?.amountApplied)

      if (!invoiceId) {
        throw new Error('Every credit note application must reference an invoice.')
      }

      if (amountApplied <= 0) {
        throw new Error('Every credit note application amount must be greater than zero.')
      }

      const invoice = await payload.findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
        id: invoiceId,
        depth: 0,
        overrideAccess: true,
      })

      if (!invoice) {
        throw new Error(`Invoice ${invoiceId} was not found.`)
      }

      if (!['posted', 'partially_paid'].includes(String(invoice.status || ''))) {
        throw new Error('Credit notes can only be applied to posted or partially paid invoices.')
      }

      if (customerId && getRelationshipId(invoice.customer) !== customerId) {
        throw new Error('Credit notes can only be applied to invoices for the selected customer.')
      }

      const nextAppliedAmount = normalizeAmount(invoiceAllocations.get(String(invoiceId))) + amountApplied

      if (nextAppliedAmount > normalizeAmount(invoice.balanceDue)) {
        throw new Error(`Credit application exceeds the remaining balance for invoice ${invoice.invoiceNumber || invoiceId}.`)
      }

      invoiceAllocations.set(String(invoiceId), nextAppliedAmount)
    }
  }

  static async validateVendorCreditApplications(
    payload: Payload,
    applications: Array<{ bill?: unknown; amountApplied?: number | null } | null | undefined>,
    vendor?: unknown,
  ) {
    const vendorId = getRelationshipId(vendor)
    const billAllocations = new Map<string, number>()

    for (const application of applications || []) {
      const billId = getRelationshipId(application?.bill)
      const amountApplied = normalizeAmount(application?.amountApplied)

      if (!billId) {
        throw new Error('Every vendor credit application must reference a bill.')
      }

      if (amountApplied <= 0) {
        throw new Error('Every vendor credit application amount must be greater than zero.')
      }

      const bill = await payload.findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.bills,
        id: billId,
        depth: 0,
        overrideAccess: true,
      })

      if (!bill) {
        throw new Error(`Bill ${billId} was not found.`)
      }

      if (!['posted', 'partially_paid'].includes(String(bill.status || ''))) {
        throw new Error('Vendor credits can only be applied to posted or partially paid bills.')
      }

      if (vendorId && getRelationshipId(bill.vendor) !== vendorId) {
        throw new Error('Vendor credits can only be applied to bills for the selected vendor.')
      }

      const nextAppliedAmount = normalizeAmount(billAllocations.get(String(billId))) + amountApplied

      if (nextAppliedAmount > normalizeAmount(bill.balanceDue)) {
        throw new Error(`Vendor credit exceeds the remaining balance for bill ${bill.billNumber || billId}.`)
      }

      billAllocations.set(String(billId), nextAppliedAmount)
    }
  }
}
