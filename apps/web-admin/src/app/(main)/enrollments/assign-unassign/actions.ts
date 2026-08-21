'use server'

import { unstable_noStore as noStore } from 'next/cache'
import { createEnrollmentService } from '@encreasl/course-actions'
import type {
  CourseOption,
  CreateEnrollmentInput,
  EnrollmentCouponOption,
  EnrollmentDoc,
  EnrollmentFilters,
  EnrollmentListResult,
  EnrollmentUserOption,
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
  noStore()
  return service.getEnrollments(params)
}

export async function getEnrollment(id: string): Promise<EnrollmentDoc> {
  noStore()
  return service.getEnrollment(id)
}

export async function searchCourses(search: string): Promise<CourseOption[]> {
  return service.searchCourses(search)
}

export async function searchTrainees(search: string): Promise<TraineeOption[]> {
  return service.searchTrainees(search)
}

export async function searchEnrollmentCoupons(search: string): Promise<EnrollmentCouponOption[]> {
  return service.searchEnrollmentCoupons(search)
}

export async function searchEnrollmentUsers(search: string): Promise<EnrollmentUserOption[]> {
  return service.searchEnrollmentUsers(search)
}

export async function createEnrollment(data: CreateEnrollmentInput): Promise<EnrollmentDoc> {
  return service.createEnrollment(data)
}

export async function updateEnrollment(id: string, data: Partial<CreateEnrollmentInput>): Promise<void> {
  return service.updateEnrollment(id, data)
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
