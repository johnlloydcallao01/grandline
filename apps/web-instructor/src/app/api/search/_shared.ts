import { cookies } from 'next/headers'

export const CMS_API = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api'
export const API_KEY = process.env.PAYLOAD_API_KEY

export function apiHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `users API-Key ${API_KEY}`,
  }
}

export async function getInstructorId(): Promise<string | null> {
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
    const userId = meData?.user?.id || meData?.id
    if (!userId) return null

    const instRes = await fetch(
      `${CMS_API}/instructors?where[user][equals]=${userId}&depth=0&limit=1`,
      { headers: apiHeaders(), cache: 'no-store' },
    )
    if (!instRes.ok) return null
    const instData = await instRes.json()
    const instructorId = instData?.docs?.[0]?.id
    return instructorId ? String(instructorId) : null
  } catch {
    return null
  }
}

export async function getMyCourseIds(instructorId: string): Promise<string[]> {
  try {
    const res = await fetch(
      `${CMS_API}/courses?where[or][0][instructor][equals]=${instructorId}&where[or][1][coInstructors][contains]=${instructorId}&limit=100&depth=0&sort=-updatedAt`,
      { headers: apiHeaders(), cache: 'no-store' },
    )
    if (!res.ok) {
      const fallback = await fetch(
        `${CMS_API}/courses?where[instructor][equals]=${instructorId}&limit=100&depth=0&sort=-updatedAt`,
        { headers: apiHeaders(), cache: 'no-store' },
      )
      if (!fallback.ok) return []
      const data = await fallback.json()
      return (data.docs || []).map((d: { id: string | number }) => String(d.id))
    }
    const data = await res.json()
    return (data.docs || []).map((d: { id: string | number }) => String(d.id))
  } catch {
    return []
  }
}

export function courseInParams(courseIds: string[], andIndex = 0): string {
  if (courseIds.length === 0) return ''
  return courseIds
    .map((id, i) => `where[and][${andIndex}][course][in][${i}]=${encodeURIComponent(id)}`)
    .join('&')
}

export type SearchHit = {
  id: string
  title: string
  subtitle?: string
  type: string
  icon: string
  typeLabel: string
  href: string
}
