'use server'

import { createEnrollmentService } from '@encreasl/course-actions'
import type {
  CourseOption,
  CreateEnrollmentInput,
  EnrollmentDoc,
  EnrollmentFilters,
  EnrollmentListResult,
  TraineeOption,
} from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const service = createEnrollmentService({
  apiKey: API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'admin',
})

export async function getEnrollments(params: EnrollmentFilters): Promise<EnrollmentListResult> {
  return service.getEnrollments(params)
}

export async function searchCourses(search: string): Promise<CourseOption[]> {
  return service.searchCourses(search)
}

export async function searchTrainees(search: string): Promise<TraineeOption[]> {
  return service.searchTrainees(search)
}

export async function createEnrollment(data: CreateEnrollmentInput): Promise<EnrollmentDoc> {
  return service.createEnrollment(data)
}

export async function updateEnrollmentStatus(id: string, status: string): Promise<void> {
  return service.updateEnrollmentStatus(id, status)
}

export async function deleteEnrollment(id: string): Promise<void> {
  return service.unassignEnrollment(id)
}

export async function archiveEnrollment(id: string): Promise<void> {
  return service.archiveEnrollment(id)
}
