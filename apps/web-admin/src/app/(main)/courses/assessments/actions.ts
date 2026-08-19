'use server'

import { createAssessmentService } from '@encreasl/course-actions'
import type {
  AssessmentDoc,
  AssessmentEditData,
  AssessmentListFilters,
  AssessmentListResult,
  AssessmentQuestionOption,
  CreateAssessmentInput,
} from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const service = createAssessmentService({
  apiKey: API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'admin',
})

export async function getAssessments(params: AssessmentListFilters): Promise<AssessmentListResult> {
  return service.getAssessments(params)
}

export async function getAssessmentById(id: string): Promise<AssessmentEditData> {
  return service.getAssessmentEditData(id)
}

export async function getQuestions(params?: {
  search?: string
  limit?: number
}): Promise<AssessmentQuestionOption[]> {
  return service.getQuestions(params)
}

export async function createAssessment(data: CreateAssessmentInput): Promise<AssessmentDoc> {
  return service.createAssessment(data)
}

export async function updateAssessment(id: string, data: Record<string, unknown>): Promise<AssessmentDoc> {
  return service.updateAssessment(id, data)
}

export async function deleteAssessment(id: string): Promise<void> {
  return service.deleteAssessment(id)
}
