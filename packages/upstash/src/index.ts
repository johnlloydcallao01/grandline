import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

let client: Redis | null = null

export function getRedisClient(): Redis | null {
  const enabled = process.env.ENABLE_REDIS_CACHING
  if (enabled !== 'true' && enabled !== '1') {
    return null
  }

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Upstash Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.')
    }
    return null
  }

  if (!client) {
    client = new Redis({ url, token })
  }

  return client
}

function getDefaultTTL(): number {
  const ttl = parseInt(process.env.REDIS_DEFAULT_TTL || '300', 10)
  return Number.isFinite(ttl) && ttl > 0 ? ttl : 300
}

const CACHE_NAMESPACE = 'cms'

export function buildKey(...segments: string[]): string {
  return [CACHE_NAMESPACE, ...segments].join(':')
}

export async function getCached<T = unknown>(key: string): Promise<T | null> {
  const redis = getRedisClient()
  if (!redis) return null

  try {
    const value = await redis.get<T>(key)
    return value ?? null
  } catch (error) {
    console.error(`[Upstash] get failed for key "${key}":`, error)
    return null
  }
}

export async function setCache<T = unknown>(
  key: string,
  value: T,
  ttl?: number
): Promise<void> {
  const redis = getRedisClient()
  if (!redis) return

  try {
    await redis.set(key, value as unknown as string, {
      ex: ttl ?? getDefaultTTL(),
    })
  } catch (error) {
    console.error(`[Upstash] set failed for key "${key}":`, error)
  }
}

export async function invalidate(key: string): Promise<void> {
  const redis = getRedisClient()
  if (!redis) return

  try {
    await redis.del(key)
  } catch (error) {
    console.error(`[Upstash] invalidate failed for key "${key}":`, error)
  }
}

export async function invalidatePattern(pattern: string): Promise<void> {
  const redis = getRedisClient()
  if (!redis) return

  try {
    let cursor: number = 0

    do {
      const [nextCursor, keys]: [string, string[]] = await redis.scan(cursor, {
        match: pattern,
        count: 100,
      })

      cursor = parseInt(nextCursor, 10) || 0

      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } while (cursor !== 0)
  } catch (error) {
    console.error(`[Upstash] invalidatePattern failed for "${pattern}":`, error)
  }
}

export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = await getCached<T>(key)
  if (cached !== null) {
    return cached
  }

  const fresh = await fetcher()
  setCache(key, fresh, ttl).catch(() => {})
  return fresh
}

export async function withStaleWhileRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { ttl?: number; staleTTL?: number }
): Promise<T> {
  const redis = getRedisClient()
  if (!redis) return fetcher()

  const ttl = options?.ttl ?? getDefaultTTL()
  const staleTTL = options?.staleTTL ?? ttl * 2
  const staleKey = `${key}:stale`

  const [fresh, stale] = await Promise.all([
    redis.get<T>(key),
    redis.get<T>(staleKey),
  ])

  if (fresh !== null) return fresh

  if (stale !== null) {
    fetcher()
      .then((newData) =>
        Promise.all([
          redis.set(key, newData as unknown as string, { ex: ttl }),
          redis.set(staleKey, newData as unknown as string, { ex: staleTTL }),
        ])
      )
      .catch(() => {})

    return stale
  }

  const newData = await fetcher()

  Promise.all([
    redis.set(key, newData as unknown as string, { ex: ttl }),
    redis.set(staleKey, newData as unknown as string, { ex: staleTTL }),
  ]).catch(() => {})

  return newData
}

export async function invalidateNamespace(namespace: string): Promise<void> {
  await invalidatePattern(`${CACHE_NAMESPACE}:${namespace}*`)
}

export async function checkConnection(): Promise<boolean> {
  const redis = getRedisClient()
  if (!redis) return false

  try {
    await redis.ping()
    return true
  } catch {
    return false
  }
}

export function createRatelimiter(opts?: { limit?: number; window?: `${number} s` | `${number} m` | `${number} h` | `${number} d` }) {
  const redis = getRedisClient()
  if (!redis) return null

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      opts?.limit ?? 10,
      opts?.window ?? '10 s',
    ),
  })
}

export { type Redis, Ratelimit }
