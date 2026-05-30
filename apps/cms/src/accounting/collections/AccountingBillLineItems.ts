import { APIError, type CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_HOOK_CONTEXT,
} from '../constants/accounting'
import { AccountingCommercialService } from '../services/AccountingCommercialService'
import { AccountingBillService } from '../services/bills/AccountingBillService'
import { applyCreatedAndUpdatedBy, getRelationshipId } from '../utils/accounting-audit'

export const AccountingBillLineItems: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.billLineItems,
  admin: {
    useAsTitle: 'description',
    defaultColumns: ['bill', 'lineNumber', 'description', 'quantity', 'lineTotal'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Normalized bill lines with expense or asset and tax mapping.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'bill', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.bills, required: true, index: true },
    { name: 'lineNumber', type: 'number', required: true, min: 1 },
    { name: 'description', type: 'text', required: true },
    { name: 'quantity', type: 'number', required: true, min: 0.000001, defaultValue: 1 },
    { name: 'unitPrice', type: 'number', required: true, min: 0, defaultValue: 0 },
    { name: 'taxCode', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.taxCodes },
    { name: 'lineSubtotal', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'lineTax', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'lineTotal', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'expenseAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts },
    { name: 'assetAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts },
    { name: 'payableAccountOverride', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts },
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
        const billId = getRelationshipId(data.bill ?? originalDoc?.bill)
        if (!billId) {
          throw new APIError('Bill line items must belong to a bill.', 400)
        }
        const bill = await req.payload.findByID({
          collection: ACCOUNTING_COLLECTION_SLUGS.bills,
          id: billId,
          depth: 0,
          overrideAccess: true,
        })
        AccountingCommercialService.assertMutableStatus(bill?.status, 'Bill')
        if (operation === 'create' && !data.lineNumber) {
          const lines = await req.payload.find({
            collection: ACCOUNTING_COLLECTION_SLUGS.billLineItems,
            where: { bill: { equals: billId } },
            sort: '-lineNumber',
            limit: 1,
            depth: 0,
            overrideAccess: true,
          })
          data.lineNumber = Number(lines.docs[0]?.lineNumber || 0) + 1
        }
        const totals = await AccountingBillService.calculateLine(req.payload, data)
        data.lineSubtotal = totals.lineSubtotal
        data.lineTax = totals.lineTax
        data.lineTotal = totals.lineTotal
        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
    afterChange: [
      async ({ doc, req, context }) => {
        if (!context?.[ACCOUNTING_HOOK_CONTEXT.skipBillTotalsSync]) {
          const billId = getRelationshipId(doc.bill)
          if (billId) {
            await AccountingBillService.syncTotals(req.payload, billId)
          }
        }
        return doc
      },
    ],
    afterDelete: [
      async ({ doc, req, context }) => {
        if (!context?.[ACCOUNTING_HOOK_CONTEXT.skipBillTotalsSync]) {
          const billId = getRelationshipId(doc?.bill)
          if (billId) {
            await AccountingBillService.syncTotals(req.payload, billId)
          }
        }
        return doc
      },
    ],
  },
}
