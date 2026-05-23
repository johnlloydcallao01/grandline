import type { PayloadRequest } from 'payload'

export const getRelationshipId = (value: unknown): number | string | null => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: number | string | null }).id
    return id ?? null
  }

  if (typeof value === 'number' || typeof value === 'string') {
    return value
  }

  return null
}

export const getRequestUserId = (req?: PayloadRequest | null): number | string | null => {
  const userId = (req as { user?: { id?: number | string | null } } | null | undefined)?.user?.id
  return userId ?? null
}

export const applyCreatedAndUpdatedBy = <T extends Record<string, unknown>>({
  data,
  originalDoc,
  req,
}: {
  data: T
  originalDoc?: Record<string, unknown> | null
  req?: PayloadRequest | null
}): T => {
  const userId = getRequestUserId(req)
  const mutableData = data as Record<string, unknown>

  if (!userId) {
    return data
  }

  if (!originalDoc?.createdBy && !mutableData.createdBy) {
    mutableData.createdBy = userId
  }

  mutableData.updatedBy = userId

  return data
}
