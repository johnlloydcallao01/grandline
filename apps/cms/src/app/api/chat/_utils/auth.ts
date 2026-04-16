import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import type { User } from '@/payload-types'
import type { ApiResponse } from '../_types/responses'

export async function getPayloadInstance(): Promise<Payload> {
  return getPayload({ config })
}

export async function requireAuth(req: NextRequest): Promise<User> {
  const payload = await getPayloadInstance()
  const authResult = await payload.auth({ headers: req.headers })

  if (!authResult || !authResult.user) {
    throw new ApiError('Unauthorized', 401)
  }

  return authResult.user as unknown as User
}

export function requireRole(user: User, allowedRoles: string[]): void {
  if (!allowedRoles.includes(user.role)) {
    throw new ApiError('Forbidden - insufficient permissions', 403)
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError<T = any>(error: unknown): NextResponse<ApiResponse<T>> {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    ) as NextResponse<ApiResponse<T>>
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    ) as NextResponse<ApiResponse<T>>
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  ) as NextResponse<ApiResponse<T>>
}
