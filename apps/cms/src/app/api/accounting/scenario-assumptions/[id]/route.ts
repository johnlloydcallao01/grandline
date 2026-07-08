import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const [scenarioId, ...keyParts] = decodeURIComponent(params.id).split(':')
    const rawKey = keyParts.join(':')
    if (!scenarioId || !rawKey) return NextResponse.json({ error: 'Invalid assumption ID format. Use scenarioId:key.' }, { status: 400 })

    const doc = await payload.findByID({ collection: ACCOUNTING_COLLECTION_SLUGS.forecastScenarios, id: scenarioId, depth: 0, overrideAccess: true })
    if (!doc) return NextResponse.json({ error: 'Scenario not found.' }, { status: 404 })

    const body = await request.json()
    const existing = (doc as any).assumptions && typeof (doc as any).assumptions === 'object' ? { ...(doc as any).assumptions } : {}
    if (!(rawKey in existing)) return NextResponse.json({ error: `Key "${rawKey}" not found in scenario.` }, { status: 404 })
    if (body.value !== undefined) existing[rawKey] = typeof body.value === 'number' ? body.value : Number(body.value) || 0
    if (body.newKey !== undefined && body.newKey !== rawKey) {
      existing[body.newKey] = existing[rawKey]
      delete existing[rawKey]
    }
    await payload.update({ collection: ACCOUNTING_COLLECTION_SLUGS.forecastScenarios, id: scenarioId, depth: 0, overrideAccess: true, data: { assumptions: existing, updatedBy: user.id } as never })
    return NextResponse.json({ success: true })
  } catch (e) { return handleAccountingApiError(e) }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const [scenarioId, ...keyParts] = decodeURIComponent(params.id).split(':')
    const rawKey = keyParts.join(':')
    if (!scenarioId || !rawKey) return NextResponse.json({ error: 'Invalid assumption ID.' }, { status: 400 })

    const doc = await payload.findByID({ collection: ACCOUNTING_COLLECTION_SLUGS.forecastScenarios, id: scenarioId, depth: 0, overrideAccess: true })
    if (!doc) return NextResponse.json({ error: 'Scenario not found.' }, { status: 404 })
    const existing = (doc as any).assumptions && typeof (doc as any).assumptions === 'object' ? { ...(doc as any).assumptions } : {}
    if (!(rawKey in existing)) return NextResponse.json({ error: `Key "${rawKey}" not found.` }, { status: 404 })
    delete existing[rawKey]
    await payload.update({ collection: ACCOUNTING_COLLECTION_SLUGS.forecastScenarios, id: scenarioId, depth: 0, overrideAccess: true, data: { assumptions: existing, updatedBy: user.id } as never })
    return NextResponse.json({ success: true })
  } catch (e) { return handleAccountingApiError(e) }
}
