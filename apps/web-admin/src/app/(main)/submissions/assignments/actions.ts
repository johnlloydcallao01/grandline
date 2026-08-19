'use server'

import { createAssignmentSubmissionService } from '@encreasl/course-actions'
import type {
  AssignmentSubmissionListFilters,
  AssignmentSubmissionListResult,
} from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const service = createAssignmentSubmissionService({
  apiKey: API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'admin',
})

export async function getAssignmentSubmissions(
  params: AssignmentSubmissionListFilters,
): Promise<AssignmentSubmissionListResult> {
  return service.getSubmissions(params)
}

export async function deleteAssignmentSubmission(id: number): Promise<void> {
  return service.deleteSubmission(id)
}