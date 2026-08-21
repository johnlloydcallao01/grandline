'use server'

import { createFeedbackFormsService } from '@encreasl/course-actions'
import type {
  FeedbackFormDoc,
  FeedbackFormPayload,
  FeedbackFormsListFilters,
  FeedbackFormsListResult,
} from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const service = createFeedbackFormsService({
  apiKey: API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'admin',
})

export async function getFormsList(params: FeedbackFormsListFilters): Promise<FeedbackFormsListResult> {
  return service.getForms(params)
}

export async function getFormById(id: number | string): Promise<FeedbackFormDoc> {
  return service.getForm(id)
}

export async function createForm(payload: FeedbackFormPayload): Promise<FeedbackFormDoc> {
  return service.createForm(payload)
}

export async function updateForm(id: number | string, payload: FeedbackFormPayload): Promise<FeedbackFormDoc> {
  return service.updateForm(id, payload)
}

export async function deleteForm(id: number | string): Promise<void> {
  return service.deleteForm(id)
}