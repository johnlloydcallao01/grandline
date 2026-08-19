'use server'

import { createAssessmentSubmissionService } from '@encreasl/course-actions'
import type {
  SubmissionAnswerDoc,
  SubmissionListFilters,
  SubmissionListResult,
} from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const service = createAssessmentSubmissionService({
  apiKey: API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'admin',
})

export async function getAssessmentSubmissions(
  params: SubmissionListFilters,
): Promise<SubmissionListResult> {
  return service.getSubmissions(params)
}

export async function getSubmissionAnswers(submissionId: number): Promise<SubmissionAnswerDoc[]> {
  return service.getAnswers(submissionId)
}

export async function deleteAssessmentSubmission(id: number): Promise<void> {
  return service.deleteSubmission(id)
}