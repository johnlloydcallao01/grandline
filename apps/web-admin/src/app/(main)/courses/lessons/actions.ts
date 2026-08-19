'use server'

import { createLessonService } from '@encreasl/course-actions'
import type {
  CreateLessonInput,
  LessonDoc,
  LessonEditData,
  LessonListFilters,
  LessonListResult,
  LessonModuleOption,
} from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const service = createLessonService({
  apiKey: API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'admin',
})

export async function getLessons(params: LessonListFilters): Promise<LessonListResult> {
  return service.getLessons(params)
}

export async function getLessonById(id: string): Promise<LessonEditData> {
  return service.getLessonEditData(id)
}

export async function createLesson(data: CreateLessonInput): Promise<LessonDoc> {
  return service.createLesson(data)
}

export async function updateLesson(id: string, data: Record<string, unknown>): Promise<LessonDoc> {
  return service.updateLesson(id, data)
}

export async function deleteLesson(id: string): Promise<void> {
  return service.deleteLesson(id)
}

export async function getModuleOptions(): Promise<LessonModuleOption[]> {
  return service.getModuleOptions()
}