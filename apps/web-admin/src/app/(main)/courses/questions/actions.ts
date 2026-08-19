'use server'

import { createQuestionService } from '@encreasl/course-actions'
import type {
  CreateQuestionInput,
  QuestionDoc,
  QuestionListFilters,
  QuestionListResult,
  UpdateQuestionInput,
} from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const service = createQuestionService({
  apiKey: API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'admin',
})

export async function getQuestions(params: QuestionListFilters): Promise<QuestionListResult> {
  return service.getQuestions(params)
}

export async function getQuestionById(id: string): Promise<QuestionDoc> {
  return service.getQuestionById(id)
}

export async function createQuestion(data: CreateQuestionInput): Promise<QuestionDoc> {
  return service.createQuestion(data)
}

export async function updateQuestion(id: string, data: UpdateQuestionInput): Promise<QuestionDoc> {
  return service.updateQuestion(id, data)
}

export async function deleteQuestion(id: string): Promise<void> {
  return service.deleteQuestion(id)
}
