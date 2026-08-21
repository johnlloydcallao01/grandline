import { cookies } from 'next/headers'

export const CMS_API =
  process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api'
export const API_KEY = process.env.PAYLOAD_API_KEY

export function apiHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `users API-Key ${API_KEY}`,
    PAYLOAD_API_KEY: API_KEY || '',
  }
}

/**
 * Resolve the current instructor's users-collection ID from their JWT cookie.
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('grandline-instructor-token')?.value
    if (!token || !API_KEY) return null

    const meRes = await fetch(`${CMS_API}/users/me`, {
      headers: {
        Authorization: `JWT ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    if (!meRes.ok) return null
    const meData = await meRes.json()
    return meData?.user?.id || meData?.id || null
  } catch {
    return null
  }
}