import { NextRequest, NextResponse } from 'next/server'
import { handleAccountingApiError, parseNumberParam, requireAccountingAdmin } from '../../../_utils/auth'
import { type ExpenseDoc } from '../../_shared'
import {
  buildExpenseMap,
  buildSupportingDocumentDetail,
  findExpenseDocs,
  type DocumentLinkDoc,
} from '../_shared'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

const normalizeOptionalString = (value: unknown) => {
  const normalized = String(value ?? '').trim()
  return normalized || undefined
}

const normalizeBoolean = (value: unknown) => value === true || value === 'true'

async function findExpenseDocumentLinkOrThrow({
  payload,
  id,
}: {
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload']
  id: string
}) {
  const record = (await payload.findByID({
    collection: 'accounting-document-links',
    id: parseNumberParam(id) || id,
    depth: 2,
    overrideAccess: true,
  })) as DocumentLinkDoc

  if (String(record.entityType || '') !== 'expense') {
    throw new Error('Only expense-linked supporting documents are supported in this view.')
  }

  return record
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const [documentLink, expenseResult] = await Promise.all([
      findExpenseDocumentLinkOrThrow({ payload, id }),
      findExpenseDocs(payload),
    ])

    return NextResponse.json(
      buildSupportingDocumentDetail({
        documentLink,
        expensesById: buildExpenseMap(expenseResult.docs as ExpenseDoc[]),
      }),
    )
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const body = (await request.json()) as Record<string, unknown>
    const currentDocumentLink = await findExpenseDocumentLinkOrThrow({ payload, id })

    const expenseId =
      body.entityId !== undefined
        ? normalizeOptionalString(body.entityId)
        : normalizeOptionalString(currentDocumentLink.entityId)
    const mediaId =
      body.media !== undefined
        ? parseNumberParam(normalizeOptionalString(body.media) || null)
        : parseNumberParam(String(currentDocumentLink.media && typeof currentDocumentLink.media === 'object' ? currentDocumentLink.media.id || '' : currentDocumentLink.media || ''))
    const documentCategory =
      body.documentCategory !== undefined
        ? normalizeOptionalString(body.documentCategory)
        : normalizeOptionalString(currentDocumentLink.documentCategory)

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

    const updated = (await payload.update({
      collection: 'accounting-document-links',
      id: parseNumberParam(id) || id,
      depth: 2,
      overrideAccess: true,
      data: {
        entityType: 'expense',
        entityId: expenseId,
        media: mediaId,
        documentCategory,
        documentDate:
          body.documentDate !== undefined
            ? normalizeOptionalString(body.documentDate)
            : normalizeOptionalString(currentDocumentLink.documentDate),
        notes:
          body.notes !== undefined
            ? normalizeOptionalString(body.notes)
            : normalizeOptionalString(currentDocumentLink.notes),
        isPrimary:
          body.isPrimary !== undefined
            ? normalizeBoolean(body.isPrimary)
            : Boolean(currentDocumentLink.isPrimary),
        updatedBy: user.id,
      } as never,
    })) as DocumentLinkDoc

    const expenseResult = await findExpenseDocs(payload)
    return NextResponse.json(
      buildSupportingDocumentDetail({
        documentLink: updated,
        expensesById: buildExpenseMap(expenseResult.docs as ExpenseDoc[]),
      }),
    )
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    await findExpenseDocumentLinkOrThrow({ payload, id })

    await payload.delete({
      collection: 'accounting-document-links',
      id: parseNumberParam(id) || id,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
