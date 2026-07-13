import { NextRequest, NextResponse } from 'next/server'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

function mapUser(raw: unknown) {
  const u = raw as Record<string, unknown>
  return {
    id: (u.id as number | string) ?? '',
    email: (u.email as string) || '',
    firstName: (u.firstName as string) || '',
    lastName: (u.lastName as string) || '',
    middleName: (u.middleName as string) || '',
    nameExtension: (u.nameExtension as string) || '',
    username: (u.username as string) || '',
    gender: (u.gender as string) || '',
    phone: (u.phone as string) || '',
    role: (u.role as string) || 'trainee',
    isActive: u.isActive !== false,
    lastLogin: (u.lastLogin as string) || null,
    enableAPIKey: u.enableAPIKey === true,
    securityAlertsEmailEnabled: u.securityAlertsEmailEnabled !== false,
    pushNotificationsEnabled: u.pushNotificationsEnabled !== false,
    createdAt: (u.createdAt as string) || '',
    updatedAt: (u.updatedAt as string) || '',
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await params

    const result = await payload.findByID({
      collection: 'users',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!result) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    return NextResponse.json({ user: mapUser(result) })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await params
    const body: Record<string, unknown> = await request.json()

    const updateData: Record<string, unknown> = {}

    const scalarFields = [
      'firstName', 'lastName', 'email', 'role', 'phone',
      'username', 'gender', 'middleName', 'nameExtension',
    ] as const
    for (const field of scalarFields) {
      if (body[field] !== undefined) updateData[field] = body[field]
    }

    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.securityAlertsEmailEnabled !== undefined) updateData.securityAlertsEmailEnabled = body.securityAlertsEmailEnabled
    if (body.pushNotificationsEnabled !== undefined) updateData.pushNotificationsEnabled = body.pushNotificationsEnabled
    if (body.enableAPIKey !== undefined) updateData.enableAPIKey = body.enableAPIKey
    if (body.resetPassword) updateData.password = body.resetPassword

    const result = await payload.update({
      collection: 'users',
      id,
      data: updateData as never,
      depth: 0,
      overrideAccess: true,
    })

    return NextResponse.json({ user: mapUser(result) })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await params

    await payload.delete({
      collection: 'users',
      id,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
