import type { NextRequest } from 'next/server'

const USERS_API_KEY_PREFIX = 'users API-Key '

export function getServiceApiKeyFromRequest(request: NextRequest): string | null {
  const authorization =
    request.headers.get('authorization') ?? request.headers.get('Authorization')

  if (authorization?.startsWith(USERS_API_KEY_PREFIX)) {
    return authorization.slice(USERS_API_KEY_PREFIX.length).trim() || null
  }

  // Legacy fallback for existing callers. Prefer Authorization going forward.
  const legacyApiKey = request.headers.get('PAYLOAD_API_KEY')
  return legacyApiKey?.trim() || null
}

export function isAuthorizedServiceRequest(
  request: NextRequest,
  expectedApiKey: string | undefined
): boolean {
  if (!expectedApiKey) return false

  const providedApiKey = getServiceApiKeyFromRequest(request)
  return providedApiKey === expectedApiKey
}
