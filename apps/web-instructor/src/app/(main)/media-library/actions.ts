'use server'

import { cookies } from 'next/headers'
import { createMediaService } from '@encreasl/course-actions'
import type { MediaDoc, MediaListFilters, MediaListResult, UpdateMediaData } from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL

const service = createMediaService({
  apiKey: process.env.PAYLOAD_API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'instructor',
})

async function getCurrentUserId(): Promise<string> {
  const cookieStore = await cookies()
  const token = cookieStore.get('grandline-instructor-token')?.value
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${CMS_API}/users/me`, {
    headers: { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to get current user')

  const data = await res.json()
  const userId = data?.user?.id || data?.id
  if (!userId) throw new Error('Could not determine user ID')
  return String(userId)
}

export async function getMedia(params: MediaListFilters): Promise<MediaListResult> {
  const userId = await getCurrentUserId()
  return service.getMedia(params, userId)
}

export async function uploadMedia(formData: FormData): Promise<MediaDoc> {
  const userId = await getCurrentUserId()
  return service.uploadMedia(formData, userId)
}

export async function updateMedia(id: number, data: UpdateMediaData): Promise<MediaDoc> {
  const userId = await getCurrentUserId()
  return service.updateMedia(id, data, userId)
}