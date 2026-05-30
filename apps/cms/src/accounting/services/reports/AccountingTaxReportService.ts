import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import type { AccountingTaxSummaryRow } from '../../types/accounting'
import { findAllDocs } from '../../utils/findAllDocs'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount } from '../../utils/amounts'

type TaxAccumulator = AccountingTaxSummaryRow

const buildKey = (taxCodeId: number | string | null | undefined, taxScope: string | null | undefined) =>
  `${String(taxCodeId || 'none')}::${String(taxScope || 'unknown')}`

const upsertAccumulator = (
  map: Map<string, TaxAccumulator>,
  nextRow: Omit<TaxAccumulator, 'sourceDocumentCount'>,
) => {
  const key = buildKey(nextRow.taxCodeId, nextRow.taxScope)
  const current = map.get(key)

  if (!current) {
    map.set(key, {
      ...nextRow,
      sourceDocumentCount: 1,
    })
    return
  }

  current.taxableAmount = normalizeAmount(current.taxableAmount + nextRow.taxableAmount)
  current.taxAmount = normalizeAmount(current.taxAmount + nextRow.taxAmount)
  current.sourceDocumentCount += 1
}

export class AccountingTaxReportService {
  static async getTaxSummary(payload: Payload) {
    const [invoiceLines, billLines, expenses] = await Promise.all([
      findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems,
        depth: 2,
      }),
      findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.billLineItems,
        depth: 2,
      }),
      findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
        depth: 1,
        where: {
          status: {
            equals: 'posted',
          },
        },
      }),
    ])

    const accumulator = new Map<string, TaxAccumulator>()

    for (const line of invoiceLines) {
      const invoice = typeof line.invoice === 'object' ? line.invoice : null
      const taxCode = typeof line.taxCode === 'object' ? line.taxCode : null

      if (!invoice || !taxCode || !['posted', 'partially_paid', 'paid'].includes(String(invoice.status || ''))) {
        continue
      }

      upsertAccumulator(
        accumulator,
        {
          taxCodeId: getRelationshipId(line.taxCode),
          taxCode: taxCode.code || null,
          taxName: taxCode.name || null,
          taxScope: taxCode.scope || null,
          calculationMethod: taxCode.calculationMethod || null,
          taxableAmount: normalizeAmount(line.lineSubtotal),
          taxAmount: normalizeAmount(line.lineTax),
        },
      )
    }

    for (const line of billLines) {
      const bill = typeof line.bill === 'object' ? line.bill : null
      const taxCode = typeof line.taxCode === 'object' ? line.taxCode : null

      if (!bill || !taxCode || !['posted', 'partially_paid', 'paid'].includes(String(bill.status || ''))) {
        continue
      }

      upsertAccumulator(
        accumulator,
        {
          taxCodeId: getRelationshipId(line.taxCode),
          taxCode: taxCode.code || null,
          taxName: taxCode.name || null,
          taxScope: taxCode.scope || null,
          calculationMethod: taxCode.calculationMethod || null,
          taxableAmount: normalizeAmount(line.lineSubtotal),
          taxAmount: normalizeAmount(line.lineTax),
        },
      )
    }

    for (const expense of expenses) {
      const taxCode = typeof expense.taxCode === 'object' ? expense.taxCode : null

      if (!taxCode || normalizeAmount(expense.taxTotal) <= 0) {
        continue
      }

      upsertAccumulator(
        accumulator,
        {
          taxCodeId: getRelationshipId(expense.taxCode),
          taxCode: taxCode.code || null,
          taxName: taxCode.name || null,
          taxScope: taxCode.scope || null,
          calculationMethod: taxCode.calculationMethod || null,
          taxableAmount: normalizeAmount(expense.subtotal),
          taxAmount: normalizeAmount(expense.taxTotal),
        },
      )
    }

    return Array.from(accumulator.values()).sort((left, right) =>
      String(left.taxCode || '').localeCompare(String(right.taxCode || '')),
    )
  }
}
