import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_PAYROLL_ENTRY_STATUS_OPTIONS,
  ACCOUNTING_PAYROLL_ENTRY_TYPE_OPTIONS,
} from '@/accounting/constants/accounting'
import { AccountingApiError, handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

const fmt = (n: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(n)

const parseListParam = (sp: URLSearchParams, key: string): string[] =>
  Array.from(new Set(sp.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

const normalizeText = (v?: string | null) => String(v || '').trim().toLowerCase()

const statusLabelMap = new Map<string, string>(ACCOUNTING_PAYROLL_ENTRY_STATUS_OPTIONS.map((o) => [o.value, o.label]))
const typeLabelMap = new Map<string, string>(ACCOUNTING_PAYROLL_ENTRY_TYPE_OPTIONS.map((o) => [o.value, o.label]))

function getStatusTone(status: string): string {
  if (status === 'posted') return 'green'
  if (status === 'approved') return 'blue'
  if (status === 'voided') return 'red'
  return 'gray'
}

function getTypeTone(entryType: string): string {
  if (entryType === 'salary') return 'green'
  if (entryType === 'contractor') return 'blue'
  if (entryType === 'reimbursement') return 'gray'
  if (entryType === 'adjustment') return 'amber'
  return 'gray'
}

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
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollEntries,
      depth: 2,
      limit: 10000,
      sort: '-createdAt',
      overrideAccess: true,
    })

    const rows = allDocs.docs.map((doc) => {
      const d = doc as unknown as Record<string, unknown>
      const et = String(d.entryType || '')
      const st = String(d.status || '')
      const run = d.payrollRun as Record<string, unknown> | undefined
      const person = (d.user as Record<string, unknown> | undefined) || (d.instructor as Record<string, unknown> | undefined)
      const ga = Number(d.grossAmount) || 0
      const da = Number(d.deductionAmount) || 0
      const na = Number(d.netAmount) || 0
      return {
        id: String(d.id),
        payrollRunCode: run?.payrollCode ? String(run.payrollCode) : run ? `Run#${run.id}` : '-',
        payrollRunId: String(run?.id ?? ''),
        personLabel: person?.name ? String(person.name) : person?.email ? String(person.email) : person ? `Person#${person.id}` : '-',
        entryType: et,
        entryTypeLabel: typeLabelMap.get(et) || et || '-',
        entryTypeTone: getTypeTone(et),
        grossAmount: ga,
        grossAmountLabel: fmt(ga),
        deductionAmount: da,
        deductionAmountLabel: fmt(da),
        netAmount: na,
        netAmountLabel: fmt(na),
        status: st,
        statusLabel: statusLabelMap.get(st) || st || '-',
        statusTone: getStatusTone(st),
        cells: [
          { text: run?.payrollCode ? String(run.payrollCode) : '-', emphasis: true },
          person?.name ? String(person.name) : person?.email ? String(person.email) : '-',
          { text: typeLabelMap.get(et) || et || '-', tone: getTypeTone(et) },
          { text: fmt(na), align: 'right' },
          { text: statusLabelMap.get(st) || st || '-', tone: getStatusTone(st) },
        ],
      }
    })

    let filtered = rows
    if (search) {
      filtered = filtered.filter((r) =>
        [r.payrollRunCode, r.personLabel, r.entryTypeLabel, r.statusLabel]
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
      const allQf = ['status:draft', 'status:approved', 'status:posted', 'type:salary', 'type:contractor']
      const selectedSet = new Set(quickFilters)
      const allSelected = allQf.every((v) => selectedSet.has(v))
      if (!allSelected) {
        filtered = filtered.filter((r) =>
          quickFilters.some((qf) => {
            const [prefix, value] = qf.split(':')
            if (prefix === 'status') return r.status === value
            if (prefix === 'type') return r.entryType === value
            return false
          }),
        )
      }
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    const totalNa = rows.reduce((s, r) => s + r.netAmount, 0)
    const salaryCount = rows.filter((r) => r.entryType === 'salary').length
    const contractorCount = rows.filter((r) => r.entryType === 'contractor').length

    const [chartAccounts, payrollRuns] = await Promise.all([
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, depth: 0, limit: 500, sort: 'code', overrideAccess: true }),
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.payrollRuns, depth: 0, limit: 200, sort: '-periodStart', overrideAccess: true }),
    ])

    return NextResponse.json({
      rows: paginatedRows,
      metrics: [
        { id: 'total-entries', label: 'Payroll Entries', value: rows.length, change: 'Rows grouped under payroll runs', trend: 'up' as const },
        { id: 'salary-entries', label: 'Salary Entries', value: salaryCount, change: 'Entries using salary type', trend: salaryCount > 0 ? 'up' as const : 'neutral' as const },
        { id: 'contractor-entries', label: 'Contractor Entries', value: contractorCount, change: 'Entries using contractor type', trend: contractorCount > 0 ? 'up' as const : 'neutral' as const },
        { id: 'net-total', label: 'Net Total', value: fmt(totalNa), change: 'Summed net amount across all entries', trend: 'up' as const },
      ],
      filterOptions: {
        statuses: ACCOUNTING_PAYROLL_ENTRY_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
        entryTypes: ACCOUNTING_PAYROLL_ENTRY_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
        quickFilters: [
          { label: 'Draft', value: 'status:draft' },
          { label: 'Approved', value: 'status:approved' },
          { label: 'Posted', value: 'status:posted' },
          { label: 'Salary', value: 'type:salary' },
          { label: 'Contractor', value: 'type:contractor' },
        ],
      },
      meta: {
        searchPlaceholder: 'Search payroll run, person, entry type, or status',
        columns: ['Payroll Run', 'Person', 'Entry Type', 'Net Amount', 'Status'],
        tableTitle: 'Payroll Entry Register',
        tableDescription: 'Entry rows aligned to accounting-payroll-entries, including salary, contractor, reimbursement, and adjustment entry types.',
      },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: rows.length, filteredRows: totalDocs },
      referenceData: {
        chartAccounts: chartAccounts.docs.map((d) => { const r = d as unknown as Record<string, unknown>; return { id: String(r.id), code: String(r.code ?? ''), name: String(r.name ?? '') }; }),
        payrollRuns: payrollRuns.docs.map((d) => { const r = d as unknown as Record<string, unknown>; return { id: String(r.id), payrollCode: String(r.payrollCode ?? ''), periodStart: r.periodStart ? String(r.periodStart).slice(0, 10) : '' }; }),
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

    const payrollRunId = toId(body.payrollRun)
    if (!payrollRunId) throw new AccountingApiError('Payroll run is required.', 400)

    const grossAmount = Number(body.grossAmount ?? 0)
    if (grossAmount < 0) throw new AccountingApiError('Gross amount must be 0 or greater.', 400)
    const deductionAmount = Number(body.deductionAmount ?? 0)
    if (deductionAmount < 0) throw new AccountingApiError('Deduction amount must be 0 or greater.', 400)

    const expenseAccountId = toId(body.expenseAccount)
    if (!expenseAccountId) throw new AccountingApiError('Expense account is required.', 400)
    const payableAccountId = toId(body.payableAccount)
    if (!payableAccountId) throw new AccountingApiError('Payable account is required.', 400)

    const data: Record<string, unknown> = {
      payrollRun: payrollRunId,
      entryType: String(body.entryType || 'salary'),
      grossAmount,
      deductionAmount,
      expenseAccount: expenseAccountId,
      payableAccount: payableAccountId,
      status: String(body.status || 'draft'),
      createdBy: user.id,
      updatedBy: user.id,
    }

    const userId = toId(body.user)
    const instructorId = toId(body.instructor)
    const projectId = toId(body.project)
    if (userId) data.user = userId
    if (instructorId) data.instructor = instructorId
    if (projectId) data.project = projectId
    if (body.notes) data.notes = String(body.notes).trim()

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollEntries,
      overrideAccess: true,
      data: data as never,
      depth: 2,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
