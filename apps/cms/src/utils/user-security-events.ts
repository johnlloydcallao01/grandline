type UserSecurityEventType = 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'PASSWORD_CHANGED'

interface CreateUserSecurityEventOptions {
  payload: any
  userId: string | number
  eventType: UserSecurityEventType
  eventData: Record<string, unknown>
  triggeredBy?: string | number | null
  ipAddress?: string
  userAgent?: string
  timestamp?: string
}

export async function createUserSecurityEvent({
  payload,
  userId,
  eventType,
  eventData,
  triggeredBy,
  ipAddress,
  userAgent,
  timestamp,
}: CreateUserSecurityEventOptions): Promise<void> {
  await payload.create({
    collection: 'user-events',
    overrideAccess: true,
    data: {
      user: userId,
      eventType,
      eventData,
      triggeredBy: triggeredBy || undefined,
      timestamp: timestamp || new Date().toISOString(),
      ipAddress,
      userAgent,
    },
  })
}
