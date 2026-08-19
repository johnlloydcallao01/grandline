'use server'

import { createTagService } from '@encreasl/course-actions'
import type {
  CreateTagInput,
  TagDoc,
  TagListFilters,
  TagListResult,
  UpdateTagInput,
} from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const service = createTagService({
  apiKey: API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'admin',
})

export async function getTagsList(params: TagListFilters): Promise<TagListResult> {
  return service.getTags(params)
}

export async function getTagById(id: string): Promise<TagDoc> {
  return service.getTagById(id)
}

export async function createTag(data: CreateTagInput): Promise<TagDoc> {
  return service.createTag(data)
}

export async function updateTag(id: string, data: UpdateTagInput): Promise<TagDoc> {
  return service.updateTag(id, data)
}

export async function deleteTag(id: string): Promise<void> {
  return service.deleteTag(id)
}
