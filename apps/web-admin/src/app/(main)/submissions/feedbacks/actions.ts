'use server'

import { createFeedbackSubmissionService } from '@encreasl/course-actions'
import type {
  FeedbackFormOption,
  FeedbackListFilters,
  FeedbackListResult,
} from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const service = createFeedbackSubmissionService({
  apiKey: API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'admin',
})

export async function getFeedbackSubmissions(
  params: FeedbackListFilters,
): Promise<FeedbackListResult> {
  return service.getSubmissions(params)
}

export async function deleteFeedbackSubmission(id: number): Promise<void> {
  return service.deleteSubmission(id)
}

export async function getFeedbackFormOptions(): Promise<FeedbackFormOption[]> {
  return service.getFormOptions()
}