import {
  buildKey,
  withCache,
  withStaleWhileRevalidate,
  invalidate,
  invalidatePattern,
  checkConnection,
  createRatelimiter,
  getRedisClient,
} from '@encreasl/upstash'
import type { PayloadRequest } from 'payload'
import type { Payload } from 'payload'
import crypto from 'crypto'

export { buildKey, withCache, withStaleWhileRevalidate, invalidate as invalidateKey, checkConnection }

const byIpRatelimiters = new Map<string, ReturnType<typeof createRatelimiter>>()

function getIPRatelimiter(window: `${number} s` | `${number} m` = '10 s', limit = 10) {
  const key = `${window}-${limit}`
  let rl = byIpRatelimiters.get(key)
  if (!rl) {
    rl = createRatelimiter({ window, limit })
    byIpRatelimiters.set(key, rl!)
  }
  return rl
}

export function getClientIP(req: Pick<PayloadRequest, 'headers'>): string {
  const forwarded = req.headers?.get?.('x-forwarded-for')
  const realIp = req.headers?.get?.('x-real-ip')
  return forwarded?.split(',')[0]?.trim() || realIp || 'unknown'
}

export async function checkRateLimit(req: Pick<PayloadRequest, 'headers'>, opts?: {
  window?: `${number} s` | `${number} m`
  limit?: number
}): Promise<{ allowed: boolean; retryAfter?: number }> {
  const rl = getIPRatelimiter(opts?.window, opts?.limit)
  if (!rl) return { allowed: true }

  const ip = getClientIP(req)
  const result = await rl.limit(ip)
  return {
    allowed: result.success,
    retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
  }
}

const CACHE_TTL = {
  collections: 300,
  endpoints: 120,
  dashboard: 60,
}

export function collectionKey(slug: string, id?: string): string {
  return id ? buildKey('collection', slug, id) : buildKey('collection', slug, 'list')
}

export function endpointKey(path: string, ...params: string[]): string {
  return buildKey('endpoint', path, ...params)
}

function stableStringify(obj: unknown): string {
  const seen = new WeakSet<object>()

  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]'
      seen.add(value)
    }

    if (Array.isArray(value)) return value

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const sorted: Record<string, unknown> = {}
      Object.keys(value)
        .sort()
        .forEach((k) => {
          sorted[k] = value[k]
        })
      return sorted
    }

    return value
  })
}

export async function cachedPayloadFind(
  payload: Payload,
  options: Record<string, unknown>,
  ttl?: number,
): Promise<any> {
  const redis = getRedisClient()
  if (!redis) return payload.find(options as any)

  const queryFingerprint = crypto
    .createHash('md5')
    .update(stableStringify(options))
    .digest('hex')

  const cacheKey = buildKey('find', String(options.collection), queryFingerprint)

  return withStaleWhileRevalidate(cacheKey, () => payload.find(options as any), {
    ttl: ttl ?? CACHE_TTL.collections,
  })
}

export async function cachePayloadQuery<T>(
  slug: string,
  queryHash: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  return withCache(buildKey('query', slug, queryHash), fetcher, CACHE_TTL.collections)
}

export async function cacheEndpoint<T>(
  path: string,
  fetcher: () => Promise<T>,
  params: string[] = [],
): Promise<T> {
  return withStaleWhileRevalidate(endpointKey(path, ...params), fetcher, {
    ttl: CACHE_TTL.endpoints,
  })
}

export async function cacheDashboard<T>(
  userId: string,
  component: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  return withStaleWhileRevalidate(buildKey('dashboard', userId, component), fetcher, {
    ttl: CACHE_TTL.dashboard,
  })
}

export async function cacheApiRoute<T>(
  path: string,
  url: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  const urlFingerprint = crypto.createHash('md5').update(url).digest('hex')
  return withStaleWhileRevalidate(
    buildKey('route', path, urlFingerprint),
    fetcher,
    { ttl: CACHE_TTL.collections },
  )
}

export async function invalidateCollection(slug: string, id?: string): Promise<void> {
  if (id) {
    await invalidate(collectionKey(slug, id))
  }
  await invalidate(collectionKey(slug))
  await invalidatePattern(buildKey('find', slug, '*'))
  await invalidatePattern(buildKey('query', slug, '*'))
}

export function createCacheInvalidationHooks(slug: string) {
  return {
    afterChange: [
      async ({ doc }: { doc: any }) => {
        await invalidateCollection(slug, doc?.id)
      },
    ],
    afterDelete: [
      async ({ doc }: { doc: any }) => {
        await invalidateCollection(slug, doc?.id)
      },
    ],
  }
}

export const CONTENT_COLLECTIONS = [
  'courses',
  'course-categories',
  'posts',
  'post-categories',
  'course-modules',
  'course-lessons',
  'materials',
  'announcements',
  'certificates',
  'certificate-templates',
] as const
