import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { parseNumberParam, handleAccountingApiError, requireAccountingAdmin } from '../../../../_utils/auth'
import {
  assertStatementImportMutationPayload,
  buildStatementImportDetailResponse,
  buildStatementImportPersistenceData,
  normalizeStatementImportMutationBody,
  type StatementImportDoc,
} from '../_shared'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const record = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankStatementImports,
      id: parseNumberParam(params.id) || params.id,
      depth: 2,
      overrideAccess: true,
    })) as StatementImportDoc

    return NextResponse.json(await buildStatementImportDetailResponse(payload, record))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const statementImportId = parseNumberParam(params.id) || params.id
    const currentRecord = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankStatementImports,
      id: statementImportId,
      depth: 2,
      overrideAccess: true,
    })) as StatementImportDoc

    const body = normalizeStatementImportMutationBody((await request.json()) as Record<string, unknown>)
    await assertStatementImportMutationPayload(payload, {
      importBatchNumber: body.importBatchNumber ?? currentRecord.importBatchNumber ?? null,
      bankAccount:
        body.bankAccount ??
        (typeof currentRecord.bankAccount === 'object' && currentRecord.bankAccount
          ? currentRecord.bankAccount.id ?? null
          : currentRecord.bankAccount ?? null),
      statementFile:
        body.statementFile ??
        (typeof currentRecord.statementFile === 'object' && currentRecord.statementFile
          ? currentRecord.statementFile.id ?? null
          : currentRecord.statementFile ?? null),
      statementDateFrom: body.statementDateFrom ?? currentRecord.statementDateFrom ?? null,
      statementDateTo: body.statementDateTo ?? currentRecord.statementDateTo ?? null,
      sourceFormat: body.sourceFormat ?? currentRecord.sourceFormat ?? 'csv',
      importStatus: body.importStatus ?? currentRecord.importStatus ?? 'queued',
      totalLines: body.totalLines ?? currentRecord.totalLines ?? 0,
      importedLines: body.importedLines ?? currentRecord.importedLines ?? 0,
      failedLines: body.failedLines ?? currentRecord.failedLines ?? 0,
      duplicateLines: body.duplicateLines ?? currentRecord.duplicateLines ?? 0,
      importedTransactionCount: body.importedTransactionCount ?? currentRecord.importedTransactionCount ?? 0,
      parseErrorSummary: body.parseErrorSummary ?? currentRecord.parseErrorSummary ?? null,
      notes: body.notes ?? currentRecord.notes ?? null,
      metadata: body.metadata ?? currentRecord.metadata ?? null,
    })

    const updatedRecord = (await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankStatementImports,
      id: statementImportId,
      overrideAccess: true,
      depth: 2,
      data: {
        ...buildStatementImportPersistenceData(body),
        updatedBy: user.id,
      } as never,
    })) as StatementImportDoc

    return NextResponse.json(await buildStatementImportDetailResponse(payload, updatedRecord))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const statementImportId = parseNumberParam(params.id) || params.id

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankStatementImports,
      id: statementImportId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
