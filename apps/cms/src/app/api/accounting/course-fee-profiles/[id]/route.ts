import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin, AccountingApiError } from '../../_utils/auth'

const toId = (v: unknown): string => {
  if (!v) return ''
  if (typeof v === 'object' && v !== null) return String((v as Record<string, unknown>).id ?? '')
  return String(v)
}

const toName = (v: unknown): string => {
  if (!v) return '-'
  if (typeof v === 'object' && v !== null) {
    const r = v as Record<string, unknown>
    if (r.name) return String(r.name)
    if (r.title) return String(r.title)
    return `Account #${r.id}`
  }
  return String(v)
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await params
    const record = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.courseFeeProfiles,
      id,
      depth: 2,
      overrideAccess: true,
    })
    if (!record) throw new AccountingApiError('Fee profile not found', 404)

    const r = record as unknown as Record<string, unknown>
    return NextResponse.json({
      id: String(r.id),
      course: toId(r.course),
      courseName: toName(r.course),
      certificateFee: Number(r.certificateFee) || 0,
      retakeFee: Number(r.retakeFee) || 0,
      reassessmentFee: Number(r.reassessmentFee) || 0,
      renewalFee: Number(r.renewalFee) || 0,
      latePaymentFee: Number(r.latePaymentFee) || 0,
      manualAdjustmentAllowed: Boolean(r.manualAdjustmentAllowed),
      defaultRecognitionMethod: String(r.defaultRecognitionMethod || 'on_activation'),
      courseRevenueAccount: toId(r.courseRevenueAccount),
      courseRevenueAccountLabel: toName(r.courseRevenueAccount),
      deferredRevenueAccount: toId(r.deferredRevenueAccount),
      deferredRevenueAccountLabel: toName(r.deferredRevenueAccount),
      certificateRevenueAccount: toId(r.certificateRevenueAccount),
      certificateRevenueAccountLabel: toName(r.certificateRevenueAccount),
      discountContraRevenueAccount: toId(r.discountContraRevenueAccount),
      discountContraRevenueAccountLabel: toName(r.discountContraRevenueAccount),
      instructorExpenseAccount: toId(r.instructorExpenseAccount),
      instructorExpenseAccountLabel: toName(r.instructorExpenseAccount),
      notes: String(r.notes || ''),
      createdAt: r.createdAt ? String(r.createdAt) : null,
      updatedAt: r.updatedAt ? String(r.updatedAt) : null,
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const { id } = await params

    const toId = (v: unknown): number | null => {
      if (v === null || v === undefined) return null
      const n = Number(v)
      return Number.isFinite(n) && n > 0 ? n : null
    }

    const existing = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.courseFeeProfiles,
      id,
      depth: 0,
      overrideAccess: true,
    })
    if (!existing) throw new AccountingApiError('Fee profile not found', 404)

    const body = await request.json()
    const data: Record<string, unknown> = { updatedBy: user.id }

    if (body.course !== undefined) data.course = toId(body.course)
    if (body.certificateFee !== undefined) data.certificateFee = Math.max(0, Number(body.certificateFee) || 0)
    if (body.retakeFee !== undefined) data.retakeFee = Math.max(0, Number(body.retakeFee) || 0)
    if (body.reassessmentFee !== undefined) data.reassessmentFee = Math.max(0, Number(body.reassessmentFee) || 0)
    if (body.renewalFee !== undefined) data.renewalFee = Math.max(0, Number(body.renewalFee) || 0)
    if (body.latePaymentFee !== undefined) data.latePaymentFee = Math.max(0, Number(body.latePaymentFee) || 0)
    if (body.manualAdjustmentAllowed !== undefined) data.manualAdjustmentAllowed = Boolean(body.manualAdjustmentAllowed)
    if (body.defaultRecognitionMethod !== undefined) data.defaultRecognitionMethod = String(body.defaultRecognitionMethod)
    if (body.courseRevenueAccount !== undefined) data.courseRevenueAccount = toId(body.courseRevenueAccount)
    if (body.deferredRevenueAccount !== undefined) data.deferredRevenueAccount = toId(body.deferredRevenueAccount)
    if (body.certificateRevenueAccount !== undefined) data.certificateRevenueAccount = toId(body.certificateRevenueAccount)
    if (body.discountContraRevenueAccount !== undefined) data.discountContraRevenueAccount = toId(body.discountContraRevenueAccount)
    if (body.instructorExpenseAccount !== undefined) data.instructorExpenseAccount = toId(body.instructorExpenseAccount)
    if (body.notes !== undefined) data.notes = String(body.notes).trim()

    const record = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.courseFeeProfiles,
      id,
      overrideAccess: true,
      data: data as never,
      depth: 2,
    })

    return NextResponse.json(record)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await params
    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.courseFeeProfiles,
      id,
      overrideAccess: true,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
