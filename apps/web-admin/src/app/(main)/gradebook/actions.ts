'use server'

import { createGradebookService } from '@encreasl/course-actions'
import type {
  CreateGradeScaleInput,
  CreateGradebookEnrollmentInput,
  GradebookCourseListResult,
  GradebookCourseWithStats,
  GradebookEnrollmentDoc,
  GradebookEnrollmentFilters,
  GradebookEnrollmentListResult,
  GradebookRecentActivityFilters,
  GradebookRecentActivityResult,
  GradebookTraineeListResult,
  GradeScaleDoc,
  GradeScaleListResult,
  StudentOverviewData,
  UpdateGradeScaleInput,
} from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const service = createGradebookService({
  apiKey: API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'admin',
})

export async function getCoursesWithStats(): Promise<GradebookCourseWithStats[]> {
  return service.getCoursesWithStats()
}

export async function getCoursesList(): Promise<GradebookCourseListResult> {
  return service.getCourses()
}

export async function getEnrollmentsList(params: GradebookEnrollmentFilters = {}): Promise<GradebookEnrollmentListResult> {
  return service.getEnrollments(params)
}

export async function getEnrollmentById(id: number | string): Promise<GradebookEnrollmentDoc> {
  return service.getEnrollmentById(id)
}

export async function updateEnrollment(id: number | string, payload: Record<string, any>): Promise<GradebookEnrollmentDoc> {
  return service.updateEnrollment(id, payload)
}

export async function deleteEnrollment(id: number | string): Promise<void> {
  return service.deleteEnrollment(id)
}

export async function createEnrollment(input: CreateGradebookEnrollmentInput): Promise<GradebookEnrollmentDoc> {
  return service.createEnrollment(input)
}

export async function getRecentActivity(params: GradebookRecentActivityFilters = {}): Promise<GradebookRecentActivityResult> {
  return service.getRecentActivity(params)
}

export async function getTraineesList(params: { page?: number; limit?: number; search?: string } = {}): Promise<GradebookTraineeListResult> {
  return service.getTrainees(params)
}

export async function getStudentOverview(traineeId: number | string): Promise<StudentOverviewData> {
  return service.getStudentOverview(traineeId)
}

export async function getGradeScalesList(): Promise<GradeScaleListResult> {
  return service.getGradeScales()
}

export async function createGradeScale(payload: CreateGradeScaleInput): Promise<GradeScaleDoc> {
  return service.createGradeScale(payload)
}

export async function updateGradeScale(id: number | string, payload: UpdateGradeScaleInput): Promise<GradeScaleDoc> {
  return service.updateGradeScale(id, payload)
}

export async function deleteGradeScale(id: number | string): Promise<void> {
  return service.deleteGradeScale(id)
}