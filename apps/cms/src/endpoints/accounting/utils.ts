import { APIError, type PayloadRequest } from 'payload'

export const requireAccountingAdmin = (req: PayloadRequest) => {
  if (!req.user) {
    throw new APIError('Authentication is required.', 401)
  }

  if (req.user.role !== 'admin') {
    throw new APIError('Only administrators can access accounting Phase 1 workflows.', 403)
  }

  return req.user
}

export const parseAccountingRequestBody = async (req: PayloadRequest) => {
  if (typeof req.json !== 'function') {
    return {}
  }

  const body = await req.json()
  return body && typeof body === 'object' ? body : {}
}

export const buildAccountingJsonResponse = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    status: init?.status || 200,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })

export const getUrl = (req: PayloadRequest) => new URL(req.url || '', 'http://localhost')
