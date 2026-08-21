'use server'

import { createMediaService } from '@encreasl/course-actions'
import type { MediaDoc, MediaListFilters, MediaListResult, UpdateMediaData } from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const service = createMediaService({
  apiKey: API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'admin',
})

export async function getMedia(params: MediaListFilters): Promise<MediaListResult> {
  return service.getMedia(params)
}

export async function getMediaItem(id: number): Promise<MediaDoc> {
  return service.getMediaItem(id)
}

export async function uploadMedia(formData: FormData): Promise<MediaDoc> {
  return service.uploadMedia(formData)
}

export async function updateMedia(id: number, data: UpdateMediaData): Promise<MediaDoc> {
  return service.updateMedia(id, data)
}

export async function deleteMedia(id: number): Promise<void> {
  return service.deleteMedia(id)
}