export interface RequestHeadersLike {
  headers?: {
    get(name: string): string | null
  }
  url?: string
  user?: {
    id?: string | number
  } | null
}

export interface RequestMetadata {
  ipAddress: string
  userAgent: string
}

function normalizeHeaderValue(value: string | null | undefined): string | null {
  const trimmed = String(value || '').trim()
  return trimmed ? trimmed : null
}

export function getRequestMetadata(req?: RequestHeadersLike | null): RequestMetadata {
  const forwardedFor = normalizeHeaderValue(req?.headers?.get('x-forwarded-for'))
  const realIp = normalizeHeaderValue(req?.headers?.get('x-real-ip'))
  const firstForwardedIp = forwardedFor?.split(',')[0]?.trim()

  return {
    ipAddress: firstForwardedIp || realIp || 'Unknown',
    userAgent: normalizeHeaderValue(req?.headers?.get('user-agent')) || 'Unknown',
  }
}

export function inferPasswordChangeSource(
  req?: RequestHeadersLike | null,
  targetUserId?: string | number | null,
): string {
  const url = String(req?.url || '')

  if (url.includes('/reset-password')) {
    return 'reset-password'
  }

  if (req?.user?.id !== undefined && targetUserId !== undefined && targetUserId !== null) {
    if (String(req.user.id) === String(targetUserId)) {
      return 'profile-password-change'
    }
  }

  return 'user-update'
}
