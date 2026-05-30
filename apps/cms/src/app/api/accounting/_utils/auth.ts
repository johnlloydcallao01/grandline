import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'
import type { User } from '@/payload-types'

export class AccountingApiError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
  ) {
    super(message)
    this.name = 'AccountingApiError'
  }
}

export async function getAccountingPayload(): Promise<Payload> {
  return getPayload({ config: configPromise })
}

export async function requireAccountingAdmin(request: NextRequest) {
  const payload = await getAccountingPayload()
  const authResult = await payload.auth({ headers: request.headers })
  const user = authResult?.user as User | undefined

  if (!user) {
    throw new AccountingApiError('Unauthorized', 401)
  }

  if (user.role !== 'admin') {
    throw new AccountingApiError('Forbidden', 403)
  }

  return {
    payload,
    user,
  }
}

export function parseNumberParam(value: string | null) {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : value
}

export function handleAccountingApiError(error: unknown) {
  console.error('Accounting API error:', error)

  if (error instanceof AccountingApiError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode })
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
