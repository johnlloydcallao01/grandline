import { NextRequest, NextResponse } from 'next/server'
import { APIError } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

function parseIdParam(rawId: string): number | string {
  const n = Number(rawId)
  return Number.isFinite(n) ? n : rawId
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id: rawId } = await params
    const id = parseIdParam(rawId)

    let record: Record<string, unknown> | null = null
    try {
      const found = await payload.findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
        id,
        depth: 1,
        overrideAccess: true,
      })
      record = found ? (found as unknown as Record<string, unknown>) : null
    } catch (err) {
      if (err instanceof APIError && err.status === 404) {
        return NextResponse.json({ error: 'Journal entry not found.' }, { status: 404 })
      }
      throw err
    }

    if (!record) {
      return NextResponse.json({ error: 'Journal entry not found.' }, { status: 404 })
    }

    const lineCount = await payload.count({
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines,
      where: { journalEntry: { equals: id } },
      overrideAccess: true,
    })

    return NextResponse.json({
      ...record,
      usageSummary: {
        lineCount: Number(lineCount.totalDocs || 0),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const { id: rawId } = await params
    const id = parseIdParam(rawId)
    const body = await request.json()

    const record = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
      id,
      overrideAccess: true,
      data: { ...body, updatedBy: user.id },
      depth: 1,
    })

    return NextResponse.json(record)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id: rawId } = await params
    const id = parseIdParam(rawId)

    const lineCount = await payload.count({
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines,
      where: { journalEntry: { equals: id } },
      overrideAccess: true,
    })

    const blockers: string[] = []
    if (Number(lineCount.totalDocs || 0) > 0) {
      blockers.push(`Referenced by ${lineCount.totalDocs} journal entry line(s)`)
    }

    return NextResponse.json({ blockers, id })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
