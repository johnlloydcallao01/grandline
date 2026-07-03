import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const ENTITY_COLLECTION_MAP: Record<string, { collection: string; idField: string; labelField: string }> = {
  invoice: { collection: ACCOUNTING_COLLECTION_SLUGS.invoices, idField: 'invoiceNumber', labelField: 'invoiceNumber' },
  bill: { collection: ACCOUNTING_COLLECTION_SLUGS.bills, idField: 'billNumber', labelField: 'billNumber' },
  expense: { collection: ACCOUNTING_COLLECTION_SLUGS.expenses, idField: 'expenseNumber', labelField: 'expenseNumber' },
  journal: { collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries, idField: 'entryNumber', labelField: 'entryNumber' },
  budget: { collection: ACCOUNTING_COLLECTION_SLUGS.budgets, idField: 'budgetCode', labelField: 'budgetCode' },
  asset_disposal: { collection: ACCOUNTING_COLLECTION_SLUGS.assetDisposals, idField: 'id', labelField: 'id' },
  timesheet: { collection: ACCOUNTING_COLLECTION_SLUGS.timesheets, idField: 'id', labelField: 'id' },
  payroll_run: { collection: ACCOUNTING_COLLECTION_SLUGS.payrollRuns, idField: 'id', labelField: 'id' },
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const entityType = String(searchParams.get('entityType') || '').trim()
    const search = String(searchParams.get('search') || '').trim().toLowerCase()

    if (!entityType || !ENTITY_COLLECTION_MAP[entityType]) {
      return NextResponse.json({ rows: [] })
    }

    const config = ENTITY_COLLECTION_MAP[entityType]

    const docs = await findAllDocs<any>({ payload, collection: config.collection, depth: 0, sort: `-${config.idField}` })

    let matched = docs.map((doc) => ({
      entityId: String(doc[config.idField] || doc.id || ''),
      label: String(doc[config.labelField] || doc.id || ''),
    })).filter((e) => e.entityId && e.label)

    if (search) {
      matched = matched.filter((e) => e.entityId.toLowerCase().includes(search) || e.label.toLowerCase().includes(search))
    } else {
      matched = matched.slice(0, 50)
    }

    return NextResponse.json({ rows: matched.slice(0, 100) })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
