import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { AccountingApiError, handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseListParam = (sp: URLSearchParams, key: string): string[] =>
  Array.from(new Set(sp.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

const normalizeText = (v?: string | null) => String(v || '').trim().toLowerCase()

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const sp = new URL(request.url).searchParams
    const search = normalizeText(sp.get('search'))
    const statuses = parseListParam(sp, 'status')
    const entryTypes = parseListParam(sp, 'entryType')
    const quickFilters = parseListParam(sp, 'quickFilter')
    const page = Math.max(1, Number(sp.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(sp.get('limit')) || 10))

    const allDocs = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollAccountMappings,
      depth: 2,
      limit: 10000,
      sort: '-createdAt',
      overrideAccess: true,
    })

    const rows = allDocs.docs.map((doc) => {
      const d = doc as unknown as Record<string, unknown>
      const expenseAcct = d.expenseAccount as unknown as Record<string, unknown> | undefined
      const payableAcct = d.payableAccount as unknown as Record<string, unknown> | undefined
      return {
        id: String(d.id),
        entryType: String(d.entryType || ''),
        person: String(d.person || '-'),
        expenseAccountId: String(expenseAcct?.id ?? ''),
        expenseAccountLabel: expenseAcct?.name ? String(expenseAcct.name) : expenseAcct?.code ? String(expenseAcct.code) : expenseAcct ? `Account #${expenseAcct.id}` : '-',
        payableAccountId: String(payableAcct?.id ?? ''),
        payableAccountLabel: payableAcct?.name ? String(payableAcct.name) : payableAcct?.code ? String(payableAcct.code) : payableAcct ? `Account #${payableAcct.id}` : '-',
        deductionAmount: Number(d.deductionAmount) || 0,
        status: String(d.status || ''),
        notes: String(d.notes || ''),
      }
    })

    let filtered = rows
    if (search) {
      filtered = filtered.filter((r) =>
        [r.person, r.entryType, r.expenseAccountLabel, r.payableAccountLabel, r.status]
          .map((v) => normalizeText(v))
          .some((v) => v.includes(search)),
      )
    }
    if (statuses.length > 0) {
      filtered = filtered.filter((r) => statuses.includes(r.status))
    }
    if (entryTypes.length > 0) {
      filtered = filtered.filter((r) => entryTypes.includes(r.entryType))
    }
    if (quickFilters.length > 0) {
      filtered = filtered.filter((r) =>
        quickFilters.some((qf) => {
          if (qf.startsWith('entryType:')) return r.entryType === qf.slice(10)
          if (qf.startsWith('hasDeductions:')) return qf.slice(14) === 'true' ? r.deductionAmount > 0 : r.deductionAmount === 0
          return false
        }),
      )
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    const chartAccounts = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      depth: 0,
      limit: 500,
      sort: 'code',
      overrideAccess: true,
    })

    const entryTypeCounts = new Map<string, number>()
    for (const r of rows) entryTypeCounts.set(r.entryType, (entryTypeCounts.get(r.entryType) || 0) + 1)

    return NextResponse.json({
      rows: paginatedRows,
      metrics: [
        { id: 'total-mappings', label: 'Total Mappings', value: rows.length, change: 'Payroll account mapping rows configured', trend: rows.length > 0 ? 'up' as const : 'neutral' as const },
        { id: 'salary-mappings', label: 'Salary Rows', value: entryTypeCounts.get('salary') || 0, change: 'Entries using salary type', trend: 'up' as const },
        { id: 'contractor-mappings', label: 'Contractor Rows', value: entryTypeCounts.get('contractor') || 0, change: 'Entries using contractor type', trend: 'up' as const },
        { id: 'with-deductions', label: 'With Deductions', value: rows.filter((r) => r.deductionAmount > 0).length, change: 'Rows where net amount differs from gross because of deductions', trend: rows.filter((r) => r.deductionAmount > 0).length > 0 ? 'neutral' as const : 'down' as const },
      ],
      filterOptions: {
        entryTypes: [
          { label: 'Salary', value: 'salary' },
          { label: 'Contractor', value: 'contractor' },
          { label: 'Reimbursement', value: 'reimbursement' },
          { label: 'Adjustment', value: 'adjustment' },
        ],
        statuses: [
          { label: 'Draft', value: 'draft' },
          { label: 'Approved', value: 'approved' },
          { label: 'Posted', value: 'posted' },
          { label: 'Voided', value: 'voided' },
        ],
        quickFilters: [
          { label: 'Salary', value: 'entryType:salary' },
          { label: 'Contractor', value: 'entryType:contractor' },
          { label: 'Reimbursement', value: 'entryType:reimbursement' },
          { label: 'Adjustment', value: 'entryType:adjustment' },
          { label: 'With Deductions', value: 'hasDeductions:true' },
        ],
      },
      meta: {
        searchPlaceholder: 'Search person, entry type, expense account, payable account, or status',
        columns: ['Entry Type', 'Person', 'Expense Account', 'Payable Account', 'Deduction Amount', 'Status'],
        tableTitle: 'Payroll Mapping Register',
        tableDescription: 'Mapping view grounded in accounting-payroll-account-mappings, where expense and payable account mapping is configured.',
      },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: rows.length, filteredRows: totalDocs },
      referenceData: {
        chartAccounts: chartAccounts.docs.map((d) => {
          const r = d as unknown as Record<string, unknown>
          return { id: String(r.id), code: String(r.code || ''), name: String(r.name || '') }
        }),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = await request.json()

    const toId = (v: unknown): number | null => {
      if (v === null || v === undefined) return null
      const n = Number(v)
      return Number.isFinite(n) && n > 0 ? n : null
    }

    const expenseAccountId = toId(body.expenseAccount)
    if (!expenseAccountId) throw new AccountingApiError('Expense account is required.', 400)
    const payableAccountId = toId(body.payableAccount)
    if (!payableAccountId) throw new AccountingApiError('Payable account is required.', 400)
    if (!body.person || !String(body.person).trim()) throw new AccountingApiError('Person is required.', 400)

    const data: Record<string, unknown> = {
      entryType: String(body.entryType || 'salary'),
      person: String(body.person).trim(),
      expenseAccount: expenseAccountId,
      payableAccount: payableAccountId,
      deductionAmount: Math.max(0, Number(body.deductionAmount) || 0),
      status: String(body.status || 'draft'),
      createdBy: user.id,
      updatedBy: user.id,
    }

    if (body.notes) data.notes = String(body.notes).trim()

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollAccountMappings,
      overrideAccess: true,
      data: data as never,
      depth: 2,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
