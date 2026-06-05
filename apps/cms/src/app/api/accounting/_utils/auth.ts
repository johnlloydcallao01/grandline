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

type PayloadLikeValidationFieldError = {
  message?: string
  label?: string
  name?: string
}

type PayloadLikeError = {
  status?: number
  data?: {
    errors?: PayloadLikeValidationFieldError[]
  }
  cause?: {
    status?: number
    data?: {
      errors?: PayloadLikeValidationFieldError[]
    }
    errors?: PayloadLikeValidationFieldError[]
  }
  errors?: PayloadLikeValidationFieldError[]
}

const extractPayloadValidationMessage = (error: unknown): string | null => {
  const candidate = error as PayloadLikeError | null | undefined
  const errors =
    candidate?.data?.errors ||
    candidate?.errors ||
    candidate?.cause?.data?.errors ||
    candidate?.cause?.errors

  if (!Array.isArray(errors) || !errors.length) {
    return null
  }

  const firstError = errors[0]
  if (typeof firstError?.message === 'string' && firstError.message.trim()) {
    return firstError.message.trim()
  }

  if (typeof firstError?.label === 'string' && firstError.label.trim()) {
    return `The following field is invalid: ${firstError.label.trim()}`
  }

  if (typeof firstError?.name === 'string' && firstError.name.trim()) {
    return `The following field is invalid: ${firstError.name.trim()}`
  }

  return null
}

export function handleAccountingApiError(error: unknown) {
  console.error('Accounting API error:', error)

  if (error instanceof AccountingApiError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode })
  }

  if (error instanceof Error) {
    const payloadValidationMessage = extractPayloadValidationMessage(error)
    const payloadError = error as Error & PayloadLikeError
    const statusCode =
      typeof payloadError.status === 'number'
        ? payloadError.status
        : typeof payloadError.cause?.status === 'number'
          ? payloadError.cause.status
          : payloadValidationMessage
            ? 400
            : 500

    return NextResponse.json(
      { error: payloadValidationMessage || error.message },
      { status: statusCode },
    )
  }

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
