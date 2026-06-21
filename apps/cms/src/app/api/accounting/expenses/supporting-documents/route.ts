import { NextRequest, NextResponse } from 'next/server'
import { SIMPLE_POSTING_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, parseNumberParam, requireAccountingAdmin } from '../../_utils/auth'
import { normalizeSearch, parseIntegerParam, parseListParam, type ExpenseDoc } from '../_shared'
import {
  buildExpenseMap,
  buildSupportingDocumentDetail,
  buildSupportingDocumentMetrics,
  buildSupportingDocumentReferenceData,
  buildSupportingDocumentRow,
  findExpenseDocs,
  findExpenseDocumentLinks,
  matchesSupportingDocumentFilters,
} from './_shared'

const normalizeOptionalString = (value: unknown) => {
  const normalized = String(value ?? '').trim()
  return normalized || undefined
}

const normalizeBoolean = (value: unknown) => value === true || value === 'true'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categories = parseListParam(searchParams, 'category')
    const states = parseListParam(searchParams, 'state')
    const expenseStatuses = parseListParam(searchParams, 'expenseStatus')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [expenseResult, documentLinkResult] = await Promise.all([
      findExpenseDocs(payload),
      findExpenseDocumentLinks(payload),
    ])

    const expenses = expenseResult.docs as ExpenseDoc[]
    const expensesById = buildExpenseMap(expenses)
    const rows = documentLinkResult.docs.map((documentLink) =>
      buildSupportingDocumentRow({
        documentLink,
        expensesById,
      }),
    )
    const normalizedQuery = normalizeSearch(search)
    const filteredRows = rows.filter((row) => {
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) return false
      return matchesSupportingDocumentFilters(row, {
        categories,
        states,
        expenseStatuses,
        quickFilters,
      })
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit)

    return NextResponse.json({
      rows: paginatedRows,
      metrics: buildSupportingDocumentMetrics(filteredRows),
      filterOptions: {
        categories: buildSupportingDocumentReferenceData(expenses).categories,
        states: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
          { label: 'With Notes', value: 'with_notes' },
          { label: 'Missing Date', value: 'missing_date' },
        ],
        expenseStatuses: SIMPLE_POSTING_STATUS_OPTIONS.map((option) => ({
          label: option.label,
          value: option.value,
        })),
        quickFilters: [
          { label: 'Primary', value: 'state:primary' },
          { label: 'Missing Date', value: 'state:missing_date' },
          { label: 'With Notes', value: 'state:with_notes' },
          { label: 'Draft Expense', value: 'status:draft' },
          { label: 'Posted Expense', value: 'status:posted' },
        ],
      },
      appliedFilters: {
        search,
        categories,
        states,
        expenseStatuses,
        quickFilters,
      },
      meta: {
        id: 'supporting-documents',
        label: 'Supporting Documents',
        description:
          'Review expense-linked support files, ownership, file categories, and document completeness from real document-link records.',
        searchPlaceholder: 'Search expense no., file name, category, uploaded by, note, or document date',
        tableTitle: 'Expense Supporting Document Register',
        tableDescription:
          'Expense-scoped document register showing file linkage, support categories, dates, and primary-file coverage.',
        columns: ['Link Ref', 'Expense', 'File', 'Category', 'Document Date', 'Uploaded By', 'State'],
      },
      pagination: {
        page: currentPage,
        limit,
        totalDocs,
        totalPages,
        hasPrevPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
      },
      totals: {
        totalRows: rows.length,
        filteredRows: totalDocs,
      },
      referenceData: buildSupportingDocumentReferenceData(expenses),
      flags: {
        editableDocumentIds: rows.map((row) => row.id),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = (await request.json()) as Record<string, unknown>
    const traceId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    // #region debug-point D:cms-post-entry
    fetch('http://127.0.0.1:7777/event', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'supporting-docs-upload',
        runId: 'pre-fix',
        hypothesisId: 'D',
        location: 'supporting-documents/route.ts:POST:entry',
        msg: '[DEBUG] CMS supporting-documents POST reached',
        data: {
          traceId,
          url: request.url,
          userId: String(user.id),
          body,
        },
        ts: Date.now(),
      }),
    }).catch(() => {})
    // #endregion

    const expenseId = normalizeOptionalString(body.entityId)
    const mediaId = parseNumberParam(normalizeOptionalString(body.media) || null)
    const documentCategory = normalizeOptionalString(body.documentCategory)
    const documentDate = normalizeOptionalString(body.documentDate)
    const notes = normalizeOptionalString(body.notes)
    const isPrimary = normalizeBoolean(body.isPrimary)

    // #region debug-point E:cms-post-normalized
    fetch('http://127.0.0.1:7777/event', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'supporting-docs-upload',
        runId: 'pre-fix',
        hypothesisId: 'E',
        location: 'supporting-documents/route.ts:POST:normalized',
        msg: '[DEBUG] CMS supporting-documents payload normalized',
        data: {
          traceId,
          expenseId,
          mediaId,
          documentCategory,
          documentDate,
          isPrimary,
          hasNotes: Boolean(notes),
        },
        ts: Date.now(),
      }),
    }).catch(() => {})
    // #endregion

    if (!expenseId) {
      throw new Error('Expense is required.')
    }
    if (!mediaId) {
      throw new Error('Media is required.')
    }
    if (!documentCategory) {
      throw new Error('Document category is required.')
    }

    await payload.findByID({
      collection: 'media',
      id: mediaId,
      depth: 0,
      overrideAccess: true,
    })
    await payload.findByID({
      collection: 'accounting-expenses',
      id: parseNumberParam(expenseId) || expenseId,
      depth: 0,
      overrideAccess: true,
    })

    const created = await payload.create({
      collection: 'accounting-document-links',
      depth: 2,
      overrideAccess: true,
      data: {
        entityType: 'expense',
        entityId: expenseId,
        media: mediaId,
        documentCategory,
        documentDate,
        notes,
        isPrimary,
        uploadedBy: user.id,
        createdBy: user.id,
        updatedBy: user.id,
      } as never,
    })

    // #region debug-point F:cms-post-created
    fetch('http://127.0.0.1:7777/event', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'supporting-docs-upload',
        runId: 'pre-fix',
        hypothesisId: 'F',
        location: 'supporting-documents/route.ts:POST:created',
        msg: '[DEBUG] CMS supporting-documents record created',
        data: {
          traceId,
          createdId: String(created.id),
          entityId: expenseId,
          mediaId,
        },
        ts: Date.now(),
      }),
    }).catch(() => {})
    // #endregion

    const expenseResult = await findExpenseDocs(payload)
    const detail = buildSupportingDocumentDetail({
      documentLink: created,
      expensesById: buildExpenseMap(expenseResult.docs as ExpenseDoc[]),
    })

    return NextResponse.json(detail, { status: 201 })
  } catch (error) {
    // #region debug-point G:cms-post-error
    fetch('http://127.0.0.1:7777/event', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'supporting-docs-upload',
        runId: 'pre-fix',
        hypothesisId: 'G',
        location: 'supporting-documents/route.ts:POST:error',
        msg: '[DEBUG] CMS supporting-documents POST failed',
        data: {
          error:
            error instanceof Error
              ? { message: error.message, stack: error.stack }
              : { value: String(error) },
        },
        ts: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    return handleAccountingApiError(error)
  }
}
