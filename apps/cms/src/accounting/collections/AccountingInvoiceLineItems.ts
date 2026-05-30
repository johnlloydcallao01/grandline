import { APIError, type CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_HOOK_CONTEXT,
  INVOICE_ITEM_TYPE_OPTIONS,
} from '../constants/accounting'
import { AccountingCommercialService } from '../services/AccountingCommercialService'
import { AccountingInvoiceService } from '../services/invoices/AccountingInvoiceService'
import { applyCreatedAndUpdatedBy, getRelationshipId } from '../utils/accounting-audit'

export const AccountingInvoiceLineItems: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems,
  admin: {
    useAsTitle: 'description',
    defaultColumns: ['invoice', 'lineNumber', 'description', 'quantity', 'lineTotal'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Normalized invoice lines with revenue and tax mapping.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'invoice', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.invoices, required: true, index: true },
    { name: 'lineNumber', type: 'number', required: true, min: 1 },
    { name: 'description', type: 'text', required: true },
    { name: 'itemType', type: 'select', required: true, defaultValue: 'service', options: [...INVOICE_ITEM_TYPE_OPTIONS] },
    { name: 'quantity', type: 'number', required: true, min: 0.000001, defaultValue: 1 },
    { name: 'unitPrice', type: 'number', required: true, min: 0, defaultValue: 0 },
    { name: 'discountAmount', type: 'number', min: 0, defaultValue: 0 },
    { name: 'taxCode', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.taxCodes },
    { name: 'lineSubtotal', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'lineTax', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'lineTotal', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'incomeAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, required: true },
    { name: 'receivableAccountOverride', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts },
    { name: 'referenceEntityType', type: 'text' },
    { name: 'referenceEntityId', type: 'text' },
    { name: 'metadata', type: 'json' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc, operation }) => {
        if (!data) return data
        const invoiceId = getRelationshipId(data.invoice ?? originalDoc?.invoice)
        if (!invoiceId) {
          throw new APIError('Invoice line items must belong to an invoice.', 400)
        }
        const invoice = await req.payload.findByID({
          collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
          id: invoiceId,
          depth: 0,
          overrideAccess: true,
        })
        AccountingCommercialService.assertMutableStatus(invoice?.status, 'Invoice')
        if (operation === 'create' && !data.lineNumber) {
          const lines = await req.payload.find({
            collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems,
            where: { invoice: { equals: invoiceId } },
            sort: '-lineNumber',
            limit: 1,
            depth: 0,
            overrideAccess: true,
          })
          data.lineNumber = Number(lines.docs[0]?.lineNumber || 0) + 1
        }
        const totals = await AccountingInvoiceService.calculateLine(req.payload, data)
        data.lineSubtotal = totals.lineSubtotal
        data.lineTax = totals.lineTax
        data.lineTotal = totals.lineTotal
        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
    afterChange: [
      async ({ doc, req, context }) => {
        if (!context?.[ACCOUNTING_HOOK_CONTEXT.skipInvoiceTotalsSync]) {
          const invoiceId = getRelationshipId(doc.invoice)
          if (invoiceId) {
            await AccountingInvoiceService.syncTotals(req.payload, invoiceId)
          }
        }
        return doc
      },
    ],
    afterDelete: [
      async ({ doc, req, context }) => {
        if (!context?.[ACCOUNTING_HOOK_CONTEXT.skipInvoiceTotalsSync]) {
          const invoiceId = getRelationshipId(doc?.invoice)
          if (invoiceId) {
            await AccountingInvoiceService.syncTotals(req.payload, invoiceId)
          }
        }
        return doc
      },
    ],
  },
}
